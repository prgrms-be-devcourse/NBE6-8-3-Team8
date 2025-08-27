package com.devmatch.backend.domain.application.dto.response

import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.application.enums.ApplicationStatus
import java.time.LocalDateTime

data class ApplicationDetailResponseDto(
    val applicationId: Long,        // 지원서 ID
    val nickname: String,           // 지원자 정보
    val status: ApplicationStatus,  // 지원서 승인 상태
    val appliedAt: LocalDateTime,   // 지원 일시
    val techName: List<String>,     // 지원자의 기술명
    val score: List<Int>            // 지원자의 기술 점수
) {
    constructor(application: Application) : this(
        application.id,
        application.user.nickname,
        application.status,
        application.appliedAt,
        application.skillScore.map { it.techName },
        application.skillScore.map { it.score }
    )
}