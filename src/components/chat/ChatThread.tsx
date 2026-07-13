"use client";

import { Archive, MessageSquare, Pencil, Trash2 } from "lucide-react";

import {
  type SidebarThreadAction,
  SidebarThreadItem,
} from "@/components/chat/sidebar-thread-item";

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
  const actions: SidebarThreadAction[] = [
    {
      id: "edit",
      icon: Pencil,
      label: variant === "project" ? "Rename thread" : "Edit thread",
      onClick: onEdit ?? (() => {}),
    },
  ];

  if (variant === "standalone") {
    actions.push({
      id: "archive",
      icon: Archive,
      label: "Archive thread",
      onClick: onArchive ?? (() => {}),
    });
  }

  actions.push({
    id: "delete",
    icon: Trash2,
    label: "Delete thread",
    onClick: onDelete ?? (() => {}),
    variant: "destructive",
  });

  return (
    <SidebarThreadItem
      title={title}
      icon={iconDisabled ? undefined : MessageSquare}
      selected={selected}
      onSelect={onSelect}
      actions={actions}
      subItem={variant === "project"}
    />
  );
}
