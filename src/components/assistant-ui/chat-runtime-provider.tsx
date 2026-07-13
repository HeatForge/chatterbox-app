"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  type ChatterboxRuntimeThread,
  useChatterboxRuntime,
} from "@/lib/chat/runtime/chatterbox-runtime";
import { Intent } from "@/lib/Intent";
import { showIntentToast } from "@/lib/toast";

type ChatRuntimeContextValue = {
  composerError: boolean;
  clearComposerError: () => void;
  thread: ChatterboxRuntimeThread | null;
  reloadThread: (threadId: string) => Promise<void>;
};

const ChatRuntimeContext = createContext<ChatRuntimeContextValue | null>(null);

export type ChatRuntimeProviderProps = {
  children: React.ReactNode;
  threadId: string | null;
  initialThread?: ChatterboxRuntimeThread | null;
  projectId?: string | null;
  isSendDisabled?: boolean;
  /** Route prefix for thread deep links, e.g. `/chat-v2` or `/chat`. */
  basePath?: string;
  /** Sync active thread id to `?thread=` for deep linking after send/load. */
  syncUrl?: boolean;
  /** Called when thread metadata or messages change after load, send, or stream. */
  onThreadChange?: (thread: ChatterboxRuntimeThread) => void;
};

/**
 * Wraps assistant-ui with the chatterbox external-store runtime and shared
 * composer error state for the v2 chat shell.
 */
export function ChatRuntimeProvider({
  children,
  threadId,
  initialThread = null,
  projectId = null,
  isSendDisabled = false,
  basePath = "/chat",
  syncUrl = true,
  onThreadChange,
}: ChatRuntimeProviderProps) {
  const router = useRouter();
  const [composerError, setComposerError] = useState(false);

  const clearComposerError = useCallback(() => {
    setComposerError(false);
  }, []);

  const handleThreadChange = useCallback(
    (thread: ChatterboxRuntimeThread) => {
      onThreadChange?.(thread);

      if (!syncUrl) {
        return;
      }

      const nextUrl = `${basePath}?thread=${encodeURIComponent(thread.id)}`;
      router.replace(nextUrl, { scroll: false });
    },
    [basePath, onThreadChange, router, syncUrl],
  );

  const handleError = useCallback((error: Error) => {
    setComposerError(true);
    showIntentToast({
      title: "Chat error",
      description: error.message,
      intent: Intent.DANGER,
    });
  }, []);

  const { runtime, thread, loadThread } = useChatterboxRuntime({
    threadId,
    initialThread,
    projectId,
    isSendDisabled,
    onThreadChange: handleThreadChange,
    onError: handleError,
  });

  const contextValue = useMemo<ChatRuntimeContextValue>(
    () => ({
      composerError,
      clearComposerError,
      thread,
      reloadThread: loadThread,
    }),
    [composerError, clearComposerError, loadThread, thread],
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatRuntimeContext.Provider value={contextValue}>
        {children}
      </ChatRuntimeContext.Provider>
    </AssistantRuntimeProvider>
  );
}

/** Returns composer error state and the active chatterbox thread snapshot. */
export function useChatRuntimeContext(): ChatRuntimeContextValue {
  const context = useContext(ChatRuntimeContext);
  if (!context) {
    throw new Error(
      "useChatRuntimeContext must be used within ChatRuntimeProvider",
    );
  }

  return context;
}
