package com.devmatch.backend.domain.application.controller

import com.devmatch.backend.domain.application.dto.request.ApplicationStatusUpdateRequestDto
import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto
import com.devmatch.backend.domain.application.service.ApplicationService
import com.devmatch.backend.global.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/applications")
class ApplicationController(
    private val applicationService: ApplicationService
) {

    /**
     * 지원서 상세 조회 API
     *
     * @param id 지원서 ID
     * @return 지원서 상세 정보
     */
    @GetMapping("/{id}")
    fun getApplicationDetail(
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<ApplicationDetailResponseDto>> {
        val applicationDetailResponseDto = applicationService.getApplicationDetail(id)

        // 성공 응답
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(
                ApiResponse(
                    "${applicationDetailResponseDto.applicationId} 번 지원서의 상세 정보 조회를 성공했습니다.",
                    applicationDetailResponseDto
                )
            )
    }

    /**
     * 지원서 삭제 API
     *
     * @param id 지원서 ID
     * @return 지원서 삭제 성공 메시지
     */
    @DeleteMapping("/{id}")
    fun deleteApplication(
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<String>> {
        applicationService.deleteApplication(id)

        // 성공 응답
        return ResponseEntity
            .status(HttpStatus.NO_CONTENT)
            .body(
                ApiResponse(
                    "지원서의 삭제를 성공했습니다."
                )
            )
    }

    /**
     * 지원서 상태 업데이트 API
     *
     * @param id 지원서 ID
     * @param reqBody       상태 업데이트 요청 DTO
     * @return 상태 업데이트 성공 메시지
     */
    @PatchMapping("/{id}/status")
    fun updateApplicationStatus(
        @PathVariable id: Long,
        @Valid @RequestBody reqBody: ApplicationStatusUpdateRequestDto
    ): ResponseEntity<ApiResponse<String>> {
        applicationService.updateApplicationStatus(id, reqBody)

        return ResponseEntity
            .status(HttpStatus.NO_CONTENT)
            .body(
                ApiResponse(
                    "지원서 상태를 업데이트했습니다."
                )
            )
    }
}