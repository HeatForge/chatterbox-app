package com.chatterboxapp.service;

import com.chatterboxapp.dto.ThreadResponse;
import com.chatterboxapp.entity.ChatThread;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class ChatDtoMapper {

  private ChatDtoMapper() {
  }

  public static com.chatterboxapp.dto.ProjectResponse toProjectResponse(
      com.chatterboxapp.entity.Project project,
      List<ChatThread> threads
  ) {
    return new com.chatterboxapp.dto.ProjectResponse(
        String.valueOf(project.getId()),
        project.getName(),
        buildThreadTree(threads)
    );
  }

  public static ThreadResponse toThreadResponse(ChatThread thread) {
    return new ThreadResponse(String.valueOf(thread.getId()), thread.getTitle(), List.of());
  }

  public static com.chatterboxapp.dto.ChatMessageResponse toMessageResponse(
      com.chatterboxapp.entity.Message message
  ) {
    List<com.chatterboxapp.dto.MessageVariantResponse> variants = message.getVariants().stream()
        .sorted(java.util.Comparator.comparingInt(
            com.chatterboxapp.entity.MessageVariant::getSortOrder))
        .map(variant -> new com.chatterboxapp.dto.MessageVariantResponse(variant.getContent()))
        .toList();

    return new com.chatterboxapp.dto.ChatMessageResponse(
        String.valueOf(message.getId()),
        message.getRole().name(),
        variants,
        message.getActiveVariantIndex(),
        message.getThinking()
    );
  }

  public static List<ThreadResponse> buildThreadTree(List<ChatThread> threads) {
    Map<Long, List<ThreadResponse>> childrenByParent = new HashMap<>();

    for (ChatThread thread : threads) {
      ThreadResponse node = new ThreadResponse(
          String.valueOf(thread.getId()),
          thread.getTitle(),
          List.of()
      );
      Long parentId = thread.getParentThread() != null ? thread.getParentThread().getId() : null;
      if (parentId != null) {
        childrenByParent.computeIfAbsent(parentId, ignored -> new ArrayList<>()).add(node);
      }
    }

    List<ThreadResponse> roots = new ArrayList<>();
    for (ChatThread thread : threads) {
      if (thread.getParentThread() != null) {
        continue;
      }
      String id = String.valueOf(thread.getId());
      roots.add(new ThreadResponse(
          id,
          thread.getTitle(),
          childrenByParent.getOrDefault(thread.getId(), List.of())
      ));
    }
    return roots;
  }
}
