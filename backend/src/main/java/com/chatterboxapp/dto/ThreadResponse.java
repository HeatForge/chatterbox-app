package com.chatterboxapp.dto;

import java.util.List;

public record ThreadResponse(
    String id,
    String title,
    List<ThreadResponse> children
) {
}
