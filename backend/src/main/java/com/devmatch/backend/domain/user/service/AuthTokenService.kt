package com.devmatch.backend.domain.user.service

import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.standard.util.Ut
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AuthTokenService(
    @param:Value("\${custom.jwt.secretKey}")
    private val jwtSecretKey: String,

    @param:Value("\${custom.accessToken.expirationSeconds}")
    private val accessTokenExpirationSeconds: Int
) {
    fun genAccessToken(user: User): String {
        val id = user.id
        val username: String = user.username
        val nickname: String = user.nickname

        return Ut.jwt.toString(
            jwtSecretKey,
            accessTokenExpirationSeconds,
            mapOf<String, Any>("id" to id, "username" to username, "name" to nickname)
        )
    }

    fun payload(accessToken: String): Map<String, Any>? {
        val parsedPayload = Ut.jwt.payload(jwtSecretKey, accessToken)
            ?: return null

        val id = parsedPayload["id"] as Int
        val username = parsedPayload["username"] as String
        val nickname = parsedPayload["name"] as String

        return mapOf<String, Any>("id" to id, "username" to username, "name" to nickname)
    }
}