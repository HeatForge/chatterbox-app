"use client";

import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { ChatThread } from "@/components/chat/ChatThread";
import type { SidebarThreadAction } from "@/components/chat/sidebar-thread-item";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type ProjectFolderThread = {
  id: string;
  title: string;
};

export type ProjectFolderProps = {
  id: string;
  title: string;
  threads: ProjectFolderThread[];
  expanded: boolean;
  selected: boolean;
  selectedThreadId: string | null;
  archived?: boolean;
  onSelectProject: () => void;
  onSelectThread: (threadId: string) => void;
  onRenameProject?: () => void;
  onArchiveProject?: () => void;
  onUnarchiveProject?: () => void;
  onDeleteProject?: () => void;
  onAddChat?: () => void;
  onRenameThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
};

export function ProjectFolder({
  title,
  threads,
  expanded,
  selected,
  selectedThreadId,
  archived = false,
  onSelectProject,
  onSelectThread,
  onRenameProject,
  onArchiveProject,
  onUnarchiveProject,
  onDeleteProject,
  onAddChat,
  onRenameThread,
  onDeleteThread,
}: ProjectFolderProps) {
  const projectActions: SidebarThreadAction[] = archived
    ? [
        {
          id: "unarchive",
          icon: ArchiveRestore,
          label: "Unarchive project",
          onClick: onUnarchiveProject ?? (() => {}),
        },
      ]
    : [
        {
          id: "add-chat",
          icon: Plus,
          label: "Add chat",
          onClick: onAddChat ?? (() => {}),
        },
        {
          id: "edit",
          icon: Pencil,
          label: "Rename project",
          onClick: onRenameProject ?? (() => {}),
        },
        {
          id: "archive",
          icon: Archive,
          label: "Archive project",
          onClick: onArchiveProject ?? (() => {}),
        },
        {
          id: "delete",
          icon: Trash2,
          label: "Delete project",
          onClick: onDeleteProject ?? (() => {}),
          variant: "destructive",
        },
      ];

  return (
    <Collapsible open={expanded} className="group/collapsible">
      <SidebarMenuItem>
        <SidebarMenuButton isActive={selected} onClick={onSelectProject}>
          <Folder />
          <span>{title}</span>
          <ChevronRight
            className={cn(
              "ml-auto transition-transform",
              expanded && "rotate-90",
            )}
          />
        </SidebarMenuButton>
        {projectActions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuAction
                  showOnHover
                  onClick={(event) => event.stopPropagation()}
                />
              }
            >
              <MoreHorizontal />
              <span className="sr-only">Project actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              {projectActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  variant={action.variant}
                  onClick={(event) => {
                    event.stopPropagation();
                    action.onClick();
                  }}
                >
                  <action.icon />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SidebarMenuItem>
      <CollapsibleContent>
        <SidebarMenuSub>
          {threads.map((thread) => (
            <ChatThread
              key={thread.id}
              id={thread.id}
              title={thread.title}
              variant="project"
              iconDisabled
              selected={thread.id === selectedThreadId}
              onSelect={() => onSelectThread(thread.id)}
              onEdit={() => onRenameThread?.(thread.id)}
              onDelete={() => onDeleteThread?.(thread.id)}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
