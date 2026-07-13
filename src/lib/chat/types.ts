export type {
  ChatMessageDto,
  ChatThreadPayload,
  ThreadSummary,
} from "@/lib/services/chat";

import type { ChatMessageDto, ChatThreadPayload } from "@/lib/services/chat";

/** POST /api/chat/messages and /api/chat/threads/:id/messages response shape. */
export type SendMessageResponse = {
  threadId: string;
  thread: Omit<ChatThreadPayload, "systemPrompt" | "messages">;
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
};
