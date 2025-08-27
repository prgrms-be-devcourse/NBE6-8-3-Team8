package com.devmatch.backend.global.initData

import com.devmatch.backend.domain.user.service.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Lazy
import org.springframework.transaction.annotation.Transactional

@Configuration
class BaseInitData(
    private val userService: UserService
) {
    @Autowired
    @Lazy
    private lateinit var self: BaseInitData

    @Bean
    fun baseInitDataApplicationRunner(): ApplicationRunner {
        return ApplicationRunner {
            self.work1()
        }
    }

    @Transactional
    fun work1() {
        if (userService.count() > 0) {
            return
        }
        //테스트용 계정
        val memberSystem = userService.join("system", "1234", "시스템")
        memberSystem.modifyApiKey(memberSystem.username)

        val memberAdmin = userService.join("admin", "1234", "관리자")
        memberAdmin.modifyApiKey(memberAdmin.username)

        val memberUser1 = userService.join("user1", "1234", "유저1")
        memberUser1.modifyApiKey(memberUser1.username)

        val memberUser2 = userService.join("user2", "1234", "유저2")
        memberUser2.modifyApiKey(memberUser2.username)

        val memberUser3 = userService.join("user3", "1234", "유저3")
        memberUser3.modifyApiKey(memberUser3.username)
    }
}