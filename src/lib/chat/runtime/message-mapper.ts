import type { ThreadMessageLike } from "@assistant-ui/react";

import type { ChatMessageDto } from "@/lib/chat/types";

/**
 * Returns the text shown for an assistant message, including terminal errors.
 */
export function getAssistantDisplayContent(message: ChatMessageDto): string {
  if (message.role === "assistant" && message.status === "error") {
    return message.error ?? "Generation failed";
  }

  return message.content;
}

/**
 * Maps a persisted chat DTO to assistant-ui's external-store message shape.
 */
export function chatMessageToThreadMessage(
  message: ChatMessageDto,
): ThreadMessageLike {
  const text = getAssistantDisplayContent(message);

  return {
    id: message.id,
    role: message.role,
    content: [{ type: "text", text }],
    createdAt: new Date(message.createdAt),
    status: mapMessageStatus(message),
    metadata: message.id.startsWith("optimistic-")
      ? { isOptimistic: true }
      : undefined,
  };
}

/**
 * Creates a temporary user message while the POST request is in flight.
 */
export function createOptimisticUserMessage(content: string): ChatMessageDto {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    role: "user",
    content,
    status: "completed",
    error: null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Replaces or appends a message in an ordered thread message list.
 */
export function upsertChatMessage(
  messages: readonly ChatMessageDto[],
  updated: ChatMessageDto,
): ChatMessageDto[] {
  const index = messages.findIndex((message) => message.id === updated.id);
  if (index === -1) {
    return [...messages, updated];
  }

  return messages.map((message) =>
    message.id === updated.id ? updated : message,
  );
}

function mapMessageStatus(
  message: ChatMessageDto,
): ThreadMessageLike["status"] | undefined {
  if (message.role !== "assistant") {
    return undefined;
  }

  switch (message.status) {
    case "streaming":
      return { type: "running" };
    case "error":
      return {
        type: "incomplete",
        reason: "error",
        error: message.error ?? "Generation failed",
      };
    case "completed":
      return { type: "complete", reason: "stop" };
    default:
      return undefined;
  }
}
