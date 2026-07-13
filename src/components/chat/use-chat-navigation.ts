"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { flushAppCachePersistence } from "@/lib/cache/app-cache";

export type UseChatNavigationOptions = {
  /** Route prefix for thread deep links, e.g. `/chat-v2` or `/chat`. */
  basePath: string;
};

/**
 * Router helpers for chat thread switching. Uses `replace` with `scroll: false`
 * so sidebar selection does not reset scroll position.
 */
export function useChatNavigation({ basePath }: UseChatNavigationOptions) {
  const router = useRouter();

  const navigateToThread = useCallback(
    (threadId: string): void => {
      flushAppCachePersistence();
      router.replace(`${basePath}?thread=${encodeURIComponent(threadId)}`, {
        scroll: false,
      });
    },
    [basePath, router],
  );

  const navigateToNewChat = useCallback((): void => {
    flushAppCachePersistence();
    router.replace(basePath, { scroll: false });
  }, [basePath, router]);

  return {
    basePath,
    navigateToThread,
    navigateToNewChat,
  };
}
