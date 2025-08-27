package com.devmatch.backend.domain.analysis.controller

import com.devmatch.backend.domain.analysis.dto.AnalysisResultResponse
import com.devmatch.backend.domain.analysis.service.AnalysisService
import com.devmatch.backend.global.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/analysis")
class AnalysisController(
    private val analysisService: AnalysisService
) {

    @GetMapping("/application/{applicationId}")
    fun getAnalysisResult(
        @PathVariable applicationId: Long
    ): ResponseEntity<ApiResponse<AnalysisResultResponse>> = 
        analysisService.getAnalysisResult(applicationId)
            .let { AnalysisResultResponse.from(it) }
            .let { ApiResponse("조회 성공", it) }
            .let { ResponseEntity.ok(it) }

    @PostMapping("/application/{applicationId}")
    fun createAnalysisResult(
        @PathVariable applicationId: Long
    ): ResponseEntity<ApiResponse<AnalysisResultResponse>> =
        analysisService.createAnalysisResult(applicationId)
            .let { AnalysisResultResponse.from(it) }
            .let { ApiResponse("분석 결과 생성 성공", it) }
            .let { ResponseEntity.status(HttpStatus.CREATED).body(it) }

    @PostMapping("/project/{projectId}/role-assignment")
    fun createTeamRoleAssignment(
        @PathVariable projectId: Long
    ): ResponseEntity<ApiResponse<String>> =
        analysisService.createTeamRoleAssignment(projectId)
            .let { ApiResponse("팀 역할 분배 완료", it) }
            .let { ResponseEntity.status(HttpStatus.CREATED).body(it) }
}