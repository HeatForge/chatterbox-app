package com.chatterboxapp.dto;

import java.util.List;

public record ProjectResponse(
    String id,
    String name,
    List<ThreadResponse> threads
) {
}
