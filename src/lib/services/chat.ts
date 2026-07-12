import { type ModelMessage, streamText } from "ai";
import { nanoid } from "nanoid";

import { type ChatMessage, type ChatThread, db } from "@/lib/db";
import {
  getGenerationModel,
  getPreferredImageGenerationModel,
  getPreferredModel,
} from "@/lib/services/ai-providers";
import { BadRequestError, NotFoundError } from "@/lib/services/api-errors";
import { generateImageFromPrompt } from "@/lib/services/image-generation";
import { getProject } from "@/lib/services/projects";
import { findRelevantProjectContext, indexMessage } from "@/lib/services/rag";

export type ThreadSummary = {
  id: string;
  title: string;
  modelId: string;
  projectId: string | null;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "completed" | "streaming" | "error";
  error: string | null;
  createdAt: string;
};

export type ChatThreadPayload = ThreadSummary & {
  systemPrompt: string;
  messages: ChatMessageDto[];
};

type GenerationRegistry = Map<string, Promise<void>>;
type StreamEvent = {
  type: "content" | "done" | "error";
  message: ChatMessageDto;
};
type StreamListeners = Map<string, Set<(event: StreamEvent) => void>>;
type StreamingMessages = Map<string, ChatMessageDto>;

const registryKey = Symbol.for("chatterbox.generationRegistry");
const globalState = globalThis as typeof globalThis & {
  [registryKey]?: GenerationRegistry;
  chatterboxStreamListeners?: StreamListeners;
  chatterboxStreamingMessages?: StreamingMessages;
};

const generationRegistry = globalState[registryKey] ?? new Map();
globalState[registryKey] = generationRegistry;
const streamListeners = globalState.chatterboxStreamListeners ?? new Map();
globalState.chatterboxStreamListeners = streamListeners;
const streamingMessages = globalState.chatterboxStreamingMessages ?? new Map();
globalState.chatterboxStreamingMessages = streamingMessages;

function toThreadSummary(thread: ChatThread): ThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    modelId: thread.model_id,
    projectId: thread.project_id,
    providerId: thread.provider_id,
    createdAt: thread.created_at.toISOString(),
    updatedAt: thread.updated_at.toISOString(),
  };
}

function toMessageDto(message: ChatMessage): ChatMessageDto {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    status: message.status,
    error: message.error,
    createdAt: message.created_at.toISOString(),
  };
}

/** Broadcasts an in-process generation update to open SSE connections. */
function publishStreamEvent(messageId: string, event: StreamEvent): void {
  for (const listener of streamListeners.get(messageId) ?? []) {
    listener(event);
  }
}

/** Registers an SSE listener until the request aborts or a terminal event arrives. */
function subscribeToStream(
  messageId: string,
  listener: (event: StreamEvent) => void,
): () => void {
  const listeners = streamListeners.get(messageId) ?? new Set();
  listeners.add(listener);
  streamListeners.set(messageId, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      streamListeners.delete(messageId);
    }
  };
}

function makeTitle(content: string): string {
  const words = content.trim().replace(/\s+/g, " ").split(" ");
  const title = words.slice(0, 8).join(" ");
  return title.length > 0 ? title : "New chat";
}

async function getUserThread(
  userId: string,
  threadId: string,
): Promise<ChatThread> {
  const thread = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("id", "=", threadId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  if (!thread) {
    throw new NotFoundError("Thread not found");
  }

  return thread;
}

async function getThreadMessages(threadId: string): Promise<ChatMessage[]> {
  return db
    .selectFrom("chat_messages")
    .selectAll()
    .where("thread_id", "=", threadId)
    .orderBy("created_at", "asc")
    .execute();
}

function indexMessageSafely(
  userId: string,
  input: {
    projectId: string;
    threadId: string;
    messageId: string;
    content: string;
  },
): void {
  void indexMessage(userId, input).catch((error: unknown) => {
    console.error("Failed to index message for RAG", error);
  });
}

async function buildSystemPrompt(
  userId: string,
  thread: ChatThread,
  userQuery: string,
): Promise<string> {
  if (!thread.project_id) {
    return thread.system_prompt;
  }

  const chunks = await findRelevantProjectContext(userId, {
    projectId: thread.project_id,
    query: userQuery,
    excludeThreadId: thread.id,
  });

  console.log("[buildSystemPrompt] Chunks: ", JSON.stringify(chunks));
  if (chunks.length === 0) {
    return thread.system_prompt;
  }

  const contextBlock = chunks.map((chunk) => `- ${chunk.content}`).join("\n");
  return `${thread.system_prompt}

Use the following retrieved context from other chats in this project when relevant:
${contextBlock}`;
}

export async function listThreads(userId: string): Promise<ThreadSummary[]> {
  const threads = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null)
    .orderBy("updated_at", "desc")
    .execute();
  return threads.map(toThreadSummary);
}

export async function createThread(
  userId: string,
  input?: {
    firstMessage?: string;
    projectId?: string;
    generationMode?: "chat" | "image";
  },
): Promise<ChatThreadPayload> {
  if (input?.projectId) {
    const project = await getProject(userId, input.projectId);
    if (project.archived_at) {
      throw new BadRequestError("Cannot create threads in archived projects");
    }
  }

  const preferred =
    input?.generationMode === "image"
      ? await getPreferredImageGenerationModel(userId)
      : await getPreferredModel(userId);
  const thread = await db
    .insertInto("chat_threads")
    .values({
      id: nanoid(),
      user_id: userId,
      project_id: input?.projectId ?? null,
      title: input?.firstMessage ? makeTitle(input.firstMessage) : "New chat",
      provider_id: preferred.providerId,
      model_id: preferred.modelId,
      system_prompt: preferred.systemPrompt,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  if (input?.projectId) {
    await db
      .updateTable("projects")
      .set({ updated_at: new Date() })
      .where("id", "=", input.projectId)
      .execute();
  }

  return {
    ...toThreadSummary(thread),
    systemPrompt: thread.system_prompt,
    messages: [],
  };
}

export async function listThreadPayloads(
  userId: string,
): Promise<ChatThreadPayload[]> {
  const threads = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null)
    .orderBy("updated_at", "desc")
    .execute();

  if (threads.length === 0) {
    return [];
  }

  const threadIds = threads.map((thread) => thread.id);
  const messages = await db
    .selectFrom("chat_messages")
    .selectAll()
    .where("thread_id", "in", threadIds)
    .orderBy("created_at", "asc")
    .execute();

  const messagesByThread = new Map<string, ChatMessage[]>();
  for (const message of messages) {
    const threadMessages = messagesByThread.get(message.thread_id) ?? [];
    threadMessages.push(message);
    messagesByThread.set(message.thread_id, threadMessages);
  }

  return threads.map((thread) => ({
    ...toThreadSummary(thread),
    systemPrompt: thread.system_prompt,
    messages: (messagesByThread.get(thread.id) ?? []).map(toMessageDto),
  }));
}

export async function getThreadPayload(
  userId: string,
  threadId: string,
): Promise<ChatThreadPayload> {
  const thread = await getUserThread(userId, threadId);
  const messages = await getThreadMessages(threadId);

  return {
    ...toThreadSummary(thread),
    systemPrompt: thread.system_prompt,
    messages: messages.map(toMessageDto),
  };
}

function toModelMessages(messages: ChatMessage[]): ModelMessage[] {
  return messages
    .filter((message) => message.status === "completed")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

async function appendAssistantContent(
  assistantMessageId: string,
  content: string,
): Promise<void> {
  await db
    .updateTable("chat_messages")
    .set({ content, updated_at: new Date() })
    .where("id", "=", assistantMessageId)
    .execute();
}

async function finishAssistantMessage(
  assistantMessageId: string,
  status: "completed" | "error",
  error?: string,
): Promise<void> {
  await db
    .updateTable("chat_messages")
    .set({
      status,
      error: error ?? null,
      updated_at: new Date(),
    })
    .where("id", "=", assistantMessageId)
    .execute();
}

function startAssistantGeneration(
  userId: string,
  thread: ChatThread,
  assistantMessage: ChatMessage,
  userQuery: string,
): void {
  const assistantMessageId = assistantMessage.id;
  if (generationRegistry.has(assistantMessageId)) {
    return;
  }

  const generation = (async () => {
    if (!thread.provider_id) {
      throw new BadRequestError("Thread does not have a provider");
    }

    const [model, messages, system] = await Promise.all([
      getGenerationModel(userId, thread.provider_id, thread.model_id),
      getThreadMessages(thread.id),
      buildSystemPrompt(userId, thread, userQuery),
    ]);

    const result = streamText({
      model,
      system,
      messages: toModelMessages(messages),
    });

    let content = "";
    let lastCheckpointAt = Date.now();
    let streamingMessage = toMessageDto(assistantMessage);
    streamingMessages.set(assistantMessageId, streamingMessage);
    for await (const delta of result.textStream) {
      content += delta;
      streamingMessage = { ...streamingMessage, content };
      streamingMessages.set(assistantMessageId, streamingMessage);
      publishStreamEvent(assistantMessageId, {
        type: "content",
        message: streamingMessage,
      });

      if (Date.now() - lastCheckpointAt >= 500) {
        await appendAssistantContent(assistantMessageId, content);
        lastCheckpointAt = Date.now();
      }
    }

    if (content.length === 0) {
      throw new Error("Model returned an empty response");
    }
    await appendAssistantContent(assistantMessageId, content);
    await finishAssistantMessage(assistantMessageId, "completed");
    const completedMessage = {
      ...streamingMessage,
      status: "completed" as const,
    };
    streamingMessages.delete(assistantMessageId);
    publishStreamEvent(assistantMessageId, {
      type: "done",
      message: completedMessage,
    });

    if (thread.project_id) {
      indexMessageSafely(userId, {
        projectId: thread.project_id,
        threadId: thread.id,
        messageId: assistantMessageId,
        content,
      });
    }
  })()
    .catch(async (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      await finishAssistantMessage(assistantMessageId, "error", message);
      const failedMessage = {
        ...(streamingMessages.get(assistantMessageId) ??
          toMessageDto(assistantMessage)),
        status: "error" as const,
        error: message,
      };
      streamingMessages.delete(assistantMessageId);
      publishStreamEvent(assistantMessageId, {
        type: "error",
        message: failedMessage,
      });
    })
    .finally(() => {
      generationRegistry.delete(assistantMessageId);
    });

  generationRegistry.set(assistantMessageId, generation);
}

function startImageGeneration(
  userId: string,
  assistantMessage: ChatMessage,
  prompt: string,
): void {
  const assistantMessageId = assistantMessage.id;
  if (generationRegistry.has(assistantMessageId)) {
    return;
  }

  const generation = (async () => {
    let streamingMessage = toMessageDto(assistantMessage);
    streamingMessages.set(assistantMessageId, streamingMessage);
    const content = await generateImageFromPrompt(userId, prompt);
    await appendAssistantContent(assistantMessageId, content);
    await finishAssistantMessage(assistantMessageId, "completed");
    const completedMessage = {
      ...streamingMessage,
      content,
      status: "completed" as const,
    };
    streamingMessages.delete(assistantMessageId);
    publishStreamEvent(assistantMessageId, {
      type: "done",
      message: completedMessage,
    });
  })()
    .catch(async (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Image generation failed";
      await finishAssistantMessage(assistantMessageId, "error", message);
      const failedMessage = {
        ...(streamingMessages.get(assistantMessageId) ??
          toMessageDto(assistantMessage)),
        status: "error" as const,
        error: message,
      };
      streamingMessages.delete(assistantMessageId);
      publishStreamEvent(assistantMessageId, {
        type: "error",
        message: failedMessage,
      });
    })
    .finally(() => {
      generationRegistry.delete(assistantMessageId);
    });

  generationRegistry.set(assistantMessageId, generation);
}

export async function sendMessage(
  userId: string,
  input: {
    threadId?: string;
    content: string;
    projectId?: string;
    imageGeneration?: boolean;
  },
) {
  const content = input.content.trim();
  if (!content) {
    throw new BadRequestError("Message is required");
  }

  const thread = input.threadId
    ? await getUserThread(userId, input.threadId)
    : await createThread(userId, {
        firstMessage: content,
        projectId: input.projectId,
        generationMode: input.imageGeneration ? "image" : "chat",
      }).then((payload) => getUserThread(userId, payload.id));

  const updatedAt = new Date();
  const updatedTitle =
    thread.title === "New chat" ? makeTitle(content) : thread.title;
  const [userMessage, assistantMessage] = await db
    .transaction()
    .execute(async (trx) => {
      const userRow = await trx
        .insertInto("chat_messages")
        .values({
          id: nanoid(),
          thread_id: thread.id,
          user_id: userId,
          role: "user",
          content,
          status: "completed",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const assistantRow = await trx
        .insertInto("chat_messages")
        .values({
          id: nanoid(),
          thread_id: thread.id,
          user_id: userId,
          role: "assistant",
          content: "",
          status: "streaming",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await trx
        .updateTable("chat_threads")
        .set({
          title: updatedTitle,
          updated_at: updatedAt,
        })
        .where("id", "=", thread.id)
        .execute();

      if (thread.project_id) {
        await trx
          .updateTable("projects")
          .set({ updated_at: new Date() })
          .where("id", "=", thread.project_id)
          .execute();
      }

      return [userRow, assistantRow] as const;
    });

  if (thread.project_id) {
    indexMessageSafely(userId, {
      projectId: thread.project_id,
      threadId: thread.id,
      messageId: userMessage.id,
      content,
    });
  }

  if (input.imageGeneration) {
    startImageGeneration(userId, assistantMessage, content);
  } else {
    startAssistantGeneration(userId, thread, assistantMessage, content);
  }

  return {
    threadId: thread.id,
    thread: {
      ...toThreadSummary(thread),
      title: updatedTitle,
      updatedAt: updatedAt.toISOString(),
    },
    userMessage: toMessageDto(userMessage),
    assistantMessage: toMessageDto(assistantMessage),
  };
}

async function getAssistantMessage(
  userId: string,
  threadId: string,
  messageId: string,
): Promise<ChatMessage> {
  const message = await db
    .selectFrom("chat_messages")
    .selectAll()
    .where("user_id", "=", userId)
    .where("thread_id", "=", threadId)
    .where("id", "=", messageId)
    .where("role", "=", "assistant")
    .executeTakeFirst();

  if (!message) {
    throw new NotFoundError("Assistant message not found");
  }

  return message;
}

function encodeSse(event: string, data: unknown): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function updateThread(
  userId: string,
  threadId: string,
  input: { title: string },
) {
  const normalizedTitle = input.title.trim();
  if (!normalizedTitle) {
    throw new BadRequestError("Thread title is required");
  }

  await getUserThread(userId, threadId);

  const thread = await db
    .updateTable("chat_threads")
    .set({ title: normalizedTitle, updated_at: new Date() })
    .where("user_id", "=", userId)
    .where("id", "=", threadId)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();

  return toThreadSummary(thread);
}

export async function archiveThread(userId: string, threadId: string) {
  const thread = await getUserThread(userId, threadId);

  if (thread.project_id) {
    throw new BadRequestError("Project threads cannot be archived");
  }

  if (thread.archived_at) {
    throw new BadRequestError("Thread is already archived");
  }

  const updated = await db
    .updateTable("chat_threads")
    .set({ archived_at: new Date(), updated_at: new Date() })
    .where("id", "=", threadId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return toThreadSummary(updated);
}

export async function unarchiveThread(userId: string, threadId: string) {
  const thread = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("id", "=", threadId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  if (!thread) {
    throw new NotFoundError("Thread not found");
  }

  if (!thread.archived_at) {
    throw new BadRequestError("Thread is not archived");
  }

  const updated = await db
    .updateTable("chat_threads")
    .set({ archived_at: null, updated_at: new Date() })
    .where("id", "=", threadId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return toThreadSummary(updated);
}

export async function deleteThread(userId: string, threadId: string) {
  await getUserThread(userId, threadId);

  await db
    .updateTable("chat_threads")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("user_id", "=", userId)
    .where("id", "=", threadId)
    .where("deleted_at", "is", null)
    .execute();
}

export async function createAssistantMessageStream(
  userId: string,
  threadId: string,
  messageId: string,
  signal: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  await getUserThread(userId, threadId);
  const persistedMessage = await getAssistantMessage(
    userId,
    threadId,
    messageId,
  );
  let cleanup = () => {};

  return new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const close = () => {
        if (!closed) {
          closed = true;
          unsubscribe();
          signal.removeEventListener("abort", close);
          controller.close();
        }
      };
      const onEvent = (event: StreamEvent) => {
        if (closed) {
          return;
        }

        controller.enqueue(encodeSse(event.type, event.message));
        if (event.type !== "content") {
          close();
        }
      };
      const unsubscribe = subscribeToStream(messageId, onEvent);
      cleanup = close;
      signal.addEventListener("abort", close, { once: true });

      const initialMessage =
        streamingMessages.get(messageId) ?? toMessageDto(persistedMessage);
      if (initialMessage.content) {
        controller.enqueue(encodeSse("content", initialMessage));
      }
      if (initialMessage.status === "completed") {
        onEvent({ type: "done", message: initialMessage });
      } else if (initialMessage.status === "error") {
        onEvent({ type: "error", message: initialMessage });
      } else if (signal.aborted) {
        close();
      }
    },
    cancel() {
      cleanup();
    },
  });
}

export { listSidebarThreads } from "@/lib/services/projects";
