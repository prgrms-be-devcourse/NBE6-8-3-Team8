package com.devmatch.backend.domain.analysis.dto;

import com.devmatch.backend.domain.analysis.entity.AnalysisResult;
import java.math.BigDecimal;

public record AnalysisResultResponse(
    Long id,
    Long applicationId,
    BigDecimal compatibilityScore,
    String compatibilityReason
) {

  public AnalysisResultResponse(AnalysisResult result) {
    this(
        result.getId(),
        result.getApplication().getId(),
        result.getCompatibilityScore(),
        result.getCompatibilityReason()
    );
  }
}