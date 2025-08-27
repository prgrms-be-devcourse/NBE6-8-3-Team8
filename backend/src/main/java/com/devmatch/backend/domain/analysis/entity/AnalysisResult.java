package com.devmatch.backend.domain.analysis.entity;

import com.devmatch.backend.domain.application.entity.Application;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "analysis_results")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(mappedBy = "analysisResult")
  private Application application;

  @Column(name = "compatibility_score", precision = 5, scale = 2, nullable = false)
  private BigDecimal compatibilityScore;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String compatibilityReason;
}