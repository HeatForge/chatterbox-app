"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import { memo } from "react";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const MarkdownTextImpl = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md flex flex-col gap-3 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
      smooth
      components={defaultComponents}
    />
  );
};

/** Renders assistant message text parts as GFM markdown. */
export const MarkdownText = memo(MarkdownTextImpl);

const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("text-base font-semibold", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("text-sm font-semibold", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("whitespace-pre-wrap", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "break-words text-primary underline underline-offset-2",
        className,
      )}
      rel="noreferrer"
      target="_blank"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-s-2 border-border ps-4 text-muted-foreground italic",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("flex list-disc flex-col gap-1 ps-5", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("flex list-decimal flex-col gap-1 ps-5", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("ps-1", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("border-border", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border border-border bg-muted px-3 py-2 text-start font-medium",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn("border border-border px-3 py-2", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[0.8125rem]",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          isCodeBlock
            ? "font-mono text-[0.8125rem]"
            : "rounded bg-muted px-1 py-0.5 font-mono text-[0.8125rem]",
          className,
        )}
        {...props}
      />
    );
  },
});
