package com.example.taskmanagementbackend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// 確認用ユーザーのパスワードハッシュを手動で生成する。
// Spring Boot起動時には実行されず、DBも変更しない。
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // 所有者の確認に使う、2人目のユーザー用パスワード。
        // 実際のサービスで使っているパスワードは入力しない。
        String testPassword = "OwnerCheck2026!";

        String hash = encoder.encode(testPassword);

        System.out.println("PASSWORD_HASH: " + hash);
        System.out.println(
                "照合確認: " + encoder.matches(testPassword, hash)
        );
    }
}