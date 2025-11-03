# 티월드스토어 (T World Store)

SKT 휴대폰 판매 상담 연결 사이트

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)]()

## 📱 프로젝트 소개

티월드스토어는 SKT 휴대폰 구매를 원하는 고객과 전문 상담원을 연결하는 웹사이트입니다.
- 실시간 가격 계산
- 다양한 할부 옵션
- 지원금 자동 계산
- 모바일 최적화

## 🚀 주요 기능

### 1. 기기 검색 및 필터링
- 브랜드별 분류 (삼성, 애플, 기타)
- 가격순, 최신순 정렬
- 실시간 재고 확인

### 2. 가격 계산기
- 할부 개월 선택 (일시불 ~ 36개월)
- 가입 유형별 지원금 (기기변경/번호이동/신규가입)
- 요금제별 추가 지원금
- 실시간 월 납부액 계산

### 3. 상담 연결
- 전화 상담 (1600-8939)
- 카카오톡 상담
- 온라인 문의

## 🛠️ 기술 스택

### Frontend
- **HTML5** - 시맨틱 마크업
- **CSS3** - Flexbox, Grid, CSS Variables
- **JavaScript ES6+** - Async/Await, Class, Modules

### Libraries
- **Swiper.js v10** - 터치 기반 슬라이더
- **No Framework** - Vanilla JavaScript로 경량화

### Backend & Data
- **Google Sheets** - 데이터 관리
- **Google Apps Script** - 자동화 및 API
- **GitHub Pages** - 정적 파일 호스팅
- **CloudFlare CDN** - 캐싱 및 배포

## 📂 프로젝트 구조

```
tworld-store-frontend/
├─ index.html              # 메인 페이지
├─ devices.html            # 기기 목록 페이지
├─ device-detail.html      # 기기 상세 페이지
│
├─ assets/
│   ├─ css/
│   │   ├─ reset.css       # CSS 초기화
│   │   ├─ common.css      # 공통 스타일 (헤더/푸터)
│   │   ├─ main.css        # 메인 페이지 스타일
│   │   ├─ devices.css     # 기기 목록 스타일
│   │   └─ device-detail.css # 기기 상세 스타일
│   │
│   ├─ js/
│   │   ├─ config.js       # 전역 설정
│   │   ├─ utils.js        # 유틸리티 함수
│   │   ├─ api.js          # DataAPI 클래스
│   │   ├─ calculator.js   # PriceCalculator 클래스
│   │   ├─ main.js         # 메인 페이지 로직
│   │   ├─ devices.js      # 기기 목록 로직
│   │   └─ device-detail.js # 기기 상세 로직
│   │
│   └─ images/
│       ├─ logo.svg
│       ├─ banners/
│       └─ placeholder/
│
├─ data/
│   └─ products.json       # 상품 데이터 (별도 Repository)
│
├─ .gitignore
└─ README.md
```

## 🌐 배포

### Production
- **URL**: https://tworld-store.com
- **호스팅**: GitHub Pages + CloudFlare CDN
- **SSL**: CloudFlare Universal SSL

### 배포 방법

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/tworld-store-frontend.git

# 2. GitHub Pages 자동 배포
git push origin main
```

## 💻 로컬 개발

### 요구사항
- 웹 브라우저 (Chrome, Safari, Firefox)
- Live Server (VS Code Extension) 또는 로컬 서버

### 실행 방법

```bash
# VS Code Live Server 사용
1. VS Code에서 프로젝트 열기
2. index.html 우클릭
3. "Open with Live Server" 클릭

# 또는 Python 간이 서버
python -m http.server 8080

# 또는 Node.js 간이 서버
npx live-server
```

브라우저에서 `http://localhost:8080` 접속

## 🧪 테스트

### 브라우저 호환성
- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+

### 모바일 지원
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

### 반응형 브레이크포인트
- Mobile: 0 ~ 767px
- Tablet: 768px ~ 1023px
- Desktop: 1024px ~ 1439px
- Large Desktop: 1440px+

## 📊 성능

### 파일 크기
- HTML: 42KB (3개)
- CSS: 62KB (5개)
- JavaScript: 93KB (7개)
- **총합: 197KB** (Gzip 후 약 50KB)

### 로딩 속도
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Lighthouse Score: 90+

## 🔒 보안

- **HTTPS Only** - CloudFlare SSL
- **CORS 설정** - GitHub Pages 기본 허용
- **XSS 방지** - HTML Sanitization
- **데이터 분리** - 민감 정보 별도 관리

## 📝 라이선스

Copyright © 2024 T World Store. All rights reserved.

이 프로젝트는 비공개 소유권 소프트웨어입니다.

## 👥 기여

현재 비공개 프로젝트로 외부 기여를 받지 않습니다.

## 📞 문의

- **전화**: 1600-8939
- **운영시간**: 평일 09:00 - 22:00, 주말 10:00 - 19:00
- **카카오톡**: [@티월드스토어](https://pf.kakao.com/_example)
- **이메일**: support@tworld-store.com

## 🗺️ 로드맵

### Phase 1 (완료)
- [x] 프론트엔드 개발
- [x] GitHub Pages 배포
- [x] CloudFlare CDN 연동

### Phase 2 (진행 중)
- [ ] 이미지 최적화
- [ ] SEO 최적화
- [ ] Google Analytics 연동

### Phase 3 (예정)
- [ ] Admin 페이지 개발
- [ ] 실시간 재고 관리
- [ ] 고객 상담 내역 관리

---

**Last Updated**: 2024-11-03
**Version**: 1.0.0
