package com.devmatch.backend.global.security

import com.back.standard.extensions.base64Decode
import com.devmatch.backend.domain.user.service.UserService
import com.devmatch.backend.global.rq.Rq
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component


//예시 프론트 url : <a href=http://localhost:8080/oauth2/authorization/kakao?redirectUrl=http://localhost:3000 />
//로그인 성공하면 쿠키에 apiKey와 accessToken을 저장하고, state 파라미터를 확인하여 리다이렉트 URL을 설정하는 핸들러
@Component
class CustomOAuth2LoginSuccessHandler(
    private val userService: UserService,
    private val rq: Rq
) : AuthenticationSuccessHandler {
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        //CustomOAuth2UserService에서 리턴한 객체 소셜 로그인한 유저 정보를 토대로 DB에서 유저 정보를 가져옴
        val actor = rq.actorFromDb

        val accessToken = userService.genAccessToken(actor)

        rq.setCookie("apiKey", actor.apiKey) //DB에서 가져와야 한다.
        rq.setCookie("accessToken", accessToken)

        val redirectUrl = request.getParameter("state")
            ?.let { encoded ->
                runCatching {
                    encoded.base64Decode()
                }.getOrNull()
            }
            ?.substringBefore('#')
            ?.takeIf { it.isNotBlank() }
            ?: "/"

        // ✅ 최종 리다이렉트
        rq.sendRedirect(redirectUrl)
    }
}
