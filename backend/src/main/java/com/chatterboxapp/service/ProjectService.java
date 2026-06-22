package com.chatterboxapp.service;

import com.chatterboxapp.dto.CreateProjectRequest;
import com.chatterboxapp.dto.ProjectResponse;
import com.chatterboxapp.dto.RenameRequest;
import com.chatterboxapp.entity.Project;
import com.chatterboxapp.entity.User;
import com.chatterboxapp.exception.ResourceNotFoundException;
import com.chatterboxapp.repository.ChatThreadRepository;
import com.chatterboxapp.repository.ProjectRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final ChatThreadRepository chatThreadRepository;
  private final AuthService authService;

  public ProjectService(
      ProjectRepository projectRepository,
      ChatThreadRepository chatThreadRepository,
      AuthService authService
  ) {
    this.projectRepository = projectRepository;
    this.chatThreadRepository = chatThreadRepository;
    this.authService = authService;
  }

  @Transactional(readOnly = true)
  public List<ProjectResponse> listProjects() {
    User user = authService.requireCurrentUser();
    return projectRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
        .map(project -> ChatDtoMapper.toProjectResponse(
            project,
            chatThreadRepository.findByUserIdAndProjectIdOrderByUpdatedAtDesc(user.getId(), project.getId())
        ))
        .toList();
  }

  @Transactional
  public ProjectResponse createProject(CreateProjectRequest request) {
    User user = authService.requireCurrentUser();
    Project project = projectRepository.save(new Project(user, request.name().trim()));
    return ChatDtoMapper.toProjectResponse(project, List.of());
  }

  @Transactional
  public ProjectResponse renameProject(Long projectId, RenameRequest request) {
    Project project = requireOwnedProject(projectId);
    project.setName(request.name().trim());
    User user = authService.requireCurrentUser();
    return ChatDtoMapper.toProjectResponse(
        project,
        chatThreadRepository.findByUserIdAndProjectIdOrderByUpdatedAtDesc(user.getId(), project.getId())
    );
  }

  @Transactional
  public void deleteProject(Long projectId) {
    Project project = requireOwnedProject(projectId);
    projectRepository.delete(project);
  }

  Project requireOwnedProject(Long projectId) {
    User user = authService.requireCurrentUser();
    return projectRepository.findByIdAndUserId(projectId, user.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
  }
}
