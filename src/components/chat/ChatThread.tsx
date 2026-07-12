"use client";

import { Thread, type ThreadAction } from "@/components/lib/thread";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

export type ChatThreadProps = {
  id: string;
  title: string;
  selected?: boolean;
  iconDisabled?: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

export function ChatThread({
  title,
  selected = false,
  iconDisabled = false,
  onSelect,
  onEdit,
  onArchive,
  onDelete,
}: ChatThreadProps) {
  const actions: ThreadAction[] = [
    {
      id: "edit",
      icon: IconNames["edit-line"],
      label: "Edit thread",
      onClick: onEdit ?? (() => {}),
      intent: Intent.TERTIARY,
    },
    {
      id: "archive",
      icon: IconNames["archive-line"],
      label: "Archive thread",
      onClick: onArchive ?? (() => {}),
      intent: Intent.TERTIARY,
    },
    {
      id: "delete",
      icon: IconNames["delete-line"],
      label: "Delete thread",
      onClick: onDelete ?? (() => {}),
      intent: Intent.DANGER,
    },
  ];

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
