import { useState } from "react";
import type { ChatMessage, ToolCallStatus } from "../../../utils/types/chat";
import LiveMarkdown from "../../markdown/LiveMarkdown";
import MessageActions from "./MessageActions";
import ThinkingChip from "./ThinkingChip";
import ToolCallPanel from "./ToolCallPanel";

interface AssistantMessageBlipProps {
  message: ChatMessage;
  isGenerating?: boolean;
  onPrevVariant: () => void;
  onNextVariant: () => void;
  onToolCallStatusChange: (status: ToolCallStatus) => void;
}

export default function AssistantMessageBlip({
  message,
  isGenerating = false,
  onPrevVariant,
  onNextVariant,
  onToolCallStatusChange,
}: AssistantMessageBlipProps) {
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const variant = message.variants[message.activeVariantIndex];
  const showLoading = isGenerating && !message.error;

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
          <LiveMarkdown content={variant.content} className="chat-message__content" />
          {showLoading ? (
            <p className="chat-message__status chat-message__status--loading">
              <span className="chat-message__loading-dots" aria-hidden="true" />
              Generating response…
            </p>
          ) : null}
          {message.error ? (
            <p className="chat-message__status chat-message__status--error" role="alert">
              {message.error}
            </p>
          ) : null}
        </div>
        <MessageActions
          content={variant.content}
          variantIndex={message.activeVariantIndex}
          variantCount={message.variants.length}
          isLoading={isGenerating}
          onPrevVariant={onPrevVariant}
          onNextVariant={onNextVariant}
        />
      </div>
    </article>
  );
}
