export type ThreadRowAction = "rename" | "archive" | "fork" | "delete" | "settings";

export interface SidebarRowActionConfig {
  action: ThreadRowAction;
  icon: string;
  label: string;
}

export const THREAD_ROW_ACTIONS: SidebarRowActionConfig[] = [
  { action: "rename", icon: "pencil-line", label: "Rename" },
  { action: "archive", icon: "archive-line", label: "Archive" },
  { action: "fork", icon: "fork-line", label: "Fork" },
  { action: "delete", icon: "delete-2-line", label: "Delete" },
];

export const PROJECT_ROW_ACTIONS: SidebarRowActionConfig[] = [
  { action: "rename", icon: "pencil-line", label: "Rename" },
  { action: "archive", icon: "archive-line", label: "Archive" },
  { action: "settings", icon: "settings-1-line", label: "Settings" },
  { action: "delete", icon: "delete-2-line", label: "Delete" }
];
