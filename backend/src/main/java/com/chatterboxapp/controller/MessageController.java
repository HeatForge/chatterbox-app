package com.chatterboxapp.controller;

import com.chatterboxapp.dto.ChatMessageResponse;
import com.chatterboxapp.dto.UpdateActiveVariantRequest;
import com.chatterboxapp.service.ThreadService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

  private final ThreadService threadService;

  public MessageController(ThreadService threadService) {
    this.threadService = threadService;
  }

  @PatchMapping("/{messageId}")
  public ChatMessageResponse updateActiveVariant(
      @PathVariable Long messageId,
      @Valid @RequestBody UpdateActiveVariantRequest request
  ) {
    return threadService.updateActiveVariant(messageId, request);
  }
}
