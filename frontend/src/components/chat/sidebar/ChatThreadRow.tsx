import {
  THREAD_ROW_ACTIONS,
  type ThreadRowAction,
} from "../../../utils/sidebar/rowActions";
import ThreadRowBase from "./ThreadRowBase";

export type ChatThreadRowVariant = "solo" | "nested";

interface ChatThreadRowProps {
  label: string;
  variant?: ChatThreadRowVariant;
  active?: boolean;
  className?: string;
  onSelect: () => void;
  onAction?: (action: ThreadRowAction) => void;
}

export default function ChatThreadRow({
  label,
  variant = "solo",
  active = false,
  className,
  onSelect,
  onAction,
}: ChatThreadRowProps) {
  return (
    <ThreadRowBase
      label={label}
      icon={variant === "nested" ? "" : "chat-1-line"}
      activeIcon={variant === "nested" ? "" : "chat-1-fill"}
      active={active}
      className={className}
      kindClassName={`chat-thread-row--thread chat-thread-row--${variant}`}
      dataKind="thread"
      onSelect={onSelect}
      actions={THREAD_ROW_ACTIONS.map((item) => ({
        key: item.action,
        icon: item.icon,
        label: item.label,
        onClick: () => onAction?.(item.action),
      }))}
    />
  );
}
