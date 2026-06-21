import { useState } from "react";
import type { ChatMessage, ToolCallStatus } from "../../../utils/types/chat";
import MessageActions from "./MessageActions";
import ThinkingChip from "./ThinkingChip";
import ToolCallPanel from "./ToolCallPanel";

interface AssistantMessageBlipProps {
  message: ChatMessage;
  onPrevVariant: () => void;
  onNextVariant: () => void;
  onToolCallStatusChange: (status: ToolCallStatus) => void;
}

export default function AssistantMessageBlip({
  message,
  onPrevVariant,
  onNextVariant,
  onToolCallStatusChange,
}: AssistantMessageBlipProps) {
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const variant = message.variants[message.activeVariantIndex];

  return (
    <article className="chat-message chat-message--assistant">
      <div className="chat-message__group">
        {message.thinking ? (
          <ThinkingChip
            text={message.thinking}
            expanded={thinkingExpanded}
            onToggle={() => setThinkingExpanded((v) => !v)}
          />
        ) : null}
        <div className="chat-message__bubble">
          {message.toolCall ? (
            <ToolCallPanel
              toolCall={message.toolCall}
              onStatusChange={onToolCallStatusChange}
            />
          ) : null}
          <p className="chat-message__content">{variant.content}</p>
        </div>
        <MessageActions
          content={variant.content}
          variantIndex={message.activeVariantIndex}
          variantCount={message.variants.length}
          onPrevVariant={onPrevVariant}
          onNextVariant={onNextVariant}
        />
      </div>
    </article>
  );
}
