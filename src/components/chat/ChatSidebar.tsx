"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/lib/button/Button";
import { Sidebar, useSidebar } from "@/components/lib/sidebar";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";
import styles from "./chat-sidebar.module.css";
import {
  ChatSidebarArchivedPanel,
  ChatSidebarThreadsPanel,
  getAlternateSidebarPanel,
  SIDEBAR_PANELS,
  type SidebarPanelId,
} from "./sidebar-panels";

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
  archivedProjects: SidebarProject[];
  archivedStandaloneThreads: SidebarStandaloneThread[];
  selection: SidebarSelection | null;
  expandedProjectIds: Set<string>;
  creatingProject: boolean;
  onSelectThread: (threadId: string, projectId: string | null) => void;
  onSelectProject: (projectId: string) => void;
  onNewChat: () => void;
  onNewProject: () => void;
  onRenameThread: (threadId: string, title: string) => void;
  onArchiveThread: (threadId: string) => void;
  onUnarchiveThread: (threadId: string) => void;
  onDeleteThread: (threadId: string, message: string) => void;
  onRenameProject: (projectId: string, title: string) => void;
  onArchiveProject: (projectId: string) => void;
  onUnarchiveProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAddChatInProject: (projectId: string) => void;
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

function getThreadTitle(
  threadId: string,
  projects: SidebarProject[],
  standalone: SidebarStandaloneThread[],
): string {
  const standaloneThread = standalone.find((thread) => thread.id === threadId);
  if (standaloneThread) {
    return standaloneThread.title;
  }

  for (const project of projects) {
    const projectThread = project.threads.find(
      (thread) => thread.id === threadId,
    );
    if (projectThread) {
      return projectThread.title;
    }
  }

  return "Thread";
}

export function ChatSidebar({
  projects,
  standaloneThreads,
  archivedProjects,
  archivedStandaloneThreads,
  selection,
  expandedProjectIds,
  creatingProject,
  onSelectThread,
  onSelectProject,
  onNewChat,
  onNewProject,
  onRenameThread,
  onArchiveThread,
  onUnarchiveThread,
  onDeleteThread,
  onRenameProject,
  onArchiveProject,
  onUnarchiveProject,
  onDeleteProject,
  onAddChatInProject,
}: ChatSidebarProps) {
  const router = useRouter();
  const { notifyItemSelected } = useSidebar();
  const [activePanel, setActivePanel] = useState<SidebarPanelId>("threads");
  const selectedThreadId = getSelectedThreadId(selection);
  const allProjects = [...projects, ...archivedProjects];
  const allStandalone = [...standaloneThreads, ...archivedStandaloneThreads];
  const panel = SIDEBAR_PANELS[activePanel];
  const alternatePanel = getAlternateSidebarPanel(activePanel);
  const alternatePanelDefinition = SIDEBAR_PANELS[alternatePanel];

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

  function togglePanel(): void {
    setActivePanel(alternatePanel);
  }

  function resolveThreadTitle(threadId: string): string {
    return getThreadTitle(threadId, allProjects, allStandalone);
  }

  function checkProjectSelected(projectId: string): boolean {
    return isProjectSelected(selection, projectId);
  }

  return (
    <Sidebar
      title={panel.title}
      footer={
        <div className={styles.footer}>
          {activePanel === "threads" ? (
            <>
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
            </>
          ) : null}
          <div className={styles.footerUtilityRow}>
            <Button
              text="Settings"
              leftIcon={IconNames["settings-3-line"]}
              intent={Intent.TERTIARY}
              style={{ justifyContent: "flex-start", flex: 1 }}
              onClick={() => {
                notifyItemSelected();
                router.push("/settings");
              }}
            />
            <Button
              leftIcon={alternatePanelDefinition.toggleIcon}
              intent={Intent.PRIMARY}
              aria-pressed={activePanel === "archived"}
              onClick={togglePanel}
            />
          </div>
        </div>
      }
    >
      {activePanel === "threads" ? (
        <ChatSidebarThreadsPanel
          projects={projects}
          standaloneThreads={standaloneThreads}
          expandedProjectIds={expandedProjectIds}
          selectedThreadId={selectedThreadId}
          onSelectProject={handleSelectProject}
          onSelectThread={handleSelectThread}
          onRenameThread={onRenameThread}
          onArchiveThread={onArchiveThread}
          onDeleteThread={onDeleteThread}
          onRenameProject={onRenameProject}
          onArchiveProject={onArchiveProject}
          onDeleteProject={onDeleteProject}
          onAddChatInProject={onAddChatInProject}
          getThreadTitle={resolveThreadTitle}
          isProjectSelected={checkProjectSelected}
        />
      ) : (
        <ChatSidebarArchivedPanel
          archivedProjects={archivedProjects}
          archivedStandaloneThreads={archivedStandaloneThreads}
          expandedProjectIds={expandedProjectIds}
          selectedThreadId={selectedThreadId}
          onSelectProject={handleSelectProject}
          onSelectThread={handleSelectThread}
          onRenameThread={onRenameThread}
          onUnarchiveThread={onUnarchiveThread}
          onUnarchiveProject={onUnarchiveProject}
          onDeleteThread={onDeleteThread}
          getThreadTitle={resolveThreadTitle}
          isProjectSelected={checkProjectSelected}
        />
      )}
    </Sidebar>
  );
}
