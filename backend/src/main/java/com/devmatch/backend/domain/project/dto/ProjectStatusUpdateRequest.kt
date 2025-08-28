package com.devmatch.backend.domain.project.dto

import com.devmatch.backend.domain.project.entity.ProjectStatus

data class ProjectStatusUpdateRequest(val status: ProjectStatus)