package com.devmatch.backend.domain.project.entity

import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.user.entity.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "projects", indexes = [Index(name = "idx_creator_id", columnList = "creator_id")])
class Project(
    val title: String,
    val description: String,
    val techStack: String,
    val teamSize: Int,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "creator_id") val creator: User,
    val durationWeeks: Int
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null

    @Enumerated(EnumType.STRING)
    var status: ProjectStatus = ProjectStatus.RECRUITING

    var content = ""
    var currentTeamSize = 0
    val createdAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, orphanRemoval = true)
    private val applications: List<Application> = emptyList()

    fun changeStatus(newStatus: ProjectStatus) {
        require(newStatus != status) { "현재 상태(${status})와 동일한 상태(${newStatus})로 변경할 수 없습니다" }
        status = newStatus
    }

    fun increaseCurTeamSize() {
        require(currentTeamSize < teamSize) { "정원이 가득 차서 지원서를 더 이상 승인할 수 없습니다" }
        currentTeamSize++

        if (currentTeamSize == teamSize) {
            status = ProjectStatus.COMPLETED
        }
    }

    fun decreaseCurTeamSize() {
        currentTeamSize--
        status = ProjectStatus.RECRUITING
    }
}