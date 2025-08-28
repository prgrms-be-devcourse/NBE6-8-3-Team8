package com.devmatch.backend.domain.project.dto

data class ProjectApplyRequest(
    val techStacks: List<String>,
    val techScores: List<Int>
)