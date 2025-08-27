package com.devmatch.backend.domain.application.dto.request;

import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusUpdateRequestDto(
    @NotNull
    ApplicationStatus status
) {
}