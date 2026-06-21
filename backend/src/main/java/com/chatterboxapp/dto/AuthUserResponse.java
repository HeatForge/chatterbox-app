package com.chatterboxapp.dto;

public record AuthUserResponse(
    Long id,
    String email,
    String displayName
) {
}
