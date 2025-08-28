package com.devmatch.backend.domain.project.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectDetailResponse(
    Long id,
    String title,
    String description,
    List<String> techStacks,
    Integer teamSize,
    Integer currentTeamSize,
    String creator,
    String status,
    String content,
    Integer durationWeeks,
    LocalDateTime createdAt
) {

}