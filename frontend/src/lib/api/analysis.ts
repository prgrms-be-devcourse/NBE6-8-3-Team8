// ============================================
// 🤖 분석 관련 API 함수들
// ============================================

import { apiClient } from './index';
import { 
  AnalysisResultResponse
} from '@/types';

// ============================================
// 🎯 API 엔드포인트 상수들
// ============================================

const ANALYSIS_ENDPOINT = '/analysis';

// ============================================
// 📡 분석 API 함수들 (백엔드 컨트롤러와 1:1 매칭)
// ============================================

/**
 * 📊 지원서 분석 결과 조회
 * 
 * 📡 백엔드 API: GET /analysis/application/{applicationId}
 * 🏠 컨트롤러: AnalysisController.getAnalysisResult()
 * 📦 응답: ApiResponse<AnalysisResultResponse>
 */
export const getAnalysisResult = async (applicationId: number): Promise<AnalysisResultResponse> => {
  try {
    const response = await apiClient.get(`${ANALYSIS_ENDPOINT}/application/${applicationId}`);
    console.log(`📤 [Analysis API] 지원서 분석 결과 조회 요청 (Application ID: ${applicationId})`);
    
    // 백엔드가 ApiResponse<AnalysisResultResponse>로 응답
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Analysis API] 지원서 분석 결과 조회 실패 (Application ID: ${applicationId}):`, error);
    throw error;
  }
};

/**
 * 📊 지원서 분석 결과 생성
 * 
 * 📡 백엔드 API: POST /analysis/application/{applicationId}
 * 🏠 컨트롤러: AnalysisController.createAnalysisResult()
 * 📦 응답: ApiResponse<AnalysisResultResponse>
 */
export const createAnalysisResult = async (applicationId: number): Promise<AnalysisResultResponse> => {
  try {
    const response = await apiClient.post(`${ANALYSIS_ENDPOINT}/application/${applicationId}`);
    console.log(`📤 [Analysis API] 지원서 분석 결과 생성 요청 (Application ID: ${applicationId})`);
    
    // 백엔드가 ApiResponse<AnalysisResultResponse>로 응답
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Analysis API] 지원서 분석 결과 생성 실패 (Application ID: ${applicationId}):`, error);
    throw error;
  }
};

/**
 * 👥 팀 역할 분배 생성
 * 
 * 📡 백엔드 API: POST /analysis/project/{projectId}/role-assignment
 * 🏠 컨트롤러: AnalysisController.createTeamRoleAssignment()
 * 📦 응답: ApiResponse<string> (역할 분배 문자열)
 */
export const createTeamRoleAssignment = async (projectId: number): Promise<string> => {
  try {
    const response = await apiClient.post(`${ANALYSIS_ENDPOINT}/project/${projectId}/role-assignment`);
    console.log(`📤 [Analysis API] 팀 역할 분배 생성 요청 (Project ID: ${projectId})`);
    
    // 백엔드가 ApiResponse<string>로 응답 (역할 분배 문자열)
    if (response.data.msg && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error(`❌ [Analysis API] 팀 역할 분배 생성 실패 (Project ID: ${projectId}):`, error);
    throw error;
  }
};
