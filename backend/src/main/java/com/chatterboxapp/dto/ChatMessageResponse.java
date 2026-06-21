package com.chatterboxapp.dto;

import java.util.List;

public record ChatMessageResponse(
    String id,
    String role,
    List<MessageVariantResponse> variants,
    int activeVariantIndex,
    String thinking
) {
}
