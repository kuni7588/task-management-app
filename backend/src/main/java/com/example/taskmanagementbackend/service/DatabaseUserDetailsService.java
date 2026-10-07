package com.example.taskmanagementbackend.service;

import com.example.taskmanagementbackend.entity.User;
import com.example.taskmanagementbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public DatabaseUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 入力されたユーザー名で、DBのユーザーを検索する。
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "ユーザーが見つかりません。"
                        )
                );

        // getPassword()は、User.javaのpasswordHashを返す。
        // 保存済みの値を渡す。ここで再ハッシュ化はしない。
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
}
