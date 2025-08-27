package com.devmatch.backend.global.security;


import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.service.UserService;
import com.devmatch.backend.global.rq.Rq;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

//예시 프론트 url : <a href=http://localhost:8080/oauth2/authorization/kakao?redirectUrl=http://localhost:3000 />
//로그인 성공하면 쿠키에 apiKey와 accessToken을 저장하고, state 파라미터를 확인하여 리다이렉트 URL을 설정하는 핸들러
@Component
@RequiredArgsConstructor
public class CustomOAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

  private final UserService userService;
  private final Rq rq;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException, ServletException {
    //CustomOAuth2UserService에서 리턴한 객체 소셜 로그인한 유저 정보를 토대로 DB에서 유저 정보를 가져옴
    User actor = rq.getActorFromDb();

    String accessToken = userService.genAccessToken(actor);

    rq.setCookie("apiKey", actor.getApiKey());//DB에서 가져와야 한다.
    rq.setCookie("accessToken", accessToken);

    // ✅ 기본 리다이렉트 URL
    String redirectUrl = "/";

    // ✅ state 파라미터 확인
    String stateParam = request.getParameter("state");
    //CustomOAuth2AuthorizationRequestResolver에서 설정한 state

    if (stateParam != null) {
      // 1️⃣ Base64 URL-safe 디코딩
      String decodedStateParam = new String(Base64.getUrlDecoder().decode(stateParam),
          StandardCharsets.UTF_8);

      // 2️⃣ '#' 앞은 redirectUrl, 뒤는 originState
      redirectUrl = decodedStateParam.split("#", 2)[0];
    }

    // ✅ 최종 리다이렉트
    rq.sendRedirect(redirectUrl);
  }
}
