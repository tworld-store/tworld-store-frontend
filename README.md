# 티월드스토어 웹빌더

> 아임웹에서 자체 웹빌더로 전환 - products.json 기반 프로젝트

## 📌 프로젝트 개요

- **목적**: 아임웹 → 자체 웹빌더 전환
- **데이터 소스**: Google Sheets → products.json (GitHub)
- **GitHub 저장소**: tworld-store-frontend
- **JSON 경로**: tworld-store-frontend/data/products.json
- **기간**: 8주 (유동적)
- **예산**: 월 2.5만원 운영비

## 🎯 핵심 특징

### products.json 중심 설계
```
Google Sheets (마스터 데이터)
    ↓ GAS (1시간 주기)
products.json 생성
    ↓ GitHub Push
tworld-store-frontend/data/products.json
    ↓ CDN
Frontend에서 사용
```

### 데이터 구조
- **devices[]**: 기기 목록 (브랜드, 모델, 용량, 색상, 가격)
- **plans[]**: 요금제 목록 (카테고리, 가격, 데이터, 혜택)
- **subsidies{}**: 지원금 (기기변경/번호이동/신규가입)
- **settings{}**: 전역 설정 (이자율, 할인율, 동기화 시간)

## 🛠️ 기술 스택

### Frontend
- React 18.2 + TypeScript 5.0
- Vite 5.0
- Zustand 4.4 (상태 관리)
- Ant Design 5.12 (UI)

### Admin
- Craft.js 0.2 (페이지 빌더)
- TinyMCE 6.0 (에디터)
- React DnD 16.0 (드래그앤드롭)

### Backend
- Firebase Functions + Firestore
- Google Sheets + GAS
- Cloudinary (이미지)

### Hosting
- Vercel (Frontend)
- Firebase (Admin)
- GitHub (products.json)

## 📁 프로젝트 구조

```
tworld-store-builder/
├── shared/              # 공유 모듈
│   ├── types/           # TypeScript 타입 (products.json 기반)
│   ├── modules/         # calculator, api, validators
│   ├── errors/          # 커스텀 에러
│   ├── design-system/   # CSS 변수, 컴포넌트 스타일
│   └── data/            # products.json 예시
│
├── admin/               # React Admin (페이지 빌더)
├── frontend/            # 생성된 정적 사이트
├── functions/           # Firebase Functions
├── templates/           # 페이지/섹션 템플릿
└── migration/           # 아임웹 데이터 이전 도구
```

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 수정
```

### 2. 개발 서버 실행

```bash
# Admin 개발 서버
npm run dev:admin

# Frontend 개발 서버
npm run dev:frontend
```

### 3. 빌드 및 배포

```bash
# Admin 빌드
npm run build:admin

# Frontend 빌드
npm run build:frontend

# 전체 배포
npm run deploy:all
```

## 📚 주요 문서

- [products.json 구조](./docs/PRODUCTS_JSON_STRUCTURE.md) ⭐ **필독**
- [00_README.md](./docs/00_README.md) - 프로젝트 개요
- [03_타입정의.md](./docs/03_타입정의.md) - TypeScript 타입
- [06_핵심모듈.md](./docs/06_핵심모듈.md) - calculator, api, validators
- [09_개발가이드라인.md](./docs/09_개발가이드라인.md) - 코딩 규칙

## 🔄 데이터 흐름

### 상품 데이터 동기화
```
Google Sheets 수정
  ↓
GAS 트리거 (1시간 또는 수동)
  ↓
products.json 생성
  ↓
GitHub tworld-store-frontend/data/ 업로드
  ↓
Frontend에서 fetch
  ↓
상품 목록/상세 표시
```

### 가격 계산
```
사용자 옵션 선택
  ↓
products.json에서 데이터 조회
  - device (출고가)
  - plan (요금제 가격)
  - subsidy (지원금)
  ↓
calculator.ts로 계산
  ↓
최종 가격 표시
```

## 📦 Phase별 진행

- [ ] **Phase 1**: 인프라 + 디자인 시스템
- [ ] **Phase 2**: Admin 페이지 빌더
- [ ] **Phase 3**: 콘텐츠 관리
- [ ] **Phase 4**: 상담 시스템 + 마이그레이션

## 🔧 개발 규칙

### 코딩 스타일
- 들여쓰기: 스페이스 2칸
- 세미콜론: 필수
- 따옴표: 작은따옴표 (JSX는 큰따옴표)
- 명명: camelCase (변수), PascalCase (컴포넌트/타입)

### Git 커밋
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드, 설정 변경
```

## ⚠️ 중요 사항

### products.json 의존성
- **모든 타입 정의는 products.json 구조를 따름**
- **API 응답도 products.json 구조 사용**
- **타입 변경 시 products.json과 동기화 필수**

### GitHub 저장소
- 저장소: tworld-store-frontend
- JSON 경로: /data/products.json
- 접근 URL: https://raw.githubusercontent.com/tworld-store-frontend/tworld-store-frontend/main/data/products.json

## 📞 문의

- 프로젝트 담당자: 티월드스토어
- GitHub: tworld-store-frontend

## 📄 라이선스

UNLICENSED - 비공개 프로젝트
