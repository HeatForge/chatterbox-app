interface ChatContextSidebarProps {
  width: number;
  resizeHandleProps: React.HTMLAttributes<HTMLDivElement> & {
    role: "separator";
    "aria-orientation": "vertical";
    "aria-valuenow": number;
    tabIndex: number;
  };
}

export default function ChatContextSidebar({
  width,
  resizeHandleProps,
}: ChatContextSidebarProps) {
  return (
    <aside className="chat-context-sidebar" style={{ width }}>
      <div className="chat-context-sidebar__resize-handle" {...resizeHandleProps}>
        <span className="chat-context-sidebar__resize-dots" aria-hidden />
      </div>
      <div className="chat-context-sidebar__empty">
        <p>Context panel</p>
      </div>
    </aside>
  );
}
