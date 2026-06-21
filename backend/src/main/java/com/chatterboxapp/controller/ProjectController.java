package com.chatterboxapp.controller;

import com.chatterboxapp.dto.CreateProjectRequest;
import com.chatterboxapp.dto.CreateThreadRequest;
import com.chatterboxapp.dto.ProjectResponse;
import com.chatterboxapp.dto.RenameRequest;
import com.chatterboxapp.dto.ThreadResponse;
import com.chatterboxapp.service.ProjectService;
import com.chatterboxapp.service.ThreadService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProjectController {

  private final ProjectService projectService;
  private final ThreadService threadService;

  public ProjectController(ProjectService projectService, ThreadService threadService) {
    this.projectService = projectService;
    this.threadService = threadService;
  }

  @GetMapping("/projects")
  public List<ProjectResponse> listProjects() {
    return projectService.listProjects();
  }

  @PostMapping("/projects")
  public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody CreateProjectRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
  }

  @PatchMapping("/projects/{projectId}")
  public ProjectResponse renameProject(
      @PathVariable Long projectId,
      @Valid @RequestBody RenameRequest request
  ) {
    return projectService.renameProject(projectId, request);
  }

  @DeleteMapping("/projects/{projectId}")
  public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
    projectService.deleteProject(projectId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/projects/{projectId}/threads")
  public ResponseEntity<ThreadResponse> createProjectThread(
      @PathVariable Long projectId,
      @Valid @RequestBody CreateThreadRequest request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(threadService.createProjectThread(projectId, request));
  }
}
