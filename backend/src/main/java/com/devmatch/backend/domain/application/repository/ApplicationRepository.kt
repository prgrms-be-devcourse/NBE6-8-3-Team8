package com.devmatch.backend.domain.application.repository

import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.application.enums.ApplicationStatus
import org.springframework.data.jpa.repository.JpaRepository

interface ApplicationRepository : JpaRepository<Application, Long> {
    fun findAllByUserId(id: Long): List<Application>

    fun findAllByProjectId(id: Long): List<Application>

    fun findByProjectIdAndStatus(
        projectId: Long,
        status: ApplicationStatus
    ): List<Application>
}