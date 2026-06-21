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
      >
        <Icon name="brain-line" />
        <span>Thinking</span>
        <Icon
          name={expanded ? "up-line" : "down-line"}
          className="chat-thinking__chevron"
        />
      </button>
      <div className="chat-thinking__extension">
        <p className="chat-thinking__body">{expanded ? text : ""}<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>Dorime</p>
      </div>
    </div>
  );
}
