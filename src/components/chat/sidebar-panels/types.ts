import type { ButtonIcon } from "@/components/lib/button/Button";
import { IconNames } from "@/lib/IconNames";

export type SidebarPanelId = "threads" | "archived";

export type SidebarPanelDefinition = {
  id: SidebarPanelId;
  title: string;
  toggleLabel: string;
  toggleIcon: ButtonIcon;
};

export const SIDEBAR_PANELS = {
  threads: {
    id: "threads",
    title: "Threads",
    toggleLabel: "Archived",
    toggleIcon: IconNames["archive-line"],
  },
  archived: {
    id: "archived",
    title: "Archived",
    toggleLabel: "Threads",
    toggleIcon: IconNames["drawer-line"],
  },
} as const satisfies Record<SidebarPanelId, SidebarPanelDefinition>;

export function getAlternateSidebarPanel(
  panel: SidebarPanelId,
): SidebarPanelId {
  return panel === "threads" ? "archived" : "threads";
}
