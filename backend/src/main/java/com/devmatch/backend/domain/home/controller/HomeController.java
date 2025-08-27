package com.devmatch.backend.domain.home.controller;

import static java.net.InetAddress.getLocalHost;
import static org.springframework.http.MediaType.TEXT_HTML_VALUE;

import java.net.InetAddress;
import lombok.SneakyThrows;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

  @SneakyThrows
  @GetMapping(produces = TEXT_HTML_VALUE)
  public String main() {
    InetAddress localHost = getLocalHost();
    return """
        <html>
        <head>
          <meta charset="UTF-8">
          <script>
            function logout() {
              fetch('/auth/logout', {
                method: 'DELETE',
              }).then(res => {
                if (res.ok) {
                  window.location.href = '/';
                } else {
                  alert('로그아웃 실패');
                }
              });
            }
          </script>
        </head>
        <body>
          <h1>API 서버</h1>
          <p>Host Name: %s</p>
          <p>Host Address: %s</p>
          <div>
              <a href="/oauth2/authorization/kakao"
                 class="p-2 rounded hover:bg-gray-100">카카오 로그인</a>
              <a href="/oauth2/authorization/google"
                 class="p-2 rounded hover:bg-gray-100">구글 로그인</a>
              <a href="/oauth2/authorization/naver"
                 class="p-2 rounded hover:bg-gray-100">네이버 로그인</a>
        
              <a href="#" onclick="logout()"
                 class="p-2 rounded hover:bg-gray-100">로그아웃</a>
          </div>
        </body>
        </html>
        """.formatted(localHost.getHostName(), localHost.getHostAddress());
  }
}

