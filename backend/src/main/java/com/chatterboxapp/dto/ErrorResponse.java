package com.chatterboxapp.dto;

public record ErrorResponse(
    String error,
    String message
) {
}
