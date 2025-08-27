package com.devmatch.backend.domain.application.entity

import com.devmatch.backend.domain.analysis.entity.AnalysisResult
import com.devmatch.backend.domain.application.enums.ApplicationStatus
import com.devmatch.backend.domain.project.entity.Project
import com.devmatch.backend.domain.user.entity.User
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "applications")
@EntityListeners(AuditingEntityListener::class)
class Application(
    // 이 지원서를 작성한 지원자의 고유 식별자
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    val user: User,

    // 지원한 프로젝트의 고유 식별자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    val project: Project,
) {
    // 각 지원서를 구분하는 유일한 번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    val id: Long? = null

    // 지원서의 승인 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: ApplicationStatus = ApplicationStatus.PENDING
        private set

    // 지원 일시
    @CreatedDate
    @Column(nullable = false, updatable = false)
    lateinit var appliedAt: LocalDateTime
        private set

    // 지원자의 기술별 점수 저장
    @OneToMany(mappedBy = "application", cascade = [CascadeType.ALL], orphanRemoval = true)
    val skillScore: MutableList<SkillScore> = mutableListOf()

    // 하나의 지원서에 대해 하나의 '지원자-프로젝트 적합도' 분석 결과
    @OneToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "analysis_result_id")
    var analysisResult: AnalysisResult? = null
        private set

    fun changeStatus(status: ApplicationStatus) {
        require(status != this.status) {
            "현재 상태(${this.status})와 동일한 상태(${status})로 변경할 수 없습니다"
        }
        this.status = status
    }

    fun setAnalysisResult(analysisResult: AnalysisResult) {
        require(this.analysisResult == null) {
            "현재 지원서(지원서 ${this.id}번)에 분석 결과가(분석 결과 ${analysisResult.id}번) 이미 존재합니다"
        }
        this.analysisResult = analysisResult
    }
}