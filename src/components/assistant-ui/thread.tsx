"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Composer } from "@/components/assistant-ui/composer";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

function ThreadWelcome() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
      <h2 className="text-lg font-semibold">Start a conversation</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Send a message to begin. Responses stream in with markdown formatting.
      </p>
    </div>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root>
      <Message align="end">
        <MessageContent>
          <Bubble variant="tinted" align="end">
            <BubbleContent>
              <MessagePrimitive.Parts />
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="group/message">
      <Message align="start">
        <MessageContent>
          <Bubble variant="muted" align="start">
            <BubbleContent>
              <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
            </BubbleContent>
          </Bubble>

          <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            autohideFloat="always"
            className={cn(
              "flex gap-0.5 opacity-100 transition-opacity",
              "data-[floating]:opacity-0 data-[floating]:group-hover/message:opacity-100",
            )}
          >
            <ActionBarPrimitive.Copy className="group/copy flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <CopyIcon className="size-4 group-data-[copied]/copy:hidden" />
              <CheckIcon className="hidden size-4 group-data-[copied]/copy:block" />
              <span className="sr-only">Copy message</span>
            </ActionBarPrimitive.Copy>
          </ActionBarPrimitive.Root>
        </MessageContent>
      </Message>
    </MessagePrimitive.Root>
  );
}

function ThreadMessage({ role }: { role: "user" | "assistant" | "system" }) {
  if (role === "user") {
    return <UserMessage />;
  }

  if (role === "assistant") {
    return <AssistantMessage />;
  }

  return null;
}

function ThreadMessages() {
  return (
    <ThreadPrimitive.Messages>
      {({ message }) => (
        <MessageScrollerItem
          key={message.id}
          messageId={message.id}
          scrollAnchor={message.role === "user"}
        >
          <ThreadMessage role={message.role} />
        </MessageScrollerItem>
      )}
    </ThreadPrimitive.Messages>
  );
}

export type ThreadProps = {
  /** When false, hides the composer (e.g. archived read-only threads). */
  showComposer?: boolean;
};

/** assistant-ui thread shell composed with shadcn message primitives. */
export function Thread({ showComposer = true }: ThreadProps) {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-1 flex-col">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="px-4 py-6">
              <AuiIf condition={(state) => state.thread.isEmpty}>
                <ThreadWelcome />
              </AuiIf>
              <ThreadMessages />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {showComposer ? (
        <div className="shrink-0 border-t bg-background p-4">
          <Composer />
        </div>
      ) : null}
    </ThreadPrimitive.Root>
  );
}
