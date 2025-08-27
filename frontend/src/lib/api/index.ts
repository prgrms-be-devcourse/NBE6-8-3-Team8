// ============================================
// 🌐 API 클라이언트 및 인터셉터 설정
// ============================================

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ============================================
// 🎯 API 클라이언트 인스턴스 생성
// ============================================

/**
 * 🌐 Axios 인스턴스 생성
 * 
 * 🎯 목적: 모든 API 요청에 대한 공통 설정
 * 🔧 설정: 기본 URL, 타임아웃, 쿠키 포함
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devmatch-production-cf16.up.railway.app', // 🌐 Railway 백엔드 서버
  timeout: 10000, // ⏱️ 10초 타임아웃
  withCredentials: true, // 🍪 쿠키 포함 (인증을 위해 필수)
});

// ============================================
// 🛡️ 요청 인터셉터 (요청 전 처리)
// ============================================

/**
 * 📤 요청 인터셉터
 * 
 * 🎯 목적: 요청 전 로깅 및 토큰 추가
 * 📝 실제 토큰 추가는 필요 시 구현
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================================
// 🛡️ 응답 인터셉터 (응답 후 처리)
// ============================================

/**
 * 📥 응답 인터셉터
 * 
 * 🎯 목적: 응답 후 로깅 및 에러 처리
 * ✅ 성공 응답: 전체 response 객체 반환 (각 API 함수에서 response.data 접근)
 * ❌ 에러 응답: 에러 메시지 추출 및 표시
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`📥 [API Response] ${response.status} ${response.config.url}`, response.data);
    return response; // 🎯 전체 response 객체 반환
  },
  (error) => {
    console.error('❌ [API Response Error]', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// ============================================
// 📡 각 도메인별 API 함수들 통합 내보내기
// ============================================

export * as projectApi from './project';
export * as userApi from './user';
export * as authApi from './auth';
export * as applicationApi from './application';
export * as analysisApi from './analysis';
