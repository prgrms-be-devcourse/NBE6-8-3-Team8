package com.devmatch.backend.global.security

import com.devmatch.backend.global.RsData
import com.devmatch.backend.standard.util.Ut
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig(
    private val customAuthenticationFilter: CustomAuthenticationFilter,
    private val customOAuth2LoginSuccessHandler: AuthenticationSuccessHandler,
    private val customOAuth2AuthorizationRequestResolver: CustomOAuth2AuthorizationRequestResolver
) {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain? {
        http {
            authorizeHttpRequests {
                authorize("/favicon.ico", permitAll)
                authorize("/h2-console/**", permitAll)
                authorize("/users/**", authenticated)
                authorize("/projects/**", authenticated)
                authorize("/analysis/**", authenticated)
                authorize("/applications/**", authenticated)
                authorize(anyRequest, permitAll)
            }
            headers {
                frameOptions { sameOrigin = true }
            }

            csrf { disable() }
            formLogin { disable() }
            logout { disable() }
            httpBasic { disable() }

            sessionManagement {
                sessionCreationPolicy = SessionCreationPolicy.STATELESS
            }

            oauth2Login {
                authenticationSuccessHandler = customOAuth2LoginSuccessHandler

                authorizationEndpoint {
                    authorizationRequestResolver = customOAuth2AuthorizationRequestResolver
                }
            }

            addFilterBefore<UsernamePasswordAuthenticationFilter>(customAuthenticationFilter)

            exceptionHandling {
                authenticationEntryPoint = AuthenticationEntryPoint { _, response, _ ->
                    response.contentType = "application/json;charset=UTF-8"
                    response.status = 401
                    response.writer.write(
                        Ut.json.toString(
                            RsData<Void>("401-1", "로그인 후 이용해주세요.")
                        )
                    )
                }

                accessDeniedHandler = AccessDeniedHandler { _, response, _ ->
                    response.contentType = "application/json;charset=UTF-8"
                    response.status = 403
                    response.writer.write(
                        Ut.json.toString(
                            RsData<Void>("403-1", "권한이 없습니다.")
                        )
                    )
                }
            }
        }
        return http.build()
    }

    @Bean // CORS 설정을 위한 Bean 등록
    fun corsConfigurationSource(): UrlBasedCorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = listOf(
                "http://localhost:3000",
                "https://nbe-6-8-2-team08-vaug.vercel.app",
                "https://www.devmatch.store",
                "https://devmatch.store"
            )
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE")
            allowCredentials = true
            allowedHeaders = listOf("*")
        }


        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", configuration) // 모든 경로에 대해 CORS 설정 적용
        }
    }
}
