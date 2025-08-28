package com.devmatch.backend.domain.project.mapper

import com.devmatch.backend.domain.project.dto.ProjectDetailResponse
import com.devmatch.backend.domain.project.entity.Project

object ProjectMapper {
    
    fun toProjectDetailResponse(project: Project): ProjectDetailResponse {
        return ProjectDetailResponse(
            project.id,
            project.title,
            project.description,
            project.techStack.split(", "),
            project.teamSize,
            project.currentTeamSize,
            project.creator.nickname,
            project.status.name,
            project.content,
            project.durationWeeks,
            project.createdAt
        )
    }
}
