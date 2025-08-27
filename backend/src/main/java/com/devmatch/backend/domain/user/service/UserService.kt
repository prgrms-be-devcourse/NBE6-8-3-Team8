package com.devmatch.backend.domain.user.service

import com.devmatch.backend.domain.user.entity.User
import com.devmatch.backend.domain.user.repository.UserRepository
import com.devmatch.backend.exception.ServiceException
import com.devmatch.backend.global.RsData
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.function.Supplier

@Service
@Transactional
class UserService(
    private val authTokenService: AuthTokenService,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    //이거는 타인의 id를 통해 타인을 가져올 때만 쓰셔야 합니다.
    //로그인 한 사람의 정보를 가져오고 싶다면 Rq.actor를 사용하세요.
    @Transactional(readOnly = true)
    fun getUser(id: Long): User? = userRepository.findById(id).orElseThrow(
        Supplier {
            ServiceException("404-1", "${id}번 회원은 존재하지 않습니다.")
        }
    )

    @Transactional(readOnly = true)
    fun count(): Long = userRepository.count()

    //테스트 계정 생성용
    fun join(username: String, password: String?, nickname: String) : User =
        join(username, password, nickname, null)

    fun join(
        username: String,
        password: String?,
        nickname: String,
        profileImgUrl: String?
    ): User {
        userRepository.findByUsername(username)?.let {
            throw ServiceException("409-1", "이미 존재하는 아이디입니다.")
        }
        val encodedPassword =  if(!password.isNullOrBlank()) passwordEncoder.encode(password) else null

        val user = User(username, encodedPassword, nickname, profileImgUrl)
        return userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun findByUsername(username: String): User? = userRepository.findByUsername(username)

    @Transactional(readOnly = true)
    fun findByApiKey(apiKey: String): User? = userRepository.findByApiKey(apiKey)

    fun genAccessToken(user: User): String = authTokenService.genAccessToken(user)

    fun payload(accessToken: String): Map<String, Any>? = authTokenService.payload(accessToken)

    fun findById(id: Long): User? = userRepository.findById(id).orElse(null)

    fun modifyOrJoin(username: String, password: String?,
                     nickname: String, profileImgUrl: String?): RsData<User> =
        findByUsername(username)?.let {
            modify(it, nickname, profileImgUrl)
            RsData("200", "회원정보가 수정되었습니다.", it)
        } ?: run {
            val joined = join(username, password, nickname, profileImgUrl)
            RsData("202-1", "회원가입이 완료되었습니다.", joined)
        }

    private fun modify(user: User, nickname: String, profileImgUrl: String?) {
        user.modify(nickname, profileImgUrl)
    }
}