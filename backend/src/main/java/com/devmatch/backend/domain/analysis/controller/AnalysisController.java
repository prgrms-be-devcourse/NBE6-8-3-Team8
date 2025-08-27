package com.devmatch.backend.domain.analysis.controller;

import com.devmatch.backend.domain.analysis.dto.AnalysisResultResponse;
import com.devmatch.backend.domain.analysis.service.AnalysisService;
import com.devmatch.backend.global.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

  private final AnalysisService analysisService;

  @GetMapping("/application/{applicationId}")
  public ResponseEntity<ApiResponse<AnalysisResultResponse>> getAnalysisResult(
      @PathVariable Long applicationId
  ) {
    AnalysisResultResponse analysisResultResponse = new AnalysisResultResponse(
        analysisService.getAnalysisResult(applicationId)
    );

    return ResponseEntity
        .status(HttpStatus.OK)
        .body(new ApiResponse<>("조회 성공", analysisResultResponse));
  }

  @PostMapping("/application/{applicationId}")
  public ResponseEntity<ApiResponse<AnalysisResultResponse>> createAnalysisResult(
      @PathVariable Long applicationId
  ) {
    AnalysisResultResponse analysisResultResponse = new AnalysisResultResponse(
        analysisService.createAnalysisResult(applicationId)
    );

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(new ApiResponse<>("분석 결과 생성 성공", analysisResultResponse));
  }

  @PostMapping("/project/{projectId}/role-assignment")
  public ResponseEntity<ApiResponse<String>> createTeamRoleAssignment(
      @PathVariable Long projectId
  ) {
    String roleAssignment = analysisService.createTeamRoleAssignment(projectId);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(new ApiResponse<>("팀 역할 분배 완료", roleAssignment));
  }
}