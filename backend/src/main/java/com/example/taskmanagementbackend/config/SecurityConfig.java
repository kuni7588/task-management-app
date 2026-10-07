package com.example.taskmanagementbackend.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.security.autoconfigure.web.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // パスワードのハッシュ化・照合に使用する。
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ローカル開発用のH2 Consoleに適用する設定。
    @Bean
    @Order(1)
    public SecurityFilterChain h2ConsoleSecurityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .securityMatcher(PathRequest.toH2Console())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                // H2 ConsoleはCSRFトークンに対応していないため、
                // この専用設定内だけでCSRF保護を無効にする。
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                );

        return http.build();
    }

    // アプリケーションの認証・アクセス制御。
    @Bean
    @Order(2)
    public SecurityFilterChain appSecurityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/csrf",
                                "/api/auth/login",
                                "/error"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        // ログイン画面はReactで表示する。
                        .loginPage("/api/auth/login")
                        .loginProcessingUrl("/api/auth/login")
                        .successHandler((request, response, authentication) ->
                                response.setStatus(
                                        HttpServletResponse.SC_NO_CONTENT
                                )
                        )
                        .failureHandler((request, response, exception) ->
                                response.setStatus(
                                        HttpServletResponse.SC_UNAUTHORIZED
                                )
                        )
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(
                                        HttpServletResponse.SC_NO_CONTENT
                                )
                        )
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                response.setStatus(
                                        HttpServletResponse.SC_UNAUTHORIZED
                                )
                        )
                )
                // APIではCSRF保護を維持する。
                // トークンの取得・送信は、次の手順で追加する。
                .requestCache(cache -> cache.disable());

        return http.build();
    }
}