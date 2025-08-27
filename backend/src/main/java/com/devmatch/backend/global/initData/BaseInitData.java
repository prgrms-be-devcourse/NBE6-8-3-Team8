package com.devmatch.backend.global.initData;

import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

  @Autowired
  @Lazy
  private BaseInitData self;

  private final UserService userService;

  @Bean
  ApplicationRunner baseInitDataApplicationRunner() {
    return args -> {
      self.work1();
    };
  }

  @Transactional
  public void work1() {
    if (userService.count() > 0) {
      return;
    }
    //테스트용 계정
    User memberSystem = userService.join("system", "1234", "시스템");
    memberSystem.modifyApiKey(memberSystem.getUsername());

    User memberAdmin = userService.join("admin", "1234", "관리자");
    memberAdmin.modifyApiKey(memberAdmin.getUsername());

    User memberUser1 = userService.join("user1", "1234", "유저1");
    memberUser1.modifyApiKey(memberUser1.getUsername());

    User memberUser2 = userService.join("user2", "1234", "유저2");
    memberUser2.modifyApiKey(memberUser2.getUsername());

    User memberUser3 = userService.join("user3", "1234", "유저3");
    memberUser3.modifyApiKey(memberUser3.getUsername());
  }
}