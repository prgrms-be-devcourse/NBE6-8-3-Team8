package com.devmatch.backend.domain.analysis.repository

import com.devmatch.backend.domain.analysis.entity.AnalysisResult
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AnalysisRepository : JpaRepository<AnalysisResult, Long> {
    fun findByApplicationId(applicationId: Long): AnalysisResult?
}