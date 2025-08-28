package com.devmatch.backend.global.security

import com.devmatch.backend.domain.user.service.UserService
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private enum class OAuth2Provider {
    KAKAO, GOOGLE, NAVER;

    companion object {
        fun from(registrationId: String): OAuth2Provider =
            entries.firstOrNull { it.name.equals(registrationId, ignoreCase = true) }
                ?: error("Unsupported provider: $registrationId")
    }
}
//카카오 로그인 성공후 이쪽으로 보낸다.
//소셜 서비스가 사용자에게 발급한 인증 코드를 통해 사용자 정보를 가져오는 서비스
@Service
class CustomOAuth2UserService(
    private val userService: UserService
) : DefaultOAuth2UserService() {
    // 카카오톡 로그인이 성공할 때 마다 이 함수가 실행된다.
    @Transactional
    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        //로그인 성공한 시점이 여기(사진상의 8번 부분)
        val oAuth2User = super.loadUser(userRequest)
        val provider = OAuth2Provider.from(userRequest.clientRegistration.registrationId)

        //소셜 로그인에서 처음 로그인한거면 가입. 이미 가입했으면 수정
        //카카오 로그인했다가 로그아웃 후  구글 로그인 하면 계정 두 개 만들어지는데 이건 요즘 표준이라 함.
        val (oauthUserId, nickname, profileImgUrl) = when (provider) {
            OAuth2Provider.KAKAO -> {
                val props = (oAuth2User.attributes.getValue("properties") as Map<String, Any>)
                Triple(
                    oAuth2User.name,
                    props.getValue("nickname") as String,
                    props.getValue("profile_image") as String
                )
            }

            OAuth2Provider.GOOGLE -> {
                val attrs = oAuth2User.attributes
                Triple(
                    oAuth2User.name,
                    attrs.getValue("name") as String,
                    attrs.getValue("picture") as String
                )
            }

            OAuth2Provider.NAVER -> {
                val resp = (oAuth2User.attributes.getValue("response") as Map<String, Any>)
                Triple(
                    resp.getValue("id") as String,
                    resp.getValue("nickname") as String,
                    resp.getValue("profile_image") as String
                )
            }
        }

        //유저 이름이 유니크 해야 하므로 소셜 서비스 이름과 아이디를 조합하여 유저 이름을 생성
        //예시: KAKAO__1234567890 뒷자리 숫자는 소셜 서비스에서 발급한 유저 아이디(고유함)
        val username = "${provider.name}__$oauthUserId"
        val password = "" //소셜 로그인은 비밀번호가 없으므로 빈 문자열로 설정

        val user = userService.modifyOrJoin(username, password, nickname, profileImgUrl).data

        //이번 요청안에서만 로그인으로 처리. 그 이후에는 날라감
        //이 객체가 시큐리티 컨텍스트에 저장되어 최초 시점의 로그인한 유저 정보를 담고 있다
        //얘는 customAuthenticationFilter의 SecurityUser랑 뭐가 다른거지? -> 시점이 다르다. 이건 최초 로그인 시점의 객체
        // 커스텀 필터는 로그인 후에 토큰을 가지고 있는 상태에서만
        //어디서 쓰이는애지? -> 로그인 유저라고 인식하게 함. 콘텍스트에 들어가고 세션에도 들어간다.
        //어짜피 인증은 소셜이 해주니까 패스워드는 필요 없지않나? -> 필요 없다. 다만 패스워드를 삭제한 버전과 삭제하지 않은 버전 두 개를 만들어야 하니 놔둔거 뿐이다.
        return SecurityUser(
            user.id,
            user.username,
            "",
            user.nickname,
            user.authorities
        ) //-> 석세스 핸들러 호출
    }
}