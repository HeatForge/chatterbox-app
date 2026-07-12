"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChatInitialData } from "@/components/chat/ChatInitialDataProvider";
import {
  ChatSidebar,
  type SidebarProject,
  type SidebarSelection,
  type SidebarStandaloneThread,
} from "@/components/chat/ChatSidebar";
import { isArchivedChatContext } from "@/components/chat/sidebar-context";
import {
  ConfirmDeleteModalContent,
  RenameModalContent,
} from "@/components/chat/ThreadActionModals";
import { ChatInput } from "@/components/lib/chat-input/ChatInput";
import { ChatInputState } from "@/components/lib/chat-input/enums";
import {
  AssistantMessageBlip,
  UserMessageBlip,
} from "@/components/lib/message-blip";
import { SidebarProvider, SidebarToggle } from "@/components/lib/sidebar";
import { useModal } from "@/hooks/use-modal/use-modal";
import { ToastPlacement } from "@/hooks/use-toaster/types";
import { useToaster } from "@/hooks/use-toaster/use-toaster";
import {
  deleteCachedThread,
  flushAppCachePersistence,
  getCachedSidebar,
  getCachedThread,
  setCachedSidebar,
  setCachedThread,
} from "@/lib/cache/app-cache";
import { Intent } from "@/lib/Intent";

import styles from "./chat.module.css";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "completed" | "streaming" | "error";
  error: string | null;
  createdAt: string;
};

type ThreadPayload = {
  id: string;
  title: string;
  modelId: string;
  projectId: string | null;
  providerId: string | null;
  systemPrompt: string;
  messages: ChatMessage[];
};

type SidebarData = {
  projects: SidebarProject[];
  standalone: SidebarStandaloneThread[];
  archived: {
    projects: SidebarProject[];
    standalone: SidebarStandaloneThread[];
  };
};

const EMPTY_SIDEBAR: SidebarData = {
  projects: [],
  standalone: [],
  archived: { projects: [], standalone: [] },
};

type SendMessageResponse = {
  threadId: string;
  thread: Omit<ThreadPayload, "systemPrompt" | "messages">;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

function createOptimisticUserMessage(content: string): ChatMessage {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    role: "user",
    content,
    status: "completed",
    error: null,
    createdAt: new Date().toISOString(),
  };
}

function getProjectTitle(
  projectId: string,
  sidebar: SidebarData,
): string | undefined {
  return (
    sidebar.projects.find((project) => project.id === projectId)?.title ??
    sidebar.archived.projects.find((project) => project.id === projectId)?.title
  );
}

function findFirstAvailableThreadId(sidebar: SidebarData): string | undefined {
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

function getProjectIdFromSelection(
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

function ChatPageContent() {
  const initialData = useChatInitialData();
  const initialThread =
    getCachedThread(initialData?.thread?.id ?? "") ??
    initialData?.thread ??
    null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToaster();
  const showModal = useModal();
  const [sidebarData, setSidebarData] = useState<SidebarData>(() => {
    return getCachedSidebar() ?? initialData?.sidebar ?? EMPTY_SIDEBAR;
  });
  const [sidebarSelection, setSidebarSelection] =
    useState<SidebarSelection | null>(() =>
      initialThread
        ? {
            type: "thread",
            threadId: initialThread.id,
            projectId: initialThread.projectId,
          }
        : null,
    );
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set(initialThread?.projectId ? [initialThread.projectId] : []),
  );
  const [creatingProject, setCreatingProject] = useState(false);
  const [activeThread, setActiveThread] = useState<ThreadPayload | null>(
    () => initialThread,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => initialThread?.messages ?? [],
  );
  const [inputState, setInputState] = useState(ChatInputState.READY);
  const messageListRef = useRef<HTMLDivElement>(null);
  const streamsRef = useRef<Map<string, EventSource>>(new Map());
  const threadCacheRef = useRef<Map<string, ThreadPayload>>(
    new Map(initialThread ? [[initialThread.id, initialThread]] : []),
  );

  useEffect(() => {
    return () => {
      for (const stream of streamsRef.current.values()) {
        stream.close();
      }
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages update
  useEffect(() => {
    const list = messageListRef.current;
    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!activeThread) {
      return;
    }

    threadCacheRef.current.set(activeThread.id, {
      ...activeThread,
      messages,
    });
  }, [activeThread, messages]);

  function cacheThread(thread: ThreadPayload): void {
    threadCacheRef.current.set(thread.id, thread);
    setCachedThread(thread);
  }

  function applyThread(thread: ThreadPayload): void {
    setActiveThread(thread);
    setMessages(thread.messages);
    setSidebarSelection({
      type: "thread",
      threadId: thread.id,
      projectId: thread.projectId,
    });

    if (thread.projectId) {
      const projectId = thread.projectId;
      setExpandedProjectIds((current) => new Set(current).add(projectId));
    }

    let hasStreamingMessage = false;
    for (const message of thread.messages) {
      if (message.role === "assistant" && message.status === "streaming") {
        hasStreamingMessage = true;
        setInputState(ChatInputState.STREAMING);
        connectAssistantStream(thread.id, message.id);
      }
    }

    if (!hasStreamingMessage) {
      setInputState(ChatInputState.READY);
    }
  }

  async function loadSidebar(): Promise<SidebarData> {
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
  }

  /**
   * Moves a newly active thread to the top of its sidebar group without
   * rebuilding the complete sidebar from the database after every message.
   */
  function upsertSidebarThread(
    thread: Pick<ThreadPayload, "id" | "title" | "projectId">,
  ): void {
    setSidebarData((current) => {
      const summary = { id: thread.id, title: thread.title };
      let next: SidebarData;

      if (thread.projectId) {
        const updateProject = (project: SidebarProject): SidebarProject =>
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
  }

  function clearActivePane(): void {
    setActiveThread(null);
    setMessages([]);
    setInputState(ChatInputState.READY);
    setSidebarSelection(null);
  }

  async function selectFallbackThread(sidebar: SidebarData): Promise<void> {
    const fallbackThreadId = findFirstAvailableThreadId(sidebar);
    if (fallbackThreadId) {
      await loadThread(fallbackThreadId);
      return;
    }

    clearActivePane();
  }

  function showActionError(title: string, error: unknown): void {
    showToast({
      title,
      description:
        error instanceof Error ? error.message : "Something went wrong.",
      intent: Intent.DANGER,
      placement: ToastPlacement.BOTTOM_RIGHT,
    });
  }

  function handleRenameThread(threadId: string, currentTitle: string): void {
    showModal({
      dim: 5,
      dismissOnOutsidePress: true,
      contents: (dismiss) => (
        <RenameModalContent
          initialTitle={currentTitle}
          entityLabel="thread"
          onCancel={dismiss}
          onConfirm={(title) => {
            dismiss();
            void (async () => {
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
                if (activeThread?.id === threadId) {
                  setActiveThread((current) =>
                    current ? { ...current, title } : current,
                  );
                }
                threadCacheRef.current.delete(threadId);
                deleteCachedThread(threadId);
              } catch (error) {
                showActionError("Rename failed", error);
              }
            })();
          }}
        />
      ),
    });
  }

  function handleRenameProject(projectId: string, currentTitle: string): void {
    showModal({
      dim: 5,
      dismissOnOutsidePress: true,
      contents: (dismiss) => (
        <RenameModalContent
          initialTitle={currentTitle}
          entityLabel="project"
          onCancel={dismiss}
          onConfirm={(title) => {
            dismiss();
            void (async () => {
              try {
                const response = await fetch(
                  `/api/chat/projects/${projectId}`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title }),
                  },
                );
                if (!response.ok) {
                  throw new Error("Project could not be renamed");
                }
                await loadSidebar();
              } catch (error) {
                showActionError("Rename failed", error);
              }
            })();
          }}
        />
      ),
    });
  }

  async function handleArchiveThread(threadId: string): Promise<void> {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}/archive`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Thread could not be archived");
      }

      const sidebar = await loadSidebar();
      threadCacheRef.current.delete(threadId);
      deleteCachedThread(threadId);

      if (activeThread?.id === threadId) {
        await selectFallbackThread(sidebar);
      }
    } catch (error) {
      showActionError("Archive failed", error);
    }
  }

  async function handleUnarchiveThread(threadId: string): Promise<void> {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}/unarchive`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Thread could not be unarchived");
      }

      await loadSidebar();
    } catch (error) {
      showActionError("Unarchive failed", error);
    }
  }

  function handleDeleteThread(threadId: string, message: string): void {
    showModal({
      dim: 5,
      dismissOnOutsidePress: true,
      contents: (dismiss) => (
        <ConfirmDeleteModalContent
          message={message}
          onCancel={dismiss}
          onConfirm={() => {
            dismiss();
            void (async () => {
              try {
                const response = await fetch(`/api/chat/threads/${threadId}`, {
                  method: "DELETE",
                });
                if (!response.ok) {
                  throw new Error("Thread could not be deleted");
                }

                const sidebar = await loadSidebar();
                threadCacheRef.current.delete(threadId);
                deleteCachedThread(threadId);

                if (activeThread?.id === threadId) {
                  await selectFallbackThread(sidebar);
                } else if (
                  sidebarSelection?.type === "thread" &&
                  sidebarSelection.threadId === threadId
                ) {
                  await selectFallbackThread(sidebar);
                }
              } catch (error) {
                showActionError("Delete failed", error);
              }
            })();
          }}
        />
      ),
    });
  }

  async function handleArchiveProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`/api/chat/projects/${projectId}/archive`, {
        method: "POST",
      });
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

      if (activeThread?.projectId === projectId) {
        await selectFallbackThread(sidebar);
      }
    } catch (error) {
      showActionError("Archive failed", error);
    }
  }

  async function handleUnarchiveProject(projectId: string): Promise<void> {
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
  }

  function handleDeleteProject(projectId: string): void {
    showModal({
      dim: 5,
      dismissOnOutsidePress: true,
      contents: (dismiss) => (
        <ConfirmDeleteModalContent
          message="Delete this project and all its chats? They will be permanently hidden."
          onCancel={dismiss}
          onConfirm={() => {
            dismiss();
            void (async () => {
              try {
                const response = await fetch(
                  `/api/chat/projects/${projectId}`,
                  {
                    method: "DELETE",
                  },
                );
                if (!response.ok) {
                  throw new Error("Project could not be deleted");
                }

                const sidebar = await loadSidebar();

                for (const [threadId] of threadCacheRef.current) {
                  const cached = threadCacheRef.current.get(threadId);
                  if (cached?.projectId === projectId) {
                    threadCacheRef.current.delete(threadId);
                    deleteCachedThread(threadId);
                  }
                }

                if (
                  sidebarSelection?.type === "project" &&
                  sidebarSelection.projectId === projectId
                ) {
                  await selectFallbackThread(sidebar);
                  return;
                }

                if (activeThread?.projectId === projectId) {
                  await selectFallbackThread(sidebar);
                }
              } catch (error) {
                showActionError("Delete failed", error);
              }
            })();
          }}
        />
      ),
    });
  }

  function handleAddChatInProject(projectId: string): void {
    setActiveThread(null);
    setMessages([]);
    setInputState(ChatInputState.READY);
    setSidebarSelection({ type: "project", projectId });
    setExpandedProjectIds((current) => new Set(current).add(projectId));
  }

  function connectAssistantStream(threadId: string, messageId: string): void {
    if (streamsRef.current.has(messageId)) {
      return;
    }

    const stream = new EventSource(
      `/api/chat/threads/${threadId}/messages/${messageId}/stream`,
    );
    streamsRef.current.set(messageId, stream);

    stream.addEventListener("content", (event) => {
      const message = JSON.parse((event as MessageEvent).data) as ChatMessage;
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? message : item)),
      );
    });

    function finish(event: Event): void {
      const message = JSON.parse((event as MessageEvent).data) as ChatMessage;
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? message : item)),
      );
      stream.close();
      streamsRef.current.delete(messageId);
      setInputState(ChatInputState.READY);
    }

    stream.addEventListener("done", finish);
    stream.addEventListener("error", (event) => {
      if ("data" in event && typeof event.data === "string") {
        finish(event);
      } else {
        stream.close();
        streamsRef.current.delete(messageId);
        setInputState(ChatInputState.ERROR);
      }
    });
  }

  /**
   * Shows a cached thread immediately, then reconciles it with the server.
   * A missing server record removes stale local data through the caller's
   * normal error handling path.
   */
  async function loadThread(threadId: string): Promise<void> {
    const cached =
      threadCacheRef.current.get(threadId) ?? getCachedThread(threadId);
    if (cached) {
      applyThread(cached);
    }

    const response = await fetch(`/api/chat/threads/${threadId}`);
    if (!response.ok) {
      throw new Error("Failed to load thread");
    }

    const thread = (await response.json()) as ThreadPayload;
    cacheThread(thread);
    applyThread(thread);
  }

  function selectThread(threadId: string, _projectId: string | null): void {
    flushAppCachePersistence();
    router.replace(`/chat?thread=${encodeURIComponent(threadId)}`, {
      scroll: false,
    });
    void loadThread(threadId);
  }

  function selectProject(projectId: string): void {
    const isAlreadySelected =
      sidebarSelection?.type === "project" &&
      sidebarSelection.projectId === projectId;

    setExpandedProjectIds((current) => {
      const next = new Set(current);
      if (isAlreadySelected) {
        if (next.has(projectId)) {
          next.delete(projectId);
        } else {
          next.add(projectId);
        }
        return next;
      }

      next.add(projectId);
      return next;
    });

    if (isAlreadySelected) {
      return;
    }

    setActiveThread(null);
    setMessages([]);
    setInputState(ChatInputState.READY);
    setSidebarSelection({ type: "project", projectId });
  }

  async function loadInitialChat(): Promise<void> {
    const sidebar = await loadSidebar();
    const firstStandalone = sidebar.standalone[0];
    const firstProjectThread = sidebar.projects.find(
      (project) => project.threads.length > 0,
    )?.threads[0];

    const firstThreadId = firstStandalone?.id ?? firstProjectThread?.id;
    if (firstThreadId) {
      await loadThread(firstThreadId);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap once from server payload
  useEffect(() => {
    const requestedThreadId = searchParams.get("thread");
    const initialThread = initialData?.thread;

    if (initialThread) {
      cacheThread(initialThread);
    }

    const load = requestedThreadId
      ? loadThread(requestedThreadId)
      : initialThread
        ? Promise.all([loadSidebar(), loadThread(initialThread.id)]).then(
            () => undefined,
          )
        : loadInitialChat();

    void load.catch(() => {
      showToast({
        title: "Chat unavailable",
        description: "Could not load your chat threads.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    });
  }, [showToast]);

  function getActiveProjectId(): string | null {
    if (activeThread?.projectId) {
      return activeThread.projectId;
    }

    return getProjectIdFromSelection(sidebarSelection);
  }

  async function handleSubmit(
    text: string,
    options: { imageGeneration: boolean },
  ): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || inputState !== ChatInputState.READY) {
      return;
    }

    const projectId = getActiveProjectId() ?? undefined;

    setInputState(ChatInputState.WAITING);
    const optimisticUserMessage = createOptimisticUserMessage(trimmed);
    setMessages((current) => [...current, optimisticUserMessage]);

    try {
      const endpoint = activeThread
        ? `/api/chat/threads/${activeThread.id}/messages`
        : "/api/chat/messages";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          ...(projectId ? { projectId } : {}),
          ...(options.imageGeneration ? { imageGeneration: true } : {}),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Message could not be sent");
      }

      const result = (await response.json()) as SendMessageResponse;
      let updatedMessages: ChatMessage[] = [];

      setMessages((current) => {
        const withoutOptimisticMessage = current.filter(
          (message) => message.id !== optimisticUserMessage.id,
        );
        updatedMessages = [
          ...withoutOptimisticMessage,
          result.userMessage,
          result.assistantMessage,
        ];
        return updatedMessages;
      });

      const currentThread =
        activeThread?.id === result.threadId
          ? activeThread
          : ({
              id: result.threadId,
              title: result.thread.title,
              modelId: result.thread.modelId,
              projectId: result.thread.projectId,
              providerId: result.thread.providerId,
              systemPrompt: "",
              messages: [],
            } satisfies ThreadPayload);

      const updatedThread: ThreadPayload = {
        ...currentThread,
        title: result.thread.title,
        modelId: result.thread.modelId,
        projectId: result.thread.projectId,
        messages: updatedMessages,
      };

      upsertSidebarThread(updatedThread);
      setActiveThread(updatedThread);
      setSidebarSelection({
        type: "thread",
        threadId: updatedThread.id,
        projectId: updatedThread.projectId,
      });
      cacheThread(updatedThread);
      setInputState(ChatInputState.STREAMING);
      connectAssistantStream(result.threadId, result.assistantMessage.id);
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUserMessage.id),
      );
      setInputState(ChatInputState.ERROR);
      showToast({
        title: options.imageGeneration
          ? "Image generation failed"
          : "Message failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not start generation.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    }
  }

  function startNewChat(): void {
    const projectId = getProjectIdFromSelection(sidebarSelection);

    setActiveThread(null);
    setMessages([]);
    setInputState(ChatInputState.READY);

    if (projectId) {
      setSidebarSelection({ type: "project", projectId });
      setExpandedProjectIds((current) => new Set(current).add(projectId));
      return;
    }

    setSidebarSelection(null);
  }

  async function createProject(): Promise<void> {
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
      setActiveThread(null);
      setMessages([]);
      setInputState(ChatInputState.READY);
      setSidebarSelection({ type: "project", projectId: project.id });
    } catch (error) {
      showToast({
        title: "Project failed",
        description:
          error instanceof Error ? error.message : "Could not create project.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    } finally {
      setCreatingProject(false);
    }
  }

  const headerTitle = activeThread
    ? `${activeThread.title} · ${activeThread.modelId}`
    : sidebarSelection?.type === "project"
      ? `${getProjectTitle(sidebarSelection.projectId, sidebarData) ?? "Project"} · New chat`
      : "New chat";

  const activeProjectId = getActiveProjectId();
  const isArchivedChat = isArchivedChatContext(
    sidebarData,
    activeThread,
    sidebarSelection,
  );

  return (
    <div className={styles.shell}>
      <ChatSidebar
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
        onArchiveThread={(threadId) => void handleArchiveThread(threadId)}
        onUnarchiveThread={(threadId) => void handleUnarchiveThread(threadId)}
        onDeleteThread={handleDeleteThread}
        onRenameProject={handleRenameProject}
        onArchiveProject={(projectId) => void handleArchiveProject(projectId)}
        onUnarchiveProject={(projectId) =>
          void handleUnarchiveProject(projectId)
        }
        onDeleteProject={handleDeleteProject}
        onAddChatInProject={handleAddChatInProject}
      />

      <main className={styles.chatView}>
        <header className={styles.header}>
          <SidebarToggle />
          <span className={styles.headerTitle}>{headerTitle}</span>
        </header>

        <div ref={messageListRef} className={styles.messageList}>
          {messages.length === 0 ? (
            <div className={styles.emptyChat}>
              Add providers in Settings, choose a model
              {activeProjectId ? " and embedding model" : ""}, then start a
              chat.
            </div>
          ) : (
            messages.map((message) => {
              if (message.role === "user") {
                return (
                  <UserMessageBlip key={message.id} content={message.content} />
                );
              }

              return (
                <AssistantMessageBlip
                  key={message.id}
                  content={
                    message.status === "error"
                      ? (message.error ?? "Generation failed")
                      : message.content
                  }
                />
              );
            })
          )}
        </div>

        <div className={styles.inputArea}>
          {isArchivedChat ? (
            <p className={styles.archivedInputNotice}>
              You can&apos;t chat with archived chats.
            </p>
          ) : (
            <ChatInput
              state={inputState}
              onSubmit={(text, options) => void handleSubmit(text, options)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <SidebarProvider>
      <ChatPageContent />
    </SidebarProvider>
  );
}
