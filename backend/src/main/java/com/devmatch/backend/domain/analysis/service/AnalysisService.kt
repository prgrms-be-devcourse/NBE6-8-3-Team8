package com.devmatch.backend.domain.analysis.service

import com.devmatch.backend.domain.analysis.entity.AnalysisResult
import com.devmatch.backend.domain.analysis.repository.AnalysisRepository
import com.devmatch.backend.domain.application.entity.Application
import com.devmatch.backend.domain.application.entity.SkillScore
import com.devmatch.backend.domain.application.enums.ApplicationStatus
import com.devmatch.backend.domain.application.service.ApplicationService
import com.devmatch.backend.domain.project.entity.Project
import com.devmatch.backend.domain.project.service.ProjectService
import org.springframework.ai.chat.model.ChatModel
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class AnalysisService(
    private val analysisRepository: AnalysisRepository,
    private val applicationService: ApplicationService,
    private val projectService: ProjectService,
    private val chatModel: ChatModel
) {

    @Transactional(readOnly = true)
    fun getAnalysisResult(applicationId: Long): AnalysisResult =
        analysisRepository.findByApplicationId(applicationId)
            ?: throw NoSuchElementException("분석 결과를 찾을 수 없습니다. applicationId: $applicationId")

    @Transactional
    fun createAnalysisResult(applicationId: Long): AnalysisResult {
        val application = applicationService.getApplicationByApplicationId(applicationId)
        val project = application.project
        val userSkills = application.skillScore

        val prompt = buildString {
            append("당신은 친화적이고 관대한 IT 프로젝트 전문 분석가입니다. 팀 프로젝트의 협업 가치를 중시하며, 지원자의 잠재력을 긍정적으로 평가해주세요.\n\n")
            
            append("프로젝트 정보:\n")
            append("- 프로젝트: ${project.description}\n")
            append("- 팀 규모: ${project.teamSize}명 (역할 분담 가능)\n")
            append("- 프로젝트 기간: ${project.durationWeeks}주 (학습 시간 충분)\n")
            append("- 필요 기술: ${project.techStack}\n\n")
            
            append("지원자 기술 역량:\n")
            userSkills.forEach { skill ->
                append("- ${skill.techName}: ${skill.score}/10점\n")
            }
            
            append("\n✨ 긍정적 평가 기준:\n")
            append("1. 🎯 전문 분야: 한 분야에 7점 이상이면 해당 분야 전문가로 인정\n")
            append("2. 🤝 팀워크: 프론트엔드 또는 백엔드 중 하나만 잘해도 충분히 기여 가능\n")
            append("3. 📚 성장성: 기본 점수(3-4점)도 팀 협업으로 빠른 성장 가능\n")
            append("4. 🔧 상호보완: 팀원들의 기술이 서로 보완되어 시너지 효과\n")
            append("5. 💡 학습력: 실제 프로젝트를 통한 실무 경험으로 급속 성장\n\n")
            
            append("🎉 관대한 점수 가이드라인 (팀 프로젝트 특성 반영):\n")
            append("85-100: 핵심 기술 전문가 - 팀을 리드하며 다른 팀원들을 가르칠 수 있음\n")
            append("70-84: 특정 분야 숙련자 - 자신의 전문 분야를 담당하며 안정적으로 기여\n")
            append("55-69: 기여 가능한 팀원 - 일부 기술에 능숙하여 특정 역할 담당 + 다른 분야 학습\n")
            append("40-54: 성장형 팀원 - 기본기가 있어 팀원들과 협업하며 빠르게 성장 가능\n")
            append("25-39: 학습 의지형 - 현재는 기초적이지만 프로젝트를 통해 실력 향상 기대\n")
            append("0-24: 현재로서는 참여 어려움 (매우 드문 경우)\n\n")
            
            append("💝 특별 고려사항:\n")
            append("- 프론트엔드 전문가(React/Vue 7점+): 백엔드를 모르더라도 75점 이상\n")
            append("- 백엔드 전문가(Java/Spring 7점+): 프론트엔드를 모르더라도 75점 이상\n")
            append("- 풀스택 지향(양쪽 5점+): 다재다능함으로 80점 이상\n")
            append("- 성장 의지 보이는 초보자도 최소 45점 이상 부여\n\n")

            append("🎯 응답 형식 (긍정적 평가로):\n")
            append("[점수]|[긍정적 이유]\n\n")
            append("📋 규칙:\n")
            append("1. 점수는 40.00-100.00 사이 (팀 프로젝트 특성상 대부분 40점 이상)\n")
            append("2. | 문자로 점수와 이유를 구분\n")
            append("3. 이유는 긍정적이고 구체적으로 (기여할 수 있는 부분 강조)\n")
            append("4. 다른 텍스트 절대 포함 금지\n\n")
            append("✨ 예시:\n")
            append("- 78.50|Java/Spring Boot 전문가로 백엔드 개발을 주도할 수 있으며, 팀원과 협업하여 프론트엔드도 학습 가능\n")
            append("- 72.00|React 숙련자로 프론트엔드 담당 가능, 백엔드 API 연동 경험으로 팀 협업에 유리\n")
            append("- 58.00|기본기가 탄탄하여 특정 분야 담당하며 다른 기술도 빠르게 습득 가능\n\n")
            append("응답:")
        }

        val aiResponse = chatModel.call(prompt)
        
        // 응답 디버깅
        println("AI 원본 응답: $aiResponse")

        val parts = aiResponse.split("|")

        if (parts.size < 2) {
            println("AI 응답 파싱 실패 - parts 길이: ${parts.size}")
            println("전체 프롬프트: $prompt")
            throw IllegalArgumentException("AI 응답 형식이 올바르지 않습니다. 응답: $aiResponse")
        }

        val score = try {
            BigDecimal(parts[0].trim()).also { s ->
                require(s in BigDecimal.ZERO..BigDecimal("100")) {
                    "점수는 0에서 100 사이여야 합니다. 받은 점수: $s"
                }
            }
        } catch (e: NumberFormatException) {
            throw IllegalArgumentException("점수 형식이 올바르지 않습니다. 응답: ${parts[0].trim()}", e)
        }.let { rawScore ->
            // 관대한 평가 권장 - 너무 낮은 점수일 경우 최소 점수로 조정
            if (rawScore < BigDecimal("25")) {
                println("⚠️ AI가 너무 낮은 점수($rawScore)를 부여했습니다. 팀 프로젝트 특성을 고려하여 최소 점수로 조정합니다.")
                BigDecimal("45.00")
            } else {
                rawScore
            }
        }

        val reason = parts[1].trim().takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("이유가 비어있습니다. 응답: $aiResponse")

        val result = AnalysisResult.create(
            application = application,
            score = score,
            reason = reason
        )

        applicationService.saveAnalysisResult(result.application!!.id!!, result)

        return analysisRepository.save(result)
    }

    @Transactional(readOnly = true)
    fun createTeamRoleAssignment(projectId: Long): String {
        val project = projectService.getProject(projectId)

        val approvedApplications = applicationService.findByProjectIdAndStatus(
            projectId,
            ApplicationStatus.APPROVED
        )

        if (approvedApplications.size != project.teamSize) {
            throw IllegalArgumentException(
                "프로젝트 필요 팀원 수만큼 승인된 지원자가 모이지 않았습니다. " +
                "프로젝트 팀원 수: ${project.teamSize}, " +
                "승인된 지원자 수: ${approvedApplications.size}"
            )
        }

        val prompt = buildString {
            // 프로젝트 컨텍스트 분석
            append("🎯 프로젝트 분석 및 팀 역할 배분\n\n")
            append("📋 프로젝트 정보:\n")
            append("- 프로젝트: ${project.description}\n")
            append("- 팀 규모: ${project.teamSize}명\n")
            append("- 프로젝트 기간: ${project.durationWeeks}주\n\n")

            // 각 팀원의 기술 스택 점수 상세 분석
            append("👥 팀원 기술 역량 분석:\n")
            approvedApplications.forEachIndexed { index, application ->
                append("팀원 ${index + 1}: ${application.user.nickname}\n")
                
                application.skillScore.forEach { skill ->
                    append("  • ${skill.techName}: ${skill.score}/10점\n")
                }
                append("\n")
            }

            // 🤖 AI 역할 분배 지침 (간결하게)
            append("🎯 각 팀원의 최고 점수 기술을 기준으로 역할을 배정하세요.\n\n")
            
            append("🚨 출력 규칙:\n")
            append("1. 한국어로만 응답\n")
            append("2. 서론/설명 없이 바로 결과만 출력\n")
            append("3. 형식: '팀원명 - 역할 | 이유'\n")
            append("4. 각 팀원마다 한 줄씩\n\n")

            append("역할 분배:")
        }

        var aiResponse = chatModel.call(prompt)
        
        // 응답 길이 제한 (데이터베이스 VARCHAR(255) 제약 준수)
        if (aiResponse.length > 250) {
            aiResponse = aiResponse.substring(0, 250) + "..."
        }
        
        return aiResponse
    }
}