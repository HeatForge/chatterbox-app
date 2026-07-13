"use client";

import { FolderPlus, MessageSquarePlus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChatSidebarLockButton,
  ChatSidebarResizeHandle,
  useChatSidebarChrome,
} from "@/components/chat/chat-sidebar-provider";
import type {
  SidebarProject,
  SidebarSelection,
  SidebarStandaloneThread,
} from "@/components/chat/chat-sidebar-types";
import { getThreadTitle } from "@/components/chat/chat-sidebar-utils";
import {
  ChatSidebarArchivedPanel,
  ChatSidebarThreadsPanel,
  getAlternateSidebarPanel,
  SIDEBAR_PANELS,
  type SidebarPanelId,
} from "@/components/chat/sidebar-panels";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type {
  SidebarProject,
  SidebarSelection,
  SidebarStandaloneThread,
} from "@/components/chat/chat-sidebar-types";

export type ChatSidebarShellProps = {
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

export function ChatSidebarShell({
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
}: ChatSidebarShellProps) {
  const router = useRouter();
  const { notifyItemSelected } = useChatSidebarChrome();
  const [activePanel, setActivePanel] = useState<SidebarPanelId>("threads");
  const selectedThreadId = getSelectedThreadId(selection);
  const allProjects = [...projects, ...archivedProjects];
  const allStandalone = [...standaloneThreads, ...archivedStandaloneThreads];
  const panel = SIDEBAR_PANELS[activePanel];
  const alternatePanel = getAlternateSidebarPanel(activePanel);
  const alternatePanelDefinition = SIDEBAR_PANELS[alternatePanel];
  const AlternateToggleIcon = alternatePanelDefinition.toggleIcon;

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
    <Sidebar collapsible="offcanvas" className="relative">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="truncate text-sm font-semibold">{panel.title}</h2>
          <ChatSidebarLockButton />
        </div>
      </SidebarHeader>

      <SidebarContent>
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
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {activePanel === "threads" ? (
            <>
              <SidebarMenuItem>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => handleFooterAction(onNewChat)}
                >
                  <MessageSquarePlus />
                  New chat
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-start"
                  disabled={creatingProject}
                  onClick={() => handleFooterAction(onNewProject)}
                >
                  <FolderPlus />
                  New project
                </Button>
              </SidebarMenuItem>
            </>
          ) : null}
          <SidebarMenuItem>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 justify-start"
                onClick={() => {
                  notifyItemSelected();
                  router.push("/settings");
                }}
              >
                <Settings />
                Settings
              </Button>
              <Button
                type="button"
                variant={activePanel === "archived" ? "default" : "outline"}
                size="icon"
                aria-pressed={activePanel === "archived"}
                aria-label={alternatePanelDefinition.toggleLabel}
                onClick={togglePanel}
              >
                <AlternateToggleIcon />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <ChatSidebarResizeHandle />
    </Sidebar>
  );
}

export { ChatSidebarShellProvider } from "@/components/chat/chat-sidebar-provider";
