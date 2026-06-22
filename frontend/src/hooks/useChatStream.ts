import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi } from "../api/chat";
import type { ChatMessage } from "../utils/types/chat";

let tempIdCounter = 0;

function createTempId(prefix: string) {
  tempIdCounter += 1;
  return `${prefix}-temp-${tempIdCounter}`;
}

function createUserMessage(content: string): ChatMessage {
  return {
    id: createTempId("user"),
    role: "user",
    variants: [{ content }],
    activeVariantIndex: 0,
  };
}

function createAssistantPlaceholder(): ChatMessage {
  return {
    id: createTempId("assistant"),
    role: "assistant",
    variants: [{ content: "" }],
    activeVariantIndex: 0,
    thinking: "",
  };
}

export function useChatStream(threadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const streamGenerationRef = useRef(0);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    chatApi
      .listMessages(threadId)
      .then((loaded) => {
        if (!cancelled) {
          setMessages(loaded);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!threadId || !text.trim() || isStreaming) {
        return;
      }

      const userMessage = createUserMessage(text.trim());
      const assistantMessage = createAssistantPlaceholder();
      const generation = streamGenerationRef.current + 1;
      streamGenerationRef.current = generation;

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        await chatApi.streamChat(threadId, text.trim(), {
          onTextDelta: (delta) => {
            if (generation !== streamGenerationRef.current) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== assistantMessage.id) {
                  return message;
                }
                return {
                  ...message,
                  variants: [{ content: message.variants[0].content + delta }],
                };
              }),
            );
          },
          onReasoningDelta: (delta) => {
            if (generation !== streamGenerationRef.current) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== assistantMessage.id) {
                  return message;
                }
                return {
                  ...message,
                  thinking: `${message.thinking ?? ""}${delta}`,
                };
              }),
            );
          },
          onDone: (payload) => {
            if (generation !== streamGenerationRef.current) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id === userMessage.id && payload.userMessageId) {
                  return { ...message, id: payload.userMessageId };
                }
                if (message.id === assistantMessage.id) {
                  return {
                    ...message,
                    id: payload.assistantMessageId,
                    variants: [{ content: payload.content }],
                    thinking: payload.thinking ?? undefined,
                  };
                }
                return message;
              }),
            );
            setIsStreaming(false);
          },
          onError: () => {
            if (generation === streamGenerationRef.current) {
              setIsStreaming(false);
            }
          },
        });
      } catch {
        setIsStreaming(false);
      }
    },
    [isStreaming, threadId],
  );

  const regenerate = useCallback(
    async (messageId: string) => {
      if (!threadId || isStreaming) {
        return;
      }

      const generation = streamGenerationRef.current + 1;
      streamGenerationRef.current = generation;
      let variantIndex = 0;

      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId) {
            return message;
          }
          variantIndex = message.variants.length;
          return {
            ...message,
            activeVariantIndex: variantIndex,
            thinking: "",
            variants: [...message.variants, { content: "" }],
          };
        }),
      );

      setIsStreaming(true);

      try {
        await chatApi.streamRegenerate(threadId, messageId, {
          onTextDelta: (delta) => {
            if (generation !== streamGenerationRef.current) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== messageId) {
                  return message;
                }
                const variants = [...message.variants];
                const current = variants[variantIndex] ?? { content: "" };
                variants[variantIndex] = { content: current.content + delta };
                return { ...message, variants };
              }),
            );
          },
          onReasoningDelta: (delta) => {
            if (generation !== streamGenerationRef.current) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== messageId) {
                  return message;
                }
                return {
                  ...message,
                  thinking: `${message.thinking ?? ""}${delta}`,
                };
              }),
            );
          },
          onDone: (payload) => {
            if (generation !== streamGenerationRef.current) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) => {
                if (message.id !== messageId) {
                  return message;
                }
                const variants = [...message.variants];
                variants[variantIndex] = { content: payload.content };
                return {
                  ...message,
                  variants,
                  thinking: payload.thinking ?? undefined,
                };
              }),
            );
            setIsStreaming(false);
          },
          onError: () => {
            if (generation === streamGenerationRef.current) {
              setIsStreaming(false);
            }
          },
        });
      } catch {
        setIsStreaming(false);
      }
    },
    [isStreaming, threadId],
  );

  const setActiveVariant = useCallback(
    async (messageId: string, index: number) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, activeVariantIndex: index }
            : message,
        ),
      );

      if (!messageId.includes("temp")) {
        try {
          await chatApi.updateActiveVariant(messageId, index);
        } catch {
          // Keep optimistic UI state on failure.
        }
      }
    },
    [],
  );

  const handlePrevVariant = useCallback(
    (messageId: string) => {
      const message = messages.find((item) => item.id === messageId);
      if (!message || message.activeVariantIndex === 0) {
        return;
      }
      void setActiveVariant(messageId, message.activeVariantIndex - 1);
    },
    [messages, setActiveVariant],
  );

  const handleNextVariant = useCallback(
    (messageId: string) => {
      const message = messages.find((item) => item.id === messageId);
      if (!message) {
        return;
      }

      if (message.activeVariantIndex < message.variants.length - 1) {
        void setActiveVariant(messageId, message.activeVariantIndex + 1);
        return;
      }

      void regenerate(messageId);
    },
    [messages, regenerate, setActiveVariant],
  );

  return {
    messages,
    isStreaming,
    isLoading,
    sendMessage,
    handlePrevVariant,
    handleNextVariant,
  };
}
