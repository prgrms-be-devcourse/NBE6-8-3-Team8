package com.devmatch.backend.domain.application.service;

import com.devmatch.backend.domain.analysis.entity.AnalysisResult;
import com.devmatch.backend.domain.application.dto.request.ApplicationStatusUpdateRequestDto;
import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto;
import com.devmatch.backend.domain.application.entity.Application;
import com.devmatch.backend.domain.application.entity.SkillScore;
import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import com.devmatch.backend.domain.application.repository.ApplicationRepository;
import com.devmatch.backend.domain.project.dto.ProjectApplyRequest;
import com.devmatch.backend.domain.project.entity.Project;
import com.devmatch.backend.domain.project.service.ProjectService;
import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.global.rq.Rq;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

  private final ApplicationRepository applicationRepository;
  private final ProjectService projectService;
  private final Rq rq;

  // 지원서 작성 로직
  @Transactional
  public ApplicationDetailResponseDto createApplication(Long projectId, ProjectApplyRequest projectApplyRequest) {
    User user = rq.getActor(); // 현재 로그인한 사용자의 정보 가져오기
    Project project = projectService.getProject(projectId); // 프로젝트 ID로 프로젝트 정보 가져오기

    Application application = Application.builder()
        .user(user)
        .project(project)
        .build();

    List<SkillScore> skillScores = new ArrayList<>();

    List<String> techStacks = projectApplyRequest.techStacks();
    List<Integer> techScores = projectApplyRequest.techScores();

    for (int i = 0; i < techStacks.size(); i++) {
      SkillScore score = SkillScore.builder()
          .application(application)
          .techName(techStacks.get(i))
          .score(techScores.get(i))
          .build();

      skillScores.add(score);
    }

    // 멘토링 피드백: 세이브를 명시적으로 표현해주는 게 좋음
    application.getSkillScore().addAll(skillScores);

    return new ApplicationDetailResponseDto(applicationRepository.save(application));
  }

  // 프로젝트 ID로 해당 프로젝트에 지원한 모든 지원서들을 가져오는 지원서 전체 조회 로직
  @Transactional(readOnly = true)
  public List<ApplicationDetailResponseDto> getApplicationsByProjectId(Long projectId) {
    projectService.getProject(projectId);

    List<Application> applicationList = applicationRepository.findAllByProjectId(projectId);

    return applicationList.stream()
        .map(ApplicationDetailResponseDto::new)
        .collect(Collectors.toList());
  }

  // 사용자 ID로 사용자가 작성한 모든 지원서들을 가져오는 지원서 전체 조회 로직
  @Transactional(readOnly = true)
  public List<ApplicationDetailResponseDto> getApplicationsByUserId(Long userId) {
    List<Application> applicationList = applicationRepository.findAllByUserId(userId);

    return applicationList.stream()
        .map(ApplicationDetailResponseDto::new)
        .collect(Collectors.toList());
  }

  // 지원서 상세 조회 로직
  @Transactional(readOnly = true)
  public ApplicationDetailResponseDto getApplicationDetail(Long applicationId) {
    return new ApplicationDetailResponseDto(getApplicationByApplicationId(applicationId));
  }

  // 지원서 상태 업데이트 로직
  @Transactional
  public void updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequestDto reqBody) {
    Application application = getApplicationByApplicationId(applicationId);

    // 지원서의 상태를 업데이트 하면서 프로젝트에도 반영
    application.getProject().changeCurTeamSize(application.getStatus(), reqBody.status());

    // 엔티티가 영속성 컨텍스트 안에 있으면, 트랜잭션 종료 시점에 자동으로 DB에 반영됩니다 (Dirty Checking)
    application.changeStatus(reqBody.status()); // 상태 업데이트
  }

  // 지원서와 프로젝트간의 적합도 분석 결과를 저장하는 로직
  @Transactional
  public void saveAnalysisResult(Long applicationId, AnalysisResult analysisResult) {
    Application application = getApplicationByApplicationId(applicationId);

    // 멘토링 피드백: 종속 관계에 따라 구현을 어떤식으로 할지 고민.
    // 두 서비스의 상위 서비스를 만들어서 관장하는 방식으로
    // 상위 서비스의 이름은 보통 어플리케이션서비스라고 지음
    application.setAnalysisResult(analysisResult);
  }

  // 지원서 삭제 로직
  @Transactional
  public void deleteApplication(Long applicationId) {
    Application application = getApplicationByApplicationId(applicationId);

    application.getProject().changeCurTeamSize(application.getStatus(), null);

    applicationRepository.delete(application); // DB 에서 삭제
  }

  // 지원서 ID로 지원서를 가져오는 함수
  public Application getApplicationByApplicationId(Long applicationId) {
    return applicationRepository.findById(applicationId)
        .orElseThrow(() -> new NoSuchElementException("지원서를 찾을 수 없습니다. ID: " + applicationId));
  }

  // 프로젝트 ID와 상태로 지원서를 조회하는 함수
  public List<Application> findByProjectIdAndStatus(Long projectId, ApplicationStatus status) {
    return applicationRepository.findByProjectIdAndStatus(projectId, status);
  }
}