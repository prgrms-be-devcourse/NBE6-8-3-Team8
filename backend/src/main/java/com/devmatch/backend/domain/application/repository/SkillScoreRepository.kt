package com.devmatch.backend.domain.application.repository

import com.devmatch.backend.domain.application.entity.SkillScore
import org.springframework.data.jpa.repository.JpaRepository

interface SkillScoreRepository : JpaRepository<SkillScore, Long>
