package com.devmatch.backend.domain.application.dto.response;

import com.devmatch.backend.domain.application.entity.Application;
import com.devmatch.backend.domain.application.entity.SkillScore;
import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import java.time.LocalDateTime;
import java.util.List;

public record ApplicationDetailResponseDto(
    Long applicationId,       // 지원서 ID
    String nickname,          // 지원자 정보
    ApplicationStatus status, // 지원서 승인 상태
    LocalDateTime appliedAt,  // 지원 일시
    List<String> techName,    // 지원자의 기술명
    List<Integer> score       // 지원자의 기술 점수
) {

  public ApplicationDetailResponseDto(Application application) {
    this(
        application.getId(),
        application.getUser().getNickName(),
        application.getStatus(),
        application.getAppliedAt(),
        application.getSkillScore().stream()
            .map(SkillScore::getTechName)
            .toList(),
        application.getSkillScore().stream()
            .map(SkillScore::getScore)
            .toList()
    );
  }
}