import { IconButton } from "../../primitive";

interface MessageActionsProps {
  content: string;
  variantIndex: number;
  variantCount: number;
  onPrevVariant: () => void;
  onNextVariant: () => void;
}

export default function MessageActions({
  content,
  variantIndex,
  variantCount,
  onPrevVariant,
  onNextVariant,
}: MessageActionsProps) {
  const hasVariants = variantCount > 1;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      /* clipboard unavailable in some contexts */
    }
  }

  return (
    <div className="chat-message-actions">
      <IconButton
        icon="copy-2-line"
        label="Copy message"
        className="chat-message-actions__btn"
        onClick={handleCopy}
      />
      {hasVariants ? (
        <div className="chat-message-actions__variants">
          <IconButton
            icon="left-line"
            label="Previous answer"
            className="chat-message-actions__btn"
            onClick={onPrevVariant}
            disabled={variantIndex === 0}
          />
          <span className="chat-message-actions__counter">
            {variantIndex + 1} / {variantCount}
          </span>
          <IconButton
            icon="right-line"
            label="Next answer"
            className="chat-message-actions__btn"
            onClick={onNextVariant}
            disabled={variantIndex === variantCount - 1}
          />
        </div>
      ) : null}
    </div>
  );
}
