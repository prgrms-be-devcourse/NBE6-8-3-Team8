package com.devmatch.backend.domain.project.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.devmatch.backend.domain.project.entity.Project;
import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class ProjectRepositoryTest {

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private UserRepository userRepository;

  @Test
  @DisplayName("성공: 사용자 ID로 프로젝트 목록을 조회하면, 해당 사용자의 프로젝트만 반환한다")
  void findAllByCreatorId_shouldReturnOnlyProjectsOfGivenUser_whenUserHasProjects() {
    User user1 = userRepository.save(new User("user1@test.com", "pwd1", "user1", "imgUrl1"));
    User user2 = userRepository.save(new User("user2@test.com", "pwd2", "user2", "imgUrl2"));

    Project project1 = projectRepository.save(
        new Project("title1", "description1", "tech1", 5, user1, 2));
    Project project2 = projectRepository.save(
        new Project("title2", "description2", "tech2", 5, user1, 2));
    projectRepository.save(new Project("title3", "description3", "tech3", 5, user2, 2));

    List<Project> projects = projectRepository.findAllByCreatorId(user1.getId());

    projects.forEach(project -> assertThat(project.getCreator().getId()).isEqualTo(user1.getId()));
    assertThat(projects).extracting(Project::getId)
        .containsExactlyInAnyOrder(project1.getId(), project2.getId());
  }

  @Test
  @DisplayName("성공: 프로젝트가 없는 사용자 ID로 조회하면, 빈 리스트를 반환한다")
  void findAllByCreatorId_shouldReturnEmptyList_whenUserHasNoProjects() {
    User user1 = userRepository.save(new User("user1@test.com", "pwd1", "user1", "imgUrl1"));
    User user2 = userRepository.save(new User("user2@test.com", "pwd2", "user2", "imgUrl2"));

    projectRepository.save(new Project("title1", "description1", "tech1", 5, user1, 2));

    List<Project> projects = projectRepository.findAllByCreatorId(user2.getId());

    assertThat(projects).isNotNull();
    assertThat(projects).isEmpty();
  }
}