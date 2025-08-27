// ============================================
// 🔐 인증 관련 API 함수들
// ============================================

import { apiClient } from './index';

// ============================================
// 🎯 API 엔드포인트 상수들
// ============================================

const AUTH_ENDPOINT = '/auth';
const OAUTH2_ENDPOINT = '/oauth2/authorization';

// ============================================
// 📡 인증 API 함수들 (백엔드 컨트롤러와 1:1 매칭)
// ============================================

/**
 * 🚪 로그아웃
 * 
 * 📡 백엔드 API: DELETE /auth/logout
 * 🏠 컨트롤러: AuthController.logout()
 * 📦 응답: void (성공 시 204 No Content)
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.delete(`${AUTH_ENDPOINT}/logout`);
    console.log('📤 [Auth API] 로그아웃 요청');
  } catch (error) {
    console.error('❌ [Auth API] 로그아웃 실패:', error);
    throw error;
  }
};

/**
 * 🔗 OAuth2 로그인 (구글)
 * 
 * 📡 백엔드 API: GET /oauth2/authorization/google
 * 🏠 컨트롤러: SecurityConfig.oauth2Login()
 * 📦 응답: void (리다이렉트)
 */
export const loginWithGoogle = (): void => {
  const redirectUrl = encodeURIComponent(window.location.origin);
  window.location.href = `${apiClient.defaults.baseURL}${OAUTH2_ENDPOINT}/google?redirectUrl=${redirectUrl}`;
  console.log('📤 [Auth API] 구글 로그인 요청');
};

/**
 * 🔗 OAuth2 로그인 (카카오)
 * 
 * 📡 백엔드 API: GET /oauth2/authorization/kakao
 * 🏠 컨트롤러: SecurityConfig.oauth2Login()
 * 📦 응답: void (리다이렉트)
 */
export const loginWithKakao = (): void => {
  const redirectUrl = encodeURIComponent(window.location.origin);
  window.location.href = `${apiClient.defaults.baseURL}${OAUTH2_ENDPOINT}/kakao?redirectUrl=${redirectUrl}`;
  console.log('📤 [Auth API] 카카오 로그인 요청');
};

/**
 * 🔗 OAuth2 로그인 (네이버)
 * 
 * 📡 백엔드 API: GET /oauth2/authorization/naver
 * 🏠 컨트롤러: SecurityConfig.oauth2Login()
 * 📦 응답: void (리다이렉트)
 */
export const loginWithNaver = (): void => {
  const redirectUrl = encodeURIComponent(window.location.origin);
  window.location.href = `${apiClient.defaults.baseURL}${OAUTH2_ENDPOINT}/naver?redirectUrl=${redirectUrl}`;
  console.log('📤 [Auth API] 네이버 로그인 요청');
};
