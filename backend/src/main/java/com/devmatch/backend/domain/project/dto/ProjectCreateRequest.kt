package com.devmatch.backend.domain.project.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectCreateRequest(
    @NotNull @Size(min = 1, max = 200) String title,
    @NotNull @Size(min = 1, max = 2000) String description,
    @NotNull @Size(min = 1, max = 500) String techStack,
    @Min(1) int teamSize,
    @Min(1) int durationWeeks
) {

}