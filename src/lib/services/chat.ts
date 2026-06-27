import { streamText, type ModelMessage } from "ai";
import { nanoid } from "nanoid";

import { db, type ChatMessage, type ChatThread } from "@/lib/db";
import { BadRequestError, NotFoundError } from "@/lib/services/api-errors";
import { getGenerationModel, getPreferredModel } from "@/lib/services/ai-providers";

type ThreadSummary = {
  id: string;
  title: string;
  modelId: string;
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

const registryKey = Symbol.for("chatterbox.generationRegistry");
const globalState = globalThis as typeof globalThis & {
  [registryKey]?: GenerationRegistry;
};

const generationRegistry = globalState[registryKey] ?? new Map();
globalState[registryKey] = generationRegistry;

function toThreadSummary(thread: ChatThread): ThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    modelId: thread.model_id,
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

export async function listThreads(userId: string): Promise<ThreadSummary[]> {
  const threads = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("updated_at", "desc")
    .execute();

  return threads.map(toThreadSummary);
}

export async function createThread(
  userId: string,
  firstMessage?: string,
): Promise<ChatThreadPayload> {
  const preferred = await getPreferredModel(userId);
  const thread = await db
    .insertInto("chat_threads")
    .values({
      id: nanoid(),
      user_id: userId,
      title: firstMessage ? makeTitle(firstMessage) : "New chat",
      provider_id: preferred.providerId,
      model_id: preferred.modelId,
      system_prompt: preferred.systemPrompt,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    ...toThreadSummary(thread),
    systemPrompt: thread.system_prompt,
    messages: [],
  };
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
  assistantMessageId: string,
): void {
  if (generationRegistry.has(assistantMessageId)) {
    return;
  }

  const generation = (async () => {
    if (!thread.provider_id) {
      throw new BadRequestError("Thread does not have a provider");
    }

    const [model, messages] = await Promise.all([
      getGenerationModel(userId, thread.provider_id, thread.model_id),
      getThreadMessages(thread.id),
    ]);

    const result = streamText({
      model,
      system: thread.system_prompt,
      messages: toModelMessages(messages),
    });

    let content = "";
    for await (const delta of result.textStream) {
      content += delta;
      await appendAssistantContent(assistantMessageId, content);
    }

    await finishAssistantMessage(assistantMessageId, "completed");
  })()
    .catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "Generation failed";
      await finishAssistantMessage(assistantMessageId, "error", message);
    })
    .finally(() => {
      generationRegistry.delete(assistantMessageId);
    });

  generationRegistry.set(assistantMessageId, generation);
}

export async function sendMessage(
  userId: string,
  input: { threadId?: string; content: string },
) {
  const content = input.content.trim();
  if (!content) {
    throw new BadRequestError("Message is required");
  }

  const thread = input.threadId
    ? await getUserThread(userId, input.threadId)
    : await createThread(userId, content).then((payload) =>
        getUserThread(userId, payload.id),
      );

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
          title: thread.title === "New chat" ? makeTitle(content) : thread.title,
          updated_at: new Date(),
        })
        .where("id", "=", thread.id)
        .execute();

      return [userRow, assistantRow] as const;
    });

  startAssistantGeneration(userId, thread, assistantMessage.id);

  return {
    threadId: thread.id,
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createAssistantMessageStream(
  userId: string,
  threadId: string,
  messageId: string,
  signal: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  await getUserThread(userId, threadId);
  await getAssistantMessage(userId, threadId, messageId);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastContent: string | null = null;

      while (!signal.aborted) {
        const message = await getAssistantMessage(userId, threadId, messageId);

        if (message.content !== lastContent) {
          lastContent = message.content;
          controller.enqueue(encodeSse("content", toMessageDto(message)));
        }

        if (message.status === "completed") {
          controller.enqueue(encodeSse("done", toMessageDto(message)));
          controller.close();
          return;
        }

        if (message.status === "error") {
          controller.enqueue(encodeSse("error", toMessageDto(message)));
          controller.close();
          return;
        }

        await delay(350);
      }

      controller.close();
    },
  });
}
