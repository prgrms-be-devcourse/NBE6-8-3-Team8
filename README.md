# DevMatch 🚀
> **AI 기반 개발팀 매칭 플랫폼**  
> 개발자와 프로젝트를 지능적으로 연결하는 차세대 협업 솔루션

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://nbe-6-8-2-team08-vaug.vercel.app)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen)](https://spring.io/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](https://neon.tech/)

## 🎯 프로젝트 개요

**DevMatch**는 개발자의 기술 스택과 프로젝트 요구사항을 AI로 분석하여 최적의 매칭을 제공하는 플랫폼입니다. 
단순한 매칭을 넘어 **팀 구성의 효율성과 프로젝트 성공률을 극대화**하는 것이 목표입니다.

### ✨ 핵심 기능

- **🤖 AI 기반 매칭**: Spring AI + OpenAI를 활용한 지능형 개발자-프로젝트 매칭
- **📊 실시간 분석**: 지원자 기술 스택과 프로젝트 적합도 실시간 분석
- **🔐 소셜 인증**: Google, Kakao, Naver 통합 OAuth2 인증
- **📱 반응형 UI**: 모든 디바이스에서 최적화된 사용자 경험
- **⚡ 실시간 업데이트**: 프로젝트 상태와 지원 현황 실시간 동기화

## 🛠️ 기술 스택

### **Frontend**
- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **UI Components**: Radix UI
- **State Management**: React Context API
- **HTTP Client**: Axios

### **Backend**
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 21
- **Security**: Spring Security + JWT
- **AI Integration**: Spring AI + OpenAI
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA
- **Authentication**: OAuth2 (Google, Kakao, Naver)

### **Infrastructure & DevOps**
- **Frontend Deploy**: Vercel
- **Backend Deploy**: Railway
- **Database**: PostgreSQL on Neon
- **Version Control**: Git + GitHub
- **CI/CD**: Vercel, Railway의 자체 CI/CD 기능

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │────│   (Railway)     │────│(Neon PostgreSQL)│
│                 │    │                 │    │                 │
│ • Next.js 15    │    │ • Spring Boot   │    │ • PostgreSQL    │
│ • TypeScript    │    │ • Spring AI     │    │ • Connection    │
│ • Tailwind CSS  │    │ • JWT Security  │    │   Pool          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 실행 방법

### 사전 요구사항
- Node.js 18+
- Java 21+
- PostgreSQL

### Frontend 실행
```bash
cd frontend
npm install
npm run dev
```
🌐 http://localhost:3000

### Backend 실행
```bash
cd backend
# 환경변수 설정 (.env.default 참고)
./gradlew bootRun
```
🌐 http://localhost:8080

## 📁 프로젝트 구조

```
NBE6-8-2-Team08/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── lib/                 # API 클라이언트 및 유틸리티
│   │   ├── contexts/            # React Context
│   │   └── types/               # TypeScript 타입 정의
│   └── public/                  # 정적 파일
└── backend/
    └── src/main/java/com/devmatch/backend/
        ├── domain/              # 도메인별 패키지
        │   ├── analysis/        # AI 분석 기능
        │   ├── application/     # 지원 관리
        │   ├── auth/           # 인증/인가
        │   ├── project/        # 프로젝트 관리
        │   └── user/           # 사용자 관리
        └── global/             # 공통 설정 및 유틸리티
```

## 🔧 주요 구현 사항

### AI 매칭 알고리즘
- **기술 스택 분석**: 지원자의 기술 스택과 프로젝트 요구사항 비교
- **적합도 스코어링**: 다차원 분석을 통한 정량적 매칭 점수
- **실시간 추천**: 프로젝트별 최적 지원자 실시간 추천

### 보안 및 인증
- **JWT 기반 인증**: 무상태 토큰 기반 보안
- **OAuth2 통합**: 소셜 로그인 원클릭 지원
- **CORS 설정**: 프론트엔드-백엔드 안전한 통신

### 성능 최적화
- **코드 스플리팅**: Next.js 자동 번들 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **API 응답 캐싱**: 효율적인 데이터 로딩

## 🌐 배포 정보

- **🎨 Frontend**: [https://nbe-6-8-2-team08-vaug.vercel.app](https://nbe-6-8-2-team08-vaug.vercel.app)
- **⚙️ Backend API**: [https://devmatch-production-cf16.up.railway.app](https://devmatch-production-cf16.up.railway.app)

## 🤝 개발팀

**8팀 - DevMatch 개발팀**
- 김지원: OAuth 2.0 인증 구현, 사용자 전체 API 개발
- 백상현: 프론트 전체, AI 기반 역할 배분 및 지원서 분석 기능 연동 
- 석근호: 지원서 전체 API 개발
- 장동혁: 프로젝트 전체 API 개발
- 코드 리뷰와 신속한 문제 공유 활성화
- Github Flow 기반 협업 및 이슈 관리

---

# 개발 가이드 📋

## 브랜치 전략
브랜치 명은 크게 세 부분으로 나누어 구분하기
- 처음엔 프론트엔드(Front-End)와 백엔드(Back-End) 작업을 명확히 구분하기 위해 브랜치 이름에 `fe`, `be` 접두사를 사용하기
- 중간에는 라벨명 표기
- 마지막엔 issue의 넘버 표기

### 예시  
- `fe/enhancement/23`  
- `be/maintenance/34`

---

## Git Issue 활용 방식

Git Issue는 **프로젝트 완성을 위해 개발자가 수행해야 하는 기능 단위 작업을 세분화**해서 관리하기

- 자신이 맡은 기능을 **기능 단위로 쪼개어 Issue 등록**
- Issue 제목은 간결하게, 내용은 구체적으로 작성
- 할당(Assignee), 라벨(Labels), 유형(Type) 등을 활용해 업무 분류

### 예시

- **제목:** [BE] 유저 로그인 API 구현
- **내용:**
  - 개요: 서용자 인증 정보 검증 및 인증 토큰 발행
  - 작업 내용:
    - [ ] JWT 발행
    - [ ] 컨트롤러 구현
    - [ ] 서비스 구현

---

## 커밋 메시지 작성 규칙

### 커밋 메시지 구조

> 헤더, 본문은 빈 행으로 구분한다.

```
[개발 분야] 타입: 제목

본문
```

1. 제목은 50글자 이내로 작성한다.
2. 제목, 본문의 첫 글자가 영문일 경우 대문자로 작성한다.
3. 제목, 본문 둘 다 마침표를 사용하지 않는다.
4. 본문의 각 행은 72글자 이내로 작성한다.
5. 제목은 뭘 했는지, 본문은 왜 or 기대 효과를 간결하게 적는다.
6. 개발 분야는 `BE` 혹은 `FE` 라고 표기한다.
7. 타입은 아래의 표를 참고하여 작성한다.

| 타입 이름    | 설명                                      |
|-------------|-------------------------------------------|
| feat        | 새로운 기능에 대한 커밋                     |
| fix         | 버그 수정에 대한 커밋                       |
| build       | 빌드 관련 파일 수정 / 모듈 설치 또는 삭제    |
| chore       | 그 외 자잘한 수정에 대한 커밋               |
| ci          | CI 관련 설정 수정에 대한 커밋               |
| docs        | 문서 수정에 대한 커밋                       |
| style       | 코드 스타일 혹은 포맷 등에 관한 커밋         |
| refactor    | 코드 리팩토링에 대한 커밋                   |
| test        | 테스트 코드 수정에 대한 커밋                |
| perf        | 성능 개선에 대한 커밋                       |

### 예시

`[BE] feat: Projects 생성 API 작성`

```
[BE] refactor: For문 코드 stream으로 변경

* Stream을 통한 코드 간결화
* 체이닝 방식을 통한 가독성 향상
```
