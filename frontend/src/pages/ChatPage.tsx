import { useCallback, useState } from "react";
import {
  ChatComposer,
  ChatContextSidebar,
  ChatLayout,
  ChatMessageList,
  ChatSidebar,
  INITIAL_MESSAGES,
  MOCK_CHAT_THREADS,
  MOCK_PROJECTS,
} from "../components/chat";
import { useResizable } from "../utils/hooks/useResizable";
import type { ChatMessage, ToolCallStatus } from "../utils/types/chat";
import "./global-pages.css";

let nextMessageId = 100;

function createId(prefix: string) {
  nextMessageId += 1;
  return `${prefix}-${nextMessageId}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    "chat-1",
  );

  const leftPanel = useResizable({
    initialWidth: 400,
    minWidth: 280,
    maxWidth: 520,
    side: "left",
  });

  const rightPanel = useResizable({
    initialWidth: 400,
    minWidth: 240,
    maxWidth: 520,
    side: "right",
  });

  const handleSend = useCallback((text: string) => {
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      variants: [{ content: text }],
      activeVariantIndex: 0,
    };

    const assistantMessage: ChatMessage = {
      id: createId("msg"),
      role: "assistant",
      variants: [
        {
          content: `Here's a placeholder reply to: "${text}"`,
        },
        {
          content: `Alternate take — I understood your message as: "${text}". A fuller answer will connect to the backend later.`,
        },
      ],
      activeVariantIndex: 0,
      thinking: "Composing a response based on the latest message…",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
  }, []);

  const handlePrevVariant = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || message.activeVariantIndex === 0) {
          return message;
        }
        return {
          ...message,
          activeVariantIndex: message.activeVariantIndex - 1,
        };
      }),
    );
  }, []);

  const handleNextVariant = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (
          message.id !== messageId ||
          message.activeVariantIndex >= message.variants.length - 1
        ) {
          return message;
        }
        return {
          ...message,
          activeVariantIndex: message.activeVariantIndex + 1,
        };
      }),
    );
  }, []);

  const handleToolCallStatusChange = useCallback(
    (messageId: string, status: ToolCallStatus) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId || !message.toolCall) return message;
          return {
            ...message,
            toolCall: { ...message.toolCall, status },
          };
        }),
      );
    },
    [],
  );

  return (
    <main className="page page-chat">
      <ChatLayout>
        <ChatSidebar
          width={leftPanel.width}
          resizeHandleProps={leftPanel.handleProps}
          projects={MOCK_PROJECTS}
          chatThreads={MOCK_CHAT_THREADS}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />
        <div className="chat-layout__main">
          <ChatMessageList
            messages={messages}
            onPrevVariant={handlePrevVariant}
            onNextVariant={handleNextVariant}
            onToolCallStatusChange={handleToolCallStatusChange}
          />
          <ChatComposer onSend={handleSend} />
        </div>
        <ChatContextSidebar
          width={rightPanel.width}
          resizeHandleProps={rightPanel.handleProps}
        />
      </ChatLayout>
    </main>
  );
}
