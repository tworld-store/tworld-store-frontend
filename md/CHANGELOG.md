# 📝 변경 이력 (CHANGELOG)

> **프로젝트**: tworld-store-builder  
> **버전 관리 정책**: Semantic Versioning (Major.Minor.Patch)

---

## 버전 정책

### Semantic Versioning
```yaml
Major (v1.0 → v2.0):
  - 기술 스택 변경 (React → Vue 등)
  - 폴더 구조 대폭 변경
  - 타입 정의 대규모 수정
  - 호환성 깨지는 변경

Minor (v1.0 → v1.1):
  - 새 API 추가
  - 새 컴포넌트 추가
  - 새 기능 추가
  - 디자인 시스템 확장

Patch (v1.0 → v1.0.1):
  - 버그 수정
  - 오타 수정
  - 주석 보강
  - 문서 업데이트
```

### 명세서 버전 vs 프로젝트 버전
```yaml
명세서 버전:
  - 문서 자체의 버전
  - 명세서 수정 시 변경
  - 예: 명세서 v1.1

프로젝트 버전:
  - 실제 코드의 버전
  - 배포 시 변경
  - 예: 프로젝트 v0.1.0
```

---

## [명세서 v1.0] - 2025-11-06

### 📚 Added (추가됨)
- **프로젝트 명세서 초기 작성 완료**
  - 00_README.md: 프로젝트 개요 및 사용법
  - 01_기술스택_및_아키텍처.md: 기술 스택, 시스템 구조, 데이터 플로우
  - 02_폴더구조_및_파일목록.md: 전체 폴더 트리 및 파일 설명
  - 03_타입정의.md: TypeScript 인터페이스 전체 코드
  - 04_API명세.md: 모든 API 엔드포인트 및 요청/응답 타입
  - 05_디자인시스템.md: CSS 변수, 컴포넌트 스타일 전체 코드
  - 06_핵심모듈.md: calculator, api, validators 전체 코드
  - 07_컴포넌트명세.md: React 컴포넌트 props 및 함수 시그니처
  - 08_상품상세페이지_기준.md: device_detail_디자인용.html 기반 구조
  - 09_개발가이드라인.md: 코딩 규칙, Git 규칙, 테스트 가이드
  - project-status.md: 파일 생성 체크리스트
  - CHANGELOG.md: 이 파일

- **기술 스택 확정**
  - Frontend: React 18.2 + TypeScript 5.0 + Vite 5.0
  - Admin: Craft.js 0.2 (페이지 빌더)
  - Backend: Firebase Functions + Firestore
  - Data: Google Sheets + GAS (자동 동기화)
  - Hosting: Vercel (Frontend) + Firebase (Admin)

- **폴더 구조 확정**
  - admin/: React Admin (페이지 빌더)
  - frontend/: 생성된 정적 사이트
  - functions/: Firebase Functions
  - shared/: 공유 모듈 (ES6)
  - templates/: 페이지/섹션 템플릿
  - migration/: 아임웹 데이터 이전 도구

- **타입 정의 완료**
  - Product, Plan, Calculation 타입
  - Page, Section 타입
  - Form, API 타입
  - 총 100+ 인터페이스 정의

- **API 명세 완료**
  - Products API (5개 엔드포인트)
  - Pages API (5개 엔드포인트)
  - Images API (4개 엔드포인트)
  - Forms API (1개 엔드포인트)
  - Boards API (5개 엔드포인트)
  - Sync API (2개 엔드포인트)

- **디자인 시스템 완료**
  - CSS 변수 전체 정의 (colors, spacing, typography 등)
  - 컴포넌트 스타일 (button, card, form 등)
  - 레이아웃 스타일 (container, grid, flexbox 등)
  - 유틸리티 클래스

- **핵심 모듈 완료**
  - calculator.ts: 가격 계산 로직 (500줄+)
  - api.ts: API 호출 래퍼 (200줄+)
  - validators.ts: 유효성 검증 (150줄+)
  - url-builder.ts: URL 생성 유틸
  - formatters.ts: 포맷팅 유틸

- **개발 가이드라인 완료**
  - 네이밍 컨벤션 (변수, 함수, 타입, 파일)
  - 코딩 규칙 (들여쓰기, 세미콜론, 따옴표 등)
  - 주석 작성 규칙 (JSDoc, 인라인, TODO)
  - 에러 처리 규칙
  - Git 커밋 메시지 규칙
  - 테스트 작성 가이드
  - 개발 도구 설정 (ESLint, Prettier, TypeScript)

### 🎯 Decisions (의사결정)
- **상품 목록 페이지**: 7줄 상세 카드, 4열 그리드
- **상품 상세 페이지**: 좌우 분할 (45% 이미지 / 55% 옵션)
- **뱃지 시스템**: HOT/NEW/SALE (넘버링 뱃지 미사용)
- **섹션 배치**: 모든 페이지 자유 배치 가능
- **개발 방식**: 주차별 계획 없음, 일별 최선

### 📝 Notes (참고사항)
- 프로젝트 기간: 8주 (유동적)
- 예산: 월 2.5만원 운영비
- 목표 트래픽: 일 1000명
- 기준 파일: device_detail_디자인용.html

---

## [프로젝트 v0.0.0] - 2025-11-06

### 🏗️ Project Setup (프로젝트 설정)
- 프로젝트 생성 준비 완료
- 명세서 작성 완료
- 다음 단계: Phase 1 시작

---

## 향후 버전 예정

### [명세서 v1.1] - 예정
- 명세서 보완 사항 반영
- 추가 컴포넌트 명세
- API 엔드포인트 추가

### [프로젝트 v0.1.0] - Phase 1 완료 시
- Firebase 프로젝트 생성
- 디자인 시스템 구현
- 핵심 모듈 구현
- 개발 환경 설정

### [프로젝트 v0.2.0] - Phase 2 완료 시
- Admin 페이지 빌더 구현
- Craft.js 통합
- 페이지 편집 기능
- 컴포넌트 라이브러리

### [프로젝트 v0.3.0] - Phase 3 완료 시
- 이미지 관리 시스템
- 상품 관리 기능
- 게시판 시스템
- 메뉴 관리

### [프로젝트 v0.4.0] - Phase 4 완료 시
- 상담 시스템
- Google Sheets 연동
- 텔레그램 봇 연동
- 데이터 마이그레이션

### [프로젝트 v1.0.0] - 정식 배포
- 전체 기능 완성
- 테스트 완료
- 프로덕션 배포
- 도메인 연결

---

## 버전 업데이트 가이드

### 명세서 업데이트 시
1. 변경사항 파악
2. 버전 번호 결정 (Major/Minor/Patch)
3. CHANGELOG.md 업데이트
4. 모든 명세서 파일 헤더의 버전 번호 업데이트
5. 이전 버전은 `/archive/` 폴더에 보관

### 프로젝트 업데이트 시
1. 변경사항 정리
2. 버전 번호 결정
3. CHANGELOG.md 업데이트
4. package.json 버전 업데이트
5. Git 태그 생성

### 변경사항 작성 형식
```markdown
## [버전] - 날짜

### Added (추가됨)
- 새로운 기능 설명

### Changed (변경됨)
- 기존 기능 변경 사항

### Deprecated (deprecated됨)
- 곧 제거될 기능

### Removed (제거됨)
- 제거된 기능

### Fixed (수정됨)
- 버그 수정 사항

### Security (보안)
- 보안 관련 수정
```

---

## 참고 자료

- [Semantic Versioning](https://semver.org/lang/ko/)
- [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)

---

**문서 버전**: v1.0  
**최종 업데이트**: 2025-11-06  
**다음 업데이트**: 명세서 또는 프로젝트 변경 시
