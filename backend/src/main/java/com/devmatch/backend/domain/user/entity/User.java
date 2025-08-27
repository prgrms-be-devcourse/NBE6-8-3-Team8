package com.devmatch.backend.domain.user.entity;

import static jakarta.persistence.GenerationType.IDENTITY;
import static lombok.AccessLevel.PROTECTED;
import lombok.AccessLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Entity
@Table(name = "users") // 테이블 이름을 명시적으로 지정
@Getter
@NoArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = IDENTITY)
  @Setter(PROTECTED)
  private Long id;

  @NotNull
  @Column(unique = true)
  @Size(min = 1, max = 50, message = "사용자 이름은 1자 이상 50자 이하이어야 합니다.")
  private String username;//기존 name 필드 대신 사용, 유니크한 사용자 이름
  private String password;
  @Getter(AccessLevel.NONE) // 롬복 자동 생성 제외, 수동 메서드 사용
  private String nickname;//소셜 응답으로 올 정보
  @Column(unique = true)
  private String apiKey;//리프레시 토큰
  private String profileImgUrl; //소셜 응답으로 올 정보

  public User(Long id, String username, String name) {
    setId(id);
    this.username = username;
    setNickName(name);
  }

  public User(String username, String password, String nickname, String profileImgUrl) {
    this.username = username;
    this.password = password;
    this.nickname = nickname;
    this.profileImgUrl = profileImgUrl;
    this.apiKey = UUID.randomUUID().toString();
  }

  public String getNickName() {
    return nickname;
  }

  public void setNickName(String name) {
    this.nickname = name;
  }

  //테스트 계정 생성용
  public void modifyApiKey(String apiKey) {//이거 더미데이터들 api키 이름이랑 똑같게 하려고 쓴거라 삭제할듯
    this.apiKey = apiKey;
  }

  //그래도 나중에 비속어 사용한 글이 있으면 삭제하게 남겨두는 편이 좋다고 하심.
  public boolean isAdmin() {
    if ("system".equals(username)) {
      return true;
    }
    if ("admin".equals(username)) {
      return true;
    }

    return false;
  }

  public Collection<? extends GrantedAuthority> getAuthorities() {
    return getAuthoritiesAsStringList()
        .stream()
        .map(SimpleGrantedAuthority::new)
        .toList();
  }

  private List<String> getAuthoritiesAsStringList() {
    List<String> authorities = new ArrayList<>();

    if (isAdmin()) {
      authorities.add("ROLE_ADMIN");
    }

    return authorities;
  }

  public void modify(String nickname, String profileImgUrl) {
    this.nickname = nickname;
    this.profileImgUrl = profileImgUrl;
  }

  //getActor를 통한 유저 객체에는 url이 없으니 getActorFromDb를 통해 DB에서 꺼낸 유저 객체를 사용해서 url을 사용.
  public String getProfileImgUrlOrDefault() {
    if (profileImgUrl == null) {
      return "https://placehold.co/600x600?text=U_U";
    }

    return profileImgUrl;
  }
}