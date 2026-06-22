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

  const refreshSidebar = useCallback(async () => {
    const [loadedProjects, loadedThreads] = await Promise.all([
      chatApi.listProjects(),
      chatApi.listThreads(),
    ]);
    setProjects(loadedProjects);
    setChatThreads(loadedThreads);
  }, []);

  useEffect(() => {
    void refreshSidebar().then(async () => {
      const threads = await chatApi.listThreads();
      if (threads.length > 0) {
        setSelectedThreadId((current) => current ?? threads[0].id);
      }
    });
  }, [refreshSidebar]);

  const handleSend = useCallback(
    (text: string) => {
      void sendMessage(text);
    },
    [sendMessage],
  );

  const handleToolCallStatusChange = useCallback(
    (_messageId: string, _status: ToolCallStatus) => {
      // Tool calls are deferred in v1.
    },
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
