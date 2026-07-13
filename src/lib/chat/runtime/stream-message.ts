import type { ChatMessageDto } from "@/lib/chat/types";

export type StreamEventType = "content" | "done" | "error";

export type EventSourceLike = {
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  close: () => void;
};

export type EventSourceFactory = (url: string) => EventSourceLike;

export type StreamEventHandlers = {
  handleContent: (event: MessageEvent<string>) => void;
  handleDone: (event: MessageEvent<string>) => void;
  handleError: (event: Event) => void;
};

export type CreateStreamEventHandlersOptions = {
  threadId: string;
  messageId: string;
  getActiveThreadId: () => string | null;
  onMessageUpdate: (message: ChatMessageDto) => void;
  onComplete: (message: ChatMessageDto) => void;
  onConnectionError: () => void;
};

export type StreamConnection = {
  close: () => void;
};

export type ConnectMessageStreamOptions = CreateStreamEventHandlersOptions & {
  eventSourceFactory?: EventSourceFactory;
};

const defaultEventSourceFactory: EventSourceFactory = (url) =>
  new EventSource(url);

/**
 * Returns false when a stream event belongs to a thread that is no longer active.
 */
export function shouldApplyStreamEvent(
  activeThreadId: string | null,
  streamThreadId: string,
): boolean {
  return activeThreadId === streamThreadId;
}

/**
 * Parses SSE payload data into a chat message DTO.
 */
export function parseStreamMessageData(data: string): ChatMessageDto {
  return JSON.parse(data) as ChatMessageDto;
}

/**
 * Builds guarded SSE handlers for assistant message streaming.
 * Exported for unit tests of the content/done/error state machine.
 */
export function createStreamEventHandlers(
  options: CreateStreamEventHandlersOptions,
): StreamEventHandlers {
  const applyMessage = (message: ChatMessageDto): void => {
    if (
      !shouldApplyStreamEvent(options.getActiveThreadId(), options.threadId)
    ) {
      return;
    }

    options.onMessageUpdate(message);
  };

  const finish = (event: MessageEvent<string>): void => {
    applyMessage(parseStreamMessageData(event.data));
    if (shouldApplyStreamEvent(options.getActiveThreadId(), options.threadId)) {
      options.onComplete(parseStreamMessageData(event.data));
    }
  };

  return {
    handleContent: (event) => {
      applyMessage(parseStreamMessageData(event.data));
    },
    handleDone: finish,
    handleError: (event) => {
      if ("data" in event && typeof event.data === "string" && event.data) {
        finish(event as MessageEvent<string>);
        return;
      }

      if (
        shouldApplyStreamEvent(options.getActiveThreadId(), options.threadId)
      ) {
        options.onConnectionError();
      }
    },
  };
}

/**
 * Opens an EventSource for assistant generation and wires guarded handlers.
 * Closes automatically after terminal `done` or message `error` events.
 */
export function connectMessageStream(
  options: ConnectMessageStreamOptions,
): StreamConnection {
  const factory = options.eventSourceFactory ?? defaultEventSourceFactory;
  const stream = factory(
    `/api/chat/threads/${options.threadId}/messages/${options.messageId}/stream`,
  );
  const handlers = createStreamEventHandlers({
    ...options,
    onComplete: (message) => {
      options.onComplete(message);
      stream.close();
    },
    onConnectionError: () => {
      options.onConnectionError();
      stream.close();
    },
  });

  stream.addEventListener("content", (event) => {
    handlers.handleContent(event as MessageEvent<string>);
  });
  stream.addEventListener("done", (event) => {
    handlers.handleDone(event as MessageEvent<string>);
  });
  stream.addEventListener("error", handlers.handleError);

  return {
    close: () => {
      stream.close();
    },
  };
}
