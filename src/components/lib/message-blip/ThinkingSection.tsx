"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

import { IconNames } from "@/lib/IconNames";

import { MarkdownContent } from "./MarkdownContent";
import styles from "./message-blip.module.css";

type ThinkingSectionProps = {
  thinking: string;
};

export function ThinkingSection({ thinking }: ThinkingSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.thinking} data-expanded={expanded || undefined}>
      <button
        type="button"
        className={styles.thinkingToggle}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse thinking" : "Expand thinking"}
      >
        <Icon
          icon={IconNames["brain-line"]}
          width={16}
          height={16}
          aria-hidden
        />
        <span className={styles.thinkingLabel}>Thinking</span>
        <Icon
          className={styles.thinkingChevron}
          icon={expanded ? IconNames["up-line"] : IconNames["down-line"]}
          width={16}
          height={16}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div className={styles.thinkingBody}>
          <MarkdownContent
            content={thinking}
            className={styles.thinkingMarkdown}
          />
        </div>
      ) : null}
    </div>
  );
}
