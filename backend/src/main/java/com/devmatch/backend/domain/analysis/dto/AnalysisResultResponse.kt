package com.devmatch.backend.domain.analysis.dto

import com.devmatch.backend.domain.analysis.entity.AnalysisResult
import java.math.BigDecimal

data class AnalysisResultResponse(
    val id: Long?,
    val applicationId: Long?,
    val compatibilityScore: BigDecimal,
    val compatibilityReason: String
) {
    companion object {
        fun from(result: AnalysisResult) = AnalysisResultResponse(
            id = result.id,
            applicationId = result.application?.id,
            compatibilityScore = result.compatibilityScore,
            compatibilityReason = result.compatibilityReason
        )
    }
}