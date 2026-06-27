"use client";

import type { ReactNode } from "react";

import { ToastPlacement } from "@/hooks/use-toaster/types";
import { useToaster } from "@/hooks/use-toaster/use-toaster";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import { Button } from "../button/Button";
import styles from "./message-blip.module.css";

type MessageActionsProps = {
  content: string;
  children?: ReactNode;
};

export function MessageActions({ content, children }: MessageActionsProps) {
  const showToast = useToaster();

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      showToast({
        title: "Copied",
        description: "Message copied to clipboard.",
        intent: Intent.SUCCESS,
        placement: ToastPlacement.BOTTOM_RIGHT,
        duration: 2500,
      });
    } catch {
      showToast({
        title: "Copy failed",
        description: "Could not copy message to clipboard.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
        duration: 3500,
      });
    }
  }

  return (
    <div className={styles.actions}>
      <Button
        leftIcon={IconNames["copy-line"]}
        intent={Intent.TERTIARY}
        iconSize={13}
        onClick={() => void handleCopy()}
        aria-label="Copy message"
      />
      {children}
    </div>
  );
}
