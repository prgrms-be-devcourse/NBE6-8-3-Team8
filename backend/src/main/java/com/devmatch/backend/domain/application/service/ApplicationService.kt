package com.devmatch.backend.domain.application.service

import com.devmatch.backend.domain.analysis.entity.AnalysisResult
import com.devmatch.backend.domain.application.dto.request.ApplicationStatusUpdateRequestDto
import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto
import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.application.entity.SkillScore
import com.devmatch.backend.domain.application.enums.ApplicationStatus
import com.devmatch.backend.domain.application.repository.ApplicationRepository
import com.devmatch.backend.domain.project.dto.ProjectApplyRequest
import com.devmatch.backend.domain.project.service.ProjectService
import com.devmatch.backend.global.rq.Rq
import lombok.RequiredArgsConstructor
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@RequiredArgsConstructor
class ApplicationService(
    private val applicationRepository: ApplicationRepository,
    private val projectService: ProjectService,
    private val rq: Rq
) {
    // 지원서 작성 로직
    @Transactional
    fun createApplication(
        projectId: Long,
        projectApplyRequest: ProjectApplyRequest
    ): ApplicationDetailResponseDto {
        val user = rq.actor // 현재 로그인한 사용자의 정보 가져오기
        val project = projectService.getProject(projectId) // 프로젝트 ID로 프로젝트 정보 가져오기

        val application = Application(
            user = user,
            project = project
        )

        val skillScores = projectApplyRequest.techStacks
            .zip(projectApplyRequest.techScores)
            .map { (tech, score) ->
                SkillScore(
                    application = application,
                    techName = tech,
                    score = score
                )
            }

        application.skillScore.addAll(skillScores)

        return ApplicationDetailResponseDto(applicationRepository.save(application))
    }

    // 프로젝트 ID로 해당 프로젝트에 지원한 모든 지원서들을 가져오는 지원서 전체 조회 로직
    @Transactional(readOnly = true)
    fun getApplicationsByProjectId(projectId: Long): List<ApplicationDetailResponseDto> {
        projectService.getProject(projectId)

        return applicationRepository.findAllByProjectId(projectId)
            .map { ApplicationDetailResponseDto(it) }
    }

    // 사용자 ID로 사용자가 작성한 모든 지원서들을 가져오는 지원서 전체 조회 로직
    @Transactional(readOnly = true)
    fun getApplicationsByUserId(userId: Long): List<ApplicationDetailResponseDto> {
        return applicationRepository.findAllByUserId(userId)
            .map { ApplicationDetailResponseDto(it) }
    }

    // 지원서 상세 조회 로직
    @Transactional(readOnly = true)
    fun getApplicationDetail(applicationId: Long): ApplicationDetailResponseDto {
        return ApplicationDetailResponseDto(getApplicationByApplicationId(applicationId))
    }

    // 지원서 상태 업데이트 로직
    @Transactional
    fun updateApplicationStatus(
        applicationId: Long,
        reqBody: ApplicationStatusUpdateRequestDto
    ) {
        val application = getApplicationByApplicationId(applicationId)

        // 지원서의 상태를 업데이트 하면서 프로젝트에도 반영
        if (application.status == ApplicationStatus.PENDING &&
            reqBody.status == ApplicationStatus.APPROVED
        ) {
            application.project.increaseCurTeamSize()
        }

        // 엔티티가 영속성 컨텍스트 안에 있으면, 트랜잭션 종료 시점에 자동으로 DB에 반영 (Dirty Checking)
        application.changeStatus(reqBody.status) // 상태 업데이트
    }

    // 지원서와 프로젝트간의 적합도 분석 결과를 저장하는 로직
    @Transactional
    fun saveAnalysisResult(applicationId: Long, analysisResult: AnalysisResult) {
        val application = getApplicationByApplicationId(applicationId)
        application.setAnalysisResult(analysisResult)
    }

    // 지원서 삭제 로직
    @Transactional
    fun deleteApplication(applicationId: Long) {
        val application = getApplicationByApplicationId(applicationId)

        if (application.status == ApplicationStatus.APPROVED) {
            application.project.decreaseCurTeamSize()
        }

        applicationRepository.delete(application) // DB 에서 삭제
    }

    // 지원서 ID로 지원서를 가져오는 함수
    fun getApplicationByApplicationId(applicationId: Long): Application {
        return applicationRepository.findById(applicationId)
            .orElseThrow{ NoSuchElementException("지원서를 찾을 수 없습니다. ID: $applicationId") }
    }

    // 프로젝트 ID와 상태로 지원서를 조회하는 함수
    fun findByProjectIdAndStatus(
        projectId: Long,
        status: ApplicationStatus
    ): List<Application> {
        return applicationRepository.findByProjectIdAndStatus(projectId, status)
    }
}