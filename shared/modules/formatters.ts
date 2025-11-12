/**
 * 포맷팅 유틸리티 모듈
 * 
 * 가격, 전화번호, 날짜 등을 사용자 친화적으로 포맷팅합니다.
 * 
 * @module modules/formatters
 * @version 1.0.0
 */

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * 
 * @param amount - 금액 (숫자)
 * @param includeUnit - "원" 단위 포함 여부 (기본: true)
 * @returns 포맷팅된 금액 문자열
 * 
 * @example
 * ```typescript
 * formatPrice(1250000);        // "1,250,000원"
 * formatPrice(1250000, false); // "1,250,000"
 * formatPrice(0);              // "0원"
 * ```
 */
export function formatPrice(amount: number, includeUnit = true): string {
  const formatted = amount.toLocaleString('ko-KR');
  return includeUnit ? `${formatted}원` : formatted;
}

/**
 * 전화번호 포맷팅
 * 
 * @param phone - 전화번호 (숫자만 또는 하이픈 포함)
 * @returns 포맷팅된 전화번호 (010-1234-5678 형식)
 * 
 * @example
 * ```typescript
 * formatPhone('01012345678');     // "010-1234-5678"
 * formatPhone('010-1234-5678');   // "010-1234-5678"
 * formatPhone('0311234567');      // "031-123-4567"
 * ```
 */
export function formatPhone(phone: string): string {
  // 숫자만 추출
  const numbers = phone.replace(/[^0-9]/g, '');

  // 휴대폰 (010, 011, 016, 017, 018, 019)
  if (numbers.length === 11 && numbers.startsWith('01')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  // 지역번호 (서울 02)
  if (numbers.length === 10 && numbers.startsWith('02')) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  // 지역번호 (그 외)
  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  // 포맷팅 불가능한 경우 원본 반환
  return phone;
}

/**
 * 날짜를 한국 형식으로 포맷팅
 * 
 * @param date - Date 객체 또는 ISO 문자열
 * @param includeTime - 시간 포함 여부 (기본: false)
 * @returns 포맷팅된 날짜 문자열
 * 
 * @example
 * ```typescript
 * formatDate(new Date('2025-11-06'));              // "2025년 11월 6일"
 * formatDate(new Date('2025-11-06T10:30:00'));     // "2025년 11월 6일"
 * formatDate(new Date('2025-11-06T10:30:00'), true); // "2025년 11월 6일 10:30"
 * formatDate('2025-11-06T10:30:00Z');              // "2025년 11월 6일"
 * ```
 */
export function formatDate(
  date: Date | string,
  includeTime = false
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  let formatted = `${year}년 ${month}월 ${day}일`;

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    formatted += ` ${hours}:${minutes}`;
  }

  return formatted;
}

/**
 * 날짜를 간단한 형식으로 포맷팅
 * 
 * @param date - Date 객체 또는 ISO 문자열
 * @returns YYYY-MM-DD 형식
 * 
 * @example
 * ```typescript
 * formatDateSimple(new Date('2025-11-06')); // "2025-11-06"
 * ```
 */
export function formatDateSimple(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 상대 시간 포맷팅 (몇 분 전, 몇 시간 전 등)
 * 
 * @param date - Date 객체 또는 ISO 문자열
 * @returns 상대 시간 문자열
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000));  // "5분 전"
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)); // "2시간 전"
 * formatRelativeTime(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)); // "3일 전"
 * ```
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return '방금 전';
  }
  if (diffMin < 60) {
    return `${diffMin}분 전`;
  }
  if (diffHour < 24) {
    return `${diffHour}시간 전`;
  }
  if (diffDay < 7) {
    return `${diffDay}일 전`;
  }

  return formatDate(d);
}

/**
 * 데이터 용량 포맷팅
 * 
 * @param data - 데이터 문자열 (예: "무제한", "11GB+")
 * @returns 포맷팅된 문자열
 * 
 * @example
 * ```typescript
 * formatDataAmount('무제한');    // "무제한"
 * formatDataAmount('11GB+');     // "11GB+"
 * formatDataAmount('0.5GB');     // "500MB"
 * ```
 */
export function formatDataAmount(data: string): string {
  // 이미 포맷팅된 경우 그대로 반환
  if (data === '무제한' || data.includes('GB') || data.includes('MB')) {
    return data;
  }

  // 숫자만 있는 경우 GB 단위 추가
  const num = parseFloat(data);
  if (!isNaN(num)) {
    if (num < 1) {
      return `${num * 1000}MB`;
    }
    return `${num}GB`;
  }

  return data;
}

/**
 * 백분율 포맷팅
 * 
 * @param rate - 비율 (0~1 사이의 소수 또는 0~100 사이의 정수)
 * @param decimals - 소수점 자릿수 (기본: 0)
 * @returns 백분율 문자열
 * 
 * @example
 * ```typescript
 * formatPercentage(0.059);      // "5.9%"
 * formatPercentage(0.25);       // "25%"
 * formatPercentage(0.333, 1);   // "33.3%"
 * formatPercentage(25);         // "25%" (이미 100 기준)
 * ```
 */
export function formatPercentage(rate: number, decimals = 0): string {
  const percentage = rate > 1 ? rate : rate * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 할부 개월 포맷팅
 * 
 * @param months - 할부 개월 수 (0은 일시불)
 * @returns 포맷팅된 문자열
 * 
 * @example
 * ```typescript
 * formatInstallmentMonths(0);   // "일시불"
 * formatInstallmentMonths(12);  // "12개월"
 * formatInstallmentMonths(24);  // "24개월"
 * ```
 */
export function formatInstallmentMonths(months: number): string {
  return months === 0 ? '일시불' : `${months}개월`;
}

/**
 * 숫자를 짧은 형식으로 포맷팅
 * 
 * @param num - 숫자
 * @returns 짧은 형식 문자열 (예: 1.2K, 3.5M)
 * 
 * @example
 * ```typescript
 * formatNumberShort(1234);      // "1.2K"
 * formatNumberShort(1234567);   // "1.2M"
 * formatNumberShort(123);       // "123"
 * ```
 */
export function formatNumberShort(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return String(num);
}

/**
 * 파일 크기 포맷팅
 * 
 * @param bytes - 바이트 크기
 * @returns 포맷팅된 파일 크기
 * 
 * @example
 * ```typescript
 * formatFileSize(1024);         // "1 KB"
 * formatFileSize(1048576);      // "1 MB"
 * formatFileSize(5242880);      // "5 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * URL 쿼리 파라미터 생성
 * 
 * @param params - 쿼리 파라미터 객체
 * @returns 쿼리 문자열 (? 포함)
 * 
 * @example
 * ```typescript
 * buildQueryString({ model: '갤럭시S24_256GB', color: 'black' });
 * // "?model=%EA%B0%A4%EB%9F%AD%EC%8B%9CS24_256GB&color=black"
 * ```
 */
export function buildQueryString(
  params: Record<string, string | number | boolean>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * URL 쿼리 파라미터 파싱
 * 
 * @param url - URL 문자열 또는 쿼리 문자열
 * @returns 파라미터 객체
 * 
 * @example
 * ```typescript
 * parseQueryString('?model=갤럭시S24_256GB&color=black');
 * // { model: '갤럭시S24_256GB', color: 'black' }
 * ```
 */
export function parseQueryString(url: string): Record<string, string> {
  const searchParams = new URLSearchParams(
    url.includes('?') ? url.split('?')[1] : url
  );

  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
