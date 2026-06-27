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
        <Button
          key={thread.id}
          text={thread.title}
          leftIcon={IconNames["chat-3-line"]}
          intent={thread.id === activeThreadId ? Intent.SECONDARY : Intent.PRIMARY}
          style={{ justifyContent: "flex-start" }}
          onClick={() => {
            onSelectThread(thread.id);
            notifyItemSelected();
          }}
        />
      ))}
    </>
  );
}

function ChatViewContent() {
  const router = useRouter();
  const showToast = useToaster();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThread, setActiveThread] = useState<ThreadPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputState, setInputState] = useState(ChatInputState.READY);
  const messageListRef = useRef<HTMLDivElement>(null);
  const streamsRef = useRef<Map<string, EventSource>>(new Map());

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
    const response = await fetch(`/api/chat/threads/${threadId}`);
    if (!response.ok) {
      throw new Error("Failed to load thread");
    }

    const thread = (await response.json()) as ThreadPayload;
    setActiveThread(thread);
    setMessages(thread.messages);

    for (const message of thread.messages) {
      if (message.role === "assistant" && message.status === "streaming") {
        setInputState(ChatInputState.STREAMING);
        connectAssistantStream(thread.id, message.id);
      }
    }
  }

  useEffect(() => {
    void loadThreads()
      .then((loadedThreads) => {
        if (loadedThreads[0]) {
          return loadThread(loadedThreads[0].id);
        }
      })
      .catch(() => {
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
      setMessages((current) => [
        ...current,
        result.userMessage,
        result.assistantMessage,
      ]);

      const loadedThreads = await loadThreads();
      const currentThread =
        activeThread?.id === result.threadId
          ? activeThread
          : ({
              id: result.threadId,
              title:
                loadedThreads.find((thread) => thread.id === result.threadId)
                  ?.title ?? "New chat",
              modelId: "",
              providerId: null,
              systemPrompt: "",
              messages: [],
            } satisfies ThreadPayload);
      setActiveThread(currentThread);
      setInputState(ChatInputState.STREAMING);
      connectAssistantStream(result.threadId, result.assistantMessage.id);
    } catch (error) {
      setInputState(ChatInputState.ERROR);
      showToast({
        title: "Message failed",
        description:
          error instanceof Error ? error.message : "Could not start generation.",
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
              onClick={() => void startNewChat()}
            />
            <Button
              text="Settings"
              leftIcon={IconNames["settings-3-line"]}
              intent={Intent.TERTIARY}
              style={{ justifyContent: "flex-start" }}
              onClick={() => router.push("/settings")}
            />
          </div>
        }
      >
        <SidebarThreads
          threads={threads}
          activeThreadId={activeThread?.id ?? null}
          onSelectThread={(threadId) => void loadThread(threadId)}
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
