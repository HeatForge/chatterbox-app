"use client";

import { memo, useMemo } from "react";

import styles from "./message-blip.module.css";
import { renderMarkdown } from "./render-markdown";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export const MarkdownContent = memo(function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={[styles.markdown, className].filter(Boolean).join(" ")}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: CommonMark escapes raw HTML by default
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
