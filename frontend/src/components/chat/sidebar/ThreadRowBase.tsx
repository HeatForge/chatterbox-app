import { Icon, IconButton } from "../../primitive";

export interface SidebarRowAction {
  key: string;
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}

export interface ThreadRowBaseProps {
  label: string;
  active?: boolean;
  icon: string;
  activeIcon?: string;
  ariaExpanded?: boolean;
  className?: string;
  kindClassName?: string;
  dataKind?: "project" | "thread";
  onSelect: () => void;
  actions: SidebarRowAction[];
}

export default function ThreadRowBase({
  label,
  active = false,
  icon,
  activeIcon,
  ariaExpanded,
  className,
  kindClassName,
  dataKind,
  onSelect,
  actions,
}: ThreadRowBaseProps) {
  return (
    <div
      className={["chat-thread-row", kindClassName, className]
        .filter(Boolean)
        .join(" ")}
      data-kind={dataKind}
    >
      <button
        type="button"
        className={[
          "chat-thread-row__main",
          active ? "chat-thread-row__main--active" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onSelect}
        aria-expanded={ariaExpanded}
      >
        <Icon
          name={active ? (activeIcon ?? icon) : icon}
          className="chat-thread-row__icon"
          aria-hidden
        />
        <span className="chat-thread-row__label">{label}</span>
      </button>
      <div className="chat-thread-row__actions">
        {actions.map((action) => (
          <IconButton
            key={action.key}
            icon={action.icon}
            label={action.label}
            className={["chat-thread-row__action", action.className]
              .filter(Boolean)
              .join(" ")}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick();
            }}
          />
        ))}
      </div>
    </div>
  );
}
