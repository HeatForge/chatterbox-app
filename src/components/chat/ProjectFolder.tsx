"use client";

import { Thread, type ThreadAction } from "@/components/lib/thread";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import { ChatThread } from "./ChatThread";
import folderStyles from "./project-folder.module.css";
import treeStyles from "./thread-tree.module.css";

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
  const projectActions: ThreadAction[] = archived
    ? [
        {
          id: "unarchive",
          icon: IconNames["unarchive-line"],
          label: "Unarchive project",
          onClick: onUnarchiveProject ?? (() => {}),
          intent: Intent.TERTIARY,
        },
      ]
    : [
        {
          id: "add-chat",
          icon: IconNames["add-line"],
          label: "Add chat",
          onClick: onAddChat ?? (() => {}),
          intent: Intent.TERTIARY,
        },
        {
          id: "edit",
          icon: IconNames["pencil-line"],
          label: "Rename project",
          onClick: onRenameProject ?? (() => {}),
          intent: Intent.TERTIARY,
        },
        {
          id: "archive",
          icon: IconNames["archive-line"],
          label: "Archive project",
          onClick: onArchiveProject ?? (() => {}),
          intent: Intent.TERTIARY,
        },
        {
          id: "delete",
          icon: IconNames["delete-line"],
          label: "Delete project",
          onClick: onDeleteProject ?? (() => {}),
          intent: Intent.DANGER,
        },
      ];

  return (
    <div className={folderStyles.root}>
      <div
        className={folderStyles.projectRow}
        data-selected={selected || undefined}
      >
        <Thread
          text={title}
          leftIcon={IconNames["folder-line"]}
          selected={selected}
          onSelect={onSelectProject}
          actions={projectActions}
          className={folderStyles.projectThread}
        />
      </div>
      {expanded ? (
        <ul className={treeStyles.treeList}>
          {threads.map((thread) => (
            <li className={treeStyles.treeItem} key={thread.id}>
              <div className={treeStyles.treeItemContent}>
                <ChatThread
                  id={thread.id}
                  title={thread.title}
                  variant="project"
                  iconDisabled
                  selected={thread.id === selectedThreadId}
                  onSelect={() => onSelectThread(thread.id)}
                  onEdit={() => onRenameThread?.(thread.id)}
                  onDelete={() => onDeleteThread?.(thread.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
