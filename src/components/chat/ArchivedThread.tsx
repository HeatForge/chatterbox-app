"use client";

import { Thread, type ThreadAction } from "@/components/lib/thread";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

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
  const actions: ThreadAction[] = [
    {
      id: "unarchive",
      icon: IconNames["unarchive-line"],
      label: "Unarchive thread",
      onClick: onUnarchive ?? (() => {}),
      intent: Intent.TERTIARY,
    },
  ];

  return (
    <Thread
      text={title}
      leftIcon={IconNames["chat-3-line"]}
      selected={selected}
      onSelect={onSelect}
      actions={actions}
    />
  );
}
