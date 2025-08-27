package com.devmatch.backend.domain.project.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devmatch.backend.domain.project.dto.ProjectCreateRequest;
import com.devmatch.backend.domain.project.dto.ProjectDetailResponse;
import com.devmatch.backend.domain.project.entity.Project;
import com.devmatch.backend.domain.project.entity.ProjectStatus;
import com.devmatch.backend.domain.project.repository.ProjectRepository;
import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.service.UserService;
import java.util.*;
import java.util.function.Consumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

  @InjectMocks
  ProjectService projectService;

  @Mock
  UserService userService;

  @Mock
  ProjectRepository projectRepository;

  @Test
  @DisplayName("성공: 유효한 프로젝트 생성 요청을 하면, 프로젝트 응답 DTO를 반환한다")
  void createProject_shouldReturnProjectResponse() {
    User user = createUser(1L, "user1@test.com", "user1");

    ProjectCreateRequest projectCreateRequest = new ProjectCreateRequest(
        "테스트 프로젝트",
        "설명",
        "Java, Spring Boot",
        5,
        4
    );

    Project savedProject = new Project(
        projectCreateRequest.title(),
        projectCreateRequest.description(),
        projectCreateRequest.techStack(),
        projectCreateRequest.teamSize(),
        user,
        projectCreateRequest.durationWeeks()
    );
    ReflectionTestUtils.setField(savedProject, "id", 1L);

    when(userService.getUser(user.getId())).thenReturn(user);
    when(projectRepository.save(any(Project.class))).thenReturn(savedProject);

    ProjectDetailResponse response = projectService.createProject(user.getId(),
        projectCreateRequest);

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(savedProject.getId());
    assertThat(response.title()).isEqualTo(savedProject.getTitle());
    assertThat(response.creator()).isEqualTo(savedProject.getCreator().getNickName());
    assertThat(response.techStacks()).isEqualTo(
        Arrays.stream(savedProject.getTechStack().split(", ")).toList());

    verify(userService, times(1)).getUser(user.getId());
    verify(projectRepository, times(1)).save(any(Project.class));
  }

  @Test
  @DisplayName("성공: 프로젝트 전체 조회를 하면, 사용자들이 만든 모든 프로젝트 응답 DTO를 반환한다")
  void getProjects_shouldReturnProjectsResponse_whenProjectExists() {
    User user1 = createUser(1L, "user1@test.com", "user1");
    User user2 = createUser(2L, "user2@test.com", "user2");
    Project project1 = createProject(1L, "title1", user1);
    Project project2 = createProject(2L, "title2", user2);

    List<Project> projects = List.of(project1, project2);

    when(projectRepository.findAll()).thenReturn(projects);

    List<ProjectDetailResponse> responses = projectService.getProjects();

    assertThat(responses).isNotNull();
    assertThat(responses.size()).isEqualTo(2);

    ProjectDetailResponse response = responses.getFirst();
    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(project1.getId());
    assertThat(response.title()).isEqualTo(project1.getTitle());
    assertThat(response.creator()).isEqualTo(project1.getCreator().getNickName());
    assertThat(response.techStacks()).isEqualTo(
        Arrays.stream(project1.getTechStack().split(", ")).toList());

    verify(projectRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("성공: 프로젝트 없을 시 전체 조회를 하면, 빈 리스트를 반환한다")
  void getProjects_shouldReturnEmptyList_whenProjectsDoNotExist() {
    when(projectRepository.findAll()).thenReturn(Collections.emptyList());

    List<ProjectDetailResponse> responses = projectService.getProjects();

    assertThat(responses).isNotNull();
    assertThat(responses).isEmpty();

    verify(projectRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("성공: 사용자의 프로젝트들을 조회하면, 사용자의 프로젝트 응답 DTO 목록을 반환한다")
  void getProjectsByUserId_shouldReturnProjectsResponse_whenUserHasProjects() {
    User user1 = createUser(1L, "user1@test.com", "user1");
    Project project1 = createProject(1L, "title1", user1);
    Project project2 = createProject(2L, "title2", user1);

    List<Project> projects = List.of(project1, project2);

    when(projectRepository.findAllByCreatorId(user1.getId())).thenReturn(projects);

    List<ProjectDetailResponse> responses = projectService.getProjectsByUserId(user1.getId());

    assertThat(responses).isNotNull();
    assertThat(responses.size()).isEqualTo(2);

    ProjectDetailResponse response = responses.getFirst();
    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(project1.getId());
    assertThat(response.title()).isEqualTo(project1.getTitle());
    assertThat(response.creator()).isEqualTo(project1.getCreator().getNickName());
    assertThat(response.techStacks()).isEqualTo(
        Arrays.stream(project1.getTechStack().split(", ")).toList());

    verify(projectRepository, times(1)).findAllByCreatorId(user1.getId());
  }

  @Test
  @DisplayName("성공: 사용자가 프로젝트를 생성한 적이 없는데 조회를 하면, 빈 리스트를 반환한다")
  void getProjectsByUserId_shouldReturnEmptyList_whenProjectsDoNotExist() {
    Long userId = 1L;

    when(projectRepository.findAllByCreatorId(userId)).thenReturn(Collections.emptyList());

    List<ProjectDetailResponse> responses = projectService.getProjectsByUserId(userId);

    assertThat(responses).isNotNull();
    assertThat(responses).isEmpty();

    verify(projectRepository, times(1)).findAllByCreatorId(userId);
  }

  @Test
  @DisplayName("성공: 프로젝트를 단일로 조회하면, 프로젝트 응답 DTO를 반환한다")
  void getProjectDetail_shouldReturnProjectResponse_whenProjectExists() {
    User user1 = createUser(1L, "user@test.com", "user");
    Project project1 = createProject(1L, "title1", user1);

    when(projectRepository.findById(project1.getId())).thenReturn(Optional.of(project1));

    ProjectDetailResponse response = projectService.getProjectDetail(project1.getId());

    assertThat(response).isNotNull();
    assertThat(response.id()).isEqualTo(project1.getId());
    assertThat(response.title()).isEqualTo(project1.getTitle());
    assertThat(response.creator()).isEqualTo(user1.getNickName());
    assertThat(response.techStacks()).isEqualTo(
        Arrays.stream(project1.getTechStack().split(", ")).toList());

    verify(projectRepository, times(1)).findById(project1.getId());
  }

  @Test
  @DisplayName("실패: 존재하지 않는 프로젝트를 상세 조회하면, NoSuchElementException을 던진다")
  void getProjectDetail_shouldThrowException_whenProjectDoesNotExist() {
    assertProjectNotFound(projectId -> projectService.getProjectDetail(projectId));
  }

  @Test
  @DisplayName("성공: 프로젝트의 상태를 변경하면, 프로젝트 상태가 변경된 응답 DTO를 반환한다")
  void modifyStatus_shouldReturnProjectResponse_whenProjectExists() {
    User user1 = createUser(1L, "user1@test.com", "user1");
    Project project1 = createProject(1L, "title1", user1);

    when(projectRepository.findById(project1.getId())).thenReturn(Optional.of(project1));

    ProjectDetailResponse response = projectService.modifyStatus(project1.getId(),
        ProjectStatus.COMPLETED);

    assertThat(response).isNotNull();
    assertThat(response.status()).isEqualTo(ProjectStatus.COMPLETED.toString());
    assertThat(response.id()).isEqualTo(project1.getId());
    assertThat(response.title()).isEqualTo(project1.getTitle());
    assertThat(response.creator()).isEqualTo(project1.getCreator().getNickName());

    verify(projectRepository, times(1)).findById(project1.getId());
  }

  @Test
  @DisplayName("실패: 존재하지 않는 프로젝트의 상태를 변경하려 하면, NoSuchElementException을 던진다")
  void modifyStatus_shouldThrowException_whenProjectDoesNotExist() {
    assertProjectNotFound(
        projectId -> projectService.modifyStatus(projectId, ProjectStatus.COMPLETED));
  }

  @Test
  @DisplayName("성공: 프로젝트가 존재할 때 역할 분석 내용을 수정하면, 내용이 변경된다")
  void modifyContent_shouldUpdateContent_whenProjectExists() {
    User user1 = createUser(1L, "user1@test.com", "user1");
    Project project1 = createProject(1L, "title1", user1);

    String newContent = "new content";

    when(projectRepository.findById(project1.getId())).thenReturn(Optional.of(project1));

    ProjectDetailResponse response = projectService.modifyContent(project1.getId(), newContent);

    assertThat(response).isNotNull();
    assertThat(response.content()).isEqualTo(newContent);
    assertThat(response.id()).isEqualTo(project1.getId());
    assertThat(response.title()).isEqualTo(project1.getTitle());
    assertThat(response.creator()).isEqualTo(project1.getCreator().getNickName());

    verify(projectRepository, times(1)).findById(project1.getId());
  }

  @Test
  @DisplayName("실패: 존재하지 않는 프로젝트의 내용을 수정하려 하면, NoSuchElementException을 던진다")
  void modifyContent_shouldThrowException_whenProjectDoesNotExist() {
    assertProjectNotFound(projectId -> projectService.modifyContent(projectId, "new content"));
  }

  @Test
  @DisplayName("성공: 프로젝트가 존재할 때 삭제하면, 프로젝트를 삭제한다")
  void deleteProject_shouldDeleteProject_whenProjectExists() {
    User user1 = createUser(1L, "user1@test.com", "user1");
    Project project1 = createProject(1L, "title1", user1);

    when(projectRepository.findById(project1.getId())).thenReturn(Optional.of(project1));

    projectService.deleteProject(project1.getId());

    verify(projectRepository, times(1)).findById(project1.getId());
    verify(projectRepository, times(1)).deleteById(project1.getId());
  }

  @Test
  @DisplayName("실패: 존재하지 않는 프로젝트를 삭제하려 하면, NoSuchElementException을 던진다")
  void deleteProject_shouldThrowException_whenProjectDoesNotExist() {
    assertProjectNotFound(projectId -> projectService.deleteProject(projectId));

    verify(projectRepository, times(0)).deleteById(anyLong());
  }

  @Test
  @DisplayName("성공: 프로젝트가 존재할 때 조회하면, 프로젝트를 반환한다")
  void getProject_shouldReturnProject_whenProjectExists() {
    User user1 = createUser(1L, "user1@test.com", "user1");
    Project project1 = createProject(1L, "title1", user1);

    when(projectRepository.findById(project1.getId())).thenReturn(Optional.of(project1));

    Project response = projectService.getProject(project1.getId());

    assertThat(response).isNotNull();
    assertThat(response.getId()).isEqualTo(project1.getId());
    assertThat(response.getTitle()).isEqualTo(project1.getTitle());
    assertThat(response.getCreator().getId()).isEqualTo(project1.getCreator().getId());

    verify(projectRepository, times(1)).findById(project1.getId());
  }

  @Test
  @DisplayName("실패: 프로젝트가 존재하지 않을 때 조회하면, NoSuchElementException을 던진다")
  void getProject_shouldThrowException_whenProjectDoesNotExist() {
    assertProjectNotFound(projectId -> projectService.getProject(projectId));
  }

  private User createUser(Long id, String email, String nickName) {
    User user = new User(email, "testPassword", nickName, "testImgUrl");
    ReflectionTestUtils.setField(user, "id", id);
    return user;
  }

  private Project createProject(Long id, String title, User creator) {
    Project project = new Project(title, "description", "Java, Spring Boot", 5, creator, 4);
    ReflectionTestUtils.setField(project, "id", id);
    return project;
  }

  private void assertProjectNotFound(Consumer<Long> serviceMethodCall) {
    Long nonExistentId = 999L;

    when(projectRepository.findById(nonExistentId)).thenReturn(Optional.empty());

    NoSuchElementException exception = assertThrows(NoSuchElementException.class,
        () -> serviceMethodCall.accept(nonExistentId));

    assertThat(exception.getClass()).isEqualTo(NoSuchElementException.class);
    assertThat(exception.getMessage()).isEqualTo("조회하려는 프로젝트가 없습니다");

    verify(projectRepository, times(1)).findById(nonExistentId);
  }
}
