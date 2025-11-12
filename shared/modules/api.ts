/**
 * products.json API 모듈
 * 
 * GitHub에서 products.json을 로드하고 데이터를 조회합니다.
 * 
 * @module modules/api
 * @version 1.0.0
 */

import type {
  ProductsData,
  Device,
  Plan,
  Subsidy,
  JoinType,
} from '../types';
import {
  PRODUCTS_JSON_URL,
  CACHE_CONFIG,
  API_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
} from './constants';

/**
 * 캐시된 products.json 데이터
 */
let cachedData: ProductsData | null = null;
let cacheTimestamp: number = 0;

/**
 * products.json 로드
 * 
 * GitHub Raw URL에서 products.json을 로드합니다.
 * 캐시가 유효하면 캐시된 데이터를 반환합니다.
 * 
 * @returns products.json 전체 데이터
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const data = await loadProductsData();
 * console.log(data.devices.length); // 기기 개수
 * ```
 */
export async function loadProductsData(): Promise<ProductsData> {
  // 캐시 확인
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_CONFIG.PRODUCTS_TTL) {
    return cachedData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.TIMEOUT
    );

    const response = await fetch(PRODUCTS_JSON_URL, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data: ProductsData = await response.json();

    // 데이터 유효성 검증
    if (!data.devices || !data.plans || !data.subsidies || !data.settings) {
      throw new Error(ERROR_MESSAGES[ERROR_CODES.INVALID_PRODUCTS_DATA]);
    }

    // 캐시 업데이트
    cachedData = data;
    cacheTimestamp = now;

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES[ERROR_CODES.TIMEOUT]);
      }
      throw new Error(
        `${ERROR_MESSAGES[ERROR_CODES.PRODUCTS_LOAD_FAILED]}: ${error.message}`
      );
    }
    throw new Error(ERROR_MESSAGES[ERROR_CODES.UNKNOWN]);
  }
}

/**
 * 캐시 초기화
 * 
 * 강제로 다음 로드 시 새로운 데이터를 가져오도록 합니다.
 * 
 * @example
 * ```typescript
 * clearCache();
 * const freshData = await loadProductsData();
 * ```
 */
export function clearCache(): void {
  cachedData = null;
  cacheTimestamp = 0;
}

/**
 * 모든 기기 조회
 * 
 * @returns 기기 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const devices = await getAllDevices();
 * ```
 */
export async function getAllDevices(): Promise<Device[]> {
  const data = await loadProductsData();
  return data.devices;
}

/**
 * 기기 ID로 조회
 * 
 * @param deviceId - 기기 ID (예: "갤럭시S24_256GB")
 * @returns 기기 정보 또는 undefined
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const device = await getDeviceById('갤럭시S24_256GB');
 * if (device) {
 *   console.log(device.price); // 1250000
 * }
 * ```
 */
export async function getDeviceById(
  deviceId: string
): Promise<Device | undefined> {
  const devices = await getAllDevices();
  return devices.find(d => d.id === deviceId);
}

/**
 * 브랜드별 기기 조회
 * 
 * @param brand - 브랜드 코드 (samsung | apple | etc)
 * @returns 해당 브랜드의 기기 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const samsungDevices = await getDevicesByBrand('samsung');
 * ```
 */
export async function getDevicesByBrand(
  brand: string
): Promise<Device[]> {
  const devices = await getAllDevices();
  return devices.filter(d => d.brand === brand);
}

/**
 * 모델명으로 기기 검색
 * 
 * @param keyword - 검색 키워드
 * @returns 모델명에 키워드가 포함된 기기 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const results = await searchDevices('갤럭시');
 * ```
 */
export async function searchDevices(keyword: string): Promise<Device[]> {
  const devices = await getAllDevices();
  const lowerKeyword = keyword.toLowerCase();
  return devices.filter(d =>
    d.model.toLowerCase().includes(lowerKeyword) ||
    d.id.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 모든 요금제 조회
 * 
 * @returns 요금제 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const plans = await getAllPlans();
 * ```
 */
export async function getAllPlans(): Promise<Plan[]> {
  const data = await loadProductsData();
  return data.plans;
}

/**
 * 요금제 ID로 조회
 * 
 * @param planId - 요금제 ID (예: "0청년109")
 * @returns 요금제 정보 또는 undefined
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const plan = await getPlanById('0청년109');
 * if (plan) {
 *   console.log(plan.basePrice); // 109000
 * }
 * ```
 */
export async function getPlanById(
  planId: string
): Promise<Plan | undefined> {
  const plans = await getAllPlans();
  return plans.find(p => p.id === planId);
}

/**
 * 카테고리별 요금제 조회
 * 
 * @param categoryId - 카테고리 ID (YOUTH | SENIOR | 5GX | LTE)
 * @returns 해당 카테고리의 요금제 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const youthPlans = await getPlansByCategory('YOUTH');
 * ```
 */
export async function getPlansByCategory(
  categoryId: string
): Promise<Plan[]> {
  const plans = await getAllPlans();
  return plans.filter(p => p.categoryId === categoryId);
}

/**
 * 지원금 조회
 * 
 * @param deviceId - 기기 ID
 * @param planId - 요금제 ID
 * @param joinType - 가입 유형 (change | transfer | new)
 * @returns 지원금 정보 또는 undefined
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const subsidy = await getSubsidy(
 *   '갤럭시S24_256GB',
 *   '0청년109',
 *   'change'
 * );
 * if (subsidy) {
 *   console.log(subsidy.common); // 300000
 * }
 * ```
 */
export async function getSubsidy(
  deviceId: string,
  planId: string,
  joinType: JoinType
): Promise<Subsidy | undefined> {
  const data = await loadProductsData();
  const subsidies = data.subsidies[joinType];

  return subsidies.find(
    s => s.deviceId === deviceId && s.planId === planId
  );
}

/**
 * 특정 기기의 모든 지원금 조회
 * 
 * @param deviceId - 기기 ID
 * @returns 가입유형별 지원금 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const subsidies = await getSubsidiesForDevice('갤럭시S24_256GB');
 * console.log(subsidies.change.length); // 기기변경 지원금 개수
 * ```
 */
export async function getSubsidiesForDevice(deviceId: string): Promise<{
  change: Subsidy[];
  transfer: Subsidy[];
  new: Subsidy[];
}> {
  const data = await loadProductsData();

  return {
    change: data.subsidies.change.filter(s => s.deviceId === deviceId),
    transfer: data.subsidies.transfer.filter(s => s.deviceId === deviceId),
    new: data.subsidies.new.filter(s => s.deviceId === deviceId),
  };
}

/**
 * 특정 요금제의 모든 지원금 조회
 * 
 * @param planId - 요금제 ID
 * @returns 가입유형별 지원금 목록
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const subsidies = await getSubsidiesForPlan('0청년109');
 * ```
 */
export async function getSubsidiesForPlan(planId: string): Promise<{
  change: Subsidy[];
  transfer: Subsidy[];
  new: Subsidy[];
}> {
  const data = await loadProductsData();

  return {
    change: data.subsidies.change.filter(s => s.planId === planId),
    transfer: data.subsidies.transfer.filter(s => s.planId === planId),
    new: data.subsidies.new.filter(s => s.planId === planId),
  };
}

/**
 * 조합 유효성 검증
 * 
 * 기기 + 요금제 + 가입유형 조합이 유효한지 확인합니다.
 * 
 * @param deviceId - 기기 ID
 * @param planId - 요금제 ID
 * @param joinType - 가입 유형
 * @returns 유효하면 true, 아니면 false
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const isValid = await isValidCombination(
 *   '갤럭시S24_256GB',
 *   '0청년109',
 *   'change'
 * );
 * ```
 */
export async function isValidCombination(
  deviceId: string,
  planId: string,
  joinType: JoinType
): Promise<boolean> {
  const device = await getDeviceById(deviceId);
  const plan = await getPlanById(planId);
  const subsidy = await getSubsidy(deviceId, planId, joinType);

  return !!(device && plan && subsidy);
}

/**
 * 전역 설정 조회
 * 
 * @returns 전역 설정 (이자율, 할인율 등)
 * @throws {Error} 로드 실패 시
 * 
 * @example
 * ```typescript
 * const settings = await getSettings();
 * console.log(settings.installmentInterestRate); // 0.059
 * ```
 */
export async function getSettings() {
  const data = await loadProductsData();
  return data.settings;
}
