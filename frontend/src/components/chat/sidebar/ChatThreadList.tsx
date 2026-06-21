import Icon from "../../primitive/Icon";
import ChatThreadRow from "./ChatThreadRow";

interface ChatThreadListProps {
  threads: Array<{ id: string; title: string }>;
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export default function ChatThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
}: ChatThreadListProps) {
  return (
    <div className="chat-thread-list">
      <div className="chat-thread-list__header">
        <Icon name="drawer-fill" className="chat-thread-list__header-icon" />
        <h2 className="chat-thread-list__title">Chats</h2>
        <div className="chat-thread-list__header-line" aria-hidden />
      </div>
      <ul className="chat-thread-list__items">
        {threads.map((thread) => (
          <li key={thread.id}>
            <ChatThreadRow
              variant="solo"
              label={thread.title}
              active={selectedThreadId === thread.id}
              onSelect={() => onSelectThread(thread.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
