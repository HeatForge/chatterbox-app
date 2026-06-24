import type { Metadata } from "next";
import ChatView from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "Chat | Chatterbox",
  description: "Personal AI chat",
};

export default function ChatPage() {
  return <ChatView />;
}
