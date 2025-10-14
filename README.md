# SKT 휴대폰 쇼핑몰 - 프론트엔드

## 📋 프로젝트 개요

1인 운영 가능한 휴대폰 판매 상담 연결 사이트의 프론트엔드입니다.

### 주요 기능
- 기기 선택 (색상, 용량)
- 요금제 선택
- 가입유형 선택 (기기변경, 번호이동, 신규가입)
- **약정 유형 선택** (지원금약정 vs 선택약정)
- **할부 개월수 선택** (0, 12, 24, 36개월)
- 실시간 가격 계산
- 상담 신청

## 🏗️ 파일 구조

```
├── calculator.html          # 가격 계산 페이지 (메인)
├── css/
│   ├── main.css            # 공통 스타일
│   └── calculator.css      # 계산기 전용 스타일
├── js/
│   ├── api.js              # 데이터 로드 (products.json)
│   ├── calculator.js       # Alpine.js 메인 로직
│   └── common.js           # 공통 유틸리티
└── README.md
```

## 🚀 배포 방법

### 1. GitHub Pages 설정

1. GitHub에 새 Repository 생성
   - 이름: `tworld-store-frontend` (원하는 이름)
   - Public으로 설정

2. 파일 업로드
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/tworld-store-frontend.git
   git push -u origin main
   ```

3. GitHub Pages 활성화
   - Repository > Settings > Pages
   - Source: `main` branch, `/ (root)` 선택
   - Save

4. 배포 URL
   ```
   https://USERNAME.github.io/tworld-store-frontend/
   ```

### 2. API URL 설정

`js/api.js` 파일에서 데이터 소스 URL을 수정하세요:

```javascript
// 기본값
DATA_URL: 'https://YOUR-USERNAME.github.io/tworld-store-data/data/products.json',

// 실제 배포 후
DATA_URL: 'https://실제사용자명.github.io/실제저장소명/data/products.json',
```

## 📊 데이터 구조

### products.json 예시

```json
{
  "deviceOptions": [
    {
      "기기옵션ID": "SAM_GS24_256_BLK",
      "브랜드": "삼성",
      "모델명": "갤럭시 S24",
      "색상명": "팬텀블랙",
      "색상HEX": "#1a1a1a",
      "용량": 256,
      "출고가": 1200000,
      "이미지URL": "https://...",
      "노출여부": "Y"
    }
  ],
  "plans": [
    {
      "요금제ID": "5GX_PLAT",
      "요금제명": "5GX 플래티넘",
      "카테고리명": "5GX",
      "카테고리아이콘": "🚀",
      "기본요금": 125000,
      "주요혜택1": "데이터 무제한",
      "주요혜택2": "통화 무제한",
      "노출여부": "Y"
    }
  ],
  "subsidies": {
    "change": [
      {
        "기기옵션ID": "SAM_GS24_256_BLK",
        "요금제ID": "5GX_PLAT",
        "공통지원금": 350000,
        "추가지원금": 150000,
        "선약지원금": 200000,
        "노출여부": "Y"
      }
    ],
    "port": [...],
    "new": [...]
  }
}
```

## 🔧 기술 스택

- **HTML5** - 시맨틱 마크업
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Alpine.js** - 반응형 UI
- **Vanilla JavaScript** - 프레임워크 없는 순수 JS

### 왜 프레임워크 없이?
- ✅ 2초 미만 로딩 속도
- ✅ 1인 운영에 최적화
- ✅ 번들러 없이 즉시 배포
- ✅ 낮은 진입 장벽

## 💰 가격 계산 로직

### 약정 유형별 계산

**1. 지원금약정**
```
기기 최종 가격 = 출고가 - 공통지원금 - 추가지원금
월 요금제 = 기본요금 (할인 없음)
```

**2. 선택약정**
```
기기 최종 가격 = 출고가 - 선약지원금
월 요금제 = 기본요금 × 0.75 (25% 할인)
선택약정할인총액 = 기본요금 × 0.25 × 24개월
```

### 할부 계산 (원리금균등상환)

```javascript
// 연 5.9% 이자율
const monthlyRate = 5.9 / 100 / 12;

// 월 납부액
const monthly = principal * 
  (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
  (Math.pow(1 + monthlyRate, months) - 1);
```

## 🎨 커스터마이징

### 색상 변경
`css/main.css` 또는 Tailwind CSS 클래스 수정

```css
/* 메인 색상 */
--primary: #2563eb;    /* 파란색 */
--success: #10b981;    /* 초록색 */
--warning: #f59e0b;    /* 주황색 */
--danger: #ef4444;     /* 빨간색 */
```

### 이자율 변경
`js/calculator.js`에서 수정

```javascript
interestRate: 5.9 / 100 / 12,  // 연 5.9%
```

## 📱 반응형 디자인

- **모바일**: ~768px
- **태블릿**: 769px~1024px
- **데스크톱**: 1025px~

## 🔗 연동 필요 사항

### 1. 백엔드 (Google Apps Script)
- 스프레드시트에서 데이터 수집
- JSON 파일 생성
- GitHub API로 업로드

### 2. 데이터 저장소
- GitHub Repository (products.json 호스팅)
- 1시간마다 자동 업데이트

### 3. 상담 신청 폼
- `contact.html` 페이지 (별도 개발 필요)
- GAS Web App으로 데이터 전송
- 주문내역 시트에 저장

## 🐛 트러블슈팅

### 데이터가 로드되지 않을 때
1. 브라우저 개발자 도구 (F12) 열기
2. Console 탭에서 에러 확인
3. Network 탭에서 products.json 요청 확인
4. API URL이 올바른지 확인

### CORS 에러
- GitHub Pages는 CORS 문제 없음
- 로컬 테스트 시에는 Live Server 사용 권장

### 가격 계산이 안될 때
1. 지원금 데이터가 있는지 확인
2. 노출여부가 'Y'인지 확인
3. 기기옵션ID, 요금제ID가 정확한지 확인

## 📝 TODO

- [ ] contact.html (상담 신청 페이지)
- [ ] index.html (메인 페이지)
- [ ] devices.html (기기 목록)
- [ ] plans.html (요금제 목록)
- [ ] about.html (회사 소개)
- [ ] terms.html (이용약관)
- [ ] privacy.html (개인정보처리방침)

## 📄 라이센스

MIT License

## 👤 작성자

SKT 프로젝트팀
