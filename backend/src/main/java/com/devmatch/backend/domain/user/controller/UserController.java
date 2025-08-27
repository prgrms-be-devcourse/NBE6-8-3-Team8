package com.devmatch.backend.domain.user.controller;

import com.devmatch.backend.domain.application.dto.response.ApplicationDetailResponseDto;
import com.devmatch.backend.domain.application.service.ApplicationService;
import com.devmatch.backend.domain.project.dto.ProjectDetailResponse;
import com.devmatch.backend.domain.project.service.ProjectService;
import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.global.rq.Rq;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

  private final Rq rq;
  private final ProjectService projectService;
  private final ApplicationService applicationService;

  @GetMapping("/profile")
  public ResponseEntity<User> getCurrentUser() {
    User actor = rq.getActor();
    return ResponseEntity.status(HttpStatus.OK).body(actor);
  }


  @GetMapping("/projects")
  public ResponseEntity<List<ProjectDetailResponse>> findProjectsById() {
    User actor = rq.getActor();
    Long id = actor.getId(); // 현재 로그인한 사용자의 ID를 가져옴
    return ResponseEntity.status(HttpStatus.OK).body(projectService.getProjectsByUserId(id));
  }

  @GetMapping("/applications")
  public ResponseEntity<List<ApplicationDetailResponseDto>> findApplicationsById() {
    User actor = rq.getActor();
    Long id = actor.getId(); // 현재 로그인한 사용자의 ID를 가져옴
    return ResponseEntity.status(HttpStatus.OK)
        .body(applicationService.getApplicationsByUserId(id));
  }
}