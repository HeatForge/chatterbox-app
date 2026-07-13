"use client";

import { ArchiveRestore, MessageSquare } from "lucide-react";

import {
  type SidebarThreadAction,
  SidebarThreadItem,
} from "@/components/chat/sidebar-thread-item";

export type ArchivedThreadProps = {
  id: string;
  title: string;
  selected?: boolean;
  onSelect: () => void;
  onUnarchive?: () => void;
};

export function ArchivedThread({
  title,
  selected = false,
  onSelect,
  onUnarchive,
}: ArchivedThreadProps) {
  const actions: SidebarThreadAction[] = [
    {
      id: "unarchive",
      icon: ArchiveRestore,
      label: "Unarchive thread",
      onClick: onUnarchive ?? (() => {}),
    },
  ];

  return (
    <SidebarThreadItem
      title={title}
      icon={MessageSquare}
      selected={selected}
      onSelect={onSelect}
      actions={actions}
    />
  );
}
