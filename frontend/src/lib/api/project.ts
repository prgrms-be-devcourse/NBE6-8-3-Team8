// ============================================
// 📦 프로젝트 관련 API 함수들
// ============================================

import { apiClient } from './index';
import { 
  ProjectDetailResponse, 
  ProjectCreateRequest,
  ProjectStatusUpdateRequest,
  ProjectContentUpdateRequest,
  ProjectApplyRequest,
  ApplicationDetailResponseDto,
  ProjectStatus
} from '@/types';

// ============================================
// 🎯 API 엔드포인트 상수들
// ============================================

const PROJECTS_ENDPOINT = '/projects';

// ============================================
// 📡 프로젝트 API 함수들 (백엔드 컨트롤러와 1:1 매칭)
// ============================================

/**
 * 📊 전체 프로젝트 조회
 * 
 * 📡 백엔드 API: GET /projects
 * 🏠 컨트롤러: ProjectController.getAll()
 * 📦 응답: List<ProjectDetailResponse>
 */
export const getAllProjects = async (): Promise<ProjectDetailResponse[]> => {
  try {
    const response = await apiClient.get(PROJECTS_ENDPOINT);
    console.log('📤 [Project API] 전체 프로젝트 조회 요청');
    console.log('📥 [Project API] 전체 프로젝트 조회 응답:', response.data);
    
    // 백엔드가 ApiResponse 래퍼로 응답: { msg: string, data: ProjectDetailResponse[] }
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    // 직접 배열로 응답하는 경우 (fallback)
    return response.data || [];
  } catch (error) {
    console.error('❌ [Project API] 전체 프로젝트 조회 실패:', error);
    return []; // 에러 시 빈 배열 반환
  }
};

/**
 * 🎯 프로젝트 생성
 * 
 * 📡 백엔드 API: POST /projects
 * 🏠 컨트롤러: ProjectController.create()
 * 📦 응답: ProjectDetailResponse
 */
export const createProject = async (data: ProjectCreateRequest): Promise<ProjectDetailResponse> => {
  try {
    const response = await apiClient.post(PROJECTS_ENDPOINT, data);
    console.log('📤 [Project API] 프로젝트 생성 요청:', data);
    console.log('📥 [Project API] 프로젝트 생성 응답:', response.data);
    
    // 백엔드가 ApiResponse 래퍼 없이 직접 데이터를 반환하는 경우
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    // 직접 ProjectDetailResponse를 반환하는 경우
    return response.data;
  } catch (error) {
    console.error('❌ [Project API] 프로젝트 생성 실패:', error);
    throw error;
  }
};

/**
 * 📋 프로젝트 단일 조회
 * 
 * 📡 백엔드 API: GET /projects/{id}
 * 🏠 컨트롤러: ProjectController.getById()
 * 📦 응답: ProjectDetailResponse
 */
export const getProject = async (id: number): Promise<ProjectDetailResponse> => {
  try {
    const response = await apiClient.get(`${PROJECTS_ENDPOINT}/${id}`);
    console.log(`📤 [Project API] 프로젝트 단일 조회 요청 (ID: ${id})`);
    
    // Handle both ApiResponse wrapper and direct data responses
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Project API] 프로젝트 단일 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 🔄 프로젝트 상태 수정
 * 
 * 📡 백엔드 API: PATCH /projects/{id}/status
 * 🏠 컨트롤러: ProjectController.updateStatus()
 * 📦 응답: ProjectDetailResponse
 */
export const updateProjectStatus = async (id: number, status: ProjectStatus): Promise<ProjectDetailResponse> => {
  try {
    const requestData: ProjectStatusUpdateRequest = { status };
    const response = await apiClient.patch(`${PROJECTS_ENDPOINT}/${id}/status`, requestData);
    console.log(`📤 [Project API] 프로젝트 상태 수정 요청 (ID: ${id}, Status: ${status})`);
    
    // 백엔드가 ApiResponse<ProjectDetailResponse>로 응답
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Project API] 프로젝트 상태 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * ✏️ 프로젝트 내용 수정
 * 
 * 📡 백엔드 API: PATCH /projects/{id}/content
 * 🏠 컨트롤러: ProjectController.updateContent()
 * 📦 응답: ProjectDetailResponse
 */
export const updateProjectContent = async (id: number, content: string): Promise<ProjectDetailResponse> => {
  try {
    const requestData: ProjectContentUpdateRequest = { content };
    const response = await apiClient.patch(`${PROJECTS_ENDPOINT}/${id}/content`, requestData);
    console.log(`📤 [Project API] 프로젝트 내용 수정 요청 (ID: ${id})`);
    
    // Handle both ApiResponse wrapper and direct data responses
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Project API] 프로젝트 내용 수정 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 🗑️ 프로젝트 삭제
 * 
 * 📡 백엔드 API: DELETE /projects/{id}
 * 🏠 컨트롤러: ProjectController.delete()
 * 📦 응답: void (성공 시 204 No Content)
 */
export const deleteProject = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${PROJECTS_ENDPOINT}/${id}`);
    console.log(`📤 [Project API] 프로젝트 삭제 요청 (ID: ${id})`);
  } catch (error) {
    console.error(`❌ [Project API] 프로젝트 삭제 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 📋 프로젝트 지원서 목록 조회
 * 
 * 📡 백엔드 API: GET /projects/{id}/applications
 * 🏠 컨트롤러: ProjectController.getApplications()
 * 📦 응답: ApiResponse<ApplicationDetailResponseDto[]>
 */
export const getProjectApplications = async (id: number): Promise<ApplicationDetailResponseDto[]> => {
  try {
    const response = await apiClient.get(`${PROJECTS_ENDPOINT}/${id}/applications`);
    console.log(`📤 [Project API] 프로젝트 지원서 목록 조회 요청 (ID: ${id})`);
    
    // 백엔드가 ApiResponse<ApplicationDetailResponseDto[]>로 응답
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error) {
    console.error(`❌ [Project API] 프로젝트 지원서 목록 조회 실패 (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * 📝 프로젝트 지원
 * 
 * 📡 백엔드 API: POST /projects/{id}/applications
 * 🏠 컨트롤러: ProjectController.apply()
 * 📦 응답: ApiResponse<ApplicationDetailResponseDto>
 */
export const applyToProject = async (id: number, data: ProjectApplyRequest): Promise<ApplicationDetailResponseDto> => {
  try {
    const response = await apiClient.post(`${PROJECTS_ENDPOINT}/${id}/applications`, data);
    console.log(`📤 [Project API] 프로젝트 지원 요청 (ID: ${id})`, data);
    
    // 백엔드가 ApiResponse<ApplicationDetailResponseDto>로 응답
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Project API] 프로젝트 지원 실패 (ID: ${id}):`, error);
    throw error;
  }
};
