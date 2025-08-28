package com.devmatch.backend.domain.application.entity

import jakarta.persistence.*

@Entity
@Table(name = "skill_scores")
class SkillScore(
    // 이 기술점수가 속한 지원서의 고유 식별자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    val application: Application,

    // 평가한 기술 명
    @Column(name = "tech_name", nullable = false)
    val techName: String,

    // 기술 숙련도 점수(1점 = 초급 ~ 10점 = 전문가)
    @Column(name = "score", nullable = false)
    val score: Int
) {
    // 각 기술점수 기록을 구분하는 유일한 번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    val id: Long? = null
}
