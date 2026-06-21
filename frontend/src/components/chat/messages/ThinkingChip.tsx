import Icon from "../../primitive/Icon";

interface ThinkingChipProps {
  text: string;
  expanded: boolean;
  onToggle: () => void;
}

export default function ThinkingChip({
  text,
  expanded,
  onToggle,
}: ThinkingChipProps) {
  return (
    <div className={`chat-thinking${expanded ? " chat-thinking--expanded" : ""}`}>
      <button
        type="button"
        className="chat-thinking__toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <Icon name="brain-line" aria-hidden />
        <span>Thinking</span>
        <Icon
          name={expanded ? "up-line" : "down-line"}
          className="chat-thinking__chevron"
          aria-hidden
        />
      </button>
      <div className="chat-thinking__panel" aria-hidden={!expanded}>
        <p className="chat-thinking__text">{text}</p>
      </div>
    </div>
  );
}
