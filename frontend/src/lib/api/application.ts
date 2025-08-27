// ============================================
// 📋 지원서 관련 API 함수들
// ============================================

import { apiClient } from './index';
import { 
  ApplicationDetailResponseDto, 
  ApplicationStatus
} from '@/types';

// ============================================
// 🎯 API 엔드포인트 상수들
// ============================================

const APPLICATIONS_ENDPOINT = '/applications';

// ============================================
// 📡 지원서 API 함수들 (백엔드 컨트롤러와 1:1 매칭)
// ============================================

/**
 * 📋 지원서 상세 조회
 * 
 * 📡 백엔드 API: GET /applications/{id}
 * 🏠 컨트롤러: ApplicationController.getById()
 * 📦 응답: ApiResponse<ApplicationDetailResponseDto>
 */
export const getApplication = async (id: number): Promise<ApplicationDetailResponseDto> => {
  try {
    const response = await apiClient.get(`${APPLICATIONS_ENDPOINT}/${id}`);
    console.log(`📤 [Application API] 지원서 상세 조회 요청 (ID: ${id})`);
    
    // 백엔드가 ApiResponse<ApplicationDetailResponseDto>로 응답
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Application API] 지원서 상세 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 🗑️ 지원서 삭제
 * 
 * 📡 백엔드 API: DELETE /applications/{id}
 * 🏠 컨트롤러: ApplicationController.delete()
 * 📦 응답: void (성공 시 204 No Content)
 */
export const deleteApplication = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${APPLICATIONS_ENDPOINT}/${id}`);
    console.log(`📤 [Application API] 지원서 삭제 요청 (ID: ${id})`);
  } catch (error) {
    console.error(`❌ [Application API] 지원서 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 🔄 지원서 상태 수정
 * 
 * 📡 백엔드 API: PATCH /applications/{id}/status
 * 🏠 컨트롤러: ApplicationController.updateStatus()
 * 📦 응답: ApiResponse<null>
 */
export const updateApplicationStatus = async (id: number, status: ApplicationStatus): Promise<void> => {
  try {
    const requestData = { status };
    const response = await apiClient.patch(`${APPLICATIONS_ENDPOINT}/${id}/status`, requestData);
    console.log(`📤 [Application API] 지원서 상태 수정 요청 (ID: ${id}, Status: ${status})`);
    
    // 백엔드가 ApiResponse<null>로 응답 (data는 null)
  } catch (error) {
    console.error(`❌ [Application API] 지원서 상태 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};
