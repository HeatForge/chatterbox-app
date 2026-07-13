import type { SidebarData, SidebarSelection } from "./chat-sidebar-types";

export function getProjectTitle(
  projectId: string,
  sidebar: SidebarData,
): string | undefined {
  return (
    sidebar.projects.find((project) => project.id === projectId)?.title ??
    sidebar.archived.projects.find((project) => project.id === projectId)?.title
  );
}

export function findFirstAvailableThreadId(
  sidebar: SidebarData,
): string | undefined {
  const firstStandalone = sidebar.standalone[0];
  if (firstStandalone) {
    return firstStandalone.id;
  }

  for (const project of sidebar.projects) {
    const firstThread = project.threads[0];
    if (firstThread) {
      return firstThread.id;
    }
  }

  const firstArchivedStandalone = sidebar.archived.standalone[0];
  if (firstArchivedStandalone) {
    return firstArchivedStandalone.id;
  }

  for (const project of sidebar.archived.projects) {
    const firstThread = project.threads[0];
    if (firstThread) {
      return firstThread.id;
    }
  }

  return undefined;
}

export function getProjectIdFromSelection(
  selection: SidebarSelection | null,
): string | null {
  if (!selection) {
    return null;
  }

  if (selection.type === "project") {
    return selection.projectId;
  }

  return selection.projectId;
}

export function getThreadTitle(
  threadId: string,
  projects: SidebarData["projects"],
  standalone: SidebarData["standalone"],
): string {
  const standaloneThread = standalone.find((thread) => thread.id === threadId);
  if (standaloneThread) {
    return standaloneThread.title;
  }

  for (const project of projects) {
    const projectThread = project.threads.find(
      (thread) => thread.id === threadId,
    );
    if (projectThread) {
      return projectThread.title;
    }
  }

  return "Thread";
}
