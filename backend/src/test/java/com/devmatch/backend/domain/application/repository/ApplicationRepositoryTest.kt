package com.devmatch.backend.domain.application.repository

import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.application.entity.SkillScore
import com.devmatch.backend.domain.application.enums.ApplicationStatus
import com.devmatch.backend.domain.project.entity.Project
import com.devmatch.backend.domain.project.repository.ProjectRepository
import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.domain.user.repository.UserRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest

@DataJpaTest
class ApplicationRepositoryTest {
    @Autowired
    private lateinit var applicationRepository: ApplicationRepository
    @Autowired
    private lateinit var userRepository: UserRepository
    @Autowired
    private lateinit var projectRepository: ProjectRepository
    @Autowired
    private lateinit var skillScoreRepository: SkillScoreRepository

    private lateinit var user1: User
    private lateinit var user2: User
    private lateinit var project1: Project
    private lateinit var project2: Project
    private lateinit var application1: Application
    private lateinit var application2: Application
    private lateinit var skillScore1: SkillScore
    private lateinit var skillScore2: SkillScore
    private lateinit var skillScore3: SkillScore

    @BeforeEach
    fun setup() {
        user1 = userRepository.save(
            User(
                "user1@test.com",
                "pwd1",
                "user1",
                "imgUrl1"
            )
        )

        user2 = userRepository.save(
            User(
                "user2@test.com",
                "pwd2",
                "user2",
                "imgUrl2"
            )
        )

        project1 = projectRepository.save(
            Project(
                title = "프로젝트1",
                description = "프로젝트1입니다.",
                techStack = "Java, Spring",
                teamSize = 5,
                creator = user1,
                durationWeeks = 4
            )
        )

        project2 = projectRepository.save(
            Project(
                title = "프로젝트2",
                description = "프로젝트2입니다.",
                techStack = "Java, Unity",
                teamSize = 5,
                creator = user2,
                durationWeeks = 4
            )
        )

        application1 = applicationRepository.save(
            Application(
                user = user1,
                project = project1,
            )
        )

        application2 = applicationRepository.save(
            Application(
                user = user2,
                project = project1,
            )
        )

        skillScore1 = skillScoreRepository.save(
            SkillScore(
                application = application1,
                techName = "Java",
                score = 5
            )
        )

        skillScore2 = skillScoreRepository.save(
            SkillScore(
                application = application1,
                techName = "Spring",
                score = 5
            )
        )

        skillScore3 = skillScoreRepository.save(
            SkillScore(
                application = application2,
                techName = "Java",
                score = 8
            )
        )
    }

    @Test
    @DisplayName("findAllByUserId")
    fun t1() {
        val application = applicationRepository.findAllByUserId(user1.id!!)

        assertThat(application[0].id).isEqualTo(application1.id)
    }

    @Test
    @DisplayName("findAllByProjectId")
    fun t2() {
        val application = applicationRepository.findAllByProjectId(project1.id!!)

        assertThat(application[0].id).isEqualTo(application1.id)
    }

    @Test
    @DisplayName("findByProjectIdAndStatus")
    fun t3() {
        val application = applicationRepository.findByProjectIdAndStatus(project1.id!!, ApplicationStatus.PENDING)

        assertThat(application[0].id).isEqualTo(application1.id)
        assertThat(application[0].status).isEqualTo(ApplicationStatus.PENDING)
    }
}