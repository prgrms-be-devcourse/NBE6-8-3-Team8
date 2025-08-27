// ============================================
// 📦 공통 응답 타입 (백엔드 실제 구조 기준)
// ============================================

/**
 * 백엔드 ApiResponse 래퍼
 * 위치: backend/src/main/java/com/devmatch/backend/global/ApiResponse.java
 */
export interface ApiResponse<T> {
  msg: string;
  data: T;
}

// ============================================
// 👤 사용자 관련 타입들
// ============================================

/**
 * 사용자 프로필 응답 (OAuth 기반 사용자 정보)
 * 
 * 📍 OAuth 플로우: Google/Kakao/Naver → CustomOAuth2UserService → User 엔티티 생성
 * 🔑 실제 OAuth 응답 필드 기준:
 *    - KAKAO: properties.nickname, properties.profile_image
 *    - GOOGLE: name/given_name, picture  
 *    - NAVER: response.nickname, response.profile_image
 * 📡 연관 API: GET /users/profile
 */
export interface User {
  id: number;                    // Long -> number (PK)
  username: string;              // "{PROVIDER}__{oauthUserId}" 형식 (예: "GOOGLE__1234567890")
  nickName: string;              // OAuth 제공자에서 받은 표시명 (백엔드 getNickName() 메서드명 기준)
  profileImgUrl: string | null;  // OAuth 제공자에서 받은 프로필 이미지 URL
  password: string | null;       // 백엔드에서 전송되는 필드 (보안상 null)
  apiKey: string | null;         // 백엔드에서 전송되는 필드 (보안상 null)
  authorities: string[];         // 백엔드에서 전송되는 권한 배열 (예: ["ROLE_ADMIN"])
  admin: boolean;                // 관리자 여부
}



// ============================================
// 📊 프로젝트 관련 타입들
// ============================================

/**
 * 프로젝트 상태 (백엔드 실제 enum)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/project/entity/ProjectStatus.java
 * 주의: IN_PROGRESS는 백엔드에 존재하지 않음
 */
export type ProjectStatus = 'RECRUITING' | 'COMPLETED';

/**
 * 프로젝트 상세 응답 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/project/dto/ProjectDetailResponse.java
 */
export interface ProjectDetailResponse {
  id: number;
  title: string;
  description: string;
  techStacks: string[];        // 배열로 반환
  teamSize: number;
  currentTeamSize: number;     // 현재 팀원 수
  creator: string;             // 프로젝트 생성자 닉네임
  status: ProjectStatus;       // "RECRUITING" | "COMPLETED"
  content: string | null;      // 역할 배분 내용 (null 가능)
  durationWeeks: number;
  createdAt: string;           // LocalDateTime이 ISO 문자열로 변환
}

/**
 * 프로젝트 생성 요청 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/project/dto/ProjectCreateRequest.java
 */
export interface ProjectCreateRequest {
  title: string;          // 1-200자
  description: string;    // 1-2000자  
  techStack: string;      // 1-500자 (쉼표로 구분된 문자열)
  teamSize: number;       // 최소 1
  durationWeeks: number;  // 최소 1
}

/**
 * 프로젝트 상태 수정 요청 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/project/dto/ProjectStatusUpdateRequest.java
 */
export interface ProjectStatusUpdateRequest {
  status: ProjectStatus;
}

/**
 * 프로젝트 내용 수정 요청 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/project/dto/ProjectContentUpdateRequest.java
 */
export interface ProjectContentUpdateRequest {
  content: string;  // 1-2000자
}

// ============================================
// 📋 지원서 관련 타입들
// ============================================

/**
 * 지원서 상태 (백엔드 실제 enum)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/application/enums/ApplicationStatus.java
 */
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * 기술별 점수 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/application/entity/SkillScore.java
 */
export interface SkillScore {
  id: number;           // 기술점수 ID
  techName: string;     // 기술 명
  score: number;        // 기술 숙련도 점수 (1-10)
}

/**
 * 지원서 상세 응답 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/application/dto/response/ApplicationDetailResponseDto.java
 */
export interface ApplicationDetailResponseDto {
  applicationId: number;      // 지원서 ID
  nickname: string;          // 지원자 닉네임 (직접 필드)
  status: ApplicationStatus; // 지원서 상태
  appliedAt: string;         // 지원 일시 (ISO 문자열)
  techName: string[];        // 지원자의 기술명 배열
  score: number[];           // 지원자의 기술 점수 배열 (1-10)
}

/**
 * 프로젝트 지원 요청 (백엔드 실제 구조)
 * 위치: backend/src/main/java/com/devmatch/backend/domain/project/dto/ProjectApplyRequest.java
 */
export interface ProjectApplyRequest {
  techStacks: string[];   // 기술 스택 배열
  techScores: number[];   // 각 기술에 대한 점수 배열
}

// ============================================
// 📊 분석 관련 타입들 (백엔드 Analysis 엔티티와 100% 동기화)
// ============================================

/**
 * 📋 분석 결과 응답
 * 
 * 📍 위치: backend/src/main/java/com/devmatch/backend/domain/analysis/dto/AnalysisResultResponse.java
 * 🎯 목적: 지원서 분석 결과 조회 시 사용
 * 📡 연관 API: GET /analysis/application/{applicationId}
 */
export interface AnalysisResultResponse {
  id: number;                   // ✅ 분석 고유 ID
  applicationId: number;        // ✅ 분석 대상 지원서 ID
  compatibilityScore: number;   // ✅ 적합도 점수 (0-100, BigDecimal)
  compatibilityReason: string;  // ✅ 적합도 이유/설명
}


// ============================================
// 📦 사용자 정의 타입들
// ============================================

/**
 * 👤 사용자의 프로젝트 목록 응답
 * 
 * 📍 위치: backend/src/main/java/com/devmatch/backend/domain/project/dto/ProjectDetailResponse.java
 * 🎯 목적: 사용자의 프로젝트 목록 조회 시 사용
 * 📡 연관 API: GET /users/projects
 * 
 * 📝 ProjectDetailResponse와 동일한 구조
 */
export interface UserProjectListResponse {
  id: number;              // ✅ 프로젝트 고유 ID (PK)
  title: string;           // ✅ 프로젝트 제목
  description: string;     // ✅ 프로젝트 설명
  techStacks: string[];    // ✅ 기술 스택 목록 (쉼표 구분자로 파싱)
  teamSize: number;        // ✅ 목표 팀원 수
  currentTeamSize: number; // ✅ 현재 팀원 수
  creator: string;         // ✅ 생성자 정보
  status: ProjectStatus;   // ✅ 프로젝트 상태
  content: string | null;  // ✅ 프로젝트 상세 내용 (역할 배분, null 가능)
  createdAt: string;       // ✅ 생성일시 (ISO 8601)
  durationWeeks: number;   // ✅ 예상 진행 기간 (주 단위)
}
