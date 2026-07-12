"use client";

import { Thread, type ThreadAction } from "@/components/lib/thread";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

export type ChatThreadProps = {
  id: string;
  title: string;
  selected?: boolean;
  iconDisabled?: boolean;
  variant?: "standalone" | "project";
  onSelect: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

export function ChatThread({
  title,
  selected = false,
  iconDisabled = false,
  variant = "standalone",
  onSelect,
  onEdit,
  onArchive,
  onDelete,
}: ChatThreadProps) {
  const actions: ThreadAction[] = [
    {
      id: "edit",
      icon: IconNames["pencil-line"],
      label: variant === "project" ? "Rename thread" : "Edit thread",
      onClick: onEdit ?? (() => {}),
      intent: Intent.TERTIARY,
    },
  ];

  if (variant === "standalone") {
    actions.push({
      id: "archive",
      icon: IconNames["archive-line"],
      label: "Archive thread",
      onClick: onArchive ?? (() => {}),
      intent: Intent.TERTIARY,
    });
  }

  actions.push({
    id: "delete",
    icon: IconNames["delete-line"],
    label: "Delete thread",
    onClick: onDelete ?? (() => {}),
    intent: Intent.DANGER,
  });

  return (
    <Thread
      text={title}
      leftIcon={iconDisabled ? undefined : IconNames["chat-3-line"]}
      selected={selected}
      onSelect={onSelect}
      actions={actions}
    />
  );
}
