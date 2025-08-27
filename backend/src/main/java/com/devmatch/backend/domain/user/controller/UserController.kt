package com.devmatch.backend.domain.user.controller

import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto
import com.devmatch.backend.domain.application.service.ApplicationService
import com.devmatch.backend.domain.project.dto.ProjectDetailResponse
import com.devmatch.backend.domain.project.service.ProjectService
import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.global.rq.Rq
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class UserController(
    private val rq: Rq,
    private val projectService: ProjectService,
    private val applicationService: ApplicationService
) {
    @GetMapping("/profile")
    fun currentUser(): ResponseEntity<User> {
        val actor = rq.actor

        return ResponseEntity
            .status(HttpStatus.OK)
            .body(actor)
    }


    @GetMapping("/projects")
    fun findProjectsById(): ResponseEntity<List<ProjectDetailResponse>> {
        val actor = rq.actor
        val id: Long = actor.id // 현재 로그인한 사용자의 ID를 가져옴
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(projectService.getProjectsByUserId(id)
        )
    }

    @GetMapping("/applications")
    fun findApplicationsById(): ResponseEntity<List<ApplicationDetailResponseDto>> {
        val actor = rq.actor
        val id: Long = actor.id // 현재 로그인한 사용자의 ID를 가져옴
        return ResponseEntity.status(HttpStatus.OK)
            .body(applicationService.getApplicationsByUserId(id))
    }
}