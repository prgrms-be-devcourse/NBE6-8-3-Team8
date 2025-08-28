package com.devmatch.backend.domain.project.controller;

import static org.springframework.http.HttpStatus.CREATED;

import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto;
import com.devmatch.backend.domain.application.service.ApplicationService;
import com.devmatch.backend.domain.project.dto.*;
import com.devmatch.backend.domain.project.service.ProjectService;
import com.devmatch.backend.global.ApiResponse;
import com.devmatch.backend.global.rq.Rq;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/projects")
public class ProjectController {

  private final Rq rq;

  private final ProjectService projectService;
  private final ApplicationService applicationService;

  @PostMapping
  public ResponseEntity<ApiResponse<ProjectDetailResponse>> create(
      @Valid @RequestBody ProjectCreateRequest projectCreateRequest
  ) {
    return ResponseEntity.status(CREATED).body(new ApiResponse<>("프로젝트 생성 성공",
        projectService.createProject(rq.getActor().getId(), projectCreateRequest)));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<ProjectDetailResponse>>> getAll() {
    return ResponseEntity.ok()
        .body(new ApiResponse<>("프로젝트 전체 조회 성공", projectService.getProjects()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ProjectDetailResponse>> get(@PathVariable Long id) {
    return ResponseEntity.ok()
        .body(new ApiResponse<>("프로젝트 단일 조회 성공", projectService.getProjectDetail(id)));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<ApiResponse<ProjectDetailResponse>> modifyStatus(
      @PathVariable Long id,
      @Valid @RequestBody ProjectStatusUpdateRequest projectStatusUpdateRequest
  ) {
    return ResponseEntity.ok().body(new ApiResponse<>("프로젝트 상태 수정 성공",
        projectService.modifyStatus(id, projectStatusUpdateRequest.status())));
  }

  @PatchMapping("/{id}/content")
  public ResponseEntity<ApiResponse<ProjectDetailResponse>> modifyContent(
      @PathVariable Long id,
      @Valid @RequestBody ProjectContentUpdateRequest projectContentUpdateRequest
  ) {
    return ResponseEntity.ok().body(new ApiResponse<>("역할 배분 내용 수정 성공",
        projectService.modifyContent(id, projectContentUpdateRequest.content())));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    projectService.deleteProject(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/applications")
  public ResponseEntity<ApiResponse<List<ApplicationDetailResponseDto>>> getApplications(
      @PathVariable Long id
  ) {
    return ResponseEntity.ok().body(new ApiResponse<>("프로젝트의 지원서 전체 목록 조회 성공",
        applicationService.getApplicationsByProjectId(id)));
  }

  @PostMapping("/{id}/applications")
  public ResponseEntity<ApiResponse<ApplicationDetailResponseDto>> apply(
      @PathVariable Long id,
      @Valid @RequestBody ProjectApplyRequest projectApplyRequest
  ) {
    return ResponseEntity.ok().body(new ApiResponse<>("지원서 작성 성공",
        applicationService.createApplication(id, projectApplyRequest)));
  }
}
