/**
 * 요금제 관련 타입 정의
 * 
 * products.json의 Plan 구조를 정의합니다.
 * 
 * @module types/plan
 * @version 1.0.0
 */

/**
 * 요금제 (Plan)
 * 
 * products.json의 plans 배열에 포함되는 요금제 데이터 구조
 */
export interface Plan {
  /** 
   * 요금제 ID (요금제명과 동일)
   * 
   * @example "0청년109", "시니어69"
   */
  id: string;
  
  /** 
   * 카테고리 ID
   * 
   * @example "YOUTH", "SENIOR", "5GX", "LTE"
   */
  categoryId: string;
  
  /** 
   * 카테고리명 (한글)
   * 
   * @example "청년", "시니어", "5GX 플랜"
   */
  categoryName: string;
  
  /** 
   * 카테고리 아이콘
   * 
   * @example "🎓", "👴", "⚡"
   */
  categoryIcon: string;
  
  /** 
   * 요금제명
   * 
   * @example "0청년109", "프리미엄플러스"
   */
  name: string;
  
  /** 
   * 요금제 설명
   * 
   * @example "만 34세 이하 청년을 위한 특별 요금제"
   */
  description: string;
  
  /** 
   * 기본 요금 (원)
   * 
   * @example 109000
   */
  basePrice: number;
  
  /** 
   * 데이터 제공량
   * 
   * @example "무제한", "11GB+", "200GB"
   */
  data: string;
  
  /** 
   * 음성통화 제공량
   * 
   * @example "무제한", "300분"
   */
  call: string;
  
  /** 
   * 문자 제공량
   * 
   * @example "무제한", "200건"
   */
  sms: string;
  
  /** 
   * 부가 혜택
   * 
   * @example "2nd 디바이스 무료, 유튜브 프리미엄 6개월"
   */
  benefits: string;
  
  /** 
   * 가입 제한사항
   * 
   * @example "만 34세 이하 가입 가능", "만 65세 이상"
   */
  restrictions: string;
  
  /** 
   * 요금제 아이콘
   * 
   * @example "📱", "📞", "👑"
   */
  icon: string;
  
  /** 
   * 주요 혜택 1
   * 
   * @example "데이터 무제한"
   */
  mainBenefit1: string;
  
  /** 
   * 주요 혜택 2
   * 
   * @example "유튜브 프리미엄 6개월"
   */
  mainBenefit2: string;
  
  /** 
   * 주요 혜택 3
   * 
   * @example "2nd 디바이스 무료"
   */
  mainBenefit3: string;
  
  /** 
   * 테마 색상 (HEX)
   * 
   * @example "#FF6B6B", "#4CAF50"
   */
  colorCode: string;
  
  /** 
   * 상세 페이지 URL (티월드 공식)
   * 
   * @example "https://www.tworld.co.kr/web/product/callplan/NA00004194"
   */
  detailUrl: string;
}

/**
 * 요금제 카테고리 ID
 */
export type PlanCategoryId = 'YOUTH' | 'SENIOR' | '5GX' | 'LTE' | 'BASIC';

/**
 * 요금제 카테고리 정보
 */
export interface PlanCategory {
  /** 카테고리 ID */
  id: PlanCategoryId;
  
  /** 카테고리명 */
  name: string;
  
  /** 카테고리 아이콘 */
  icon: string;
  
  /** 카테고리 설명 */
  description: string;
}

/**
 * 요금제 필터 옵션
 */
export interface PlanFilterOptions {
  /** 카테고리 ID */
  categoryId?: PlanCategoryId;
  
  /** 최소 가격 */
  minPrice?: number;
  
  /** 최대 가격 */
  maxPrice?: number;
  
  /** 데이터 무제한만 */
  unlimitedDataOnly?: boolean;
  
  /** 음성 무제한만 */
  unlimitedCallOnly?: boolean;
}

/**
 * 요금제 정렬 옵션
 */
export type PlanSortOption = 
  | 'price-asc'      // 가격 낮은순
  | 'price-desc'     // 가격 높은순
  | 'popular'        // 인기순
  | 'latest';        // 최신순
