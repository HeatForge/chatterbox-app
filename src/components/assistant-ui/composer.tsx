"use client";

import { AuiIf, ComposerPrimitive, useAuiState } from "@assistant-ui/react";
import { AlertCircleIcon, ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef } from "react";

import { useChatRuntimeContext } from "@/components/assistant-ui/chat-runtime-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ComposerVisualState = "ready" | "waiting" | "streaming" | "error";

/**
 * Maps assistant-ui thread state to the legacy ChatInput state machine.
 */
export function useComposerVisualState(): ComposerVisualState {
  const isRunning = useAuiState((state) => state.thread.isRunning);
  const messages = useAuiState((state) => state.thread.messages);
  const { composerError } = useChatRuntimeContext();

  if (composerError) {
    return "error";
  }

  if (!isRunning) {
    return "ready";
  }

  const lastMessage = messages.at(-1);
  if (
    lastMessage?.role === "user" &&
    lastMessage.id.startsWith("optimistic-")
  ) {
    return "waiting";
  }

  if (lastMessage?.status?.type === "running") {
    return "streaming";
  }

  return "waiting";
}

function ComposerStatusIndicator({ state }: { state: ComposerVisualState }) {
  if (state === "waiting") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" />
        Sending…
      </span>
    );
  }

  if (state === "streaming") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" />
        Generating…
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircleIcon className="size-3.5" />
        Message could not be sent
      </span>
    );
  }

  return null;
}

/** Message composer backed by assistant-ui primitives and shadcn controls. */
export function Composer() {
  const visualState = useComposerVisualState();
  const { clearComposerError } = useChatRuntimeContext();
  const rootRef = useRef<HTMLFormElement>(null);
  const isInputDisabled = visualState === "waiting";

  useEffect(() => {
    if (visualState !== "error" || !rootRef.current) {
      return;
    }

    rootRef.current.classList.add("animate-shake");
    const timer = window.setTimeout(() => {
      rootRef.current?.classList.remove("animate-shake");
    }, 450);

    return () => window.clearTimeout(timer);
  }, [visualState]);

  return (
    <ComposerPrimitive.Root
      ref={rootRef}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm",
        visualState === "error" && "border-destructive/60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <ComposerStatusIndicator state={visualState} />
        <AuiIf condition={(state) => state.thread.isRunning}>
          <span className="text-xs text-muted-foreground">
            Reply in progress
          </span>
        </AuiIf>
      </div>

      <ComposerPrimitive.Input
        placeholder="Message…"
        rows={1}
        disabled={isInputDisabled}
        className="max-h-40 min-h-10 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        onChange={() => clearComposerError()}
      />

      <div className="flex items-center justify-end">
        <ComposerPrimitive.Send
          render={
            <Button
              type="submit"
              size="icon-sm"
              className={cn(
                "rounded-full",
                visualState === "streaming" && "opacity-70",
              )}
            />
          }
        >
          <ArrowUpIcon data-icon="inline-start" />
          <span className="sr-only">Send message</span>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}
