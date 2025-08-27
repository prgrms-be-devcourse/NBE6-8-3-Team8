package com.devmatch.backend.domain.project.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ProjectApplyRequest(
    @NotNull List<String> techStacks,
    @NotNull List<Integer> techScores
) {

}