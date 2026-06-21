import type { ChatMessage } from "../../../utils/types/chat";
import MessageActions from "./MessageActions";

interface UserMessageBlipProps {
  message: ChatMessage;
  onPrevVariant: () => void;
  onNextVariant: () => void;
}

export default function UserMessageBlip({
  message,
  onPrevVariant,
  onNextVariant,
}: UserMessageBlipProps) {
  const variant = message.variants[message.activeVariantIndex];

  return (
    <article className="chat-message chat-message--user">
      <div className="chat-message__group">
        <div className="chat-message__bubble">
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
