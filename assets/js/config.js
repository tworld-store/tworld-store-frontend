/**
 * 프로젝트 전역 설정 - config.js
 * 
 * API URL, 상수, 환경 변수 등을 정의합니다.
 */

// ============================================
// API 설정
// ============================================

/**
 * API 기본 URL
 * @type {Object}
 */
const API_CONFIG = {
  // GitHub Pages에서 호스팅되는 products.json URL
  // 상대 경로 사용 (자동으로 올바른 경로 찾음)
  PRODUCTS_JSON: './data/products.json',
  
  // 로컬 개발 환경 (상대 경로)
  PRODUCTS_JSON_LOCAL: './data/products.json',
  
  // Google Sheets API (상담 신청용)
  // 실제 GAS 배포 후 URL로 교체
  GOOGLE_SHEETS_API: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  
  // 타임아웃 (밀리초)
  TIMEOUT: 10000
};

/**
 * 현재 환경 감지
 * @returns {string} 'development' | 'production'
 */
function getEnvironment() {
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  return 'production';
}

/**
 * 환경에 따른 API URL 반환
 * @returns {string} products.json URL
 */
function getProductsAPIURL() {
  const env = getEnvironment();
  const baseUrl = env === 'development' 
    ? API_CONFIG.PRODUCTS_JSON_LOCAL 
    : API_CONFIG.PRODUCTS_JSON;
  
  // 캐시 무효화를 위한 타임스탬프 파라미터 추가
  // 매 요청마다 새로운 URL을 생성하여 브라우저 캐시 우회
  const cacheBuster = `v=${Date.now()}`;
  
  // URL에 이미 쿼리 파라미터가 있는지 확인
  const separator = baseUrl.includes('?') ? '&' : '?';
  
  return `${baseUrl}${separator}${cacheBuster}`;
}

// ============================================
// 앱 설정
// ============================================

/**
 * 앱 전역 설정
 * @type {Object}
 */
const APP_CONFIG = {
  // 사이트명
  SITE_NAME: '티월드스토어',
  
  // 상담 전화번호
  PHONE_NUMBER: '1600-8939',
  
  // 카카오톡 링크
  KAKAO_LINK: 'https://pf.kakao.com/',
  
  // 디버그 모드 (콘솔 로그 출력 여부)
  DEBUG: true
};

// ============================================
// 가격 계산 설정
// ============================================

/**
 * 가격 계산 관련 설정
 * @type {Object}
 */
const PRICE_CONFIG = {
  // 할부 이자율 (연 5.9%)
  INTEREST_RATE: 0.059,
  
  // 반올림 단위 (1원 단위)
  ROUND_UNIT: 1,
  
  // 선택약정 할인율 (25%)
  SELECTIVE_DISCOUNT_RATE: 0.25,
  
  // 할부 개월 옵션
  INSTALLMENT_OPTIONS: [24, 30, 36],
  
  // 기본 할부 개월
  DEFAULT_INSTALLMENT: 24
};

// ============================================
// 가입 유형
// ============================================

/**
 * 가입 유형 정의
 * @type {Object}
 */
const SUBSCRIPTION_TYPES = {
  CHANGE: {
    id: 'change',
    name: '기기변경',
    description: '현재 SKT를 사용 중이며 번호 유지'
  },
  PORT: {
    id: 'port',
    name: '번호이동',
    description: '타사에서 SKT로 통신사 변경'
  },
  NEW: {
    id: 'new',
    name: '신규가입',
    description: '새로운 번호로 SKT 가입'
  }
};

// ============================================
// 할인 유형
// ============================================

/**
 * 할인 유형 정의
 * @type {Object}
 */
const DISCOUNT_TYPES = {
  SUBSIDY: {
    id: 'subsidy',
    name: '공시지원',
    description: '기기 구매 시 지원금을 받는 방식'
  },
  SELECTIVE: {
    id: 'selective',
    name: '선택약정',
    description: '요금제 할인을 받는 방식 (25% 할인)'
  }
};

// ============================================
// UI 설정
// ============================================

/**
 * UI 관련 설정
 * @type {Object}
 */
const UI_CONFIG = {
  // 로딩 딜레이 (밀리초)
  LOADING_DELAY: 300,
  
  // 애니메이션 지속 시간 (밀리초)
  ANIMATION_DURATION: 300,
  
  // 스크롤 오프셋 (px)
  SCROLL_OFFSET: 100,
  
  // 모바일 브레이크포인트 (px)
  MOBILE_BREAKPOINT: 767,
  
  // 태블릿 브레이크포인트 (px)
  TABLET_BREAKPOINT: 1023
};

// ============================================
// 에러 메시지
// ============================================

/**
 * 에러 메시지 정의
 * @type {Object}
 */
const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  API_ERROR: '데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.',
  NOT_FOUND: '요청하신 정보를 찾을 수 없습니다.',
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.'
};

// ============================================
// 로컬 스토리지 키
// ============================================

/**
 * 로컬 스토리지 키 정의
 * @type {Object}
 */
const STORAGE_KEYS = {
  // 최근 본 기기
  RECENT_DEVICES: 'tworld_recent_devices',
  
  // 마지막 선택 옵션
  LAST_SELECTIONS: 'tworld_last_selections',
  
  // 캐시된 products.json
  CACHED_PRODUCTS: 'tworld_cached_products',
  
  // 캐시 만료 시간
  CACHE_EXPIRY: 'tworld_cache_expiry'
};

// ============================================
// 캐시 설정
// ============================================

/**
 * 캐시 관련 설정
 * @type {Object}
 */
const CACHE_CONFIG = {
  // 캐시 유효 시간 (밀리초, 1시간)
  EXPIRY_TIME: 60 * 60 * 1000,
  
  // 캐시 사용 여부 (개발 중 비활성화)
  ENABLED: false
};

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 디버그 로그 출력
 * @param {...any} args - 로그 인자
 */
function debugLog(...args) {
  if (APP_CONFIG.DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * 에러 로그 출력
 * @param {...any} args - 로그 인자
 */
function errorLog(...args) {
  console.error('[ERROR]', ...args);
}

/**
 * 경고 로그 출력
 * @param {...any} args - 로그 인자
 */
function warnLog(...args) {
  console.warn('[WARN]', ...args);
}

// ============================================
// 전역 Export (필요시 사용)
// ============================================

// Node.js 환경에서 사용 가능하도록 (필요시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_CONFIG,
    APP_CONFIG,
    PRICE_CONFIG,
    SUBSCRIPTION_TYPES,
    DISCOUNT_TYPES,
    UI_CONFIG,
    ERROR_MESSAGES,
    STORAGE_KEYS,
    CACHE_CONFIG,
    getEnvironment,
    getProductsAPIURL,
    debugLog,
    errorLog,
    warnLog
  };
}

// ============================================
// 초기화 로그
// ============================================

debugLog('Config 로드 완료', {
  environment: getEnvironment(),
  apiUrl: getProductsAPIURL(),
  debug: APP_CONFIG.DEBUG
});
