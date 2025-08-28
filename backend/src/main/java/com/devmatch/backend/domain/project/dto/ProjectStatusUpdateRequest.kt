package com.devmatch.backend.domain.project.dto;

import com.devmatch.backend.domain.project.entity.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusUpdateRequest(@NotNull ProjectStatus status) {

}