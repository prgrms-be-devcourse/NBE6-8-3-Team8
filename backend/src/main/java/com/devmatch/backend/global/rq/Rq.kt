package com.devmatch.backend.global.rq

import com.back.standard.extensions.getOrThrow
import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.domain.user.service.UserService
import com.devmatch.backend.global.security.SecurityUser
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

//엄청 중요한 클래스. 나중에 이걸로 컨트롤러에서 인증 인가된 유저인지 확인할 떄 씀
@Component
class Rq(
    private val req: HttpServletRequest,
    private val resp: HttpServletResponse,
    private val userService: UserService,
) {
    // 현재 로그인한 사용자의 정보를 SecurityUser로 변환하여 User 객체로 반환
    // 만약 로그인하지 않았다면 null을 반환
    // SecurityContextHolder 에서 Authentication 객체를 가져오고, 그 안의 principal을 SecurityUser로 캐스팅
    // 시점에 따라 소셜 정보가 들어있는 SecurityUser 객체, 엑세스 토큰에서 가져온 페이로드를 통해 만든 유저 객체를 반환한다.
    val actor: User
        get() = SecurityContextHolder
            .getContext()
            ?.authentication
            ?.principal
            ?.let {
                if (it is SecurityUser) {
                    User(it.id, it.username, it.nickname)
                } else {
                    null
                }
            }
            ?: throw IllegalStateException("인증된 사용자가 없습니다.")

    val actorFromDb: User
        get() = userService.findById(actor.id).getOrThrow()

    fun getHeader(name: String, defaultValue: String): String {
        return req.getHeader(name) ?: defaultValue
    }

    fun setHeader(name: String, value: String) {
        resp.setHeader(name, value)
    }

    fun getCookieValue(name: String, defaultValue: String): String =
        req.cookies
            ?.firstOrNull { it.name == name }
            ?.value
            ?.takeIf { it.isNotBlank() }
            ?: defaultValue

    fun setCookie(name: String, value: String?) {
        val cookie = Cookie(name, value ?: "").apply {
            path = "/"
            isHttpOnly = true
            val scheme = req.scheme
            if (scheme == "https") {
                secure = true
            }
            setAttribute("SameSite", "None")
            maxAge = if (value.isNullOrBlank()) 0 else 60 * 60 * 24 * 365
        }

        resp.addCookie(cookie)
    }

    fun deleteCookie(name: String) { setCookie(name, null) }

    fun sendRedirect(url: String) { resp.sendRedirect(url) }
}
