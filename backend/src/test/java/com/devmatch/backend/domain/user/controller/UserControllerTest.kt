package com.devmatch.backend.domain.user.controller

import com.devmatch.backend.domain.application.service.ApplicationService
import com.devmatch.backend.domain.project.service.ProjectService
import com.devmatch.backend.domain.user.service.UserService
import com.devmatch.backend.global.rq.Rq
import com.devmatch.backend.global.security.SecurityUser
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.mockito.BDDMockito.given
import org.mockito.Mockito.mock
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import kotlin.test.Test


@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var projectService: ProjectService

    @Autowired
    private lateinit var applicationService: ApplicationService

    @Autowired
    private lateinit var rq: Rq

    @BeforeEach
    fun setUp() {
        rq = mock(Rq::class.java)
        projectService = mock(ProjectService::class.java)
        applicationService = mock(ApplicationService::class.java)

        mockMvc = MockMvcBuilders.standaloneSetup(UserController(rq, projectService, applicationService)).build()
    }


    @Test
    @DisplayName("현재 로그인 유저 조회")
    fun t1() {
        val testUser = userService.getUser(1)
        val securityUser = SecurityUser(
            testUser.id,
            testUser.username,
            "",
            testUser.nickname,
            testUser.authorities
        )
        val auth = UsernamePasswordAuthenticationToken(securityUser, null, securityUser.authorities)

        given(rq.actor).willReturn(testUser)

        // When
        val result = mockMvc.perform(
            get("/users/profile").with(authentication(auth))
        ).andDo(print())

        // Then
        result.andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(testUser.id))
            .andExpect(jsonPath("$.username").value(testUser.username))
            .andExpect(jsonPath("$.nickname").value(testUser.nickname))
    }


}