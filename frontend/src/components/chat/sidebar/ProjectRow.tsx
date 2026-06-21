
import {
  PROJECT_ROW_ACTIONS,
  type ThreadRowAction,
} from "../../../utils/sidebar/rowActions";
import ThreadRowBase from "./ThreadRowBase";

interface ProjectRowProps {
  label: string;
  active?: boolean;
  className?: string;
  onSelect: () => void;
  onAction?: (action: ThreadRowAction) => void;
  onProjectAction?: () => void;
}

export default function ProjectRow({
  label,
  active = false,
  className,
  onSelect,
  onAction,
}: ProjectRowProps) {
  return (
    <ThreadRowBase
      label={label}
      icon="folder-line"
      activeIcon="folder-open-fill"
      active={active}
      ariaExpanded={active}
      className={className}
      kindClassName="chat-thread-row--project"
      dataKind="project"
      onSelect={onSelect}
      actions={PROJECT_ROW_ACTIONS.map((item) => ({
        key: item.action,
        icon: item.icon,
        label: item.label,
        onClick: () => onAction?.(item.action),
      }))}
    />
  );
}
