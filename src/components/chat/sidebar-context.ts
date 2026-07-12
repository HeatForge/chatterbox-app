import type {
  SidebarProject,
  SidebarSelection,
  SidebarStandaloneThread,
} from "@/components/chat/ChatSidebar";

export type SidebarArchivedData = {
  projects: SidebarProject[];
  standalone: SidebarStandaloneThread[];
};

export type SidebarDataShape = {
  projects: SidebarProject[];
  standalone: SidebarStandaloneThread[];
  archived: SidebarArchivedData;
};

export function isArchivedThreadId(
  threadId: string,
  archived: SidebarArchivedData,
): boolean {
  if (archived.standalone.some((thread) => thread.id === threadId)) {
    return true;
  }

  return archived.projects.some((project) =>
    project.threads.some((thread) => thread.id === threadId),
  );
}

export function isArchivedProjectId(
  projectId: string,
  archived: SidebarArchivedData,
): boolean {
  return archived.projects.some((project) => project.id === projectId);
}

export function isArchivedChatContext(
  sidebar: SidebarDataShape,
  activeThread: { id: string; projectId: string | null } | null,
  selection: SidebarSelection | null,
): boolean {
  if (activeThread) {
    if (isArchivedThreadId(activeThread.id, sidebar.archived)) {
      return true;
    }

    if (
      activeThread.projectId &&
      isArchivedProjectId(activeThread.projectId, sidebar.archived)
    ) {
      return true;
    }
  }

  if (
    selection?.type === "project" &&
    isArchivedProjectId(selection.projectId, sidebar.archived)
  ) {
    return true;
  }

  return false;
}
