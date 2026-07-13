import { ChatShell } from "@/components/chat/chat-shell";

/** Primary chat route — assembled shell with assistant-ui runtime (WP-4 cutover). */
export default function ChatPage() {
  return <ChatShell basePath="/chat" />;
}
