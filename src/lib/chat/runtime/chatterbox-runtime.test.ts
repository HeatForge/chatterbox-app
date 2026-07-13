import { describe, expect, it, vi } from "vitest";

import type { ChatMessageDto } from "@/lib/chat/types";

import {
  chatMessageToThreadMessage,
  createOptimisticUserMessage,
  getAssistantDisplayContent,
  upsertChatMessage,
} from "./message-mapper";
import {
  connectMessageStream,
  createStreamEventHandlers,
  parseStreamMessageData,
  shouldApplyStreamEvent,
} from "./stream-message";

const baseAssistantMessage: ChatMessageDto = {
  id: "assistant-1",
  role: "assistant",
  content: "Hello",
  status: "streaming",
  error: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("message-mapper", () => {
  it("maps user messages to assistant-ui text parts", () => {
    const message: ChatMessageDto = {
      id: "user-1",
      role: "user",
      content: "Hi there",
      status: "completed",
      error: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    expect(chatMessageToThreadMessage(message)).toEqual({
      id: "user-1",
      role: "user",
      content: [{ type: "text", text: "Hi there" }],
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      status: undefined,
      metadata: undefined,
    });
  });

  it("maps streaming assistant messages to running status", () => {
    expect(chatMessageToThreadMessage(baseAssistantMessage).status).toEqual({
      type: "running",
    });
  });

  it("maps assistant errors to incomplete status and error text", () => {
    const message: ChatMessageDto = {
      ...baseAssistantMessage,
      status: "error",
      content: "",
      error: "Model unavailable",
    };

    expect(getAssistantDisplayContent(message)).toBe("Model unavailable");
    expect(chatMessageToThreadMessage(message)).toMatchObject({
      content: [{ type: "text", text: "Model unavailable" }],
      status: {
        type: "incomplete",
        reason: "error",
        error: "Model unavailable",
      },
    });
  });

  it("creates optimistic user messages with stable DTO fields", () => {
    const message = createOptimisticUserMessage("Draft");

    expect(message.role).toBe("user");
    expect(message.content).toBe("Draft");
    expect(message.status).toBe("completed");
    expect(message.id.startsWith("optimistic-")).toBe(true);
    expect(chatMessageToThreadMessage(message).metadata).toEqual({
      isOptimistic: true,
    });
  });

  it("upserts messages by id", () => {
    const updated: ChatMessageDto = {
      ...baseAssistantMessage,
      content: "Hello world",
    };

    expect(upsertChatMessage([baseAssistantMessage], updated)[0]?.content).toBe(
      "Hello world",
    );
    expect(upsertChatMessage([], updated)).toEqual([updated]);
  });
});

describe("stream-message state machine", () => {
  it("parses SSE payload data", () => {
    expect(
      parseStreamMessageData(JSON.stringify(baseAssistantMessage)),
    ).toEqual(baseAssistantMessage);
  });

  it("guards stale thread updates", () => {
    expect(shouldApplyStreamEvent("thread-a", "thread-a")).toBe(true);
    expect(shouldApplyStreamEvent("thread-b", "thread-a")).toBe(false);
    expect(shouldApplyStreamEvent(null, "thread-a")).toBe(false);
  });

  it("applies content updates only for the active thread", () => {
    const onMessageUpdate = vi.fn();
    const handlers = createStreamEventHandlers({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-b",
      onMessageUpdate,
      onComplete: vi.fn(),
      onConnectionError: vi.fn(),
    });

    handlers.handleContent({
      data: JSON.stringify({
        ...baseAssistantMessage,
        content: "Partial",
      }),
    } as MessageEvent<string>);

    expect(onMessageUpdate).not.toHaveBeenCalled();
  });

  it("does not complete on done when the active thread changed", () => {
    const onComplete = vi.fn();
    const handlers = createStreamEventHandlers({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-b",
      onMessageUpdate: vi.fn(),
      onComplete,
      onConnectionError: vi.fn(),
    });

    handlers.handleDone({
      data: JSON.stringify({
        ...baseAssistantMessage,
        status: "completed",
      }),
    } as MessageEvent<string>);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("streams content updates and completes on done", () => {
    const onMessageUpdate = vi.fn();
    const onComplete = vi.fn();
    const handlers = createStreamEventHandlers({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-a",
      onMessageUpdate,
      onComplete,
      onConnectionError: vi.fn(),
    });

    const partial = {
      ...baseAssistantMessage,
      content: "Partial",
    };
    const finalMessage = {
      ...baseAssistantMessage,
      content: "Final",
      status: "completed" as const,
    };

    handlers.handleContent({
      data: JSON.stringify(partial),
    } as MessageEvent<string>);
    handlers.handleDone({
      data: JSON.stringify(finalMessage),
    } as MessageEvent<string>);

    expect(onMessageUpdate).toHaveBeenCalledWith(partial);
    expect(onComplete).toHaveBeenCalledWith(finalMessage);
  });

  it("treats SSE error events with payload as terminal message updates", () => {
    const onComplete = vi.fn();
    const handlers = createStreamEventHandlers({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-a",
      onMessageUpdate: vi.fn(),
      onComplete,
      onConnectionError: vi.fn(),
    });

    const failedMessage: ChatMessageDto = {
      ...baseAssistantMessage,
      status: "error",
      error: "Generation failed",
      content: "",
    };

    handlers.handleError({
      data: JSON.stringify(failedMessage),
    } as MessageEvent<string>);

    expect(onComplete).toHaveBeenCalledWith(failedMessage);
  });

  it("ignores connection errors when the active thread changed", () => {
    const onConnectionError = vi.fn();
    const handlers = createStreamEventHandlers({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-b",
      onMessageUpdate: vi.fn(),
      onComplete: vi.fn(),
      onConnectionError,
    });

    handlers.handleError(new Event("error"));

    expect(onConnectionError).not.toHaveBeenCalled();
  });

  it("reports connection errors without SSE payload", () => {
    const onConnectionError = vi.fn();
    const handlers = createStreamEventHandlers({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-a",
      onMessageUpdate: vi.fn(),
      onComplete: vi.fn(),
      onConnectionError,
    });

    handlers.handleError(new Event("error"));

    expect(onConnectionError).toHaveBeenCalledTimes(1);
  });

  it("closes EventSource connections after terminal events", () => {
    const listeners = new Map<string, (event: Event) => void>();
    const close = vi.fn();
    const eventSourceFactory = () => ({
      addEventListener: (type: string, listener: (event: Event) => void) => {
        listeners.set(type, listener);
      },
      close,
    });

    connectMessageStream({
      threadId: "thread-a",
      messageId: "assistant-1",
      getActiveThreadId: () => "thread-a",
      onMessageUpdate: vi.fn(),
      onComplete: vi.fn(),
      onConnectionError: vi.fn(),
      eventSourceFactory,
    });

    listeners.get("done")?.({
      data: JSON.stringify({
        ...baseAssistantMessage,
        status: "completed",
      }),
    } as MessageEvent<string>);

    expect(close).toHaveBeenCalledTimes(1);
  });
});
