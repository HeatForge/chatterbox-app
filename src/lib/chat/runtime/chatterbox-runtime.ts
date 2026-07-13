"use client";

import {
  type AppendMessage,
  type AssistantRuntime,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CachedThreadPayload } from "@/lib/chat/runtime/thread-cache";
import type { ChatMessageDto } from "@/lib/chat/types";

import {
  chatMessageToThreadMessage,
  createOptimisticUserMessage,
  upsertChatMessage,
} from "./message-mapper";
import { sendChatMessage } from "./send-message";
import { connectMessageStream, type StreamConnection } from "./stream-message";
import { createThreadCache } from "./thread-cache";

export type ChatterboxRuntimeThread = CachedThreadPayload;

export type UseChatterboxRuntimeOptions = {
  /** Active thread id from URL or sidebar selection; null for compose-only surfaces. */
  threadId: string | null;
  /** Server-prefetched or cached thread used to seed the first render. */
  initialThread?: ChatterboxRuntimeThread | null;
  /** Project context for the first message in a project-scoped new chat. */
  projectId?: string | null;
  /** Called when thread metadata or messages change after load, send, or stream. */
  onThreadChange?: (thread: ChatterboxRuntimeThread) => void;
  /** Called when send, load, or stream operations fail. */
  onError?: (error: Error) => void;
  /** Blocks composer send while keeping the thread readable. */
  isSendDisabled?: boolean;
};

export type ChatterboxRuntime = {
  runtime: AssistantRuntime;
  messages: ChatMessageDto[];
  thread: ChatterboxRuntimeThread | null;
  isRunning: boolean;
  loadThread: (threadId: string) => Promise<void>;
  clearThread: () => void;
};

function hasStreamingAssistantMessage(
  messages: readonly ChatMessageDto[],
): boolean {
  return messages.some(
    (message) => message.role === "assistant" && message.status === "streaming",
  );
}

function getAppendMessageText(message: AppendMessage): string {
  const part = message.content[0];
  if (!part || part.type !== "text") {
    throw new Error("Only text messages are supported");
  }

  return part.text.trim();
}

/**
 * assistant-ui external-store runtime backed by the existing POST+SSE chat API.
 * Owns message state, optimistic send, SSE streaming, and thread caching.
 */
export function useChatterboxRuntime(
  options: UseChatterboxRuntimeOptions,
): ChatterboxRuntime {
  const {
    threadId,
    initialThread = null,
    projectId = null,
    onThreadChange,
    onError,
    isSendDisabled = false,
  } = options;

  const [thread, setThread] = useState<ChatterboxRuntimeThread | null>(
    () => initialThread,
  );
  const [messages, setMessages] = useState<ChatMessageDto[]>(
    () => initialThread?.messages ?? [],
  );
  const [isRunning, setIsRunning] = useState(() =>
    hasStreamingAssistantMessage(initialThread?.messages ?? []),
  );

  const threadCacheRef = useRef(createThreadCache(initialThread ?? undefined));
  const streamsRef = useRef<Map<string, StreamConnection>>(new Map());
  const activeThreadIdRef = useRef<string | null>(threadId);
  const onThreadChangeRef = useRef(onThreadChange);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onThreadChangeRef.current = onThreadChange;
  }, [onThreadChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const closeAllStreams = useCallback(() => {
    for (const stream of streamsRef.current.values()) {
      stream.close();
    }
    streamsRef.current.clear();
  }, []);

  const syncThreadState = useCallback(
    (nextThread: ChatterboxRuntimeThread, nextMessages: ChatMessageDto[]) => {
      const payload: ChatterboxRuntimeThread = {
        ...nextThread,
        messages: nextMessages,
      };
      threadCacheRef.current.set(payload);
      setThread(payload);
      setMessages(nextMessages);
      onThreadChangeRef.current?.(payload);
    },
    [],
  );

  const updateMessages = useCallback(
    (updater: (current: ChatMessageDto[]) => ChatMessageDto[]) => {
      setMessages((current) => {
        const nextMessages = updater(current);
        setThread((currentThread) => {
          if (!currentThread) {
            return currentThread;
          }

          const payload: ChatterboxRuntimeThread = {
            ...currentThread,
            messages: nextMessages,
          };
          threadCacheRef.current.set(payload);
          onThreadChangeRef.current?.(payload);
          return payload;
        });
        return nextMessages;
      });
    },
    [],
  );

  const connectAssistantStream = useCallback(
    (streamThreadId: string, messageId: string) => {
      if (streamsRef.current.has(messageId)) {
        return;
      }

      const connection = connectMessageStream({
        threadId: streamThreadId,
        messageId,
        getActiveThreadId: () => activeThreadIdRef.current,
        onMessageUpdate: (message) => {
          updateMessages((current) => upsertChatMessage(current, message));
        },
        onComplete: (message) => {
          updateMessages((current) => upsertChatMessage(current, message));
          streamsRef.current.delete(messageId);
          setIsRunning(false);
        },
        onConnectionError: () => {
          streamsRef.current.delete(messageId);
          setIsRunning(false);
          onErrorRef.current?.(new Error("Stream connection failed"));
        },
      });

      streamsRef.current.set(messageId, connection);
      setIsRunning(true);
    },
    [updateMessages],
  );

  const applyThread = useCallback(
    (nextThread: ChatterboxRuntimeThread) => {
      setThread(nextThread);
      setMessages(nextThread.messages);

      const streamingMessage = nextThread.messages.find(
        (message) =>
          message.role === "assistant" && message.status === "streaming",
      );

      if (streamingMessage) {
        setIsRunning(true);
        connectAssistantStream(nextThread.id, streamingMessage.id);
        return;
      }

      setIsRunning(false);
    },
    [connectAssistantStream],
  );

  const loadThread = useCallback(
    async (requestedThreadId: string) => {
      const cached = threadCacheRef.current.get(requestedThreadId);
      if (cached) {
        applyThread(cached);
      }

      const response = await fetch(`/api/chat/threads/${requestedThreadId}`);
      if (!response.ok) {
        throw new Error("Failed to load thread");
      }

      const payload = (await response.json()) as ChatterboxRuntimeThread;
      threadCacheRef.current.set(payload);
      applyThread(payload);
    },
    [applyThread],
  );

  const clearThread = useCallback(() => {
    closeAllStreams();
    setThread(null);
    setMessages([]);
    setIsRunning(false);
  }, [closeAllStreams]);

  useEffect(() => {
    activeThreadIdRef.current = threadId;
    closeAllStreams();

    if (!threadId) {
      setThread(null);
      setMessages([]);
      setIsRunning(false);
      return;
    }

    void loadThread(threadId).catch((error: unknown) => {
      onErrorRef.current?.(
        error instanceof Error ? error : new Error("Failed to load thread"),
      );
    });
  }, [threadId, loadThread, closeAllStreams]);

  useEffect(() => {
    return () => {
      closeAllStreams();
    };
  }, [closeAllStreams]);

  const onNew = useCallback(
    async (message: AppendMessage) => {
      if (isSendDisabled) {
        return;
      }

      const text = getAppendMessageText(message);
      if (!text) {
        return;
      }

      const optimisticUserMessage = createOptimisticUserMessage(text);
      updateMessages((current) => [...current, optimisticUserMessage]);
      setIsRunning(true);

      try {
        const result = await sendChatMessage({
          content: text,
          threadId: thread?.id,
          projectId: projectId ?? undefined,
        });

        let nextMessages: ChatMessageDto[] = [];
        setMessages((current) => {
          const withoutOptimistic = current.filter(
            (item) => item.id !== optimisticUserMessage.id,
          );
          nextMessages = [
            ...withoutOptimistic,
            result.userMessage,
            result.assistantMessage,
          ];
          return nextMessages;
        });

        const nextThread: ChatterboxRuntimeThread = {
          id: result.threadId,
          title: result.thread.title,
          modelId: result.thread.modelId,
          projectId: result.thread.projectId,
          providerId: result.thread.providerId,
          systemPrompt: thread?.systemPrompt ?? "",
          messages: nextMessages,
        };

        syncThreadState(nextThread, nextMessages);
        activeThreadIdRef.current = result.threadId;
        connectAssistantStream(result.threadId, result.assistantMessage.id);
      } catch (error) {
        updateMessages((current) =>
          current.filter((item) => item.id !== optimisticUserMessage.id),
        );
        setIsRunning(false);
        onErrorRef.current?.(
          error instanceof Error
            ? error
            : new Error("Message could not be sent"),
        );
      }
    },
    [
      connectAssistantStream,
      isSendDisabled,
      projectId,
      syncThreadState,
      thread,
      updateMessages,
    ],
  );

  const runtime = useExternalStoreRuntime<ChatMessageDto>({
    isRunning,
    isSendDisabled,
    messages,
    convertMessage: chatMessageToThreadMessage,
    onNew,
  });

  return {
    runtime,
    messages,
    thread,
    isRunning,
    loadThread,
    clearThread,
  };
}
