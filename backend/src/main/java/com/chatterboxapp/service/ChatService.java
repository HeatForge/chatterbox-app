package com.chatterboxapp.service;

import com.chatterboxapp.dto.StreamDonePayload;
import com.chatterboxapp.entity.ChatThread;
import com.chatterboxapp.entity.Message;
import com.chatterboxapp.entity.MessageRole;
import com.chatterboxapp.entity.MessageVariant;
import com.chatterboxapp.exception.ResourceNotFoundException;
import com.chatterboxapp.repository.ChatThreadRepository;
import com.chatterboxapp.repository.MessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class ChatService {

  private static final long STREAM_TIMEOUT_MS = 120_000L;

  private final ChatClient chatClient;
  private final MessageRepository messageRepository;
  private final ChatThreadRepository chatThreadRepository;
  private final ThreadService threadService;
  private final ObjectMapper objectMapper;
  private final TransactionTemplate transactionTemplate;
  private final ExecutorService streamExecutor = Executors.newCachedThreadPool();

  public ChatService(
      ChatClient chatClient,
      MessageRepository messageRepository,
      ChatThreadRepository chatThreadRepository,
      ThreadService threadService,
      ObjectMapper objectMapper,
      TransactionTemplate transactionTemplate
  ) {
    this.chatClient = chatClient;
    this.messageRepository = messageRepository;
    this.chatThreadRepository = chatThreadRepository;
    this.threadService = threadService;
    this.objectMapper = objectMapper;
    this.transactionTemplate = transactionTemplate;
  }

  @Transactional
  public SendContext prepareSend(Long threadId, String content) {
    ChatThread thread = threadService.requireOwnedThread(threadId);
    Message userMessage = new Message(thread, MessageRole.user);
    userMessage.addVariant(new MessageVariant(content.trim(), 0));
    messageRepository.save(userMessage);

    maybeUpdateThreadTitle(thread, content);

    List<Message> history = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    return new SendContext(threadId, userMessage.getId(), buildAiMessages(history));
  }

  @Transactional
  public RegenerateContext prepareRegenerate(Long threadId, Long messageId) {
    threadService.requireOwnedThread(threadId);
    Message message = messageRepository.findByIdAndThreadId(messageId, threadId)
        .orElseThrow(() -> new ResourceNotFoundException("Message not found."));

    if (message.getRole() != MessageRole.assistant) {
      throw new ResourceNotFoundException("Only assistant messages can be regenerated.");
    }

    int newIndex = message.getVariants().size();
    MessageVariant variant = new MessageVariant("", newIndex);
    message.addVariant(variant);
    message.setActiveVariantIndex(newIndex);
    message.setThinking(null);
    Message saved = messageRepository.saveAndFlush(message);

    Long variantId = saved.getVariants().stream()
        .max(Comparator.comparingInt(MessageVariant::getSortOrder))
        .map(MessageVariant::getId)
        .orElseThrow();

    List<Message> history = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId).stream()
        .filter(existing -> existing.getCreatedAt().isBefore(saved.getCreatedAt()))
        .toList();

    return new RegenerateContext(messageId, variantId, buildAiMessages(history));
  }

  public SseEmitter streamSend(SendContext context) {
    SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MS);
    streamExecutor.execute(() -> runStream(
        emitter,
        context.aiMessages(),
        (text, thinking) -> finalizeSend(context, text, thinking, emitter)
    ));
    return emitter;
  }

  public SseEmitter streamRegenerate(RegenerateContext context) {
    SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MS);
    streamExecutor.execute(() -> runStream(
        emitter,
        context.aiMessages(),
        (text, thinking) -> finalizeRegenerate(context, text, thinking, emitter)
    ));
    return emitter;
  }

  private void finalizeSend(
      SendContext context,
      String content,
      String thinking,
      SseEmitter emitter
  ) {
    ChatThread thread = chatThreadRepository.findById(context.threadId()).orElseThrow();
    Message assistantMessage = new Message(thread, MessageRole.assistant);
    if (thinking != null && !thinking.isBlank()) {
      assistantMessage.setThinking(thinking);
    }
    MessageVariant variant = new MessageVariant(content, 0);
    assistantMessage.addVariant(variant);
    messageRepository.save(assistantMessage);

    StreamDonePayload payload = new StreamDonePayload(
        String.valueOf(context.userMessageId()),
        String.valueOf(assistantMessage.getId()),
        String.valueOf(variant.getId()),
        content,
        thinking
    );
    sendDone(emitter, payload);
  }

  private void finalizeRegenerate(
      RegenerateContext context,
      String content,
      String thinking,
      SseEmitter emitter
  ) {
    Message message = messageRepository.findById(context.messageId()).orElseThrow();
    MessageVariant variant = message.getVariants().stream()
        .filter(existing -> existing.getId().equals(context.variantId()))
        .findFirst()
        .orElseThrow();
    variant.setContent(content);
    if (thinking != null && !thinking.isBlank()) {
      message.setThinking(thinking);
    }
    messageRepository.save(message);

    StreamDonePayload payload = new StreamDonePayload(
        null,
        String.valueOf(message.getId()),
        String.valueOf(variant.getId()),
        content,
        thinking
    );
    sendDone(emitter, payload);
  }

  private void runStream(
      SseEmitter emitter,
      List<org.springframework.ai.chat.messages.Message> aiMessages,
      StreamFinalizer finalizer
  ) {
    StringBuilder text = new StringBuilder();
    StringBuilder reasoning = new StringBuilder();

    chatClient.prompt()
        .messages(aiMessages)
        .stream()
        .chatResponse()
        .subscribe(
            response -> handleChunk(emitter, response, text, reasoning),
            error -> sendError(emitter, error),
            () -> {
              try {
                transactionTemplate.executeWithoutResult(status ->
                    finalizer.finish(
                        text.toString(),
                        reasoning.isEmpty() ? null : reasoning.toString()
                    )
                );
              } catch (Exception ex) {
                sendError(emitter, ex);
              }
            }
        );
  }

  private void handleChunk(
      SseEmitter emitter,
      ChatResponse response,
      StringBuilder text,
      StringBuilder reasoning
  ) {
    String textDelta = extractTextDelta(response);
    if (!textDelta.isEmpty()) {
      text.append(textDelta);
      sendEvent(emitter, "text-delta", Map.of("delta", textDelta));
    }

    String reasoningDelta = extractReasoningDelta(response);
    if (!reasoningDelta.isEmpty()) {
      reasoning.append(reasoningDelta);
      sendEvent(emitter, "reasoning-delta", Map.of("delta", reasoningDelta));
    }
  }

  private String extractTextDelta(ChatResponse response) {
    if (response.getResult() == null || response.getResult().getOutput() == null) {
      return "";
    }
    String text = response.getResult().getOutput().getText();
    return text != null ? text : "";
  }

  private String extractReasoningDelta(ChatResponse response) {
    if (response.getResult() == null || response.getResult().getOutput() == null) {
      return "";
    }
    Object reasoning = response.getResult().getOutput().getMetadata().get("reasoningContent");
    if (reasoning == null) {
      reasoning = response.getResult().getOutput().getMetadata().get("reasoning");
    }
    return reasoning != null ? reasoning.toString() : "";
  }

  private List<org.springframework.ai.chat.messages.Message> buildAiMessages(List<Message> messages) {
    List<org.springframework.ai.chat.messages.Message> aiMessages = new ArrayList<>();
    for (Message message : messages) {
      String content = activeVariantContent(message);
      if (content.isBlank()) {
        continue;
      }
      if (message.getRole() == MessageRole.user) {
        aiMessages.add(new UserMessage(content));
      } else {
        aiMessages.add(new AssistantMessage(content));
      }
    }
    return aiMessages;
  }

  private String activeVariantContent(Message message) {
    List<MessageVariant> sorted = message.getVariants().stream()
        .sorted(Comparator.comparingInt(MessageVariant::getSortOrder))
        .toList();
    int index = message.getActiveVariantIndex();
    if (index < 0 || index >= sorted.size()) {
      return "";
    }
    return sorted.get(index).getContent();
  }

  private void maybeUpdateThreadTitle(ChatThread thread, String content) {
    if (!ChatThread.DEFAULT_TITLE.equals(thread.getTitle())) {
      return;
    }
    String title = content.trim();
    if (title.length() > 60) {
      title = title.substring(0, 57) + "...";
    }
    thread.setTitle(title.isBlank() ? ChatThread.DEFAULT_TITLE : title);
    chatThreadRepository.save(thread);
  }

  private void sendEvent(SseEmitter emitter, String eventName, Object payload) {
    try {
      emitter.send(SseEmitter.event().name(eventName).data(objectMapper.writeValueAsString(payload)));
    } catch (IOException ex) {
      emitter.completeWithError(ex);
    }
  }

  private void sendDone(SseEmitter emitter, StreamDonePayload payload) {
    try {
      emitter.send(SseEmitter.event().name("done").data(objectMapper.writeValueAsString(payload)));
      emitter.complete();
    } catch (IOException ex) {
      emitter.completeWithError(ex);
    }
  }

  private void sendError(SseEmitter emitter, Throwable error) {
    try {
      Map<String, String> body = Map.of(
          "error", "stream_error",
          "message", error.getMessage() != null ? error.getMessage() : "Streaming failed."
      );
      emitter.send(SseEmitter.event().name("error").data(objectMapper.writeValueAsString(body)));
      emitter.completeWithError(error);
    } catch (IOException ex) {
      emitter.completeWithError(ex);
    }
  }

  public record SendContext(
      Long threadId,
      Long userMessageId,
      List<org.springframework.ai.chat.messages.Message> aiMessages
  ) {
  }

  public record RegenerateContext(
      Long messageId,
      Long variantId,
      List<org.springframework.ai.chat.messages.Message> aiMessages
  ) {
  }

  @FunctionalInterface
  private interface StreamFinalizer {
    void finish(String content, String thinking);
  }
}
