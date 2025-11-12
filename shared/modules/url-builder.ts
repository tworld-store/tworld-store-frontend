/**
 * URL 생성 및 파싱 모듈
 * 
 * 상품 페이지, 게시판 등의 URL을 생성하고
 * 쿼리 파라미터를 파싱하는 유틸리티입니다.
 * 
 * 주요 기능:
 * - 상품 상세/목록 URL 생성
 * - URL 쿼리 파라미터 파싱
 * - 파라미터 추가/제거
 * - URL 정규화
 * 
 * @module url-builder
 * @version 1.0.0
 */

import type { Brand, JoinType } from './products';

/**
 * URL Builder 설정
 */
export interface URLBuilderConfig {
  /** 베이스 URL (예: 'https://tworld-store.com') */
  baseUrl: string;
}

/**
 * 상품 목록 필터
 */
export interface DeviceListFilters {
  /** 브랜드 */
  brand?: Brand | string;
  /** 최소 가격 */
  minPrice?: number;
  /** 최대 가격 */
  maxPrice?: number;
  /** 정렬 (price-asc: 낮은가격순, price-desc: 높은가격순, latest: 최신순) */
  sort?: 'price-asc' | 'price-desc' | 'latest' | 'popular';
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 항목 수 */
  pageSize?: number;
  /** 검색 키워드 */
  search?: string;
}

/**
 * 상품 상세 파라미터
 */
export interface DeviceDetailParams {
  /** 색상 코드 */
  color?: string;
  /** 용량 */
  storage?: number;
  /** 요금제 ID */
  planId?: string;
  /** 가입 유형 */
  joinType?: JoinType;
  /** 참조 페이지 (분석용) */
  ref?: string;
}

/**
 * 쿼리 파라미터 객체
 */
export type QueryParams = Record<string, string | number | boolean>;

/**
 * URL 생성 및 파싱 클래스
 * 
 * @example
 * ```typescript
 * const urlBuilder = new URLBuilder({
 *   baseUrl: 'https://tworld-store.com'
 * });
 * 
 * // 상품 상세 URL 생성
 * const url = urlBuilder.buildDeviceDetailUrl('갤럭시S24_256GB', {
 *   color: 'black',
 *   storage: 256
 * });
 * 
 * // 쿼리 파라미터 파싱
 * const params = urlBuilder.parseQueryString();
 * console.log(params.model); // '갤럭시S24_256GB'
 * ```
 */
export class URLBuilder {
  /** 베이스 URL */
  private baseUrl: string;

  /**
   * URLBuilder 생성자
   * 
   * @param config - URL Builder 설정
   */
  constructor(config: URLBuilderConfig) {
    this.baseUrl = config.baseUrl;
  }

  /**
   * 상품 상세 URL 생성
   * 
   * @param deviceId - 기기 ID (예: '갤럭시S24_256GB')
   * @param params - 추가 파라미터 (색상, 용량 등)
   * @returns 생성된 URL
   * 
   * @example
   * ```typescript
   * const url = urlBuilder.buildDeviceDetailUrl('갤럭시S24_256GB', {
   *   color: 'black',
   *   storage: 256,
   *   planId: '0청년109'
   * });
   * // => https://tworld-store.com/device-detail.html?model=갤럭시S24_256GB&color=black&storage=256&planId=0청년109
   * ```
   */
  buildDeviceDetailUrl(
    deviceId: string,
    params: DeviceDetailParams = {}
  ): string {
    const url = new URL('/device-detail.html', this.baseUrl);

    // 기기 ID 파라미터 추가
    url.searchParams.set('model', deviceId);

    // 추가 파라미터
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * 상품 목록 URL 생성
   * 
   * @param filters - 필터 조건 (브랜드, 가격, 정렬 등)
   * @returns 생성된 URL
   * 
   * @example
   * ```typescript
   * const url = urlBuilder.buildDeviceListUrl({
   *   brand: 'samsung',
   *   minPrice: 500000,
   *   maxPrice: 1500000,
   *   sort: 'price-asc',
   *   page: 1
   * });
   * // => https://tworld-store.com/devices.html?brand=samsung&minPrice=500000&maxPrice=1500000&sort=price-asc&page=1
   * ```
   */
  buildDeviceListUrl(filters: DeviceListFilters = {}): string {
    const url = new URL('/devices.html', this.baseUrl);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * 게시판 URL 생성
   * 
   * @param boardId - 게시판 ID
   * @param postId - 게시글 ID (선택)
   * @returns 생성된 URL
   * 
   * @example
   * ```typescript
   * // 게시판 목록
   * urlBuilder.buildBoardUrl('notice');
   * // => https://tworld-store.com/board.html?boardId=notice
   * 
   * // 게시글 상세
   * urlBuilder.buildBoardUrl('notice', 'post-123');
   * // => https://tworld-store.com/board.html?boardId=notice&postId=post-123
   * ```
   */
  buildBoardUrl(boardId: string, postId?: string): string {
    const url = new URL('/board.html', this.baseUrl);
    url.searchParams.set('boardId', boardId);

    if (postId) {
      url.searchParams.set('postId', postId);
    }

    return url.toString();
  }

  /**
   * 홈페이지 URL 생성
   * 
   * @returns 홈페이지 URL
   */
  buildHomeUrl(): string {
    return `${this.baseUrl}/index.html`;
  }

  /**
   * 쿼리 문자열 파싱
   * 
   * 현재 페이지 또는 제공된 쿼리 문자열을 파싱하여 객체로 반환합니다.
   * 
   * @param queryString - 파싱할 쿼리 문자열 (선택, 없으면 현재 URL 사용)
   * @returns 파싱된 파라미터 객체
   * 
   * @example
   * ```typescript
   * // 현재 URL: https://example.com?model=갤럭시S24_256GB&color=black
   * const params = urlBuilder.parseQueryString();
   * console.log(params);
   * // => { model: '갤럭시S24_256GB', color: 'black' }
   * 
   * // 특정 쿼리 문자열 파싱
   * const params2 = urlBuilder.parseQueryString('?brand=samsung&page=2');
   * console.log(params2);
   * // => { brand: 'samsung', page: '2' }
   * ```
   */
  parseQueryString(queryString?: string): QueryParams {
    // 브라우저 환경인지 확인
    const search =
      queryString ||
      (typeof window !== 'undefined' ? window.location.search : '');

    const params = new URLSearchParams(search);
    const result: QueryParams = {};

    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  }

  /**
   * 현재 URL에서 특정 파라미터 가져오기
   * 
   * @param key - 파라미터 키
   * @param defaultValue - 기본값 (파라미터가 없을 때)
   * @returns 파라미터 값 또는 기본값
   * 
   * @example
   * ```typescript
   * // 현재 URL: https://example.com?model=갤럭시S24_256GB&page=2
   * const model = urlBuilder.getParam('model');
   * console.log(model); // '갤럭시S24_256GB'
   * 
   * const sort = urlBuilder.getParam('sort', 'latest');
   * console.log(sort); // 'latest' (없으므로 기본값)
   * ```
   */
  getParam(key: string, defaultValue: string | null = null): string | null {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get(key) || defaultValue;
  }

  /**
   * 현재 URL에 파라미터 추가
   * 
   * 기존 파라미터를 유지하면서 새 파라미터를 추가합니다.
   * 
   * @param params - 추가할 파라미터
   * @returns 새로운 URL
   * 
   * @example
   * ```typescript
   * // 현재 URL: https://example.com?model=갤럭시S24_256GB
   * const newUrl = urlBuilder.addParams({ color: 'black', storage: 256 });
   * console.log(newUrl);
   * // => https://example.com?model=갤럭시S24_256GB&color=black&storage=256
   * ```
   */
  addParams(params: QueryParams): string {
    if (typeof window === 'undefined') {
      return this.baseUrl;
    }

    const url = new URL(window.location.href);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * 현재 URL에서 파라미터 제거
   * 
   * @param keys - 제거할 파라미터 키 (단일 또는 배열)
   * @returns 새로운 URL
   * 
   * @example
   * ```typescript
   * // 현재 URL: https://example.com?model=갤럭시S24&color=black&storage=256
   * 
   * // 단일 파라미터 제거
   * const url1 = urlBuilder.removeParams('color');
   * // => https://example.com?model=갤럭시S24&storage=256
   * 
   * // 여러 파라미터 제거
   * const url2 = urlBuilder.removeParams(['color', 'storage']);
   * // => https://example.com?model=갤럭시S24
   * ```
   */
  removeParams(keys: string | string[]): string {
    if (typeof window === 'undefined') {
      return this.baseUrl;
    }

    const url = new URL(window.location.href);
    const keysArray = Array.isArray(keys) ? keys : [keys];

    keysArray.forEach((key) => {
      url.searchParams.delete(key);
    });

    return url.toString();
  }

  /**
   * URL 정규화
   * 
   * trailing slash 제거, 프로토콜 정규화 등을 수행합니다.
   * 
   * @param url - 정규화할 URL
   * @returns 정규화된 URL
   * 
   * @example
   * ```typescript
   * urlBuilder.normalize('tworld-store.com/devices/');
   * // => https://tworld-store.com/devices
   * 
   * urlBuilder.normalize('https://tworld-store.com//devices//');
   * // => https://tworld-store.com/devices
   * ```
   */
  normalize(url: string): string {
    // trailing slash 제거
    let normalized = url.replace(/\/+$/, '');

    // 중복 슬래시 제거
    normalized = normalized.replace(/([^:]\/)\/+/g, '$1');

    // 프로토콜 정규화
    if (!normalized.match(/^https?:\/\//)) {
      normalized = `https://${normalized}`;
    }

    return normalized;
  }

  /**
   * 상대 URL을 절대 URL로 변환
   * 
   * @param relativePath - 상대 경로
   * @returns 절대 URL
   * 
   * @example
   * ```typescript
   * const urlBuilder = new URLBuilder({ baseUrl: 'https://tworld-store.com' });
   * 
   * urlBuilder.toAbsolute('/devices.html');
   * // => https://tworld-store.com/devices.html
   * 
   * urlBuilder.toAbsolute('images/product.jpg');
   * // => https://tworld-store.com/images/product.jpg
   * ```
   */
  toAbsolute(relativePath: string): string {
    return new URL(relativePath, this.baseUrl).toString();
  }

  /**
   * URL에서 특정 파라미터 업데이트
   * 
   * 기존 URL의 특정 파라미터만 업데이트합니다.
   * 
   * @param url - 업데이트할 URL
   * @param params - 업데이트할 파라미터
   * @returns 업데이트된 URL
   * 
   * @example
   * ```typescript
   * const original = 'https://example.com?page=1&sort=latest';
   * const updated = urlBuilder.updateParams(original, { page: 2 });
   * // => https://example.com?page=2&sort=latest
   * ```
   */
  updateParams(url: string, params: QueryParams): string {
    const urlObj = new URL(url);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.set(key, String(value));
      }
    });

    return urlObj.toString();
  }

  /**
   * 현재 페이지 새로고침 (파라미터 적용)
   * 
   * 브라우저 환경에서만 동작합니다.
   * 
   * @param params - 적용할 파라미터
   * 
   * @example
   * ```typescript
   * // 현재 페이지에 color=black 파라미터 추가하고 새로고침
   * urlBuilder.refresh({ color: 'black' });
   * ```
   */
  refresh(params?: QueryParams): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (params) {
      const newUrl = this.addParams(params);
      window.location.href = newUrl;
    } else {
      window.location.reload();
    }
  }

  /**
   * 페이지 이동
   * 
   * 브라우저 환경에서만 동작합니다.
   * 
   * @param url - 이동할 URL
   * 
   * @example
   * ```typescript
   * urlBuilder.navigate('/devices.html?brand=samsung');
   * ```
   */
  navigate(url: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.href = url;
  }
}

/**
 * URL에서 파일명 추출
 * 
 * @param url - URL
 * @returns 파일명
 * 
 * @example
 * ```typescript
 * getFilenameFromUrl('https://example.com/images/product.jpg?v=1');
 * // => 'product.jpg'
 * ```
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename || '';
  } catch {
    return '';
  }
}

/**
 * URL이 외부 링크인지 확인
 * 
 * @param url - 확인할 URL
 * @param baseUrl - 기준 URL
 * @returns 외부 링크 여부
 * 
 * @example
 * ```typescript
 * isExternalUrl('https://google.com', 'https://tworld-store.com');
 * // => true
 * 
 * isExternalUrl('/devices.html', 'https://tworld-store.com');
 * // => false
 * ```
 */
export function isExternalUrl(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url, baseUrl);
    const baseUrlObj = new URL(baseUrl);
    return urlObj.hostname !== baseUrlObj.hostname;
  } catch {
    return false;
  }
}

/**
 * 쿼리 파라미터를 문자열로 변환
 * 
 * @param params - 파라미터 객체
 * @returns 쿼리 문자열
 * 
 * @example
 * ```typescript
 * toQueryString({ brand: 'samsung', page: 2, sort: 'price-asc' });
 * // => '?brand=samsung&page=2&sort=price-asc'
 * ```
 */
export function toQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
