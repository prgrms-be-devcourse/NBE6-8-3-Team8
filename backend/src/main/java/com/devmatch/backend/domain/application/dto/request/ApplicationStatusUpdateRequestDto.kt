package com.devmatch.backend.domain.application.dto.request

import com.devmatch.backend.domain.application.enums.ApplicationStatus
import jakarta.validation.constraints.NotNull

data class ApplicationStatusUpdateRequestDto(
    @field:NotNull
    val status: ApplicationStatus
) 