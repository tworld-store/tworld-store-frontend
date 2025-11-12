/**
 * 프로젝트 전역 상수
 * 
 * @module modules/constants
 * @version 1.0.0
 */

/**
 * products.json URL
 * GitHub Raw URL
 */
export const PRODUCTS_JSON_URL =
  'https://raw.githubusercontent.com/tworld-store-frontend/tworld-store-frontend/main/data/products.json';

/**
 * 할부 개월 옵션
 */
export const INSTALLMENT_MONTHS = [0, 12, 24, 36] as const;

/**
 * 약정 유형
 */
export const CONTRACT_TYPES = {
  PUBLIC_SUBSIDY: '공시지원',
  SELECTIVE_DISCOUNT: '선택약정',
} as const;

/**
 * 가입 유형 코드 → 한글명 매핑
 */
export const JOIN_TYPE_LABELS = {
  change: '기기변경',
  transfer: '번호이동',
  new: '신규가입',
} as const;

/**
 * 브랜드 코드 → 한글명 매핑
 */
export const BRAND_LABELS = {
  samsung: '삼성',
  apple: '애플',
  etc: '기타',
} as const;

/**
 * 기본 할부 이자율 (5.9%)
 */
export const DEFAULT_INSTALLMENT_INTEREST_RATE = 0.059;

/**
 * 기본 선택약정 할인율 (25%)
 */
export const DEFAULT_SELECTIVE_DISCOUNT_RATE = 0.25;

/**
 * 부가세율 (10%)
 */
export const VAT_RATE = 0.1;

/**
 * 결합할인율
 */
export const BUNDLE_DISCOUNT_RATES = {
  INTERNET: 0.05,      // 인터넷 결합 5%
  INTERNET_TV: 0.10,   // 인터넷+TV 결합 10%
} as const;

/**
 * 최소/최대 가격 제한
 */
export const PRICE_LIMITS = {
  MIN_DEVICE_PRICE: 100000,      // 최소 기기 출고가 10만원
  MAX_DEVICE_PRICE: 3000000,     // 최대 기기 출고가 300만원
  MIN_PLAN_PRICE: 30000,         // 최소 요금제 3만원
  MAX_PLAN_PRICE: 200000,        // 최대 요금제 20만원
} as const;

/**
 * 이미지 설정
 */
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
  SUPPORTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  THUMBNAIL_SIZE: 200,              // 썸네일 크기 (px)
  PRODUCT_IMAGE_SIZE: 800,          // 상품 이미지 크기 (px)
} as const;

/**
 * 페이지네이션 설정
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,            // 기본 페이지당 상품 수
  MAX_PAGE_SIZE: 48,                // 최대 페이지당 상품 수
  GRID_COLUMNS: {
    DESKTOP: 4,                     // 데스크톱 그리드 열 수
    TABLET: 3,                      // 태블릿 그리드 열 수
    MOBILE: 2,                      // 모바일 그리드 열 수
  },
} as const;

/**
 * 캐시 설정 (밀리초)
 */
export const CACHE_CONFIG = {
  PRODUCTS_TTL: 60 * 60 * 1000,     // 상품 캐시 1시간
  PLANS_TTL: 60 * 60 * 1000,        // 요금제 캐시 1시간
  PAGES_TTL: 10 * 60 * 1000,        // 페이지 캐시 10분
  IMAGES_TTL: 24 * 60 * 60 * 1000,  // 이미지 캐시 24시간
} as const;

/**
 * API 설정
 */
export const API_CONFIG = {
  TIMEOUT: 30000,                    // API 타임아웃 30초
  RETRY_ATTEMPTS: 3,                 // 재시도 횟수
  RETRY_DELAY: 1000,                 // 재시도 대기 시간 (ms)
} as const;

/**
 * 에러 코드
 */
export const ERROR_CODES = {
  // 일반 에러
  UNKNOWN: 'E000',
  INVALID_INPUT: 'E001',
  NOT_FOUND: 'E004',
  
  // 네트워크 에러
  NETWORK_ERROR: 'E100',
  TIMEOUT: 'E101',
  
  // products.json 관련 에러
  PRODUCTS_LOAD_FAILED: 'E200',
  INVALID_PRODUCTS_DATA: 'E201',
  DEVICE_NOT_FOUND: 'E202',
  PLAN_NOT_FOUND: 'E203',
  SUBSIDY_NOT_FOUND: 'E204',
  
  // 계산 에러
  CALCULATION_ERROR: 'E400',
  INVALID_INSTALLMENT: 'E401',
  INVALID_CONTRACT_TYPE: 'E402',
  INVALID_COMBINATION: 'E403',
  
  // 유효성 검증 에러
  VALIDATION_FAILED: 'E600',
  INVALID_EMAIL: 'E601',
  INVALID_PHONE: 'E602',
} as const;

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNKNOWN]: '알 수 없는 오류가 발생했습니다.',
  [ERROR_CODES.INVALID_INPUT]: '입력값이 올바르지 않습니다.',
  [ERROR_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
  [ERROR_CODES.TIMEOUT]: '요청 시간이 초과되었습니다.',
  
  [ERROR_CODES.PRODUCTS_LOAD_FAILED]: 'products.json 로드에 실패했습니다.',
  [ERROR_CODES.INVALID_PRODUCTS_DATA]: 'products.json 데이터가 올바르지 않습니다.',
  [ERROR_CODES.DEVICE_NOT_FOUND]: '기기를 찾을 수 없습니다.',
  [ERROR_CODES.PLAN_NOT_FOUND]: '요금제를 찾을 수 없습니다.',
  [ERROR_CODES.SUBSIDY_NOT_FOUND]: '지원금 정보를 찾을 수 없습니다.',
  
  [ERROR_CODES.CALCULATION_ERROR]: '가격 계산 중 오류가 발생했습니다.',
  [ERROR_CODES.INVALID_INSTALLMENT]: '유효하지 않은 할부 개월입니다.',
  [ERROR_CODES.INVALID_CONTRACT_TYPE]: '유효하지 않은 약정 유형입니다.',
  [ERROR_CODES.INVALID_COMBINATION]: '유효하지 않은 기기+요금제 조합입니다.',
  
  [ERROR_CODES.VALIDATION_FAILED]: '입력값을 확인해주세요.',
  [ERROR_CODES.INVALID_EMAIL]: '이메일 형식이 올바르지 않습니다.',
  [ERROR_CODES.INVALID_PHONE]: '전화번호 형식이 올바르지 않습니다.',
} as const;

/**
 * 정규식 패턴
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  KOREAN: /^[가-힣]+$/,
  NUMBER_ONLY: /^[0-9]+$/,
} as const;

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  PRODUCTS_CACHE: 'tworld_products_cache',
  RECENT_PRODUCTS: 'tworld_recent_products',
  FILTER_STATE: 'tworld_filter_state',
  CART: 'tworld_cart',
} as const;
