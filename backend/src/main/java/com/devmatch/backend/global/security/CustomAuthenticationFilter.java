package com.devmatch.backend.global.security;


import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.service.UserService;
import com.devmatch.backend.exception.ServiceException;
import com.devmatch.backend.global.RsData;
import com.devmatch.backend.global.rq.Rq;
import com.devmatch.backend.standard.util.Ut;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

  private final UserService memberService;
  private final Rq rq;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    logger.debug("Processing request for " + request.getRequestURI());

    try {
      work(request, response, filterChain);
    } catch (ServiceException e) {
      RsData<Void> rsData = e.getRsData();
      response.setContentType("application/json;charset=UTF-8");
      response.setStatus(rsData.statusCode());
      response.getWriter().write(
          Ut.json.toString(rsData)
      );
    }
  }

  //엑세스 토큰이 유효한지 확인하고, 인증된 사용자 정보를 SecurityContextHolder에 저장하는 메소드
  private void work(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
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
    if (request.getRequestURI().startsWith("/oauth2/authorization/") || request.getRequestURI()
        .startsWith("/login/oauth2/code/")) {
      filterChain.doFilter(request, response);
      return;
    }

    String apiKey;
    String accessToken;

    String headerAuthorization = rq.getHeader("Authorization", "");

    if (!headerAuthorization.isBlank()) {
      if (!headerAuthorization.startsWith("Bearer ")) {
        throw new ServiceException("401-2", "Authorization 헤더가 Bearer 형식이 아닙니다.");
      }

      String[] headerAuthorizationBits = headerAuthorization.split(" ", 3);

      apiKey = headerAuthorizationBits[1];
      accessToken = headerAuthorizationBits.length == 3 ? headerAuthorizationBits[2] : "";
    } else {
      apiKey = rq.getCookieValue("apiKey", "");
      accessToken = rq.getCookieValue("accessToken", "");
    }

    logger.debug("apiKey : " + apiKey);
    logger.debug("accessToken : " + accessToken);

    boolean isApiKeyExists = !apiKey.isBlank();
    boolean isAccessTokenExists = !accessToken.isBlank();

    if (!isApiKeyExists && !isAccessTokenExists) {
      filterChain.doFilter(request, response);
      return;
    }

    //뭐가 됐던 이 시점부터는 로그인 후의 요청이라는 것 -> 토큰들을 가지고 있으니까.
    User user = null;
    boolean isAccessTokenValid = false;

    if (isAccessTokenExists) {
      Map<String, Object> payload = memberService.payload(accessToken);

      if (payload != null) {
        int id = (int) payload.get("id");
        String username = (String) payload.get("username");
        String name = (String) payload.get("name");
        user = new User((long) id, username, name);

        isAccessTokenValid = true;
      }
    }

    if (user == null) {
      user = memberService
          .findByApiKey(apiKey)
          .orElseThrow(() -> new ServiceException("401-3", "API 키가 유효하지 않습니다."));
    }

    if (isAccessTokenExists && !isAccessTokenValid) {
      String actorAccessToken = memberService.genAccessToken(user);

      rq.setCookie("accessToken", actorAccessToken);
      rq.setHeader("Authorization", actorAccessToken);
    }

    //이제 이 사용자는 인증된 사용자이다. 다만 우리 db에서 꺼낸게 아닌 사용자가 준 토큰에서 꺼낸 정보로 이루어짐.
    //이게 Rq에에서 getActor()를 통해 꺼내지는 정보이다.
    UserDetails authUser = new SecurityUser(
        user.getId(),
        user.getUsername(),
        "",
        user.getNickName(),
        user.getAuthorities()
    );

    Authentication authentication = new UsernamePasswordAuthenticationToken(
        authUser,
        authUser.getPassword(),
        authUser.getAuthorities()
    );

    // 이 시점 이후부터는 시큐리티가 이 요청을 인증된 사용자(기존의 로그인 해서 토큰을 발급 받은 사람)의 요청이다.
    // SecurityContext에 인증 정보를 저장한다.(Authentication 객체)
    // 이게 어떻게 rq로 들어가는거지? -> 콘텍스트에서 authentication 객체를 꺼내서 User로 캐스팅.
    //로그인 후의 유저 정보다.
    SecurityContextHolder
        .getContext()
        .setAuthentication(authentication);

    filterChain.doFilter(request, response);
  }
}