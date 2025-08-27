// ============================================
// 👤 사용자 관련 API 함수들
// ============================================

import { apiClient } from './index';
import { User, UserProjectListResponse, ApplicationDetailResponseDto } from '@/types';

// ============================================
// 🎯 API 엔드포인트 상수들
// ============================================

const USERS_ENDPOINT = '/users';

// ============================================
// 📡 사용자 API 함수들 (백엔드 컨트롤러와 1:1 매칭)
// ============================================

/**
 * 👤 현재 사용자 정보 조회
 * 
 * 📡 백엔드 API: GET /users/profile
 * 🏠 컨트롤러: UserController.getCurrentUser()
 * 📦 응답: User (래퍼 없음)
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/users/profile');
    console.log('📤 [User API] 사용자 프로필 조회 성공');
    console.log('📥 [User API] 사용자 데이터:', response.data);
    console.log('🔍 [User API] 백엔드 응답 전체 객체:', JSON.stringify(response.data, null, 2));
    console.log('🔍 [User API] nickname 필드:', response.data.nickname);
    console.log('🔍 [User API] nickName 필드:', response.data.nickName);
    console.log('🔍 [User API] username 필드:', response.data.username);
    
    // 백엔드에서 User 엔티티를 직접 반환
    return response.data;
  } catch (error) {
    console.error('❌ [User API] 사용자 프로필 조회 실패:', error);
    return null;
  }
};

/**
 * 🚪 로그아웃
 * 
 * 📡 백엔드 API: DELETE /auth/logout
 * 🏠 컨트롤러: AuthController.logout()
 * 📦 응답: void (성공 시 204 No Content)
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.delete('/auth/logout');
    console.log('📤 [User API] 로그아웃 요청');
  } catch (error) {
    console.error('❌ [User API] 로그아웃 실패:', error);
    throw error;
  }
};


/**
 * 📊 사용자의 프로젝트 목록 조회
 * 
 * 📡 백엔드 API: GET /users/projects
 * 🏠 컨트롤러: UserController.findProjectsById()
 * 📦 응답: List<UserProjectListResponse>
 */
export const getUserProjects = async (): Promise<UserProjectListResponse[]> => {
  try {
    const response = await apiClient.get(`${USERS_ENDPOINT}/projects`);
    console.log('📤 [User API] 사용자 프로젝트 목록 조회 요청');
    console.log('📥 [User API] 응답 데이터:', response.data);
    
    // 백엔드가 직접 배열로 응답하므로 response.data 사용
    return response.data || [];
  } catch (error) {
    console.error('❌ [User API] 사용자 프로젝트 목록 조회 실패:', error);
    return []; // 에러 시 빈 배열 반환
  }
};

/**
 * 📋 사용자의 지원서 목록 조회
 * 
 * 📡 백엔드 API: GET /users/applications
 * 🏠 컨트롤러: UserController.findApplicationsById()
 * 📦 응답: ApplicationDetailResponseDto[] (래퍼 없음)
 */
export const getUserApplications = async (): Promise<ApplicationDetailResponseDto[]> => {
  try {
    const response = await apiClient.get(`${USERS_ENDPOINT}/applications`);
    console.log('📤 [User API] 사용자 지원서 목록 조회 요청');
    console.log('📥 [User API] 응답 데이터:', response.data);
    
    // 백엔드가 직접 ApplicationDetailResponseDto 배열로 응답
    return response.data || [];
  } catch (error) {
    console.error('❌ [User API] 사용자 지원서 목록 조회 실패:', error);
    return []; // 에러 시 빈 배열 반환
  }
};
