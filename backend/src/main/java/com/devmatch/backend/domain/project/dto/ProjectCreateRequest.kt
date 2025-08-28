package com.devmatch.backend.domain.project.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size

data class ProjectCreateRequest(
    @field:Size(min = 1, max = 200)
    val title: String,
    @field:Size(min = 1, max = 2000)
    val description: String,
    @field:Size(min = 1, max = 500)
    val techStack: String,
    @field:Min(1)
    val teamSize: Int,
    @field:Min(1)
    val durationWeeks: Int
) 