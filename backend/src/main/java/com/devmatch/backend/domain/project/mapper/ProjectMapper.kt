package com.devmatch.backend.domain.project.mapper;

import com.devmatch.backend.domain.project.dto.ProjectDetailResponse;
import com.devmatch.backend.domain.project.entity.Project;
import java.util.Arrays;

public class ProjectMapper {

  public static ProjectDetailResponse toProjectDetailResponse(Project project) {
    return new ProjectDetailResponse(
        project.getId(),
        project.getTitle(),
        project.getDescription(),
        Arrays.stream(project.getTechStack().split(", ")).toList(),
        project.getTeamSize(),
        project.getCurrentTeamSize(),
        project.getCreator().getNickName(),
        project.getStatus().name(),
        project.getContent(),
        project.getDurationWeeks(),
        project.getCreatedAt()
    );
  }
}
