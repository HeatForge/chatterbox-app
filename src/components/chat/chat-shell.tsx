"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChatRuntimeProvider,
  useChatRuntimeContext,
} from "@/components/assistant-ui/chat-runtime-provider";
import { Thread } from "@/components/assistant-ui/thread";
import { useChatInitialData } from "@/components/chat/ChatInitialDataProvider";
import {
  ChatSidebarShell,
  ChatSidebarShellProvider,
} from "@/components/chat/chat-sidebar-shell";
import {
  getProjectIdFromSelection,
  getProjectTitle,
} from "@/components/chat/chat-sidebar-utils";
import { isArchivedChatContext } from "@/components/chat/sidebar-context";
import {
  ConfirmDeleteAlertDialog,
  RenameDialog,
} from "@/components/chat/ThreadActionModals";
import { useActiveThread } from "@/components/chat/use-active-thread";
import { useChatNavigation } from "@/components/chat/use-chat-navigation";
import { useChatThreads } from "@/components/chat/use-chat-threads";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { setCachedThread } from "@/lib/cache/app-cache";
import type { ChatterboxRuntimeThread } from "@/lib/chat/runtime/chatterbox-runtime";
import { Intent } from "@/lib/Intent";
import { showIntentToast } from "@/lib/toast";

export type ChatShellProps = {
  /** Route prefix for thread deep links, e.g. `/chat-v2` or `/chat`. */
  basePath?: string;
};

function RuntimeReloadBridge({
  reloadRef,
}: {
  reloadRef: React.MutableRefObject<(threadId: string) => Promise<void>>;
}) {
  const { reloadThread } = useChatRuntimeContext();
  reloadRef.current = reloadThread;
  return null;
}

function ChatShellContent({ basePath }: ChatShellProps) {
  const initialData = useChatInitialData();
  const reloadThreadRef = useRef<(threadId: string) => Promise<void>>(
    async () => undefined,
  );
  const bootstrappedRef = useRef(false);

  const { navigateToThread, navigateToNewChat } = useChatNavigation({
    basePath: basePath ?? "/chat",
  });

  const {
    threadId,
    initialThread,
    sidebarSelection,
    setSidebarSelection,
    expandedProjectIds,
    setExpandedProjectIds,
    projectId,
  } = useActiveThread();

  const [runtimeThread, setRuntimeThread] =
    useState<ChatterboxRuntimeThread | null>(initialThread);

  const {
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
  } = useChatThreads({
    activeThreadId: threadId,
    activeProjectId: runtimeThread?.projectId ?? projectId,
    sidebarSelection,
    setSidebarSelection,
    setExpandedProjectIds,
    navigateToThread,
    navigateToNewChat,
    getProjectIdFromSelection,
    reloadActiveThread: (id) => reloadThreadRef.current(id),
  });

  const handleRuntimeThreadChange = useCallback(
    (thread: ChatterboxRuntimeThread) => {
      upsertSidebarThread({
        id: thread.id,
        title: thread.title,
        projectId: thread.projectId,
      });
      setRuntimeThread(thread);
      setSidebarSelection({
        type: "thread",
        threadId: thread.id,
        projectId: thread.projectId,
      });

      if (thread.projectId) {
        const nextProjectId = thread.projectId;
        setExpandedProjectIds((current) => new Set(current).add(nextProjectId));
      }
    },
    [setExpandedProjectIds, setSidebarSelection, upsertSidebarThread],
  );

  useEffect(() => {
    if (!threadId) {
      setRuntimeThread(null);
    }
  }, [threadId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap once from server payload
  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }
    bootstrappedRef.current = true;

    const requestedThreadId = threadId;
    const seededThread = initialData?.thread;

    if (seededThread) {
      setCachedThread(seededThread);
    }

    const bootstrap = async (): Promise<void> => {
      if (requestedThreadId) {
        await loadSidebar();
        return;
      }

      if (seededThread) {
        await loadSidebar();
        navigateToThread(seededThread.id);
        return;
      }

      const sidebar = await loadSidebar();
      const firstThreadId =
        sidebar.standalone[0]?.id ??
        sidebar.projects.find((project) => project.threads.length > 0)
          ?.threads[0]?.id;

      if (firstThreadId) {
        navigateToThread(firstThreadId);
      }
    };

    void bootstrap().catch(() => {
      showIntentToast({
        title: "Chat unavailable",
        description: "Could not load your chat threads.",
        intent: Intent.DANGER,
      });
    });
  }, []);

  function selectThread(
    selectedThreadId: string,
    selectedProjectId: string | null,
  ): void {
    setSidebarSelection({
      type: "thread",
      threadId: selectedThreadId,
      projectId: selectedProjectId,
    });

    if (selectedProjectId) {
      setExpandedProjectIds((current) =>
        new Set(current).add(selectedProjectId),
      );
    }

    navigateToThread(selectedThreadId);
  }

  function selectProject(selectedProjectId: string): void {
    const isAlreadySelected =
      sidebarSelection?.type === "project" &&
      sidebarSelection.projectId === selectedProjectId;

    setExpandedProjectIds((current) => {
      const next = new Set(current);
      if (isAlreadySelected) {
        if (next.has(selectedProjectId)) {
          next.delete(selectedProjectId);
        } else {
          next.add(selectedProjectId);
        }
        return next;
      }

      next.add(selectedProjectId);
      return next;
    });

    if (isAlreadySelected) {
      return;
    }

    navigateToNewChat();
    setRuntimeThread(null);
    setSidebarSelection({ type: "project", projectId: selectedProjectId });
  }

  const headerTitle = runtimeThread
    ? `${runtimeThread.title} · ${runtimeThread.modelId}`
    : sidebarSelection?.type === "project"
      ? `${getProjectTitle(sidebarSelection.projectId, sidebarData) ?? "Project"} · New chat`
      : "New chat";

  const isArchivedChat = isArchivedChatContext(
    sidebarData,
    runtimeThread,
    sidebarSelection,
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <ChatSidebarShell
        projects={sidebarData.projects}
        standaloneThreads={sidebarData.standalone}
        archivedProjects={sidebarData.archived.projects}
        archivedStandaloneThreads={sidebarData.archived.standalone}
        selection={sidebarSelection}
        expandedProjectIds={expandedProjectIds}
        creatingProject={creatingProject}
        onSelectThread={selectThread}
        onSelectProject={selectProject}
        onNewChat={startNewChat}
        onNewProject={() => void createProject()}
        onRenameThread={handleRenameThread}
        onArchiveThread={(id) => void handleArchiveThread(id)}
        onUnarchiveThread={(id) => void handleUnarchiveThread(id)}
        onDeleteThread={handleDeleteThread}
        onRenameProject={handleRenameProject}
        onArchiveProject={(id) => void handleArchiveProject(id)}
        onUnarchiveProject={(id) => void handleUnarchiveProject(id)}
        onDeleteProject={handleDeleteProject}
        onAddChatInProject={handleAddChatInProject}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4">
        <header className="flex min-h-10 shrink-0 items-center gap-2">
          <SidebarTrigger />
          <span className="min-w-0 truncate text-[0.9375rem] font-semibold">
            {headerTitle}
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <ChatRuntimeProvider
            threadId={threadId}
            initialThread={initialThread}
            projectId={projectId}
            basePath={basePath ?? "/chat"}
            isSendDisabled={isArchivedChat}
            onThreadChange={handleRuntimeThreadChange}
          >
            <RuntimeReloadBridge reloadRef={reloadThreadRef} />
            <Thread showComposer={!isArchivedChat} />
            {isArchivedChat ? (
              <p className="shrink-0 border-t px-4 py-3 text-sm text-muted-foreground">
                You can&apos;t chat with archived chats.
              </p>
            ) : null}
          </ChatRuntimeProvider>
        </div>
      </main>

      <RenameDialog
        open={modal?.kind === "rename-thread"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
        initialTitle={modal?.kind === "rename-thread" ? modal.currentTitle : ""}
        entityLabel="thread"
        onConfirm={(title) => {
          const renameThreadId =
            modal?.kind === "rename-thread" ? modal.threadId : "";
          setModal(null);
          void confirmRenameThread(renameThreadId, title);
        }}
      />

      <RenameDialog
        open={modal?.kind === "rename-project"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
        initialTitle={
          modal?.kind === "rename-project" ? modal.currentTitle : ""
        }
        entityLabel="project"
        onConfirm={(title) => {
          const renameProjectId =
            modal?.kind === "rename-project" ? modal.projectId : "";
          setModal(null);
          void confirmRenameProject(renameProjectId, title);
        }}
      />

      <ConfirmDeleteAlertDialog
        open={modal?.kind === "delete-thread"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
        message={
          modal?.kind === "delete-thread"
            ? modal.message
            : "Delete this chat? It will be permanently hidden."
        }
        onConfirm={() => {
          const deleteThreadId =
            modal?.kind === "delete-thread" ? modal.threadId : "";
          setModal(null);
          void confirmDeleteThread(deleteThreadId);
        }}
      />

      <ConfirmDeleteAlertDialog
        open={modal?.kind === "delete-project"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
        message="Delete this project and all its chats? They will be permanently hidden."
        onConfirm={() => {
          const deleteProjectId =
            modal?.kind === "delete-project" ? modal.projectId : "";
          setModal(null);
          void confirmDeleteProject(deleteProjectId);
        }}
      />
    </div>
  );
}

/**
 * Full chat viewport: shadcn sidebar, assistant-ui thread, and chatterbox runtime.
 * Drop-in replacement for legacy `ChatPageContent` (WP-4 cutover).
 */
export function ChatShell({ basePath = "/chat" }: ChatShellProps) {
  return (
    <ChatSidebarShellProvider>
      <ChatShellContent basePath={basePath} />
    </ChatSidebarShellProvider>
  );
}
