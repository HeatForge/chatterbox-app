package com.chatterboxapp.controller;

import com.chatterboxapp.dto.ChatMessageResponse;
import com.chatterboxapp.dto.CreateThreadRequest;
import com.chatterboxapp.dto.RenameRequest;
import com.chatterboxapp.dto.SendMessageRequest;
import com.chatterboxapp.dto.ThreadResponse;
import com.chatterboxapp.dto.UpdateActiveVariantRequest;
import com.chatterboxapp.service.ChatService;
import com.chatterboxapp.service.ThreadService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api")
public class ThreadController {

  private final ThreadService threadService;
  private final ChatService chatService;

  public ThreadController(ThreadService threadService, ChatService chatService) {
    this.threadService = threadService;
    this.chatService = chatService;
  }

  @GetMapping("/threads")
  public List<ThreadResponse> listStandaloneThreads() {
    return threadService.listStandaloneThreads();
  }

  @PostMapping("/threads")
  public ResponseEntity<ThreadResponse> createStandaloneThread(
      @Valid @RequestBody CreateThreadRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(threadService.createStandaloneThread(request));
  }

  @PatchMapping("/threads/{threadId}")
  public ThreadResponse renameThread(
      @PathVariable Long threadId,
      @Valid @RequestBody RenameRequest request
  ) {
    return threadService.renameThread(threadId, request);
  }

  @DeleteMapping("/threads/{threadId}")
  public ResponseEntity<Void> deleteThread(@PathVariable Long threadId) {
    threadService.deleteThread(threadId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/threads/{threadId}/messages")
  public List<ChatMessageResponse> listMessages(@PathVariable Long threadId) {
    return threadService.listMessages(threadId);
  }

  @PostMapping(value = "/threads/{threadId}/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter chat(
      @PathVariable Long threadId,
      @Valid @RequestBody SendMessageRequest request
  ) {
    ChatService.SendContext context = chatService.prepareSend(threadId, request.content());
    return chatService.streamSend(context);
  }

  @PostMapping(
      value = "/threads/{threadId}/messages/{messageId}/regenerate",
      produces = MediaType.TEXT_EVENT_STREAM_VALUE
  )
  public SseEmitter regenerate(
      @PathVariable Long threadId,
      @PathVariable Long messageId
  ) {
    ChatService.RegenerateContext context = chatService.prepareRegenerate(threadId, messageId);
    return chatService.streamRegenerate(context);
  }
}
