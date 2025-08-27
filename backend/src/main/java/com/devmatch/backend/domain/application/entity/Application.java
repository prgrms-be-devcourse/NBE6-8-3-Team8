package com.devmatch.backend.domain.application.entity;

import com.devmatch.backend.domain.analysis.entity.AnalysisResult;
import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import com.devmatch.backend.domain.project.entity.Project;
import com.devmatch.backend.domain.user.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Table(name = "applications")
@EntityListeners(AuditingEntityListener.class)
public class Application {

  // 각 지원서를 구분하는 유일한 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  // 이 지원서를 작성한 지원자의 고유 식별자
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "user_id")
  private User user;

  // 지원한 프로젝트의 고유 식별자
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  private Project project;

  // 지원서의 승인 상태
  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private ApplicationStatus status = ApplicationStatus.PENDING;

  // 지원 일시
  @CreatedDate
  private LocalDateTime appliedAt;

  // 지원자의 기술별 점수 저장
  @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<SkillScore> skillScore = new ArrayList<>();

  // 하나의 지원서에 대해 하나의 '지원자-프로젝트 적합도' 분석 결과
  @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "analysis_result_id")
  private AnalysisResult analysisResult;

  @Builder
  public Application(User user, Project project) {
    this.user = user;
    this.project = project;
  }

  public void changeStatus(ApplicationStatus status) {
    if (status == this.status) {
      throw new IllegalArgumentException(
          "현재 상태(%s)와 동일한 상태(%s)로 변경할 수 없습니다".formatted(this.status, status));
    }
    this.status = status;
  }

  public void setAnalysisResult(AnalysisResult analysisResult) {
    if (this.analysisResult != null) {
      throw new IllegalArgumentException(
          "현재 지원서(지원서 %s번)에 분석 결과가(분석 결과 %s번) 이미 존재합니다".formatted(this.id, analysisResult.getId()));
    }
    this.analysisResult = analysisResult;
  }
}