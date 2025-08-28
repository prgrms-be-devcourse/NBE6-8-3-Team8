package com.devmatch.backend.global.security

import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.domain.user.service.UserService
import com.devmatch.backend.exception.ServiceException
import com.devmatch.backend.global.RsData
import com.devmatch.backend.global.rq.Rq
import com.devmatch.backend.standard.util.Ut
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter


@Component
class CustomAuthenticationFilter(
    private val userService: UserService,
    private val rq: Rq
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest, response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            work(request, response, filterChain)
        } catch (e: ServiceException) {
            val rsData: RsData<Void> = e.rsData
            response.contentType = "$APPLICATION_JSON_VALUE; charset=UTF-8"
            response.status = rsData.statusCode
            response.writer.write(Ut.json.toString(rsData))
        }
    }

    //엑세스 토큰이 유효한지 확인하고, 인증된 사용자 정보를 SecurityContextHolder에 저장하는 메소드
    private fun work(
        request: HttpServletRequest, response: HttpServletResponse?,
        filterChain: FilterChain
    ) {
        // API 요청이 아니라면 패스
        //api는 꼭 붙이는게 좋다. h2 스웨거 같은거 걸러야 할 때
//    if (!request.getRequestURI().startsWith("/api/")) {
//      filterChain.doFilter(request, response);
//      return;
//    }

        //인증, 인가가 필요없는 API 요청이라면 패스
        //여기까진 모든 필터에서 적용되는 부분. 로그인을 했냐 안했냐로 시점이 나뉨
        //로그인을 안했으면 이 밑으로는 진행이 안됨.
        //로그인 url로 요청 들어온거면 토큰 검사확인 불필요
        if (request.requestURI.startsWith("/oauth2/authorization/") ||
            request.requestURI.startsWith("/login/oauth2/code/") ||
            request.requestURI.startsWith("/auth/logout")
        ) {
            filterChain.doFilter(request, response)
            return
        }

        //뭐가 됐던 이 시점부터는 로그인 후의 요청이라는 것 -> 토큰들을 가지고 있으니까.
        val (apiKey, accessToken) = extractTokens()
        if(apiKey.isBlank() && accessToken.isBlank()) {
            filterChain.doFilter(request, response)
            return
        }

        val (member, isAccessTokenValid) = resolveUser(apiKey, accessToken)

        if(accessToken.isNotBlank() && !isAccessTokenValid) {
            refreshAccessToken(member)
        }

        // 이 시점 이후부터는 시큐리티가 이 요청을 인증된 사용자(기존의 로그인 해서 토큰을 발급 받은 사람)의 요청이다.
        // SecurityContext에 인증 정보를 저장한다.(Authentication 객체)
        // 이게 어떻게 rq로 들어가는거지? -> 콘텍스트에서 authentication 객체를 꺼내서 User로 캐스팅.
        //로그인 후의 유저 정보다.
        authenticate(member)

        filterChain.doFilter(request, response)
    }

    private fun extractTokens(): Pair<String, String> {
        val headerAuthorization = rq.getHeader("Authorization", "")

        return if (headerAuthorization.isNotBlank()) {
            if (!headerAuthorization.startsWith("Bearer "))
                throw ServiceException("401-2", "Authorization 헤더가 Bearer 형식이 아닙니다.")
            val bits = headerAuthorization.split(" ", limit = 3)
            bits.getOrNull(1).orEmpty() to bits.getOrNull(2).orEmpty()
        } else {
            rq.getCookieValue("apiKey", "") to rq.getCookieValue("accessToken", "")
        }
    }

    private fun resolveUser(apiKey: String, accessToken: String): Pair<User, Boolean> {
        userFromAccessToken(accessToken)?.let { return it to true }

        val user = userService.findByApiKey(apiKey)
            ?: throw ServiceException("401-3", "API 키가 유효하지 않습니다.")

        return user to false
    }

    private fun userFromAccessToken(token: String): User? {
        if (token.isBlank()) return null

        val payload = userService.payload(token) ?: return null

        val id = payload["id"] as Int
        val username = payload["username"] as String
        val name = payload["name"] as String

        return User(id.toLong(), username, name)
    }

    private fun refreshAccessToken(user: User) {
        val newToken = userService.genAccessToken(user)

        rq.setCookie("accessToken", newToken)
        rq.setHeader("Authorization", newToken)
    }

    private fun authenticate(user: User) {
        //이제 이 사용자는 인증된 사용자이다. 다만 우리 db에서 꺼낸게 아닌 사용자가 준 토큰에서 꺼낸 정보로 이루어짐.
        //이게 Rq에에서 getActor()를 통해 꺼내지는 정보이다.
        val authUser: UserDetails = SecurityUser(
            user.id,
            user.username,
            "",
            user.nickname,
        user.authorities
        )

        val authentication: Authentication =
            UsernamePasswordAuthenticationToken(authUser, authUser.password, authUser.authorities)

        SecurityContextHolder.getContext().authentication = authentication
    }

}