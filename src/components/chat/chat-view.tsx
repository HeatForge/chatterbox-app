"use client";

import type { UIMessage } from "ai";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";

import { ChatInput } from "../lib/chat-input/ChatInput";
import { ChatInputState } from "../lib/chat-input/enums";
import { AssistantMessageBlip, UserMessageBlip } from "../lib/message-blip";
import {
  Sidebar,
  SidebarProvider,
  SidebarToggle,
  useSidebar,
} from "../lib/sidebar";
import sidebarStyles from "../lib/sidebar/sidebar.module.css";
import styles from "./chat.module.css";
import { initialThreads } from "./chat-data";
import { Button } from "../lib/button/Button";
import { Intent } from "@/lib/Intent";
import { IconNames } from "@/lib/IconNames";

const DEMO_THINKING = `The user is asking for food-focused weekend ideas in Portland.
I should suggest a route that stays walkable and relaxed.
Central Eastside has good density of coffee, pastries, and dinner spots.`;

const INITIAL_MESSAGES: UIMessage[] = [
  ...initialThreads[0].messages.slice(0, 3),
  ...initialThreads[1].messages,
];

function createTextMessage(
  role: UIMessage["role"],
  text: string,
  id = nanoid(),
): UIMessage {
  return {
    id,
    role,
    parts: [{ type: "text", text }],
  };
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n");
}

function buildDemoResponse(userText: string): {
  thinking: string;
  content: string;
} {
  return {
    thinking: `The user said: "${userText}"\nI should reply with a helpful markdown example.`,
    content: `You wrote:\n\n> ${userText}\n\nHere's a demo reply with **markdown**:\n\n- Bullet one\n- Bullet two\n\n\`\`\`ts\nconsole.log("streaming works");\n\`\`\``,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function SidebarThreadPlaceholders() {
  const { notifyItemSelected } = useSidebar();

  return (
    <>
      {initialThreads.map((thread) => (
        <Button 
          key={thread.id}
          text={thread.title}
          leftIcon={IconNames["chat-3-line"]}
          style={{justifyContent: "flex-start"}}
          onClick={() => notifyItemSelected()}
        />
      ))}
    </>
  );
}

function ChatViewContent() {
  const [messages, setMessages] = useState<UIMessage[]>(INITIAL_MESSAGES);
  const [thinkingById, setThinkingById] = useState<Record<string, string>>({
    m4: DEMO_THINKING,
  });
  const [inputState, setInputState] = useState(ChatInputState.READY);
  const messageListRef = useRef<HTMLDivElement>(null);
  const streamAbortRef = useRef(false);

  useEffect(() => {
    return () => {
      streamAbortRef.current = true;
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

  async function handleSubmit(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || inputState !== ChatInputState.READY) {
      return;
    }

    setMessages((current) => [...current, createTextMessage("user", trimmed)]);
    setInputState(ChatInputState.WAITING);
    await delay(500);

    if (streamAbortRef.current) {
      return;
    }

    const assistantId = nanoid();
    const { thinking, content } = buildDemoResponse(trimmed);

    setThinkingById((current) => ({ ...current, [assistantId]: thinking }));
    setMessages((current) => [
      ...current,
      createTextMessage("assistant", "", assistantId),
    ]);
    setInputState(ChatInputState.STREAMING);

    const chunkSize = 4;
    for (let index = 0; index <= content.length; index += chunkSize) {
      if (streamAbortRef.current) {
        return;
      }

      const slice = content.slice(0, index);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? createTextMessage("assistant", slice, assistantId)
            : message,
        ),
      );
      await delay(30);
    }

    if (!streamAbortRef.current) {
      setInputState(ChatInputState.READY);
    }
  }

  return (
    <div className={styles.shell}>
      <Sidebar>
        <SidebarThreadPlaceholders />
      </Sidebar>

      <main className={styles.chatView}>
        <header className={styles.header}>
          <SidebarToggle />
          <span className={styles.headerTitle}>
            This is the header of the chat
          </span>
        </header>

        <div ref={messageListRef} className={styles.messageList}>
          {messages.map((message) => {
            const content = getMessageText(message);

            if (message.role === "user") {
              return <UserMessageBlip key={message.id} content={content} />;
            }

            return (
              <AssistantMessageBlip
                key={message.id}
                content={content}
                thinking={thinkingById[message.id]}
              />
            );
          })}
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
