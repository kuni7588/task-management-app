package com.example.taskmanagementbackend.controller;

import com.example.taskmanagementbackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Reactが送信時に使用するCSRFトークンを返す。
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName()
        );
    }

    // ログイン中のユーザー情報を返す。
    @GetMapping("/me")
    public ResponseEntity<UserInfo> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        return userRepository.findByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(
                        new UserInfo(
                                user.getUserId(),
                                user.getUsername()
                        )
                ))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    // パスワードやハッシュを含めず、画面で必要な情報だけ返す。
    public record UserInfo(Long userId, String username) {
    }
}