import type {
  SidebarProject,
  SidebarStandaloneThread,
} from "@/components/chat/ChatSidebar";
import { ChatThread } from "@/components/chat/ChatThread";
import { ProjectFolder } from "@/components/chat/ProjectFolder";
import { SidebarSectionDivider } from "@/components/lib/sidebar-section-divider";
import { IconNames } from "@/lib/IconNames";

export type ChatSidebarThreadsPanelProps = {
  projects: SidebarProject[];
  standaloneThreads: SidebarStandaloneThread[];
  expandedProjectIds: Set<string>;
  selectedThreadId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectThread: (threadId: string, projectId: string | null) => void;
  onRenameThread: (threadId: string, title: string) => void;
  onArchiveThread: (threadId: string) => void;
  onDeleteThread: (threadId: string, message: string) => void;
  onRenameProject: (projectId: string, title: string) => void;
  onArchiveProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAddChatInProject: (projectId: string) => void;
  getThreadTitle: (threadId: string) => string;
  isProjectSelected: (projectId: string) => boolean;
};

export function ChatSidebarThreadsPanel({
  projects,
  standaloneThreads,
  expandedProjectIds,
  selectedThreadId,
  onSelectProject,
  onSelectThread,
  onRenameThread,
  onArchiveThread,
  onDeleteThread,
  onRenameProject,
  onArchiveProject,
  onDeleteProject,
  onAddChatInProject,
  getThreadTitle,
  isProjectSelected,
}: ChatSidebarThreadsPanelProps) {
  return (
    <>
      <SidebarSectionDivider icon={IconNames["folder-line"]} label="Projects" />
      {projects.map((project) => (
        <ProjectFolder
          key={project.id}
          id={project.id}
          title={project.title}
          threads={project.threads}
          expanded={expandedProjectIds.has(project.id)}
          selected={isProjectSelected(project.id)}
          selectedThreadId={selectedThreadId}
          onSelectProject={() => onSelectProject(project.id)}
          onSelectThread={(threadId) => onSelectThread(threadId, project.id)}
          onRenameProject={() => onRenameProject(project.id, project.title)}
          onArchiveProject={() => onArchiveProject(project.id)}
          onDeleteProject={() => onDeleteProject(project.id)}
          onAddChat={() => onAddChatInProject(project.id)}
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

      <SidebarSectionDivider icon={IconNames["drawer-line"]} label="Chats" />
      {standaloneThreads.map((thread) => (
        <ChatThread
          key={thread.id}
          id={thread.id}
          title={thread.title}
          selected={thread.id === selectedThreadId}
          onSelect={() => onSelectThread(thread.id, null)}
          onEdit={() => onRenameThread(thread.id, thread.title)}
          onArchive={() => onArchiveThread(thread.id)}
          onDelete={() =>
            onDeleteThread(
              thread.id,
              "Delete this chat? It will be permanently hidden.",
            )
          }
        />
      ))}
    </>
  );
}
