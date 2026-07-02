"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ToastPlacement } from "@/hooks/use-toaster/types";
import { useToaster } from "@/hooks/use-toaster/use-toaster";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";
import { Button } from "../lib/button/Button";
import { ChatInput } from "../lib/chat-input/ChatInput";
import { ChatInputState } from "../lib/chat-input/enums";
import { AssistantMessageBlip, UserMessageBlip } from "../lib/message-blip";
import {
  Sidebar,
  SidebarProvider,
  SidebarToggle,
  useSidebar,
} from "../lib/sidebar";
import styles from "./chat.module.css";

type ThreadSummary = {
  id: string;
  title: string;
  modelId: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "completed" | "streaming" | "error";
  error: string | null;
  createdAt: string;
};

type ThreadPayload = ThreadSummary & {
  providerId: string | null;
  systemPrompt: string;
  messages: ChatMessage[];
};

type SendMessageResponse = {
  threadId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

function createOptimisticUserMessage(content: string): ChatMessage {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    role: "user",
    content,
    status: "completed",
    error: null,
    createdAt: new Date().toISOString(),
  };
}

function toThreadSummary(thread: ThreadPayload): ThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    modelId: thread.modelId,
  };
}

function SidebarThreads({
  threads,
  activeThreadId,
  onSelectThread,
}: {
  threads: ThreadSummary[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}) {
  const { notifyItemSelected } = useSidebar();

  return (
    <>
      {threads.map((thread) => (
        <button
          key={thread.id}
          type="button"
          className={[
            styles.threadItem,
            thread.id === activeThreadId ? styles.threadItemActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            onSelectThread(thread.id);
            notifyItemSelected();
          }}
        >
          {thread.title}
        </button>
      ))}
    </>
  );
}

function ChatViewContent() {
  const router = useRouter();
  const showToast = useToaster();
  const { notifyItemSelected } = useSidebar();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThread, setActiveThread] = useState<ThreadPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputState, setInputState] = useState(ChatInputState.READY);
  const messageListRef = useRef<HTMLDivElement>(null);
  const streamsRef = useRef<Map<string, EventSource>>(new Map());
  const threadCacheRef = useRef<Map<string, ThreadPayload>>(new Map());

  useEffect(() => {
    return () => {
      for (const stream of streamsRef.current.values()) {
        stream.close();
      }
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages update
  useEffect(() => {
    const list = messageListRef.current;
    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!activeThread) {
      return;
    }

    threadCacheRef.current.set(activeThread.id, {
      ...activeThread,
      messages,
    });
  }, [activeThread, messages]);

  function cacheThread(thread: ThreadPayload): void {
    threadCacheRef.current.set(thread.id, thread);
  }

  function applyThread(thread: ThreadPayload): void {
    setActiveThread(thread);
    setMessages(thread.messages);

    let hasStreamingMessage = false;
    for (const message of thread.messages) {
      if (message.role === "assistant" && message.status === "streaming") {
        hasStreamingMessage = true;
        setInputState(ChatInputState.STREAMING);
        connectAssistantStream(thread.id, message.id);
      }
    }

    if (!hasStreamingMessage) {
      setInputState(ChatInputState.READY);
    }
  }

  async function loadAllThreads(): Promise<void> {
    const response = await fetch("/api/chat/threads?full=true");
    if (!response.ok) {
      throw new Error("Failed to load threads");
    }

    const payloads = (await response.json()) as ThreadPayload[];
    const cache = new Map<string, ThreadPayload>();

    for (const thread of payloads) {
      cache.set(thread.id, thread);
    }

    threadCacheRef.current = cache;
    setThreads(payloads.map(toThreadSummary));

    if (payloads[0]) {
      applyThread(payloads[0]);
    }
  }

  async function loadThreads(): Promise<ThreadSummary[]> {
    const response = await fetch("/api/chat/threads");
    if (!response.ok) {
      throw new Error("Failed to load threads");
    }

    const nextThreads = (await response.json()) as ThreadSummary[];
    setThreads(nextThreads);
    return nextThreads;
  }

  function connectAssistantStream(threadId: string, messageId: string): void {
    if (streamsRef.current.has(messageId)) {
      return;
    }

    const stream = new EventSource(
      `/api/chat/threads/${threadId}/messages/${messageId}/stream`,
    );
    streamsRef.current.set(messageId, stream);

    stream.addEventListener("content", (event) => {
      const message = JSON.parse((event as MessageEvent).data) as ChatMessage;
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? message : item)),
      );
    });

    function finish(event: Event): void {
      const message = JSON.parse((event as MessageEvent).data) as ChatMessage;
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? message : item)),
      );
      stream.close();
      streamsRef.current.delete(messageId);
      setInputState(ChatInputState.READY);
    }

    stream.addEventListener("done", finish);
    stream.addEventListener("error", (event) => {
      if ("data" in event && typeof event.data === "string") {
        finish(event);
      } else {
        stream.close();
        streamsRef.current.delete(messageId);
        setInputState(ChatInputState.ERROR);
      }
    });
  }

  async function loadThread(threadId: string): Promise<void> {
    const cached = threadCacheRef.current.get(threadId);
    if (cached) {
      applyThread(cached);
      return;
    }

    const response = await fetch(`/api/chat/threads/${threadId}`);
    if (!response.ok) {
      throw new Error("Failed to load thread");
    }

    const thread = (await response.json()) as ThreadPayload;
    cacheThread(thread);
    applyThread(thread);
  }

  function selectThread(threadId: string): void {
    void loadThread(threadId);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load initial thread list once
  useEffect(() => {
    void loadAllThreads().catch(() => {
      showToast({
        title: "Chat unavailable",
        description: "Could not load your chat threads.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    });
  }, [showToast]);

  async function handleSubmit(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || inputState !== ChatInputState.READY) {
      return;
    }

    setInputState(ChatInputState.WAITING);
    const optimisticUserMessage = createOptimisticUserMessage(trimmed);
    setMessages((current) => [...current, optimisticUserMessage]);

    try {
      const endpoint = activeThread
        ? `/api/chat/threads/${activeThread.id}/messages`
        : "/api/chat/messages";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Message could not be sent");
      }

      const result = (await response.json()) as SendMessageResponse;
      let updatedMessages: ChatMessage[] = [];

      setMessages((current) => {
        const withoutOptimisticMessage = current.filter(
          (message) => message.id !== optimisticUserMessage.id,
        );
        updatedMessages = [
          ...withoutOptimisticMessage,
          result.userMessage,
          result.assistantMessage,
        ];
        return updatedMessages;
      });

      const loadedThreads = await loadThreads();
      const createdThread = loadedThreads.find(
        (thread) => thread.id === result.threadId,
      );
      const currentThread =
        activeThread?.id === result.threadId
          ? activeThread
          : ({
              id: result.threadId,
              title: createdThread?.title ?? "New chat",
              modelId: createdThread?.modelId ?? "",
              providerId: null,
              systemPrompt: "",
              messages: [],
            } satisfies ThreadPayload);

      const updatedThread: ThreadPayload = {
        ...currentThread,
        title: createdThread?.title ?? currentThread.title,
        modelId: createdThread?.modelId ?? currentThread.modelId,
        messages: updatedMessages,
      };

      setActiveThread(updatedThread);
      cacheThread(updatedThread);
      setInputState(ChatInputState.STREAMING);
      connectAssistantStream(result.threadId, result.assistantMessage.id);
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUserMessage.id),
      );
      setInputState(ChatInputState.ERROR);
      showToast({
        title: "Message failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not start generation.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    }
  }

  async function startNewChat(): Promise<void> {
    setActiveThread(null);
    setMessages([]);
    setInputState(ChatInputState.READY);
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        footer={
          <div className={styles.sidebarFooter}>
            <Button
              text="New chat"
              leftIcon={IconNames["add-line"]}
              intent={Intent.SECONDARY}
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                notifyItemSelected();
                void startNewChat();
              }}
            />
            <Button
              text="Settings"
              leftIcon={IconNames["settings-3-line"]}
              intent={Intent.TERTIARY}
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                notifyItemSelected();
                router.push("/settings");
              }}
            />
          </div>
        }
      >
        <SidebarThreads
          threads={threads}
          activeThreadId={activeThread?.id ?? null}
          onSelectThread={selectThread}
        />
      </Sidebar>

      <main className={styles.chatView}>
        <header className={styles.header}>
          <SidebarToggle />
          <span className={styles.headerTitle}>
            {activeThread
              ? `${activeThread.title} · ${activeThread.modelId}`
              : "New chat"}
          </span>
        </header>

        <div ref={messageListRef} className={styles.messageList}>
          {messages.length === 0 ? (
            <div className={styles.emptyChat}>
              Add providers in Settings, choose a model, then start a chat.
            </div>
          ) : (
            messages.map((message) => {
              if (message.role === "user") {
                return (
                  <UserMessageBlip key={message.id} content={message.content} />
                );
              }

              return (
                <AssistantMessageBlip
                  key={message.id}
                  content={
                    message.status === "error"
                      ? (message.error ?? "Generation failed")
                      : message.content
                  }
                />
              );
            })
          )}
        </div>

        <div className={styles.inputArea}>
          <ChatInput
            state={inputState}
            onSubmit={(text) => void handleSubmit(text)}
          />
        </div>
      </main>
    </div>
  );
}

export default function ChatView() {
  return (
    <SidebarProvider>
      <ChatViewContent />
    </SidebarProvider>
  );
}
