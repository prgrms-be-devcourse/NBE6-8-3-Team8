package com.devmatch.backend.domain.project.dto

import java.time.LocalDateTime

data class ProjectDetailResponse(
    val id: Long,
    val title: String,
    val description: String,
    val techStacks: List<String>,
    val teamSize: Int,
    val currentTeamSize: Int,
    val creator: String,
    val status: String,
    val content: String,
    val durationWeeks: Int,
    val createdAt: LocalDateTime
) 