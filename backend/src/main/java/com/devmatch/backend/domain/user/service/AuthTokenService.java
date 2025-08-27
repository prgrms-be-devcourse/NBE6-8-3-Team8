package com.devmatch.backend.domain.user.service;

import com.devmatch.backend.domain.user.entity.User;
import com.devmatch.backend.standard.util.Ut;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

  @Value("${custom.jwt.secretKey}")
  private String jwtSecretKey;

  @Value("${custom.accessToken.expirationSeconds}")
  private int accessTokenExpirationSeconds;

  String genAccessToken(User user) {
    long id = user.getId();
    String username = user.getUsername();//롬복
    String name = user.getNickName();//닉네임 가져오는 메서드

    return Ut.jwt.toString(
        jwtSecretKey,
        accessTokenExpirationSeconds,
        Map.of("id", id, "username", username, "name", name)
    );
  }

  Map<String, Object> payload(String accessToken) {
    Map<String, Object> parsedPayload = Ut.jwt.payload(jwtSecretKey, accessToken);

    if (parsedPayload == null) {
      return null;
    }

    int id = (int) parsedPayload.get("id");
    String username = (String) parsedPayload.get("username");
    String name = (String) parsedPayload.get("name");

    return Map.of("id", id, "username", username, "name", name);
  }
}