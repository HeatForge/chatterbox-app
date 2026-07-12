"use client";

import { Button } from "@/components/lib/button/Button";
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
  onSelectProject: () => void;
  onSelectThread: (threadId: string) => void;
};

export function ProjectFolder({
  title,
  threads,
  expanded,
  selected,
  selectedThreadId,
  onSelectProject,
  onSelectThread,
}: ProjectFolderProps) {
  return (
    <div className={folderStyles.root}>
      <div
        className={folderStyles.projectRow}
        data-selected={selected || undefined}
      >
        <Button
          text={title}
          leftIcon={IconNames["folder-line"]}
          intent={selected ? Intent.SECONDARY : Intent.PRIMARY}
          minimal
          style={{ justifyContent: "flex-start", width: "100%" }}
          onClick={onSelectProject}
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
                  iconDisabled
                  selected={thread.id === selectedThreadId}
                  onSelect={() => onSelectThread(thread.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
