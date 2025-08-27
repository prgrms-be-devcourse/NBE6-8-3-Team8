package com.devmatch.backend.domain.project.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectContentUpdateRequest(@NotNull @Size(min = 1, max = 2000) String content) {

}