package com.devmatch.backend.domain.project.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devmatch.backend.domain.project.dto.ProjectContentUpdateRequest;
import com.devmatch.backend.domain.project.dto.ProjectStatusUpdateRequest;
import com.devmatch.backend.domain.project.entity.Project;
import com.devmatch.backend.domain.project.entity.ProjectStatus;
import com.devmatch.backend.domain.project.repository.ProjectRepository;
import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class ProjectControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private EntityManager entityManager;

  private Project testProject;

  @BeforeEach
  void setUp() {
    User testUser = userRepository.save(new User("testUser", "password123", "user", "imgUrl"));
    testProject = projectRepository.save(
        new Project("테스트 프로젝트", "설명", "Java, Spring", 5, testUser, 4)
    );
  }

  @Test
  @DisplayName("프로젝트 상태 변경 API 호출 시 더티 체킹으로 DB에 상태가 업데이트된다")
  void modifyStatus_shouldUpdateProjectStatusInDatabase() throws Exception {
    ProjectStatusUpdateRequest request = new ProjectStatusUpdateRequest(ProjectStatus.COMPLETED);

    mockMvc.perform(patch("/projects/{id}/status", testProject.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value(request.status().name()));

    entityManager.flush();
    entityManager.clear();

    Project updatedProject = projectRepository.findById(testProject.getId())
        .orElseThrow(() -> new AssertionError("테스트 프로젝트를 찾을 수 없습니다."));

    assertThat(updatedProject.getStatus()).isEqualTo(request.status());
    assertThat(updatedProject.getStatus()).isNotEqualTo(ProjectStatus.RECRUITING);
  }

  @Test
  @DisplayName("프로젝트 내용 변경 API 호출 시 더티 체킹으로 DB에 내용이 업데이트된다")
  void modifyContent_updatesProjectContentInDatabase() throws Exception {
    String newContent = "새로운 역할 분담 내용입니다. 백엔드 2명, 프론트엔드 3명으로 구성합니다.";
    ProjectContentUpdateRequest requestDto = new ProjectContentUpdateRequest(newContent);

    mockMvc.perform(patch("/projects/{id}/content", testProject.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.content").value(newContent));

    entityManager.flush();
    entityManager.clear();

    Project updatedProject = projectRepository.findById(testProject.getId())
        .orElseThrow(() -> new AssertionError("테스트 프로젝트를 찾을 수 없습니다."));

    assertThat(updatedProject.getContent()).isEqualTo(newContent);
    assertThat(updatedProject.getContent()).isNotEqualTo("");
  }
}
