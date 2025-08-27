package com.devmatch.backend.global.rq;

import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.service.UserService;
import com.devmatch.backend.global.security.SecurityUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

//엄청 중요한 클래스. 나중에 이걸로 컨트롤러에서 인증 인가된 유저인지 확인할 떄 씀
@Component
@RequiredArgsConstructor
public class Rq {

  private final HttpServletRequest req;
  private final HttpServletResponse resp;
  private final UserService userService;

  public User getActor() {
    // 현재 로그인한 사용자의 정보를 SecurityUser로 변환하여 User 객체로 반환
    // 만약 로그인하지 않았다면 null을 반환
    // SecurityContextHolder 에서 Authentication 객체를 가져오고, 그 안의 principal을 SecurityUser로 캐스팅
    // 시점에 따라 소셜 정보가 들어있는 SecurityUser 객체, 엑세스 토큰에서 가져온 페이로드를 통해 만든 유저 객체를 반환한다.
    return Optional.ofNullable(
            SecurityContextHolder
                .getContext()
                .getAuthentication()
        )
        .map(Authentication::getPrincipal)
        .filter(principal -> principal instanceof SecurityUser)
        .map(principal -> (SecurityUser) principal)
        .map(securityUser -> new User(securityUser.getId(), securityUser.getUsername(),
            securityUser.getName()))
        .orElse(null);
  }

  public String getHeader(String name, String defaultValue) {
    return Optional
        .ofNullable(req.getHeader(name))
        .filter(headerValue -> !headerValue.isBlank())
        .orElse(defaultValue);
  }

  public void setHeader(String name, String value) {
    if (value == null) {
      value = "";
    }

    if (value.isBlank()) {
      req.removeAttribute(name);
    } else {
      resp.setHeader(name, value);
    }
  }

  public String getCookieValue(String name, String defaultValue) {
    return Optional
        .ofNullable(req.getCookies())
        .flatMap(
            cookies ->
                Arrays.stream(cookies)
                    .filter(cookie -> cookie.getName().equals(name))
                    .map(Cookie::getValue)
                    .filter(value -> !value.isBlank())
                    .findFirst()
        )
        .orElse(defaultValue);
  }

  public void setCookie(String name, String value) {
    if (value == null) {
      value = "";
    }

    Cookie cookie = new Cookie(name, value);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    // 도메인 설정 제거 - 브라우저가 자동으로 설정하도록
    // cookie.setDomain("localhost");
    // HTTPS 환경에서만 Secure 설정
    String scheme = req.getScheme();
    if ("https".equals(scheme)) {
      cookie.setSecure(true);
    }
    // 크로스 도메인 요청을 위해 SameSite=None 설정
    cookie.setAttribute("SameSite", "None");

    if (value.isBlank()) {
      cookie.setMaxAge(0);
    } else {
      cookie.setMaxAge(60 * 60 * 24 * 365);
    }

    resp.addCookie(cookie);
  }

  public void deleteCookie(String name) {
    setCookie(name, null);
  }

  @SneakyThrows
  public void sendRedirect(String url) {
    resp.sendRedirect(url);
  }

  public User getActorFromDb() {
    User actor = getActor();

    if (actor == null) {
      return null;
    }

    return userService.findById(actor.getId()).get();
  }

}
