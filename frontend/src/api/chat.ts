import type { ChatMessage, Project } from "../utils/types/chat";
import { ApiError } from "./client";
import { parseSseStream } from "../utils/parseSseStream";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export interface ThreadSummary {
  id: string;
  title: string;
}

export interface StreamDonePayload {
  userMessageId: string | null;
  assistantMessageId: string;
  variantId: string;
  content: string;
  thinking: string | null;
}

export interface StreamCallbacks {
  onTextDelta: (delta: string) => void;
  onReasoningDelta: (delta: string) => void;
  onDone: (payload: StreamDonePayload) => void;
  onError: (error: Error) => void;
}

interface ErrorBody {
  error?: string;
  message?: string;
}

async function parseApiError(res: Response): Promise<ApiError> {
  let body: ErrorBody = {};
  try {
    body = (await res.json()) as ErrorBody;
  } catch {
    // Response body is not JSON.
  }

  return new ApiError(
    res.status,
    body.error ?? "unknown",
    body.message ?? res.statusText,
  );
}

async function consumeSseStream(
  res: Response,
  callbacks: StreamCallbacks,
): Promise<void> {
  if (!res.body) {
    throw new Error("Streaming response has no body.");
  }

  for await (const event of parseSseStream(res.body)) {
    if (event.event === "text-delta") {
      const payload = JSON.parse(event.data) as { delta: string };
      callbacks.onTextDelta(payload.delta);
      continue;
    }

    if (event.event === "reasoning-delta") {
      const payload = JSON.parse(event.data) as { delta: string };
      callbacks.onReasoningDelta(payload.delta);
      continue;
    }

    if (event.event === "done") {
      callbacks.onDone(JSON.parse(event.data) as StreamDonePayload);
      continue;
    }

    if (event.event === "error") {
      const payload = JSON.parse(event.data) as ErrorBody;
      throw new ApiError(
        res.status,
        payload.error ?? "stream_error",
        payload.message ?? "Streaming failed.",
      );
    }
  }
}

async function postSse(
  path: string,
  body: unknown | undefined,
  callbacks: StreamCallbacks,
): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw await parseApiError(res);
  }

  await consumeSseStream(res, callbacks);
}

function mapApiMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    thinking: message.thinking ?? undefined,
  };
}

export const chatApi = {
  listProjects: () => apiGet<Project[]>("/api/projects"),
  createProject: (name: string) =>
    apiPost<Project>("/api/projects", { name }),
  renameProject: (projectId: string, name: string) =>
    apiPatch<Project>(`/api/projects/${projectId}`, { name }),
  deleteProject: (projectId: string) =>
    apiDelete(`/api/projects/${projectId}`),

  listThreads: () => apiGet<ThreadSummary[]>("/api/threads"),
  createThread: (title = "New chat", parentThreadId?: string) =>
    apiPost<ThreadSummary>("/api/threads", {
      title,
      parentThreadId: parentThreadId ? Number(parentThreadId) : null,
    }),
  createProjectThread: (
    projectId: string,
    title = "New chat",
    parentThreadId?: string,
  ) =>
    apiPost<ThreadSummary>(`/api/projects/${projectId}/threads`, {
      title,
      parentThreadId: parentThreadId ? Number(parentThreadId) : null,
    }),
  renameThread: (threadId: string, name: string) =>
    apiPatch<ThreadSummary>(`/api/threads/${threadId}`, { name }),
  deleteThread: (threadId: string) => apiDelete(`/api/threads/${threadId}`),

  listMessages: (threadId: string) =>
    apiGet<ChatMessage[]>(`/api/threads/${threadId}/messages`).then((messages) =>
      messages.map(mapApiMessage),
    ),

  updateActiveVariant: (messageId: string, activeVariantIndex: number) =>
    apiPatch<ChatMessage>(`/api/messages/${messageId}`, { activeVariantIndex }),

  streamChat: (threadId: string, content: string, callbacks: StreamCallbacks) =>
    postSse(`/api/threads/${threadId}/chat`, { content }, callbacks),

  streamRegenerate: (
    threadId: string,
    messageId: string,
    callbacks: StreamCallbacks,
  ) =>
    postSse(
      `/api/threads/${threadId}/messages/${messageId}/regenerate`,
      undefined,
      callbacks,
    ),
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: "include" });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return res.json() as Promise<T>;
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
}
