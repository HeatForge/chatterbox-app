"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useChatInitialData } from "@/components/chat/ChatInitialDataProvider";
import type { SidebarSelection } from "@/components/chat/chat-sidebar-types";
import { getCachedThread } from "@/lib/cache/app-cache";
import type { ChatterboxRuntimeThread } from "@/lib/chat/runtime/chatterbox-runtime";

function createInitialSelection(
  thread: ChatterboxRuntimeThread | null,
): SidebarSelection | null {
  if (!thread) {
    return null;
  }

  return {
    type: "thread",
    threadId: thread.id,
    projectId: thread.projectId,
  };
}

/**
 * Reads `?thread=` from the URL and keeps sidebar selection / expanded projects
 * aligned with the active thread for compose-only (new chat) surfaces.
 */
export function useActiveThread() {
  const initialData = useChatInitialData();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  const seededThread = useMemo((): ChatterboxRuntimeThread | null => {
    if (threadId) {
      const cached = getCachedThread(threadId);
      if (cached) {
        return cached;
      }

      if (initialData?.thread?.id === threadId) {
        return initialData.thread;
      }

      return null;
    }

    if (!initialData?.thread) {
      return null;
    }

    return getCachedThread(initialData.thread.id) ?? initialData.thread ?? null;
  }, [initialData?.thread, threadId]);

  const [sidebarSelection, setSidebarSelection] =
    useState<SidebarSelection | null>(() =>
      createInitialSelection(seededThread),
    );
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set(seededThread?.projectId ? [seededThread.projectId] : []),
  );

  const projectId = useMemo((): string | null => {
    if (sidebarSelection?.type === "project") {
      return sidebarSelection.projectId;
    }

    if (sidebarSelection?.type === "thread") {
      return sidebarSelection.projectId;
    }

    return null;
  }, [sidebarSelection]);

  return {
    threadId,
    initialThread: seededThread,
    sidebarSelection,
    setSidebarSelection,
    expandedProjectIds,
    setExpandedProjectIds,
    projectId,
  };
}
