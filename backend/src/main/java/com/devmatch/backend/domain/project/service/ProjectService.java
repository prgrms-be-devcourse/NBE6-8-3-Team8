package com.devmatch.backend.domain.project.service;

import com.devmatch.backend.domain.project.dto.ProjectCreateRequest;
import com.devmatch.backend.domain.project.dto.ProjectDetailResponse;
import com.devmatch.backend.domain.project.entity.Project;
import com.devmatch.backend.domain.project.entity.ProjectStatus;
import com.devmatch.backend.domain.project.mapper.ProjectMapper;
import com.devmatch.backend.domain.project.repository.ProjectRepository;
import com.devmatch.backend.domain.user.service.UserService;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ProjectService {

  private final UserService userService;

  private final ProjectRepository projectRepository;

  @Transactional
  public ProjectDetailResponse createProject(
      Long userId,
      ProjectCreateRequest projectCreateRequest
  ) {
    if (!projectCreateRequest.techStack().matches("^([\\w .+#-]+)(, [\\w .+#-]+)*$")) {
      throw new IllegalArgumentException("기술 스택 기재 형식이 올바르지 않습니다. \", \"로 구분해주세요");
    }

    Project project = new Project(
        projectCreateRequest.title(),
        projectCreateRequest.description(),
        projectCreateRequest.techStack(),
        projectCreateRequest.teamSize(),
        userService.getUser(userId),
        projectCreateRequest.durationWeeks()
    );

    return ProjectMapper.toProjectDetailResponse(projectRepository.save(project));
  }

  @Transactional(readOnly = true)
  public List<ProjectDetailResponse> getProjects() {
    return projectRepository.findAll()
        .stream()
        .map(ProjectMapper::toProjectDetailResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProjectDetailResponse> getProjectsByUserId(Long userId) {
    return projectRepository.findAllByCreatorId(userId)
        .stream()
        .map(ProjectMapper::toProjectDetailResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public ProjectDetailResponse getProjectDetail(Long projectId) {
    return ProjectMapper.toProjectDetailResponse(getProject(projectId));
  }

  @Transactional
  public ProjectDetailResponse modifyStatus(Long projectId, ProjectStatus status) {
    Project project = getProject(projectId);
    project.changeStatus(status);

    return ProjectMapper.toProjectDetailResponse(project);
  }

  @Transactional
  public ProjectDetailResponse modifyContent(Long projectId, String content) {
    Project project = getProject(projectId);
    project.changeContent(content);

    return ProjectMapper.toProjectDetailResponse(project);
  }

  @Transactional
  public void deleteProject(Long projectId) {
    getProject(projectId);
    projectRepository.deleteById(projectId);
  }

  public Project getProject(Long projectId) {
    return projectRepository.findById(projectId)
        .orElseThrow(() -> new NoSuchElementException("조회하려는 프로젝트가 없습니다"));
  }
}
