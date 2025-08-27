package com.devmatch.backend.domain.project.entity;

import static jakarta.persistence.FetchType.LAZY;

import com.devmatch.backend.domain.application.entity.Application;
import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import com.devmatch.backend.domain.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(
    name = "projects",
    indexes = {@Index(name = "idx_creator_id", columnList = "creator_id")}
)
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String description;
  private String techStack;

  private Integer teamSize;
  private Integer currentTeamSize;

  @ManyToOne
  @JoinColumn(name = "creator_id")
  private User creator;

  @Enumerated(EnumType.STRING)
  private ProjectStatus status;

  private String content;
  private Integer durationWeeks;
  private LocalDateTime createdAt;

  @OneToMany(mappedBy = "project", fetch = LAZY, orphanRemoval = true)
  private List<Application> applications;

  public Project(
      String title,
      String description,
      String techStack,
      Integer teamSize,
      User creator,
      Integer durationWeeks
  ) {
    this.title = title;
    this.description = description;
    this.techStack = techStack;
    this.teamSize = teamSize;
    this.creator = creator;
    this.status = ProjectStatus.RECRUITING;
    this.currentTeamSize = 0;
    this.content = "";
    this.durationWeeks = durationWeeks;
    this.createdAt = LocalDateTime.now();
  }

  public void changeStatus(ProjectStatus newStatus) {
    if (newStatus == this.status) {
      throw new IllegalArgumentException(
          "현재 상태(%s)와 동일한 상태(%s)로 변경할 수 없습니다".formatted(this.status, newStatus));
    }

    this.status = newStatus;
  }

  public void changeCurTeamSize(ApplicationStatus oldStatus, ApplicationStatus newStatus) {
    if (oldStatus != ApplicationStatus.APPROVED && newStatus == ApplicationStatus.APPROVED) {
      if (this.currentTeamSize.equals(this.teamSize)) {
        throw new IllegalArgumentException("정원이 가득 차서 지원서를 더 이상 승인할 수 없습니다");
      }

      this.currentTeamSize++;
    } else if (oldStatus == ApplicationStatus.APPROVED && newStatus != ApplicationStatus.APPROVED) {
      this.currentTeamSize--;
    }

    if (this.currentTeamSize.equals(this.teamSize)) {
      this.status = ProjectStatus.COMPLETED;
    } else {
      this.status = ProjectStatus.RECRUITING;
    }
  }

  public void changeContent(String content) {
    this.content = content;
  }
}
