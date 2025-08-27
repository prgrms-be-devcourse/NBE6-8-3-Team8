package com.devmatch.backend.domain.user.repository

import com.devmatch.backend.domain.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByUsername(username: String): User?

    fun findByApiKey(apiKey: String): User?
}