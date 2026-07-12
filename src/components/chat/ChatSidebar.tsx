"use client";

import { useRouter } from "next/navigation";

import { ChatThread } from "@/components/chat/ChatThread";
import { ProjectFolder } from "@/components/chat/ProjectFolder";
import { Button } from "@/components/lib/button/Button";
import { Sidebar, useSidebar } from "@/components/lib/sidebar";
import { SidebarSectionDivider } from "@/components/lib/sidebar-section-divider";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import styles from "./chat-sidebar.module.css";

export type SidebarProject = {
  id: string;
  title: string;
  threads: { id: string; title: string }[];
};

export type SidebarStandaloneThread = {
  id: string;
  title: string;
};

export type SidebarSelection =
  | { type: "thread"; threadId: string; projectId: string | null }
  | { type: "project"; projectId: string };

export type ChatSidebarProps = {
  projects: SidebarProject[];
  standaloneThreads: SidebarStandaloneThread[];
  selection: SidebarSelection | null;
  expandedProjectIds: Set<string>;
  creatingProject: boolean;
  onSelectThread: (threadId: string, projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onNewChat: () => void;
  onNewProject: () => void;
};

function getSelectedThreadId(
  selection: SidebarSelection | null,
): string | null {
  return selection?.type === "thread" ? selection.threadId : null;
}

function isProjectSelected(
  selection: SidebarSelection | null,
  projectId: string,
): boolean {
  return selection?.type === "project" && selection.projectId === projectId;
}

export function ChatSidebar({
  projects,
  standaloneThreads,
  selection,
  expandedProjectIds,
  creatingProject,
  onSelectThread,
  onSelectProject,
  onNewChat,
  onNewProject,
}: ChatSidebarProps) {
  const router = useRouter();
  const { notifyItemSelected } = useSidebar();
  const selectedThreadId = getSelectedThreadId(selection);

  function handleSelectThread(
    threadId: string,
    projectId: string | null,
  ): void {
    onSelectThread(threadId, projectId);
    notifyItemSelected();
  }

  function handleSelectProject(projectId: string): void {
    onSelectProject(projectId);
    notifyItemSelected();
  }

  function handleFooterAction(action: () => void): void {
    notifyItemSelected();
    action();
  }

  return (
    <Sidebar
      footer={
        <div className={styles.footer}>
          <Button
            text="New chat"
            leftIcon={IconNames["add-line"]}
            intent={Intent.SECONDARY}
            style={{ justifyContent: "flex-start" }}
            onClick={() => handleFooterAction(onNewChat)}
          />
          <Button
            text="New project"
            leftIcon={IconNames["folder-2-line"]}
            intent={Intent.SECONDARY}
            style={{ justifyContent: "flex-start" }}
            disabled={creatingProject}
            onClick={() => handleFooterAction(onNewProject)}
          />
          <Button
            text="Settings"
            leftIcon={IconNames["settings-3-line"]}
            intent={Intent.TERTIARY}
            style={{ justifyContent: "flex-start" }}
            onClick={() => {
              notifyItemSelected();
              router.push("/settings");
            }}
          />
        </div>
      }
    >
      <SidebarSectionDivider icon={IconNames["folder-line"]} label="Projects" />
      {projects.map((project) => (
        <ProjectFolder
          key={project.id}
          id={project.id}
          title={project.title}
          threads={project.threads}
          expanded={expandedProjectIds.has(project.id)}
          selected={isProjectSelected(selection, project.id)}
          selectedThreadId={selectedThreadId}
          onSelectProject={() => handleSelectProject(project.id)}
          onSelectThread={(threadId) =>
            handleSelectThread(threadId, project.id)
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
          onSelect={() => handleSelectThread(thread.id, null)}
        />
      ))}
    </Sidebar>
  );
}
