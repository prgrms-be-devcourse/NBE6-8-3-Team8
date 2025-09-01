package com.devmatch.backend.domain.analysis.controller

import com.devmatch.backend.domain.analysis.entity.AnalysisResult
import com.devmatch.backend.domain.analysis.service.AnalysisService
import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.application.repository.ApplicationRepository
import com.devmatch.backend.domain.project.entity.Project
import com.devmatch.backend.domain.project.repository.ProjectRepository
import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.domain.user.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import kotlin.test.Test
import java.math.BigDecimal

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Suppress("DEPRECATION")  // @MockBean is deprecated but no replacement yet
class AnalysisControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc
    
    @MockBean
    private lateinit var analysisService: AnalysisService
    
    @Autowired
    private lateinit var userRepository: UserRepository
    
    @Autowired
    private lateinit var projectRepository: ProjectRepository
    
    @Autowired
    private lateinit var applicationRepository: ApplicationRepository
    
    private lateinit var testUser: User
    private lateinit var testProject: Project
    private lateinit var testApplication: Application
    
    @BeforeEach
    fun setUp() {
        // Create test data
        testUser = userRepository.save(
            User(
                username = "testuser_${System.currentTimeMillis()}",
                password = "password",
                nickname = "Test User",
                profileImgUrl = null
            )
        )
        
        testProject = projectRepository.save(
            Project(
                title = "Test Project",
                description = "Test project description",
                techStack = "Java, Spring Boot",
                teamSize = 5,
                creator = testUser,
                durationWeeks = 8
            )
        )
        
        testApplication = applicationRepository.save(
            Application(
                user = testUser,
                project = testProject
            )
        )
    }
    
    @Test
    @DisplayName("분석 결과 조회 - 성공")
    fun getAnalysisResult_Success() {
        // Given
        val mockResult = AnalysisResult.create(
            application = testApplication,
            score = 85.toBigDecimal(),
            reason = "Test reason"
        )
        given(analysisService.getAnalysisResult(testApplication.id!!)).willReturn(mockResult)
        
        // When & Then
        mockMvc.perform(
            get("/analysis/application/${testApplication.id}")
        ).andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.applicationId").value(testApplication.id))
            .andExpect(jsonPath("$.data.compatibilityScore").value(85))
            .andExpect(jsonPath("$.data.compatibilityReason").value("Test reason"))
    }
    
    @Test
    @DisplayName("분석 결과 조회 - 존재하지 않는 지원서")
    fun getAnalysisResult_NotFound() {
        // Given
        given(analysisService.getAnalysisResult(999999L)).willThrow(NoSuchElementException("분석 결과를 찾을 수 없습니다. applicationId: 999999"))
        
        // When & Then
        mockMvc.perform(
            get("/analysis/application/999999")
        ).andDo(print())
            .andExpect(status().isNotFound)
    }
    
    @Test
    @DisplayName("분석 결과 생성 - 성공")
    fun createAnalysisResult_Success() {
        // Given
        val mockResult = AnalysisResult.create(
            application = testApplication,
            score = 90.toBigDecimal(),
            reason = "Great match for the project"
        )
        given(analysisService.createAnalysisResult(testApplication.id!!)).willReturn(mockResult)
        
        // When & Then
        mockMvc.perform(
            post("/analysis/application/${testApplication.id}")
        ).andDo(print())
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.applicationId").value(testApplication.id))
            .andExpect(jsonPath("$.data.compatibilityScore").value(90))
            .andExpect(jsonPath("$.data.compatibilityReason").value("Great match for the project"))
    }
    
    @Test
    @DisplayName("팀 역할 할당 생성 - 성공")
    fun createTeamRoleAssignment_Success() {
        // Given
        val mockAssignment = """
            {
                "projectId": ${testProject.id},
                "assignments": {
                    "Backend Developer": ["user1", "user2"],
                    "Frontend Developer": ["user3"]
                }
            }
        """.trimIndent()
        given(analysisService.createTeamRoleAssignment(testProject.id!!)).willReturn(mockAssignment)
        
        // When & Then
        mockMvc.perform(
            post("/analysis/project/${testProject.id}/role-assignment")
        ).andDo(print())
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data").exists())
    }
}