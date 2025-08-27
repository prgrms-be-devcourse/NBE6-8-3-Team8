package com.devmatch.backend.domain.analysis.repository;

import com.devmatch.backend.domain.analysis.entity.AnalysisResult;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalysisRepository extends JpaRepository<AnalysisResult, Long> {

  Optional<AnalysisResult> findByApplicationId(Long applicationId);
}