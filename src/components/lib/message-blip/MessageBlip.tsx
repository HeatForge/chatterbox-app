"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

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
  const innerRef = useRef<HTMLDivElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState<number | undefined>();
  const [isScrollable, setIsScrollable] = useState(false);

  useLayoutEffect(() => {
    const element = innerRef.current;
    if (!element) {
      return;
    }

    function updateHeight(): void {
      const naturalHeight = element?.scrollHeight ?? 0;

      if (expandFull) {
        setWrapperHeight(naturalHeight);
        setIsScrollable(false);
        return;
      }

      setWrapperHeight(Math.min(naturalHeight, maxHeight));
      setIsScrollable(naturalHeight > maxHeight);
    }

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [expandFull, maxHeight]);

  const hasThinking = Boolean(thinking?.trim());

  return (
    <article
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-align={align}
    >
      <div className={styles.bubble} data-align={align}>
        {hasThinking ? <ThinkingSection thinking={thinking ?? ""} /> : null}

        <div
          className={styles.bodyWrapper}
          style={
            wrapperHeight === undefined ? undefined : { height: wrapperHeight }
          }
        >
          <div
            ref={innerRef}
            className={styles.bodyInner}
            data-scrollable={isScrollable || undefined}
            style={
              isScrollable && !expandFull
                ? { maxHeight, overflowY: "auto" }
                : undefined
            }
          >
            <MarkdownContent content={content} />
          </div>
        </div>
      </div>

      <MessageActions content={content}>{actions}</MessageActions>
    </article>
  );
}
