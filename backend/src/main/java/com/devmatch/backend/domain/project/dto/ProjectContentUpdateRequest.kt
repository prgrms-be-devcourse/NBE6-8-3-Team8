package com.devmatch.backend.domain.project.dto

import jakarta.validation.constraints.Size

data class ProjectContentUpdateRequest(
    @field: Size(min = 1, max = 2000)
    val content: String
)