package com.devmatch.backend.domain.project.service

import com.devmatch.backend.domain.project.dto.ProjectCreateRequest
import com.devmatch.backend.domain.project.dto.ProjectDetailResponse
import com.devmatch.backend.domain.project.entity.Project
import com.devmatch.backend.domain.project.entity.ProjectStatus
import com.devmatch.backend.domain.project.mapper.ProjectMapper
import com.devmatch.backend.domain.project.repository.ProjectRepository
import com.devmatch.backend.domain.user.service.UserService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProjectService(
    private val userService: UserService,
    private val projectRepository: ProjectRepository,
) {

    @Transactional
    fun createProject(
        userId: Long,
        projectCreateRequest: ProjectCreateRequest
    ): ProjectDetailResponse {
        require(projectCreateRequest.techStack.matches("^([\\w .+#-]+)(, [\\w .+#-]+)*$".toRegex())) {
            "기술 스택 기재 형식이 올바르지 않습니다. \", \"로 구분해주세요"
        }

        val project = Project(
            title = projectCreateRequest.title,
            description = projectCreateRequest.description,
            techStack = projectCreateRequest.techStack,
            teamSize = projectCreateRequest.teamSize,
            creator = userService.getUser(userId),
            durationWeeks = projectCreateRequest.durationWeeks
        )

        return ProjectMapper.toProjectDetailResponse(projectRepository.save(project))
    }

    @Transactional(readOnly = true)
    fun getProjects(): List<ProjectDetailResponse> {
        return projectRepository.findAll().map { ProjectMapper.toProjectDetailResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getProjectsByUserId(userId: Long): List<ProjectDetailResponse> {
        return projectRepository.findAllByCreatorId(userId)
            .map { ProjectMapper.toProjectDetailResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getProjectDetail(projectId: Long): ProjectDetailResponse {
        return ProjectMapper.toProjectDetailResponse(getProject(projectId))
    }

    @Transactional
    fun modifyStatus(projectId: Long, status: ProjectStatus): ProjectDetailResponse {
        val project = getProject(projectId)
        project.changeStatus(status)

        return ProjectMapper.toProjectDetailResponse(project)
    }

    @Transactional
    fun modifyContent(projectId: Long, content: String): ProjectDetailResponse {
        val project = getProject(projectId)
        project.content = content

        return ProjectMapper.toProjectDetailResponse(project)
    }

    @Transactional
    fun deleteProject(projectId: Long) {
        getProject(projectId)
        projectRepository.deleteById(projectId)
    }

    fun getProject(projectId: Long): Project {
        return projectRepository.findByIdOrNull(projectId)
            ?: throw NoSuchElementException("조회하려는 프로젝트가 없습니다")
    }
}
