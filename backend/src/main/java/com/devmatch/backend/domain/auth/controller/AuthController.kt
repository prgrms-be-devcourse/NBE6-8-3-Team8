package com.devmatch.backend.domain.auth.controller

import com.devmatch.backend.global.RsData
import com.devmatch.backend.global.rq.Rq
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    private val rq: Rq
) {
    //로그아웃은 소셜이랑 무관
    @DeleteMapping("/logout")
    fun logout(): RsData<Void?> {
        rq.deleteCookie("apiKey")
        rq.deleteCookie("accessToken")

        return RsData<Void?>(
            "200-1",
            "로그아웃 되었습니다."
        )
    }
}