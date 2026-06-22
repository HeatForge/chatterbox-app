import { IconButton } from "../../primitive";

interface MessageActionsProps {
  content: string;
  variantIndex: number;
  variantCount: number;
  isLoading?: boolean;
  onPrevVariant: () => void;
  onNextVariant: () => void;
}

export default function MessageActions({
  content,
  variantIndex,
  variantCount,
  isLoading = false,
  onPrevVariant,
  onNextVariant,
}: MessageActionsProps) {
  const hasVariants = variantCount > 1;
  const isLastVariant = variantIndex >= variantCount - 1;

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
      <div className="chat-message-actions__variants">
        {hasVariants ? (
          <>
            <IconButton
              icon="left-line"
              label="Previous answer"
              className="chat-message-actions__btn"
              onClick={onPrevVariant}
              disabled={isLoading || variantIndex === 0}
            />
            <span className="chat-message-actions__counter">
              {variantIndex + 1} / {variantCount}
            </span>
          </>
        ) : null}
        <IconButton
          icon="right-line"
          label={isLastVariant ? "Regenerate answer" : "Next answer"}
          className="chat-message-actions__btn"
          onClick={onNextVariant}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
