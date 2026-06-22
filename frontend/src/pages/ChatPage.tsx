import { useCallback, useEffect, useState } from "react";
import {
  ChatComposer,
  ChatContextSidebar,
  ChatLayout,
  ChatMessageList,
  ChatSidebar,
} from "../components/chat";
import { chatApi } from "../api/chat";
import { useChatStream } from "../hooks/useChatStream";
import { useResizable } from "../utils/hooks/useResizable";
import type { Project, ToolCallStatus } from "../utils/types/chat";
import "./global-pages.css";

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [chatThreads, setChatThreads] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const {
    messages,
    isStreaming,
    isLoading,
    streamingMessageId,
    sendMessage,
    handlePrevVariant,
    handleNextVariant,
  } = useChatStream(selectedThreadId);

  const leftPanel = useResizable({
    initialWidth: 400,
    minWidth: 280,
    maxWidth: 520,
    side: "left",
  });

  const rightPanel = useResizable({
    initialWidth: 400,
    minWidth: 240,
    maxWidth: 520,
    side: "right",
  });

  const fetchSidebarData = useCallback(async () => {
    const [loadedProjects, loadedThreads] = await Promise.all([
      chatApi.listProjects(),
      chatApi.listThreads(),
    ]);
    return { loadedProjects, loadedThreads };
  }, []);

  const refreshSidebar = useCallback(async () => {
    const { loadedProjects, loadedThreads } = await fetchSidebarData();
    setProjects(loadedProjects);
    setChatThreads(loadedThreads);
  }, [fetchSidebarData]);

  useEffect(() => {
    let cancelled = false;

    void fetchSidebarData().then(({ loadedProjects, loadedThreads }) => {
      if (cancelled) {
        return;
      }
      setProjects(loadedProjects);
      setChatThreads(loadedThreads);
      if (loadedThreads.length > 0) {
        setSelectedThreadId((current) => current ?? loadedThreads[0].id);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fetchSidebarData]);

  const handleSend = useCallback(
    (text: string) => {
      void sendMessage(text);
    },
    [sendMessage],
  );

  const handleToolCallStatusChange = useCallback(
    // Tool calls are deferred in v1.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_messageId: string, _status: ToolCallStatus) => {},
    [],
  );

  const handleNewChat = useCallback(async () => {
    const thread = await chatApi.createThread();
    await refreshSidebar();
    setSelectedThreadId(thread.id);
  }, [refreshSidebar]);

  const handleNewProject = useCallback(async () => {
    await chatApi.createProject("New project");
    await refreshSidebar();
  }, [refreshSidebar]);

  return (
    <main className="page page-chat">
      <ChatLayout>
        <ChatSidebar
          width={leftPanel.width}
          resizeHandleProps={leftPanel.handleProps}
          projects={projects}
          chatThreads={chatThreads}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />
        <div className="chat-layout__main">
          {isLoading && messages.length === 0 ? (
            <p className="chat-layout__status">Loading messages…</p>
          ) : (
            <ChatMessageList
              messages={messages}
              streamingMessageId={streamingMessageId}
              onPrevVariant={handlePrevVariant}
              onNextVariant={handleNextVariant}
              onToolCallStatusChange={handleToolCallStatusChange}
            />
          )}
          <ChatComposer onSend={handleSend} disabled={isStreaming || !selectedThreadId} />
        </div>
        <ChatContextSidebar
          width={rightPanel.width}
          resizeHandleProps={rightPanel.handleProps}
        />
      </ChatLayout>
    </main>
  );
}
