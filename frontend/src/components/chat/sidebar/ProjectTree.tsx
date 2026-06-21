import { useState } from "react";
import type { ChatThread } from "../../../utils/types/chat";
import ChatThreadRow from "./ChatThreadRow";
import ProjectRow from "./ProjectRow";

interface ProjectTreeProps {
  projects: Array<{ id: string; name: string; threads?: ChatThread[] }>;
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

function ThreadNodes({
  threads,
  selectedThreadId,
  onSelectThread,
}: {
  threads: ChatThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}) {
  return (
    <ul>
      {threads.map((thread) => (
        <li key={thread.id}>
          <ChatThreadRow
            variant="nested"
            className="chat-thread-tree__thread-row"
            label={thread.title}
            active={selectedThreadId === thread.id}
            onSelect={() => onSelectThread(thread.id)}
          />
          {thread.children && thread.children.length > 0 ? (
            <ThreadNodes
              threads={thread.children}
              selectedThreadId={selectedThreadId}
              onSelectThread={onSelectThread}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectTree({
  projects,
  selectedThreadId,
  onSelectThread,
}: ProjectTreeProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    () => new Set(["heidelberg"]),
  );

  function toggleProject(projectId: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  return (
    <section className="chat-projects" aria-label="Projects">
      <ul className="chat-thread-tree">
        {projects.map((project) => {
          const hasThreads = Boolean(project.threads?.length);
          const expanded = expandedProjects.has(project.id);

          return (
            <li key={project.id}>
              <ProjectRow
                className="chat-thread-tree__folder-row"
                label={project.name}
                active={hasThreads && expanded}
                onSelect={() => hasThreads && toggleProject(project.id)}
              />
              {hasThreads && expanded ? (
                <ThreadNodes
                  threads={project.threads!}
                  selectedThreadId={selectedThreadId}
                  onSelectThread={onSelectThread}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
