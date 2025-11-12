/**
 * products.json 데이터 구조 타입 정의
 * 
 * 이 파일의 모든 타입은 products.json 구조를 정확히 반영합니다.
 * 
 * GitHub: tworld-store-frontend/data/products.json
 * 
 * @module types/products
 * @version 1.0.0
 */

/**
 * products.json 최상위 구조
 */
export interface ProductsData {
  /** 기기 목록 */
  devices: Device[];
  
  /** 요금제 목록 */
  plans: Plan[];
  
  /** 지원금 (가입유형별) */
  subsidies: {
    change: Subsidy[];    // 기기변경
    transfer: Subsidy[];  // 번호이동
    new: Subsidy[];       // 신규가입
  };
  
  /** 전역 설정 */
  settings: GlobalSettings;
}

/**
 * 기기 (Device)
 * 
 * 용량별로 구분되는 기기 정보
 * 예: 갤럭시S24_256GB, 갤럭시S24_512GB는 별도 Device
 */
export interface Device {
  /** 
   * 기기 ID
   * 형식: "모델명_용량GB"
   * 예: "갤럭시S24_256GB"
   */
  id: string;
  
  /** 
   * 브랜드
   * 예: "samsung", "apple", "etc"
   */
  brand: string;
  
  /** 
   * 모델명
   * 예: "갤럭시 S24", "아이폰 15"
   */
  model: string;
  
  /** 
   * 용량 (GB)
   * 예: 128, 256, 512
   */
  storage: number;
  
  /** 
   * 출고가 (원)
   * 예: 1250000
   */
  price: number;
  
  /** 색상 옵션 목록 */
  colors: DeviceColor[];
}

/**
 * 기기 색상 옵션
 * 
 * 각 기기는 여러 색상을 가질 수 있음
 */
export interface DeviceColor {
  /** 
   * 색상 옵션 ID
   * 형식: "모델명_색상명_용량GB"
   * 예: "갤럭시S24_팬텀블랙_256GB"
   */
  id: string;
  
  /** 
   * 색상 코드
   * 예: "black", "white", "blue"
   */
  code: string;
  
  /** 
   * 색상명 (한글)
   * 예: "팬텀블랙", "팬텀화이트"
   */
  name: string;
  
  /** 
   * HEX 색상값
   * 예: "#1C1C1C", "#F5F5F5"
   */
  hex: string;
}

/**
 * 요금제 (Plan)
 */
export interface Plan {
  /** 
   * 요금제 ID (요금제명과 동일)
   * 예: "0청년109", "시니어69"
   */
  id: string;
  
  /** 
   * 카테고리 ID
   * 예: "YOUTH", "SENIOR", "5GX", "LTE"
   */
  categoryId: string;
  
  /** 
   * 카테고리명 (한글)
   * 예: "청년", "시니어", "5GX 플랜"
   */
  categoryName: string;
  
  /** 
   * 카테고리 아이콘
   * 예: "🎓", "👴", "⚡"
   */
  categoryIcon: string;
  
  /** 
   * 요금제명
   * 예: "0청년109", "프리미엄플러스"
   */
  name: string;
  
  /** 
   * 요금제 설명
   * 예: "만 34세 이하 청년을 위한 특별 요금제"
   */
  description: string;
  
  /** 
   * 기본 요금 (원)
   * 예: 109000
   */
  basePrice: number;
  
  /** 
   * 데이터 제공량
   * 예: "무제한", "11GB+", "200GB"
   */
  data: string;
  
  /** 
   * 음성통화 제공량
   * 예: "무제한", "300분"
   */
  call: string;
  
  /** 
   * 문자 제공량
   * 예: "무제한", "200건"
   */
  sms: string;
  
  /** 
   * 부가 혜택
   * 예: "2nd 디바이스 무료, 유튜브 프리미엄 6개월"
   */
  benefits: string;
  
  /** 
   * 가입 제한사항
   * 예: "만 34세 이하 가입 가능", "만 65세 이상"
   */
  restrictions: string;
  
  /** 
   * 요금제 아이콘
   * 예: "📱", "📞", "👑"
   */
  icon: string;
  
  /** 
   * 주요 혜택 1
   * 예: "데이터 무제한"
   */
  mainBenefit1: string;
  
  /** 
   * 주요 혜택 2
   * 예: "유튜브 프리미엄 6개월"
   */
  mainBenefit2: string;
  
  /** 
   * 주요 혜택 3
   * 예: "2nd 디바이스 무료"
   */
  mainBenefit3: string;
  
  /** 
   * 테마 색상 (HEX)
   * 예: "#FF6B6B", "#4CAF50"
   */
  colorCode: string;
  
  /** 
   * 상세 페이지 URL (티월드 공식)
   * 예: "https://www.tworld.co.kr/web/product/callplan/NA00004194"
   */
  detailUrl: string;
}

/**
 * 지원금 (Subsidy)
 * 
 * 기기 + 요금제 + 가입유형 조합별 지원금
 */
export interface Subsidy {
  /** 
   * 지원금 ID
   * 형식: "기기ID_요금제ID_가입유형코드"
   * 예: "갤럭시S24_256GB_0청년109_기변"
   */
  id: string;
  
  /** 
   * 기기 ID (Device.id 참조)
   * 예: "갤럭시S24_256GB"
   */
  deviceId: string;
  
  /** 
   * 요금제 ID (Plan.id 참조)
   * 예: "0청년109"
   */
  planId: string;
  
  /** 
   * 공시지원금 (원)
   * 예: 300000
   */
  common: number;
  
  /** 
   * 추가지원금 (원)
   * 예: 100000
   */
  additional: number;
  
  /** 
   * 선택약정 할인금 (원)
   * 예: 50000
   */
  select: number;
}

/**
 * 전역 설정 (GlobalSettings)
 * 
 * 가격 계산에 필요한 전역 설정값
 */
export interface GlobalSettings {
  /** 
   * 할부 이자율 (연 이자율)
   * 예: 0.059 (5.9%)
   */
  installmentInterestRate: number;
  
  /** 
   * 선택약정 할인율
   * 예: 0.25 (25%)
   */
  selectiveDiscountRate: number;
  
  /** 
   * 부가세율
   * 예: 0.1 (10%)
   */
  vatRate: number;
  
  /** 
   * 마지막 동기화 시간 (ISO 8601)
   * 예: "2025-11-06T10:00:00Z"
   */
  syncedAt: string;
}

/**
 * 가입 유형 코드
 */
export const JOIN_TYPE_CODES = {
  CHANGE: 'change',     // 기기변경
  TRANSFER: 'transfer', // 번호이동
  NEW: 'new',           // 신규가입
} as const;

export type JoinType = typeof JOIN_TYPE_CODES[keyof typeof JOIN_TYPE_CODES];

/**
 * 가입 유형 한글명
 */
export const JOIN_TYPE_NAMES: Record<JoinType, string> = {
  change: '기기변경',
  transfer: '번호이동',
  new: '신규가입',
};

/**
 * 브랜드 타입
 */
export type Brand = 'samsung' | 'apple' | 'etc';

/**
 * 브랜드 한글명
 */
export const BRAND_NAMES: Record<Brand, string> = {
  samsung: '삼성',
  apple: '애플',
  etc: '기타',
};
