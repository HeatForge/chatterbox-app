import { ArchivedThread } from "@/components/chat/ArchivedThread";
import type {
  SidebarProject,
  SidebarStandaloneThread,
} from "@/components/chat/ChatSidebar";
import { ProjectFolder } from "@/components/chat/ProjectFolder";
import { SidebarSectionDivider } from "@/components/lib/sidebar-section-divider";
import { IconNames } from "@/lib/IconNames";

import archivedPanelStyles from "./chat-sidebar-archived-panel.module.css";

export type ChatSidebarArchivedPanelProps = {
  archivedProjects: SidebarProject[];
  archivedStandaloneThreads: SidebarStandaloneThread[];
  expandedProjectIds: Set<string>;
  selectedThreadId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectThread: (threadId: string, projectId: string | null) => void;
  onRenameThread: (threadId: string, title: string) => void;
  onUnarchiveThread: (threadId: string) => void;
  onUnarchiveProject: (projectId: string) => void;
  onDeleteThread: (threadId: string, message: string) => void;
  getThreadTitle: (threadId: string) => string;
  isProjectSelected: (projectId: string) => boolean;
};

export function ChatSidebarArchivedPanel({
  archivedProjects,
  archivedStandaloneThreads,
  expandedProjectIds,
  selectedThreadId,
  onSelectProject,
  onSelectThread,
  onRenameThread,
  onUnarchiveThread,
  onUnarchiveProject,
  onDeleteThread,
  getThreadTitle,
  isProjectSelected,
}: ChatSidebarArchivedPanelProps) {
  const isEmpty =
    archivedProjects.length === 0 && archivedStandaloneThreads.length === 0;

  if (isEmpty) {
    return (
      <p className={archivedPanelStyles.emptyState}>
        No archived chats or projects yet.
      </p>
    );
  }

  return (
    <>
      {archivedProjects.length > 0 ? (
        <>
          <SidebarSectionDivider
            icon={IconNames["folder-line"]}
            label="Projects"
          />
          {archivedProjects.map((project) => (
            <ProjectFolder
              key={project.id}
              id={project.id}
              title={project.title}
              threads={project.threads}
              archived
              expanded={expandedProjectIds.has(project.id)}
              selected={isProjectSelected(project.id)}
              selectedThreadId={selectedThreadId}
              onSelectProject={() => onSelectProject(project.id)}
              onSelectThread={(threadId) =>
                onSelectThread(threadId, project.id)
              }
              onUnarchiveProject={() => onUnarchiveProject(project.id)}
              onRenameThread={(threadId) =>
                onRenameThread(threadId, getThreadTitle(threadId))
              }
              onDeleteThread={(threadId) =>
                onDeleteThread(
                  threadId,
                  "Delete this chat? It will be hidden and removed from project context retrieval.",
                )
              }
            />
          ))}
        </>
      ) : null}

      {archivedStandaloneThreads.length > 0 ? (
        <>
          <SidebarSectionDivider
            icon={IconNames["drawer-line"]}
            label="Chats"
          />
          {archivedStandaloneThreads.map((thread) => (
            <ArchivedThread
              key={thread.id}
              id={thread.id}
              title={thread.title}
              selected={thread.id === selectedThreadId}
              onSelect={() => onSelectThread(thread.id, null)}
              onUnarchive={() => onUnarchiveThread(thread.id)}
            />
          ))}
        </>
      ) : null}
    </>
  );
}
