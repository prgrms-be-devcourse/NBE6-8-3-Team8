package com.devmatch.backend.global.security;


import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.service.UserService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//카카오 로그인 성공후 이쪽으로 보낸다.
//소셜 서비스가 사용자에게 발급한 인증 코드를 통해 사용자 정보를 가져오는 서비스
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

  private final UserService userService;

  // 카카오톡 로그인이 성공할 때 마다 이 함수가 실행된다.
  @Override
  @Transactional
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

    OAuth2User oAuth2User = super.loadUser(userRequest);//로그인 성공한 시점이 여기(사진상의 8번 부분)

    String oauthUserId = "";
    String providerTypeCode = userRequest.getClientRegistration().getRegistrationId().toUpperCase();

    String nickname = "";
    String profileImgUrl = "";
    String username = "";

    //소셜 로그인에서 처음 로그인한거면 가입. 이미 가입했으면 수정
    //카카오 로그인했다가 로그아웃 후  구글 로그인 하면 계정 두 개 만들어지는데 이건 요즘 표준이라 함.
    switch (providerTypeCode) {
      case "KAKAO" -> {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, Object> attributesProperties = (Map<String, Object>) attributes.get(
            "properties");

        oauthUserId = oAuth2User.getName();
        nickname = (String) attributesProperties.get("nickname");
        profileImgUrl = (String) attributesProperties.get("profile_image");
      }
      case "GOOGLE" -> {
        oauthUserId = oAuth2User.getName();
        nickname = (String) oAuth2User.getAttributes().get("name");
        profileImgUrl = (String) oAuth2User.getAttributes().get("picture");
      }
      case "NAVER" -> {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, Object> attributesProperties = (Map<String, Object>) attributes.get("response");

        oauthUserId = (String) attributesProperties.get("id");
        nickname = (String) attributesProperties.get("nickname");
        profileImgUrl = (String) attributesProperties.get("profile_image");
      }
    }

    //유저 이름이 유니크 해야 하므로 소셜 서비스 이름과 아이디를 조합하여 유저 이름을 생성
    //예시: KAKAO__1234567890 뒷자리 숫자는 소셜 서비스에서 발급한 유저 아이디(고유함)
    username = providerTypeCode + "__%s".formatted(oauthUserId);
    String password = "";//소셜 로그인은 비밀번호가 없으므로 빈 문자열로 설정

    User user = userService.modifyOrJoin(username, password, nickname, profileImgUrl).data();

    //이번 요청안에서만 로그인으로 처리. 그 이후에는 날라감
    //이 객체가 시큐리티 컨텍스트에 저장되어 최초 시점의 로그인한 유저 정보를 담고 있다
    //얘는 customAuthenticationFilter의 SecurityUser랑 뭐가 다른거지? -> 시점이 다르다. 이건 최초 로그인 시점의 객체
    // 커스텀 필터는 로그인 후에 토큰을 가지고 있는 상태에서만
    //어디서 쓰이는애지? -> 로그인 유저라고 인식하게 함. 콘텍스트에 들어가고 세션에도 들어간다.
    //어짜피 인증은 소셜이 해주니까 패스워드는 필요 없지않나? -> 필요 없다. 다만 패스워드를 삭제한 버전과 삭제하지 않은 버전 두 개를 만들어야 하니 놔둔거 뿐이다.
    return new SecurityUser(
        user.getId(),
        user.getUsername(),
        user.getPassword(),
        user.getNickName(),
        user.getAuthorities()
    ); //-> 석세스 핸들러 호출
  }
}