/**
 * Shared 모듈 통합 Export
 * 
 * 모든 공유 모듈을 한 곳에서 import할 수 있도록 통합합니다.
 * 
 * @module shared/modules
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * // 개별 import
 * import { PriceCalculator } from '@/shared/modules';
 * import { Validators } from '@/shared/modules';
 * 
 * // 또는 구조 분해
 * import {
 *   PriceCalculator,
 *   Validators,
 *   URLBuilder,
 *   formatPrice,
 *   PRODUCTS_JSON_URL
 * } from '@/shared/modules';
 * ```
 */

// =====================================================
// API 모듈
// =====================================================
export { DataAPI } from './api';
export type {
  DataAPIConfig,
  APIResponse,
  APIError,
  CacheEntry,
} from './api';

// =====================================================
// 계산 모듈
// =====================================================
export {
  PriceCalculator,
  findSubsidy,
  getSubsidiesByDevice,
  getSubsidiesByPlan,
} from './calculator';

// =====================================================
// 검증 모듈
// =====================================================
export {
  Validators,
  isDevice,
  isPlan,
  isSubsidy,
} from './validators';
export type {
  ValidationResult,
  FieldValidationResult,
  ConsultationFormData,
} from './validators';

// =====================================================
// 포맷팅 모듈
// =====================================================
export {
  formatPrice,
  formatNumber,
  formatPhone,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatPercentage,
  parsePrice,
  parseNumber,
  truncateText,
  capitalizeFirst,
  toKebabCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  slugify,
} from './formatters';
export type {
  FormatPriceOptions,
  FormatNumberOptions,
  FormatDateOptions,
} from './formatters';

// =====================================================
// 상수
// =====================================================
export {
  PRODUCTS_JSON_URL,
  INSTALLMENT_MONTHS,
  CONTRACT_TYPES,
  JOIN_TYPE_LABELS,
  BRAND_LABELS,
  DEFAULT_INSTALLMENT_INTEREST_RATE,
  DEFAULT_SELECTIVE_DISCOUNT_RATE,
  VAT_RATE,
  BUNDLE_DISCOUNT_RATES,
  PRICE_LIMITS,
  IMAGE_CONFIG,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  API_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  REGEX_PATTERNS,
  STORAGE_KEYS,
} from './constants';

// =====================================================
// URL 빌더
// =====================================================
export {
  URLBuilder,
  getFilenameFromUrl,
  isExternalUrl,
  toQueryString,
} from './url-builder';
export type {
  URLBuilderConfig,
  DeviceListFilters,
  DeviceDetailParams,
  QueryParams,
} from './url-builder';

// =====================================================
// 타입 정의 (재export)
// =====================================================
// products.json 기반 타입
export type {
  ProductsData,
  Device,
  DeviceColor,
  Plan,
  Subsidy,
  GlobalSettings,
  JoinType,
  Brand,
} from './products';

export {
  JOIN_TYPE_CODES,
  JOIN_TYPE_NAMES,
  BRAND_NAMES,
} from './products';

// 계산 관련 타입
export type {
  ContractType,
  InstallmentMonths,
  CalculationInput,
  CalculationResult,
  CalculatorOptions,
  MonthlyDeviceFeeParams,
  MonthlyPlanFeeParams,
} from './calculation';

// =====================================================
// 유틸리티 타입
// =====================================================

/**
 * 선택적 속성을 가진 타입으로 변환
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 읽기 전용 깊은 타입
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 부분적으로 선택적인 타입
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 특정 키를 필수로 만드는 타입
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// =====================================================
// 버전 정보
// =====================================================
export const VERSION = '1.0.0';
export const BUILD_DATE = '2025-11-11';

/**
 * 모듈 정보
 */
export const MODULE_INFO = {
  version: VERSION,
  buildDate: BUILD_DATE,
  modules: [
    'api',
    'calculator',
    'validators',
    'formatters',
    'constants',
    'url-builder',
  ],
} as const;
