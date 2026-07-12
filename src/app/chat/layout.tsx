import { ChatInitialDataProvider } from "@/components/chat/ChatInitialDataProvider";
import { getThreadPayload } from "@/lib/services/chat";
import { listSidebarThreads } from "@/lib/services/projects";
import { getServerUserId } from "@/lib/services/session";

/**
 * Loads the initial chat snapshot on the server so the chat client does not
 * start with an empty sidebar and a client-side request waterfall.
 */
export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getServerUserId();
  const sidebar = await listSidebarThreads(userId);
  const firstThreadId =
    sidebar.standalone[0]?.id ??
    sidebar.projects.find((project) => project.threads.length > 0)?.threads[0]
      ?.id ??
    null;
  const thread = firstThreadId
    ? await getThreadPayload(userId, firstThreadId)
    : null;

  return (
    <ChatInitialDataProvider initialData={{ sidebar, thread }}>
      {children}
    </ChatInitialDataProvider>
  );
}
