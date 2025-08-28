package com.devmatch.backend.domain.project.controller

import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto
import com.devmatch.backend.domain.application.service.ApplicationService
import com.devmatch.backend.domain.project.dto.*
import com.devmatch.backend.domain.project.service.ProjectService
import com.devmatch.backend.global.ApiResponse
import com.devmatch.backend.global.rq.Rq
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/projects")
class ProjectController(
    private val rq: Rq,
    private val projectService: ProjectService,
    private val applicationService: ApplicationService
) {

    @PostMapping
    fun create(
        @Valid @RequestBody projectCreateRequest: ProjectCreateRequest
    ): ResponseEntity<ApiResponse<ProjectDetailResponse>> {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(
                "프로젝트 생성 성공",
                projectService.createProject(rq.actor.id, projectCreateRequest)
            )
        )
    }

    @GetMapping
    fun getAll(): ResponseEntity<ApiResponse<List<ProjectDetailResponse>>> =
        ResponseEntity.ok(ApiResponse("프로젝트 전체 조회 성공", projectService.getProjects()))

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<ApiResponse<ProjectDetailResponse>> =
        ResponseEntity.ok(ApiResponse("프로젝트 단일 조회 성공", projectService.getProjectDetail(id)))

    @PatchMapping("/{id}/status")
    fun modifyStatus(
        @PathVariable id: Long,
        @Valid @RequestBody projectStatusUpdateRequest: ProjectStatusUpdateRequest
    ): ResponseEntity<ApiResponse<ProjectDetailResponse>> {
        return ResponseEntity.ok(
            ApiResponse(
                "프로젝트 상태 수정 성공",
                projectService.modifyStatus(id, projectStatusUpdateRequest.status)
            )
        )
    }

    @PatchMapping("/{id}/content")
    fun modifyContent(
        @PathVariable id: Long,
        @Valid @RequestBody projectContentUpdateRequest: ProjectContentUpdateRequest
    ): ResponseEntity<ApiResponse<ProjectDetailResponse>> {
        return ResponseEntity.ok(
            ApiResponse(
                "역할 배분 내용 수정 성공",
                projectService.modifyContent(id, projectContentUpdateRequest.content)
            )
        )
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        projectService.deleteProject(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/applications")
    fun getApplications(
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<List<ApplicationDetailResponseDto>>> {
        return ResponseEntity.ok(
            ApiResponse(
                "프로젝트의 지원서 전체 목록 조회 성공",
                applicationService.getApplicationsByProjectId(id)
            )
        )
    }

    @PostMapping("/{id}/applications")
    fun apply(
        @PathVariable id: Long,
        @Valid @RequestBody projectApplyRequest: ProjectApplyRequest
    ): ResponseEntity<ApiResponse<ApplicationDetailResponseDto>> {
        return ResponseEntity.ok(
            ApiResponse(
                "지원서 작성 성공",
                applicationService.createApplication(id, projectApplyRequest)
            )
        )
    }
}
