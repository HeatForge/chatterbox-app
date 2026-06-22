package com.chatterboxapp.dto;

public record StreamDonePayload(
    String userMessageId,
    String assistantMessageId,
    String variantId,
    String content,
    String thinking
) {
}
