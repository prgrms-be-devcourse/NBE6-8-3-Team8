package com.devmatch.backend.domain.application.repository;

import com.devmatch.backend.domain.application.entity.Application;
import com.devmatch.backend.domain.application.enums.ApplicationStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

  List<Application> findAllByUserId(Long id);

  List<Application> findAllByProjectId(Long id);

  List<Application> findByProjectIdAndStatus(Long projectId, ApplicationStatus status);

}