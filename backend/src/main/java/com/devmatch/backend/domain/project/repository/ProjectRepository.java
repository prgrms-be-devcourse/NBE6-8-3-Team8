package com.devmatch.backend.domain.project.repository;

import com.devmatch.backend.domain.project.entity.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

  List<Project> findAllByCreatorId(Long creatorId);
}