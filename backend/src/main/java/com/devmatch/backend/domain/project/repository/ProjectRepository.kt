package com.devmatch.backend.domain.project.repository

import com.devmatch.backend.domain.project.entity.Project
import org.springframework.data.jpa.repository.JpaRepository

interface ProjectRepository : JpaRepository<Project, Long> {
    fun findAllByCreatorId(creatorId: Long): List<Project>
}