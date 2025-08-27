package com.devmatch.backend.domain.user.repository

import com.devmatch.backend.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface UserRepository : JpaRepository<User, Long> {
    fun findByUsername(username: String): Optional<User>

    fun findByApiKey(apiKey: String): Optional<User>
}