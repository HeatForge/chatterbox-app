import { IconButton } from "../../primitive";
import type { Project } from "../../../utils/types/chat";
import ChatThreadList from "../sidebar/ChatThreadList";
import ProjectTree from "../sidebar/ProjectTree";

interface ChatSidebarProps {
  width: number;
  resizeHandleProps: React.HTMLAttributes<HTMLDivElement> & {
    role: "separator";
    "aria-orientation": "vertical";
    "aria-valuenow": number;
    tabIndex: number;
  };
  projects: Project[];
  chatThreads: Array<{ id: string; title: string }>;
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export default function ChatSidebar({
  width,
  resizeHandleProps,
  projects,
  chatThreads,
  selectedThreadId,
  onSelectThread,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar" style={{ width }}>
      <div className="chat-sidebar__scroll">
        <ProjectTree
          projects={projects}
          selectedThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
        />
        <ChatThreadList
          threads={chatThreads}
          selectedThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
        />
      </div>
      <footer className="chat-sidebar__footer">
        <IconButton
          icon="quill-pen-line"
          label="New chat"
          className="chat-sidebar__footer-btn"
        />
        <IconButton
          icon="new-folder-line"
          label="New project"
          className="chat-sidebar__footer-btn"
        />
        <div
          className="chat-sidebar__footer-btn chat-sidebar__footer-btn--placeholder"
          aria-hidden
        />
        <div
          className="chat-sidebar__footer-btn chat-sidebar__footer-btn--placeholder"
          aria-hidden
        />
      </footer>
      <div className="chat-sidebar__resize-handle" {...resizeHandleProps}>
        <span className="chat-sidebar__resize-dots" aria-hidden />
      </div>
    </aside>
  );
}
