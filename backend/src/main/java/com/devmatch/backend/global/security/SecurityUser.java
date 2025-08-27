package com.devmatch.backend.global.security;

import java.util.Collection;
import java.util.Map;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

//아마 나중에 Rq에 넣을듯. 이걸로 getActor() 메서드로 현재 로그인한 유저를 가져올 수 있음
public class SecurityUser extends User implements OAuth2User {

  @Getter
  private Long id;
  @Getter
  private String name;

  public SecurityUser(
      Long id,
      String username,
      String password,
      String name,
      Collection<? extends GrantedAuthority> authorities
  ) {
    super(username, password != null ? password : "", authorities);
    this.id = id;
    this.name = name;
  }

  @Override
  public Map<String, Object> getAttributes() {
    return Map.of();
  }
}