# API Documentation (백엔드 실제 응답 기준)

이 문서는 **백엔드에서 실제로 프론트엔드에게 전달하는 데이터 구조**를 기반으로 작성되었습니다.

## 공통 응답 구조

대부분의 API는 `ApiResponse<T>` 래퍼로 감싸져서 응답됩니다:

```typescript
interface ApiResponse<T> {
  msg: string;      // 응답 메시지
  data: T;          // 실제 데이터
}
```

**예외**: 일부 엔드포인트는 데이터를 직접 반환합니다 (래퍼 없음).

## 베이스 URL
```
http://localhost:8080
```

## 인증
OAuth2를 사용한 소셜 로그인(구글, 카카오, 네이버)을 지원합니다.
- 로그인 성공 시 `apiKey`와 `accessToken` 쿠키가 설정됩니다.
- 인증이 필요한 API는 쿠키에 `apiKey`와 `accessToken`이 있어야 합니다.

## API 엔드포인트

### 1. 인증 (Auth) API

#### 1.1 OAuth2 로그인
```
GET /oauth2/authorization/{provider}?redirectUrl={redirectUrl}
```
- `provider`: google, kakao, naver 중 하나
- `redirectUrl`: 로그인 성공 후 리다이렉트할 URL (Base64 URL-safe 인코딩 필요)

#### 1.2 로그아웃
```
DELETE /auth/logout
```

**응답:**
```json
{
  "msg": "로그아웃 되었습니다.",
  "data": null
}
```

### 2. 사용자 (User) API

#### 2.1 현재 사용자 프로필 조회
```
GET /users/profile
```
- **Response**: `User` (래퍼 없음)

#### 2.2 내가 생성한 프로젝트 목록
```
GET /users/projects  
```
- **Response**: `ProjectDetailResponse[]` (래퍼 없음)

#### 2.3 내가 지원한 프로젝트 목록
```
GET /users/applications
```
- **Response**: `ApplicationDetailResponseDto[]` (래퍼 없음)


### 3. 프로젝트 (Project) API

#### 3.1 프로젝트 생성
```
POST /projects
```
- **Request Body**:
```typescript
interface ProjectCreateRequest {
  title: string;          // 1-200자
  description: string;    // 1-2000자  
  techStack: string;      // 1-500자 (쉼표로 구분된 문자열)
  teamSize: number;       // 최소 1
  durationWeeks: number;  // 최소 1
}
```
- **Response**: `ApiResponse<ProjectDetailResponse>`

#### 3.2 프로젝트 전체 조회
```
GET /projects
```
- **Response**: `ApiResponse<ProjectDetailResponse[]>`

#### 3.3 프로젝트 단일 조회
```
GET /projects/{id}
```
- **Response**: `ApiResponse<ProjectDetailResponse>`

#### 3.4 프로젝트 상태 수정
```
PATCH /projects/{id}/status
```
- **Request Body**:
```typescript
interface ProjectStatusUpdateRequest {
  status: ProjectStatus;
}

type ProjectStatus = "RECRUITING" | "COMPLETED";
// 주의: IN_PROGRESS는 백엔드에 존재하지 않음
```
- **Response**: `ApiResponse<ProjectDetailResponse>`

#### 3.5 프로젝트 내용 수정 (역할 배분)
```
PATCH /projects/{id}/content
```
- **Request Body**:
```typescript
interface ProjectContentUpdateRequest {
  content: string;  // 1-2000자
}
```
- **Response**: `ApiResponse<ProjectDetailResponse>`

#### 3.6 프로젝트 삭제
```
DELETE /projects/{id}
```
- **Response**: `204 No Content` (응답 본문 없음)

#### 3.7 프로젝트 지원서 목록 조회
```
GET /projects/{id}/applications
```
- **Response**: `ApiResponse<ApplicationDetailResponseDto[]>`

#### 3.8 프로젝트 지원
```
POST /projects/{id}/applications
```
- **Request Body**:
```typescript
interface ProjectApplyRequest {
  techStacks: string[];   // 기술 스택 배열
  techScores: number[];   // 각 기술에 대한 점수 배열
}
```
- **Response**: `ApiResponse<ApplicationDetailResponseDto>`


### 4. 지원서 (Application) API

#### 4.1 지원서 상세 조회
```
GET /applications/{id}
```

**경로 매개변수:**
- `id` (long): 지원서 ID

**응답:**
```json
{
  "msg": "1 번 지원서의 상세 정보 조회를 성공했습니다.",
  "data": {
    "applicationId": 1,
    "user": {
      "nickName": "홍길동"
    },
    "status": "PENDING",
    "appliedAt": "2024-01-01T10:00:00"
  }
}
```


#### 4.2 지원서 삭제
```
DELETE /applications/{id}
```

**경로 매개변수:**
- `id` (long): 지원서 ID

**응답:**
```json
{
  "msg": "지원서의 삭제를 성공했습니다.",
  "data": null
}
```

#### 4.3 지원서 상태 업데이트
```
PATCH /applications/{id}/status
```

**경로 매개변수:**
- `id` (long): 지원서 ID

**요청 본문:**
```json
{
  "status": "APPROVED"
}
```

**응답:**
```json
{
  "msg": "지원서 상태를 업데이트했습니다.",
  "data": null
}
```

### 4. 분석 (Analysis) API

#### 4.1 지원서 분석 결과 조회
```
GET /analysis/application/{applicationId}
```
- **Response**: `ApiResponse<AnalysisResultResponse>`

#### 4.2 지원서 분석 결과 생성
```
POST /analysis/application/{applicationId}
```
- **Response**: `ApiResponse<AnalysisResultResponse>`

#### 4.3 팀 역할 분배 생성
```
POST /analysis/project/{projectId}/role-assignment
```
- **Response**: `ApiResponse<string>` (역할 분배 문자열)

## 프로젝트 응답 데이터 구조

```typescript
interface ProjectDetailResponse {
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
```

## 사용자 데이터 구조

```typescript
interface User {
  id: number;
  username: string;           // 유니크 사용자명
  password: string;           // 암호화된 비밀번호
  nickname: string;           // 표시명
  apiKey: string;            // 리프레시 토큰
  profileImgUrl: string | null;
}
```

## 지원서 관련 데이터 구조

```typescript
interface ApplicationDetailResponseDto {
  applicationId: number;      // 지원서 ID
  nickname: string;          // 지원자 닉네임 (직접 필드)
  status: ApplicationStatus; // 지원서 상태
  appliedAt: string;         // 지원 일시 (ISO 문자열)
}

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
```

## 분석 결과 데이터 구조

```typescript
interface AnalysisResultResponse {
  id: number;
  applicationId: number;
  compatibilityScore: number;    // BigDecimal → number
  compatibilityReason: string;
}
```

## 중요 사항

### 1. 데이터 타입 변환
- **LocalDateTime** → **string** (ISO 8601 형식)
- **BigDecimal** → **number**
- **enum** → **string literal types**

### 2. 프로젝트 상태
- 백엔드에는 `RECRUITING`, `COMPLETED` 두 상태만 존재
- `IN_PROGRESS`는 프론트엔드에서만 사용하는 상태

### 3. 기술 스택 처리
- **생성 시**: `techStack` (문자열, 쉼표로 구분)
- **응답 시**: `techStacks` (문자열 배열)
- **지원 시**: `techStacks` (문자열 배열)

### 4. API 래퍼 사용 여부
- **ApiResponse 래퍼 사용**: 대부분의 CRUD 엔드포인트
- **직접 반환**: `/users/profile`, `/users/projects`, `/users/applications`

### 5. 검증 규칙
- `title`: 1-200자
- `description`: 1-2000자
- `techStack`: 1-500자
- `content`: 1-2000자
- `teamSize`, `durationWeeks`: 최소 1

이 문서는 실제 백엔드 코드 분석을 통해 작성되었으며, 프론트엔드에서 실제로 받는 데이터 구조와 정확히 일치합니다.
