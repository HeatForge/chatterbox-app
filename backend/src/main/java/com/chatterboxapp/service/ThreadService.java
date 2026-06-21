package com.chatterboxapp.service;

import com.chatterboxapp.dto.ChatMessageResponse;
import com.chatterboxapp.dto.CreateThreadRequest;
import com.chatterboxapp.dto.RenameRequest;
import com.chatterboxapp.dto.ThreadResponse;
import com.chatterboxapp.dto.UpdateActiveVariantRequest;
import com.chatterboxapp.entity.ChatThread;
import com.chatterboxapp.entity.Message;
import com.chatterboxapp.entity.Project;
import com.chatterboxapp.entity.User;
import com.chatterboxapp.exception.ResourceNotFoundException;
import com.chatterboxapp.repository.ChatThreadRepository;
import com.chatterboxapp.repository.MessageRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ThreadService {

  private final ChatThreadRepository chatThreadRepository;
  private final MessageRepository messageRepository;
  private final AuthService authService;
  private final ProjectService projectService;

  public ThreadService(
      ChatThreadRepository chatThreadRepository,
      MessageRepository messageRepository,
      AuthService authService,
      ProjectService projectService
  ) {
    this.chatThreadRepository = chatThreadRepository;
    this.messageRepository = messageRepository;
    this.authService = authService;
    this.projectService = projectService;
  }

  @Transactional(readOnly = true)
  public List<ThreadResponse> listStandaloneThreads() {
    User user = authService.requireCurrentUser();
    return chatThreadRepository.findByUserIdAndProjectIdIsNullOrderByUpdatedAtDesc(user.getId()).stream()
        .filter(thread -> thread.getParentThread() == null)
        .map(ChatDtoMapper::toThreadResponse)
        .toList();
  }

  @Transactional
  public ThreadResponse createStandaloneThread(CreateThreadRequest request) {
    User user = authService.requireCurrentUser();
    ChatThread thread = new ChatThread(user, resolveTitle(request));
    if (request.parentThreadId() != null) {
      ChatThread parent = requireOwnedThread(request.parentThreadId());
      thread.setParentThread(parent);
    }
    ChatThread saved = chatThreadRepository.save(thread);
    return ChatDtoMapper.toThreadResponse(saved);
  }

  @Transactional
  public ThreadResponse createProjectThread(
      Long projectId,
      CreateThreadRequest request
  ) {
    User user = authService.requireCurrentUser();
    Project project = projectService.requireOwnedProject(projectId);
    ChatThread thread = new ChatThread(user, resolveTitle(request));
    thread.setProject(project);
    if (request.parentThreadId() != null) {
      ChatThread parent = requireOwnedThread(request.parentThreadId());
      thread.setParentThread(parent);
      thread.setProject(parent.getProject());
    }
    ChatThread saved = chatThreadRepository.save(thread);
    return ChatDtoMapper.toThreadResponse(saved);
  }

  @Transactional
  public ThreadResponse renameThread(Long threadId, RenameRequest request) {
    ChatThread thread = requireOwnedThread(threadId);
    thread.setTitle(request.name().trim());
    return ChatDtoMapper.toThreadResponse(thread);
  }

  @Transactional
  public void deleteThread(Long threadId) {
    ChatThread thread = requireOwnedThread(threadId);
    chatThreadRepository.delete(thread);
  }

  @Transactional(readOnly = true)
  public List<ChatMessageResponse> listMessages(Long threadId) {
    requireOwnedThread(threadId);
    return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId).stream()
        .map(ChatDtoMapper::toMessageResponse)
        .toList();
  }

  @Transactional
  public ChatMessageResponse updateActiveVariant(Long messageId, UpdateActiveVariantRequest request) {
    Message message = messageRepository.findById(messageId)
        .orElseThrow(() -> new ResourceNotFoundException("Message not found."));
    requireOwnedThread(message.getThread().getId());

    if (request.activeVariantIndex() >= message.getVariants().size()) {
      throw new ResourceNotFoundException("Variant index out of range.");
    }

    message.setActiveVariantIndex(request.activeVariantIndex());
    return ChatDtoMapper.toMessageResponse(message);
  }

  ChatThread requireOwnedThread(Long threadId) {
    User user = authService.requireCurrentUser();
    return chatThreadRepository.findByIdAndUserId(threadId, user.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Thread not found."));
  }

  private String resolveTitle(CreateThreadRequest request) {
    if (request.title() == null || request.title().isBlank()) {
      return ChatThread.DEFAULT_TITLE;
    }
    return request.title().trim();
  }
}
