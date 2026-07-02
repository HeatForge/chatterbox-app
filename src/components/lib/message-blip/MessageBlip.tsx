"use client";

import type { ReactNode } from "react";

import { MarkdownContent } from "./MarkdownContent";
import { MessageActions } from "./MessageActions";
import styles from "./message-blip.module.css";
import { ThinkingSection } from "./ThinkingSection";

const DEFAULT_MAX_HEIGHT = 384;

export type MessageBlipProps = {
  content: string;
  align: "left" | "right";
  thinking?: string;
  expandFull?: boolean;
  maxHeight?: number;
  actions?: ReactNode;
  className?: string;
};

export function MessageBlip({
  content,
  align,
  thinking,
  expandFull = false,
  maxHeight = DEFAULT_MAX_HEIGHT,
  actions,
  className,
}: MessageBlipProps) {
  const hasThinking = Boolean(thinking?.trim());

  return (
    <article
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-align={align}
    >
      <div className={styles.bubble} data-align={align}>
        {hasThinking ? <ThinkingSection thinking={thinking ?? ""} /> : null}

        <div className={styles.bodyWrapper}>
          <div
            className={styles.bodyInner}
            data-scrollable={!expandFull || undefined}
            style={expandFull ? undefined : { maxHeight, overflowY: "auto" }}
          >
            <MarkdownContent content={content} />
          </div>
        </div>
      </div>

      <MessageActions content={content}>{actions}</MessageActions>
    </article>
  );
}
