package com.devmatch.backend.domain.project.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto;
import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import com.devmatch.backend.domain.application.service.ApplicationService;
import com.devmatch.backend.domain.project.dto.ProjectApplyRequest;
import com.devmatch.backend.domain.project.dto.ProjectCreateRequest;
import com.devmatch.backend.domain.project.dto.ProjectDetailResponse;
import com.devmatch.backend.domain.project.dto.ProjectStatusUpdateRequest;
import com.devmatch.backend.domain.project.entity.ProjectStatus;
import com.devmatch.backend.domain.project.service.ProjectService;
import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.global.rq.Rq;
import com.devmatch.backend.global.security.CustomAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = ProjectController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
    },
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = CustomAuthenticationFilter.class
    )
)
class ProjectControllerUnitTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private ProjectService projectService;

  @MockitoBean
  private ApplicationService applicationService;

  @MockitoBean
  private Rq rq;

  @Test
  @DisplayName("성공: 유효한 데이터로 프로젝트 생성을 요청하면 201 Created와 생성된 프로젝트 정보를 반환한다")
  void createProject_shouldMakeProject_whenValidRequest() throws Exception {
    ProjectCreateRequest request = createProjectCreateRequest("새 프로젝트");
    ProjectDetailResponse response = createProjectDetailResponse(1L, "새 프로젝트");

    User user = Mockito.mock(User.class);
    given(rq.getActor()).willReturn(user);
    given(user.getId()).willReturn(1L);

    given(projectService.createProject(rq.getActor().getId(), request)).willReturn(response);

    mockMvc.perform(post("/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.msg").value("프로젝트 생성 성공"))
        .andExpect(jsonPath("$.data.id").value(response.id()))
        .andExpect(jsonPath("$.data.title").value(response.title()));

    verify(projectService, times(1)).createProject(rq.getActor().getId(), request);
  }

  // 여러 실패 케이스를 한 번에 테스트하기 위한 데이터 소스
  static Stream<Arguments> provideInvalidProjectCreateRequests() {
    return Stream.of(
        Arguments.of(new ProjectCreateRequest(null, "설명", "기술", 3, 4), "title"),
        Arguments.of(new ProjectCreateRequest("", "설명", "기술", 3, 4), "title"),
        Arguments.of(new ProjectCreateRequest("제목", null, "기술", 3, 4), "description"),
        Arguments.of(new ProjectCreateRequest("제목", "", "기술", 3, 4), "description"),
        Arguments.of(new ProjectCreateRequest("제목", "설명", null, 3, 4), "techStack"),
        Arguments.of(new ProjectCreateRequest("제목", "설명", "", 3, 4), "techStack"),
        Arguments.of(new ProjectCreateRequest("제목", "설명", "기술", 0, 4), "teamSize"),
        Arguments.of(new ProjectCreateRequest("제목", "설명", "기술", 3, 0), "durationWeeks")
    );
  }

  @ParameterizedTest(name = "[{index}] {1} 필드가 유효하지 않을 때 400 Bad Request 반환")
  @MethodSource("provideInvalidProjectCreateRequests")
  @DisplayName("실패: 유효하지 않은 데이터로 프로젝트 생성을 요청하면 400 Bad Request를 반환한다")
  void createProject_shouldFail_WithInvalidInput(
      ProjectCreateRequest invalidRequest,
      String errorField
  ) throws Exception {
    mockMvc.perform(post("/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalidRequest)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.msg").value(containsString(errorField)));
  }

  @Test
  @DisplayName("성공: 프로젝트 목록 조회를 요청하면 200 OK와 전체 프로젝트 목록을 반환한다")
  void getAllProjects_shouldReturnProjectList_whenProjectsExist() throws Exception {
    ProjectDetailResponse project1 = createProjectDetailResponse(1L, "새 프로젝트1");
    ProjectDetailResponse project2 = createProjectDetailResponse(2L, "새 프로젝트2");
    List<ProjectDetailResponse> projectList = List.of(project1, project2);

    given(projectService.getProjects()).willReturn(projectList);

    mockMvc.perform(get("/projects")
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("프로젝트 전체 조회 성공"))
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data", hasSize(2)))
        .andExpect(jsonPath("$.data[0].id").value(project1.id()))
        .andExpect(jsonPath("$.data[0].title").value(project1.title()))
        .andExpect(jsonPath("$.data[1].id").value(project2.id()))
        .andExpect(jsonPath("$.data[1].title").value(project2.title()));

    verify(projectService, times(1)).getProjects();
  }

  @Test
  @DisplayName("성공: 프로젝트가 하나도 없을 때 200 OK와 빈 목록을 반환한다")
  void getAllProjects_shouldReturnEmptyList_whenNoProjectsExist() throws Exception {
    given(projectService.getProjects()).willReturn(Collections.emptyList());

    mockMvc.perform(get("/projects")
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("프로젝트 전체 조회 성공"))
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data", hasSize(0)));

    verify(projectService, times(1)).getProjects();
  }

  @Test
  @DisplayName("성공: 존재하는 ID로 프로젝트 단일 조회를 요청하면 200 OK와 해당 프로젝트 정보를 반환한다")
  void getProject_shouldReturnProject_whenIdExists() throws Exception {
    ProjectDetailResponse response = createProjectDetailResponse(1L, "새 프로젝트");

    given(projectService.getProjectDetail(response.id())).willReturn(response);

    mockMvc.perform(get("/projects/{id}", response.id())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("프로젝트 단일 조회 성공"))
        .andExpect(jsonPath("$.data.id").value(response.id()))
        .andExpect(jsonPath("$.data.title").value(response.title()));

    verify(projectService, times(1)).getProjectDetail(response.id());
  }

  @Test
  @DisplayName("실패: 존재하지 않는 ID로 프로젝트 조회를 요청하면 404 Not Found를 반환한다")
  void getProject_shouldReturnNotFound_whenIdDoesNotExist() throws Exception {
    Long nonExistentId = 999L;

    given(projectService.getProjectDetail(nonExistentId))
        .willThrow(new NoSuchElementException("조회하려는 프로젝트가 없습니다"));

    mockMvc.perform(get("/projects/{id}", nonExistentId)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.msg").value("조회하려는 프로젝트가 없습니다"));

    verify(projectService, times(1)).getProjectDetail(nonExistentId);
  }

  @Test
  @DisplayName("성공: 유효한 요청으로 프로젝트 상태를 수정하면 200 OK와 수정된 정보를 반환한다")
  void modifyStatus_shouldUpdateStatus_whenRequestIsValid() throws Exception {
    ProjectStatusUpdateRequest request = new ProjectStatusUpdateRequest(ProjectStatus.COMPLETED);

    ProjectDetailResponse updatedResponse = new ProjectDetailResponse(
        1L, "새 프로젝트", "프로젝트 설명", List.of("Java", "Spring Boot"),
        5, 4, "testUser", request.status().toString(),
        "content", 4, LocalDateTime.now()
    );

    given(projectService.modifyStatus(updatedResponse.id(), request.status())).willReturn(
        updatedResponse);

    mockMvc.perform(patch("/projects/{id}/status", updatedResponse.id())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("프로젝트 상태 수정 성공"))
        .andExpect(jsonPath("$.data.id").value(updatedResponse.id()))
        .andExpect(jsonPath("$.data.status").value(request.status().toString()));

    verify(projectService, times(1)).modifyStatus(updatedResponse.id(), request.status());
  }

  @Test
  @DisplayName("실패: status 필드가 null인 요청은 400 Bad Request를 반환한다")
  void modifyStatus_shouldReturnBadRequest_whenStatusIsNull() throws Exception {
    String invalidRequestBody = createContentJson("status", null);

    mockMvc.perform(patch("/projects/{id}/status", 1L)
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidRequestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.msg").value(containsString("status")));

    verify(projectService, times(0)).modifyStatus(anyLong(), any(ProjectStatus.class));
  }

  @Test
  @DisplayName("실패: 유효하지 않은 status 문자열로 요청하면 400 Bad Request를 반환한다")
  void modifyStatus_shouldReturnBadRequest_whenStatusIsInvalidString() throws Exception {
    String invalidRequestBody = createContentJson("status", "IN_PROGRESS");

    mockMvc.perform(patch("/projects/{id}/status", 1L)
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidRequestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.msg").value(containsString("IN_PROGRESS")));

    verify(projectService, times(0)).modifyStatus(anyLong(), any(ProjectStatus.class));
  }

  @Test
  @DisplayName("실패: 존재하지 않는 ID로 상태 수정을 요청하면 404 Not Found를 반환한다")
  void modifyStatus_shouldReturnNotFound_whenIdDoesNotExist() throws Exception {
    Long nonExistentId = 999L;
    ProjectStatusUpdateRequest request = new ProjectStatusUpdateRequest(ProjectStatus.COMPLETED);

    given(projectService.modifyStatus(nonExistentId, request.status()))
        .willThrow(new NoSuchElementException("조회하려는 프로젝트가 없습니다"));

    mockMvc.perform(patch("/projects/{id}/status", nonExistentId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.msg").value("조회하려는 프로젝트가 없습니다"));

    verify(projectService, times(1)).modifyStatus(anyLong(), any(ProjectStatus.class));
  }

  @Test
  @DisplayName("성공: 유효한 내용으로 프로젝트 내용을 수정하면 200 OK와 수정된 정보를 반환한다")
  void modifyContent_shouldUpdateContent_whenRequestIsValid() throws Exception {
    Long projectId = 1L;
    String newContent = "새로운 역할 배분 내용입니다.";
    String requestBody = createContentJson("content", newContent);

    ProjectDetailResponse updatedResponse = new ProjectDetailResponse(
        1L, "새 프로젝트", "프로젝트 설명", List.of("Java", "Spring Boot"),
        5, 4, "testUser", ProjectStatus.RECRUITING.toString(),
        newContent, 4, LocalDateTime.now()
    );

    given(projectService.modifyContent(projectId, newContent)).willReturn(updatedResponse);

    mockMvc.perform(patch("/projects/{id}/content", projectId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("역할 배분 내용 수정 성공"))
        .andExpect(jsonPath("$.data.id").value(projectId))
        .andExpect(jsonPath("$.data.content").value(newContent));

    verify(projectService, times(1)).modifyContent(projectId, newContent);
  }

  static Stream<Arguments> provideInvalidContentRequests() {
    String longContent = String.join("", Collections.nCopies(2001, "a"));

    return Stream.of(
        Arguments.of(createContentJson("content", null), "NotNull"),
        Arguments.of(createContentJson("content", ""), "Size"),
        Arguments.of(createContentJson("content", longContent), "Size")
    );
  }

  @ParameterizedTest(name = "[{index}] {1} 불통과 요청 시 400 Bad Request 반환")
  @MethodSource("provideInvalidContentRequests")
  @DisplayName("실패: content 필드가 유효하지 않은 요청은 400 Bad Request를 반환한다")
  void modifyContent_shouldReturnBadRequest_whenContentIsInvalid(
      String invalidRequestBody,
      String errorType
  ) throws Exception {
    mockMvc.perform(patch("/projects/{id}/content", 1L)
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidRequestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.msg").value(containsString(errorType)));

    verify(projectService, times(0)).modifyContent(anyLong(), any(String.class));
  }

  @Test
  @DisplayName("실패: 존재하지 않는 ID로 내용 수정을 요청하면 404 Not Found를 반환한다")
  void modifyContent_shouldReturnNotFound_whenIdDoesNotExist() throws Exception {
    Long nonExistentId = 999L;
    String newContent = "새로운 역할 배분 내용입니다.";
    String requestBody = createContentJson("content", newContent);

    given(projectService.modifyContent(nonExistentId, newContent))
        .willThrow(new NoSuchElementException("조회하려는 프로젝트가 없습니다"));

    mockMvc.perform(patch("/projects/{id}/content", nonExistentId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.msg").value("조회하려는 프로젝트가 없습니다"));

    verify(projectService, times(1)).modifyContent(nonExistentId, newContent);
  }

  @Test
  @DisplayName("성공: 존재하는 ID로 프로젝트 삭제를 요청하면 204 No Content를 반환한다")
  void deleteProject_shouldReturnNoContent_whenIdExists() throws Exception {
    Long projectId = 1L;
    doNothing().when(projectService).deleteProject(projectId);

    mockMvc.perform(delete("/projects/{id}", projectId)).andExpect(status().isNoContent());

    verify(projectService, times(1)).deleteProject(projectId);
  }

  @Test
  @DisplayName("실패: 존재하지 않는 ID로 프로젝트 삭제를 요청하면 404 Not Found를 반환한다")
  void deleteProject_shouldReturnNotFound_whenIdDoesNotExist() throws Exception {
    Long nonExistentId = 999L;
    doThrow(new NoSuchElementException("조회하려는 프로젝트가 없습니다"))
        .when(projectService).deleteProject(nonExistentId);

    mockMvc.perform(delete("/projects/{id}", nonExistentId))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.msg").value("조회하려는 프로젝트가 없습니다"));

    verify(projectService, times(1)).deleteProject(nonExistentId);
  }

  @Test
  @DisplayName("성공: 존재하는 프로젝트 ID로 지원서 목록 조회를 요청하면 200 OK와 지원서 목록을 반환한다")
  void getApplications_shouldReturnApplicationList_whenProjectExists() throws Exception {
    Long projectId = 1L;
    ApplicationDetailResponseDto application1 = createApplicationDetailResponseDto(1L, "지원자A");
    ApplicationDetailResponseDto application2 = createApplicationDetailResponseDto(2L, "지원자B");
    List<ApplicationDetailResponseDto> applicationList = List.of(application1, application2);

    given(applicationService.getApplicationsByProjectId(projectId)).willReturn(applicationList);

    mockMvc.perform(get("/projects/{id}/applications", projectId)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("프로젝트의 지원서 전체 목록 조회 성공"))
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data", hasSize(2))) // 배열의 크기가 2인지 확인
        .andExpect(jsonPath("$.data[0].applicationId").value(application1.applicationId()))
        .andExpect(jsonPath("$.data[0].nickname").value(application1.nickname()))
        .andExpect(jsonPath("$.data[1].applicationId").value(application2.applicationId()))
        .andExpect(jsonPath("$.data[0].nickname").value(application1.nickname()));

    verify(applicationService, times(1)).getApplicationsByProjectId(projectId);
  }

  @Test
  @DisplayName("성공: 지원서가 없는 프로젝트 ID로 조회 요청 시 200 OK와 빈 목록을 반환한다")
  void getApplications_shouldReturnEmptyList_whenNoApplicationsExist() throws Exception {
    Long projectId = 2L;
    given(applicationService.getApplicationsByProjectId(projectId)).willReturn(
        Collections.emptyList());

    mockMvc.perform(get("/projects/{id}/applications", projectId)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("프로젝트의 지원서 전체 목록 조회 성공"))
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data", hasSize(0)));

    verify(applicationService, times(1)).getApplicationsByProjectId(projectId);
  }

  @Test
  @DisplayName("실패: 존재하지 않는 프로젝트 ID로 지원서 목록 조회를 요청하면 404 Not Found를 반환한다")
  void getApplications_shouldReturnNotFound_whenProjectDoesNotExist() throws Exception {
    Long nonExistentProjectId = 999L;
    given(applicationService.getApplicationsByProjectId(nonExistentProjectId))
        .willThrow(new NoSuchElementException("조회하려는 프로젝트가 없습니다"));

    mockMvc.perform(get("/projects/{id}/applications", nonExistentProjectId)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.msg").value("조회하려는 프로젝트가 없습니다"));

    verify(applicationService, times(1)).getApplicationsByProjectId(nonExistentProjectId);
  }

  @Test
  @DisplayName("성공: 유효한 요청으로 프로젝트에 지원하면 200 OK와 생성된 지원서 정보를 반환한다")
  void apply_shouldCreateApplication_whenRequestIsValid() throws Exception {
    Long projectId = 1L;
    ProjectApplyRequest request = new ProjectApplyRequest(
        List.of("Java", "Spring Boot"),
        List.of(90, 85)
    );
    ApplicationDetailResponseDto responseDto = createApplicationDetailResponseDto(1L,
        "NewApplicant");

    given(applicationService.createApplication(projectId, request)).willReturn(responseDto);

    mockMvc.perform(post("/projects/{id}/applications", projectId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.msg").value("지원서 작성 성공"))
        .andExpect(jsonPath("$.data.applicationId").value(responseDto.applicationId()))
        .andExpect(jsonPath("$.data.nickname").value(responseDto.nickname()));

    verify(applicationService, times(1)).createApplication(projectId, request);
  }

  // 유효성 검사 실패 케이스를 위한 데이터 소스
  static Stream<Arguments> provideInvalidApplyRequests() {
    return Stream.of(
        Arguments.of("""
            {
              "techStacks": null,
              "techScores": [90, 85]
            }
            """, "techStacks"),
        Arguments.of("""
            {
              "techStacks": ["Java", "Spring Boot"],
              "techScores": null
            }
            """, "techScores")
    );
  }

  @ParameterizedTest(name = "[{index}] {1} 필드가 유효하지 않을 때 400 Bad Request 반환")
  @MethodSource("provideInvalidApplyRequests")
  @DisplayName("실패: 유효하지 않은 데이터로 지원을 요청하면 400 Bad Request를 반환한다")
  void apply_shouldReturnBadRequest_whenRequestIsInvalid(
      String invalidRequestBody,
      String errorField
  ) throws Exception {
    Long projectId = 1L;

    mockMvc.perform(post("/projects/{id}/applications", projectId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidRequestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.msg").value(containsString(errorField)));

    verify(applicationService, times(0)).createApplication(anyLong(),
        any(ProjectApplyRequest.class));
  }

  @Test
  @DisplayName("실패: 존재하지 않는 프로젝트 ID로 지원하면 404 Not Found를 반환한다")
  void apply_shouldReturnNotFound_whenProjectDoesNotExist() throws Exception {
    Long nonExistentProjectId = 999L;
    ProjectApplyRequest request = new ProjectApplyRequest(
        List.of("Java"),
        List.of(90)
    );

    given(applicationService.createApplication(nonExistentProjectId, request))
        .willThrow(new NoSuchElementException("조회하려는 프로젝트가 없습니다"));

    mockMvc.perform(post("/projects/{id}/applications", nonExistentProjectId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.msg").value("조회하려는 프로젝트가 없습니다"));

    verify(applicationService, times(1)).createApplication(nonExistentProjectId, request);
  }

  private ApplicationDetailResponseDto createApplicationDetailResponseDto(
      Long applicationId,
      String nickname
  ) {
    return new ApplicationDetailResponseDto(
        applicationId,
        nickname,
        ApplicationStatus.PENDING,
        LocalDateTime.of(2025, 10, 27, 14, 30, 0),
        List.of("Java", "Spring Boot", "JPA"),
        List.of(95, 90, 85)
    );
  }

  private ProjectCreateRequest createProjectCreateRequest(String title) {
    return new ProjectCreateRequest(title, "프로젝트 설명", "Java, Spring Boot", 3, 4);
  }

  private ProjectDetailResponse createProjectDetailResponse(Long id, String title) {
    return new ProjectDetailResponse(
        id,
        title,
        "프로젝트 설명",
        List.of("Java", "Spring Boot"),
        5,
        4,
        "testUser",
        ProjectStatus.RECRUITING.toString(),
        "content",
        4,
        LocalDateTime.of(2025, 10, 27, 10, 0, 0)
    );
  }

  static String createContentJson(String key, String value) {
    if (value == null) {
      return """
          {
            "%s": null
          }
          """.formatted(key);
    }

    return """
        {
          "%s": "%s"
        }
        """.formatted(key, value);
  }
}