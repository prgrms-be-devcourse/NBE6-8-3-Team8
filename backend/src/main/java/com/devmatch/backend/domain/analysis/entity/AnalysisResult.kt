package com.devmatch.backend.domain.analysis.entity

import com.devmatch.backend.domain.application.entity.Application
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "analysis_results")
class AnalysisResult(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(mappedBy = "analysisResult")
    var application: Application? = null,

    @Column(name = "compatibility_score", precision = 5, scale = 2, nullable = false)
    var compatibilityScore: BigDecimal = BigDecimal.ZERO,

    @Column(columnDefinition = "TEXT", nullable = false)
    var compatibilityReason: String = ""
) {
    // JPA를 위한 기본 생성자 (리플렉션으로 사용됨)
    private constructor() : this(
        id = null,
        application = null,
        compatibilityScore = BigDecimal.ZERO,
        compatibilityReason = ""
    )
    
    companion object {
        fun create(
            application: Application,
            score: BigDecimal,
            reason: String
        ) = AnalysisResult(
            application = application,
            compatibilityScore = score,
            compatibilityReason = reason
        )
    }
}