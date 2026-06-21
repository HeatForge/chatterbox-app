import { useEffect, useRef } from "react";
import type { ChatMessage, ToolCallStatus } from "../../../utils/types/chat";
import AssistantMessageBlip from "./AssistantMessageBlip";
import UserMessageBlip from "./UserMessageBlip";

interface ChatMessageListProps {
  messages: ChatMessage[];
  onPrevVariant: (messageId: string) => void;
  onNextVariant: (messageId: string) => void;
  onToolCallStatusChange: (
    messageId: string,
    status: ToolCallStatus,
  ) => void;
}

export default function ChatMessageList({
  messages,
  onPrevVariant,
  onNextVariant,
  onToolCallStatusChange,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-message-list">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessageBlip
            key={message.id}
            message={message}
            onPrevVariant={() => onPrevVariant(message.id)}
            onNextVariant={() => onNextVariant(message.id)}
          />
        ) : (
          <AssistantMessageBlip
            key={message.id}
            message={message}
            onPrevVariant={() => onPrevVariant(message.id)}
            onNextVariant={() => onNextVariant(message.id)}
            onToolCallStatusChange={(status) =>
              onToolCallStatusChange(message.id, status)
            }
          />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
