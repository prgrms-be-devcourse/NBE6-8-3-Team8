package com.devmatch.backend.domain.user.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.util.*

//class Member(
//    @Column(name = "id") val _id: Int?
//) {
//    val id: Int
//        get() = _id!!
//}
@Entity
@Table(name = "users") // 테이블 이름을 명시적으로 지정
class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,
    @field:Column(unique = true) @field:NotNull
    @field:Size(min = 1, max = 50, message = "사용자 이름은 1자 이상 50자 이하이어야 합니다.")
    var username: String,
    var password: String? = null,
    var nickname: String,
    @field:Column(unique = true) var apiKey: String,
    var profileImgUrl: String? = null,
) {
    constructor(id: Long, username: String, nickname: String) : this(
        id,
        username,
        null,
        nickname,
        "",
    )

    constructor(username: String, password: String?, nickname: String, profileImgUrl: String?) : this(
        0L,
        username,
        password,
        nickname,
        UUID.randomUUID().toString(), // apiKey는 UUID로 생성
        profileImgUrl
    )

    //테스트 계정 생성용(TDD)
    fun modifyApiKey(apiKey: String) {
        this.apiKey = apiKey
    }

    val isAdmin: Boolean
        get() {
            if ("system" == username)  return true
            if ("admin" == username) return true

            return false
        }

    val authoritiesAsStringList: List<String>
        get() {
            val authorities = mutableListOf<String>()

            if (isAdmin) authorities.add("ROLE_ADMIN")

            return authorities
        }

    val authorities: Collection<GrantedAuthority>
        get() = authoritiesAsStringList.map { SimpleGrantedAuthority(it) }

    fun modify(nickname: String, profileImgUrl: String?) {
        this.nickname = nickname
        this.profileImgUrl = profileImgUrl
    }

    val profileImgUrlOrDefault: String
        get() {
            profileImgUrl?.let { return it }

            return "https://placehold.co/600x600?text=U_U"
        }
}