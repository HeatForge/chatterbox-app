"use client";

import { createContext, useContext, useState } from "react";

import type {
  SidebarProject,
  SidebarStandaloneThread,
} from "@/components/chat/chat-sidebar-types";
import type { ChatThreadPayload } from "@/lib/services/chat";

export type ChatSidebarData = {
  projects: SidebarProject[];
  standalone: SidebarStandaloneThread[];
  archived: {
    projects: SidebarProject[];
    standalone: SidebarStandaloneThread[];
  };
};

type ChatInitialData = {
  sidebar: ChatSidebarData;
  thread: ChatThreadPayload | null;
};

const ChatInitialDataContext = createContext<ChatInitialData | null>(null);

/**
 * Provides the server-rendered chat payload to the interactive chat page.
 * The value is initialized once per `/chat` layout mount so the client can
 * render immediately without repeating the initial sidebar/thread fetches.
 */
export function ChatInitialDataProvider({
  initialData,
  children,
}: Readonly<{
  initialData: ChatInitialData;
  children: React.ReactNode;
}>) {
  const [data] = useState(initialData);

  return (
    <ChatInitialDataContext.Provider value={data}>
      {children}
    </ChatInitialDataContext.Provider>
  );
}

/**
 * Returns the initial chat snapshot supplied by the server layout, if any.
 * Consumers must still revalidate because it can become stale after render.
 */
export function useChatInitialData(): ChatInitialData | null {
  return useContext(ChatInitialDataContext);
}
