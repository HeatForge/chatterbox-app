package com.chatterboxapp.dto;

public record CreateThreadRequest(
    String title,
    Long parentThreadId
) {
}
