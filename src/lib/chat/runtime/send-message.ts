import type { SendMessageResponse } from "@/lib/chat/types";

export type SendChatMessageInput = {
  content: string;
  threadId?: string;
  projectId?: string;
};

/**
 * Sends a user message to an existing thread or starts a new thread.
 * Preserves the existing POST contract used by `/chat`.
 */
export async function sendChatMessage(
  input: SendChatMessageInput,
): Promise<SendMessageResponse> {
  const trimmed = input.content.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }

  const endpoint = input.threadId
    ? `/api/chat/threads/${input.threadId}/messages`
    : "/api/chat/messages";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: trimmed,
      ...(input.projectId ? { projectId: input.projectId } : {}),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Message could not be sent");
  }

  return (await response.json()) as SendMessageResponse;
}
