package com.devmatch.backend.global.security;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import com.devmatch.backend.global.RsData;
import com.devmatch.backend.standard.util.Ut;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final CustomAuthenticationFilter customAuthenticationFilter;
  private final AuthenticationSuccessHandler customOAuth2LoginSuccessHandler;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(
            auth -> auth
                .requestMatchers("/favicon.ico").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/users/**").authenticated()
                .requestMatchers("/projects/**").authenticated()
                .requestMatchers("/analysis/**").authenticated()
                .requestMatchers("/applications/**").authenticated()
                .anyRequest().permitAll()
        )
        .headers(
            headers -> headers
                .frameOptions(
                    HeadersConfigurer.FrameOptionsConfig::sameOrigin
                )
        ).csrf(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .logout(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        //세션 사용 안함
        .sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(STATELESS))
        .oauth2Login(oauth2Login -> oauth2Login.successHandler(customOAuth2LoginSuccessHandler))
        .addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .exceptionHandling(
            exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.setContentType("application/json;charset=UTF-8");

                      response.setStatus(401);
                      response.getWriter().write(
                          Ut.json.toString(
                              new RsData<>(
                                  "401-1",
                                  "로그인 후 이용해주세요."
                              )
                          )
                      );
                    }
                )
                .accessDeniedHandler(
                    (request, response, accessDeniedException) -> {
                      response.setContentType("application/json;charset=UTF-8");
                      response.setStatus(403);
                      response.getWriter().write(
                          Ut.json.toString(
                              new RsData<>(
                                  "403-1",
                                  "권한이 없습니다."
                              )
                          )
                      );
                    }
                )
        );

    return http.build();
  }

  @Bean// CORS 설정을 위한 Bean 등록
  public UrlBasedCorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // 허용할 오리진 설정
    configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://nbe-6-8-2-team08-vaug.vercel.app"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));

    // 자격 증명 허용 설정
    configuration.setAllowCredentials(true);

    // 허용할 헤더 설정
    configuration.setAllowedHeaders(List.of("*"));

    // CORS 설정을 소스에 등록
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);//여기 고침 /api/** -> /**

    return source;
  }
}
