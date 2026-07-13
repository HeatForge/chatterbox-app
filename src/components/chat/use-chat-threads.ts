"use client";

import { useCallback, useState } from "react";

import { useChatInitialData } from "@/components/chat/ChatInitialDataProvider";
import {
  EMPTY_SIDEBAR,
  type SidebarData,
  type SidebarProject,
  type SidebarSelection,
} from "@/components/chat/chat-sidebar-types";
import { findFirstAvailableThreadId } from "@/components/chat/chat-sidebar-utils";
import {
  deleteCachedThread,
  getCachedSidebar,
  setCachedSidebar,
} from "@/lib/cache/app-cache";
import { Intent } from "@/lib/Intent";
import { showIntentToast } from "@/lib/toast";

export type ThreadModalState =
  | { kind: "rename-thread"; threadId: string; currentTitle: string }
  | { kind: "rename-project"; projectId: string; currentTitle: string }
  | { kind: "delete-thread"; threadId: string; message: string }
  | { kind: "delete-project"; projectId: string }
  | null;

type UseChatThreadsOptions = {
  activeThreadId: string | null;
  activeProjectId: string | null;
  sidebarSelection: SidebarSelection | null;
  setSidebarSelection: React.Dispatch<
    React.SetStateAction<SidebarSelection | null>
  >;
  setExpandedProjectIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  navigateToThread: (threadId: string) => void;
  navigateToNewChat: () => void;
  getProjectIdFromSelection: (
    selection: SidebarSelection | null,
  ) => string | null;
  /** Reloads the active thread after sidebar metadata mutations. */
  reloadActiveThread?: (threadId: string) => Promise<void>;
};

function showActionError(title: string, error: unknown): void {
  showIntentToast({
    title,
    description:
      error instanceof Error ? error.message : "Something went wrong.",
    intent: Intent.DANGER,
  });
}

/**
 * Sidebar list state plus fetch/mutation handlers for the assistant-ui chat shell.
 */
export function useChatThreads({
  activeThreadId,
  activeProjectId,
  sidebarSelection,
  setSidebarSelection,
  setExpandedProjectIds,
  navigateToThread,
  navigateToNewChat,
  getProjectIdFromSelection,
  reloadActiveThread,
}: UseChatThreadsOptions) {
  const initialData = useChatInitialData();
  const [sidebarData, setSidebarData] = useState<SidebarData>(() => {
    return getCachedSidebar() ?? initialData?.sidebar ?? EMPTY_SIDEBAR;
  });
  const [modal, setModal] = useState<ThreadModalState>(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const loadSidebar = useCallback(async (): Promise<SidebarData> => {
    const response = await fetch("/api/chat/threads?view=sidebar");
    if (!response.ok) {
      throw new Error("Failed to load sidebar");
    }

    const nextSidebar = (await response.json()) as SidebarData;
    const normalized: SidebarData = {
      projects: nextSidebar.projects ?? [],
      standalone: nextSidebar.standalone ?? [],
      archived: nextSidebar.archived ?? { projects: [], standalone: [] },
    };
    setSidebarData(normalized);
    setCachedSidebar(normalized);
    return normalized;
  }, []);

  const upsertSidebarThread = useCallback(
    (
      thread: Pick<SidebarData["standalone"][number], "id" | "title"> & {
        projectId: string | null;
      },
    ): void => {
      setSidebarData((current) => {
        const summary = { id: thread.id, title: thread.title };
        let next: SidebarData;

        if (thread.projectId) {
          const updateProject = (
            project: SidebarData["projects"][number],
          ): SidebarData["projects"][number] =>
            project.id === thread.projectId
              ? {
                  ...project,
                  threads: [
                    summary,
                    ...project.threads.filter((item) => item.id !== thread.id),
                  ],
                }
              : project;
          next = {
            ...current,
            projects: current.projects.map(updateProject),
            archived: {
              ...current.archived,
              projects: current.archived.projects.map(updateProject),
            },
          };
        } else {
          next = {
            ...current,
            standalone: [
              summary,
              ...current.standalone.filter((item) => item.id !== thread.id),
            ],
          };
        }

        setCachedSidebar(next);
        return next;
      });
    },
    [],
  );

  const clearActivePane = useCallback(() => {
    navigateToNewChat();
    setSidebarSelection(null);
  }, [navigateToNewChat, setSidebarSelection]);

  const selectFallbackThread = useCallback(
    async (sidebar: SidebarData): Promise<void> => {
      const fallbackThreadId = findFirstAvailableThreadId(sidebar);
      if (fallbackThreadId) {
        navigateToThread(fallbackThreadId);
        return;
      }

      clearActivePane();
    },
    [clearActivePane, navigateToThread],
  );

  const confirmRenameThread = useCallback(
    async (threadId: string, title: string): Promise<void> => {
      try {
        const response = await fetch(`/api/chat/threads/${threadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) {
          throw new Error("Thread could not be renamed");
        }
        await loadSidebar();
        deleteCachedThread(threadId);
        if (activeThreadId === threadId) {
          await reloadActiveThread?.(threadId);
        }
      } catch (error) {
        showActionError("Rename failed", error);
      }
    },
    [activeThreadId, loadSidebar, reloadActiveThread],
  );

  const confirmRenameProject = useCallback(
    async (projectId: string, title: string): Promise<void> => {
      try {
        const response = await fetch(`/api/chat/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) {
          throw new Error("Project could not be renamed");
        }
        await loadSidebar();
      } catch (error) {
        showActionError("Rename failed", error);
      }
    },
    [loadSidebar],
  );

  const handleRenameThread = useCallback(
    (threadId: string, currentTitle: string): void => {
      setModal({ kind: "rename-thread", threadId, currentTitle });
    },
    [],
  );

  const handleRenameProject = useCallback(
    (projectId: string, currentTitle: string): void => {
      setModal({ kind: "rename-project", projectId, currentTitle });
    },
    [],
  );

  const handleArchiveThread = useCallback(
    async (threadId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/chat/threads/${threadId}/archive`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error("Thread could not be archived");
        }

        const sidebar = await loadSidebar();
        deleteCachedThread(threadId);

        if (activeThreadId === threadId) {
          await selectFallbackThread(sidebar);
        }
      } catch (error) {
        showActionError("Archive failed", error);
      }
    },
    [activeThreadId, loadSidebar, selectFallbackThread],
  );

  const handleUnarchiveThread = useCallback(
    async (threadId: string): Promise<void> => {
      try {
        const response = await fetch(
          `/api/chat/threads/${threadId}/unarchive`,
          { method: "POST" },
        );
        if (!response.ok) {
          throw new Error("Thread could not be unarchived");
        }

        await loadSidebar();
      } catch (error) {
        showActionError("Unarchive failed", error);
      }
    },
    [loadSidebar],
  );

  const confirmDeleteThread = useCallback(
    async (threadId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/chat/threads/${threadId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Thread could not be deleted");
        }

        const sidebar = await loadSidebar();
        deleteCachedThread(threadId);

        if (
          activeThreadId === threadId ||
          (sidebarSelection?.type === "thread" &&
            sidebarSelection.threadId === threadId)
        ) {
          await selectFallbackThread(sidebar);
        }
      } catch (error) {
        showActionError("Delete failed", error);
      }
    },
    [activeThreadId, loadSidebar, selectFallbackThread, sidebarSelection],
  );

  const handleDeleteThread = useCallback(
    (threadId: string, message: string): void => {
      setModal({ kind: "delete-thread", threadId, message });
    },
    [],
  );

  const handleArchiveProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        const response = await fetch(
          `/api/chat/projects/${projectId}/archive`,
          {
            method: "POST",
          },
        );
        if (!response.ok) {
          throw new Error("Project could not be archived");
        }

        const sidebar = await loadSidebar();

        if (
          sidebarSelection?.type === "project" &&
          sidebarSelection.projectId === projectId
        ) {
          clearActivePane();
        }

        if (activeProjectId === projectId) {
          await selectFallbackThread(sidebar);
        }
      } catch (error) {
        showActionError("Archive failed", error);
      }
    },
    [
      activeProjectId,
      clearActivePane,
      loadSidebar,
      selectFallbackThread,
      sidebarSelection,
    ],
  );

  const handleUnarchiveProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        const response = await fetch(
          `/api/chat/projects/${projectId}/unarchive`,
          { method: "POST" },
        );
        if (!response.ok) {
          throw new Error("Project could not be unarchived");
        }

        await loadSidebar();
      } catch (error) {
        showActionError("Unarchive failed", error);
      }
    },
    [loadSidebar],
  );

  const confirmDeleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/chat/projects/${projectId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Project could not be deleted");
        }

        const sidebar = await loadSidebar();

        for (const project of [
          ...sidebar.projects,
          ...sidebar.archived.projects,
        ]) {
          if (project.id !== projectId) {
            continue;
          }

          for (const item of project.threads) {
            deleteCachedThread(item.id);
          }
        }

        if (
          sidebarSelection?.type === "project" &&
          sidebarSelection.projectId === projectId
        ) {
          await selectFallbackThread(sidebar);
          return;
        }

        if (activeProjectId === projectId) {
          await selectFallbackThread(sidebar);
        }
      } catch (error) {
        showActionError("Delete failed", error);
      }
    },
    [activeProjectId, loadSidebar, selectFallbackThread, sidebarSelection],
  );

  const handleDeleteProject = useCallback((projectId: string): void => {
    setModal({ kind: "delete-project", projectId });
  }, []);

  const handleAddChatInProject = useCallback(
    (projectId: string): void => {
      navigateToNewChat();
      setSidebarSelection({ type: "project", projectId });
      setExpandedProjectIds((current) => new Set(current).add(projectId));
    },
    [navigateToNewChat, setExpandedProjectIds, setSidebarSelection],
  );

  const startNewChat = useCallback(() => {
    const projectId = getProjectIdFromSelection(sidebarSelection);
    navigateToNewChat();

    if (projectId) {
      setSidebarSelection({ type: "project", projectId });
      setExpandedProjectIds((current) => new Set(current).add(projectId));
      return;
    }

    setSidebarSelection(null);
  }, [
    getProjectIdFromSelection,
    navigateToNewChat,
    setExpandedProjectIds,
    setSidebarSelection,
    sidebarSelection,
  ]);

  const createProject = useCallback(async (): Promise<void> => {
    setCreatingProject(true);
    try {
      const response = await fetch("/api/chat/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New project" }),
      });

      if (!response.ok) {
        throw new Error("Project could not be created");
      }

      const project = (await response.json()) as SidebarProject;
      await loadSidebar();
      setExpandedProjectIds((current) => new Set(current).add(project.id));
      navigateToNewChat();
      setSidebarSelection({ type: "project", projectId: project.id });
    } catch (error) {
      showIntentToast({
        title: "Project failed",
        description:
          error instanceof Error ? error.message : "Could not create project.",
        intent: Intent.DANGER,
      });
    } finally {
      setCreatingProject(false);
    }
  }, [
    loadSidebar,
    navigateToNewChat,
    setExpandedProjectIds,
    setSidebarSelection,
  ]);

  return {
    sidebarData,
    modal,
    setModal,
    creatingProject,
    loadSidebar,
    upsertSidebarThread,
    confirmRenameThread,
    confirmRenameProject,
    handleRenameThread,
    handleRenameProject,
    handleArchiveThread,
    handleUnarchiveThread,
    confirmDeleteThread,
    handleDeleteThread,
    handleArchiveProject,
    handleUnarchiveProject,
    confirmDeleteProject,
    handleDeleteProject,
    handleAddChatInProject,
    startNewChat,
    createProject,
    selectFallbackThread,
  };
}
