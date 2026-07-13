import type { LucideIcon } from "lucide-react";
import { Archive, Inbox } from "lucide-react";

export type SidebarPanelId = "threads" | "archived";

export type SidebarPanelDefinition = {
  id: SidebarPanelId;
  title: string;
  toggleLabel: string;
  toggleIcon: LucideIcon;
};

export const SIDEBAR_PANELS = {
  threads: {
    id: "threads",
    title: "Threads",
    toggleLabel: "Archived",
    toggleIcon: Archive,
  },
  archived: {
    id: "archived",
    title: "Archived",
    toggleLabel: "Threads",
    toggleIcon: Inbox,
  },
} as const satisfies Record<SidebarPanelId, SidebarPanelDefinition>;

export function getAlternateSidebarPanel(
  panel: SidebarPanelId,
): SidebarPanelId {
  return panel === "threads" ? "archived" : "threads";
}
