/**
 * Errors 모듈 통합 export
 * 
 * 모든 에러 클래스와 헬퍼 함수를 한 곳에서 import 할 수 있습니다.
 * 
 * @module errors
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * // 개별 import
 * import { ApiError, ValidationError } from '@/shared/errors';
 * 
 * // 헬퍼 함수 import
 * import { notFound, badRequest, requiredField } from '@/shared/errors';
 * 
 * // 사용
 * throw notFound('상품', productId);
 * throw requiredField('customerName', '고객명');
 * ```
 */

// ========================================
// 에러 클래스
// ========================================

export {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,
  internalError,
  serviceUnavailable,
} from './ApiError';

export {
  ValidationError,
  requiredField,
  minLengthError,
  maxLengthError,
  invalidFormatError,
  rangeError,
  combineErrors,
} from './ValidationError';

export type { FieldError } from './ValidationError';

// ========================================
// 에러 타입 가드
// ========================================

/**
 * ApiError 타입 가드
 * 
 * 에러가 ApiError 인스턴스인지 확인합니다.
 * 
 * @param error - 확인할 에러 객체
 * @returns ApiError 여부
 * 
 * @example
 * ```typescript
 * try {
 *   // 어떤 작업
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.log('API 에러:', error.code, error.message);
 *   }
 * }
 * ```
 */
export function isApiError(error: any): error is import('./ApiError').ApiError {
  return error?.name === 'ApiError';
}

/**
 * ValidationError 타입 가드
 * 
 * 에러가 ValidationError 인스턴스인지 확인합니다.
 * 
 * @param error - 확인할 에러 객체
 * @returns ValidationError 여부
 * 
 * @example
 * ```typescript
 * try {
 *   // 어떤 작업
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     console.log('검증 에러:', error.fields);
 *   }
 * }
 * ```
 */
export function isValidationError(
  error: any
): error is import('./ValidationError').ValidationError {
  return error?.name === 'ValidationError';
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 일반 Error를 ApiError로 변환
 * 
 * 예상하지 못한 에러를 ApiError로 래핑합니다.
 * 
 * @param error - 원본 에러
 * @param message - 사용자에게 표시할 메시지 (선택)
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * try {
 *   JSON.parse(invalidJson);
 * } catch (error) {
 *   throw wrapError(error, '데이터 파싱에 실패했습니다');
 * }
 * ```
 */
export function wrapError(
  error: any,
  message: string = '서버 오류가 발생했습니다'
): import('./ApiError').ApiError {
  const { internalError } = require('./ApiError');
  return internalError(message, error);
}

/**
 * 에러 객체를 JSON으로 변환
 * 
 * Express 응답에서 사용하기 쉽게 에러를 JSON으로 변환합니다.
 * 
 * @param error - 에러 객체
 * @returns JSON 객체
 * 
 * @example
 * ```typescript
 * app.use((error, req, res, next) => {
 *   const errorJson = errorToJson(error);
 *   res.status(errorJson.statusCode).json(errorJson);
 * });
 * ```
 */
export function errorToJson(error: any): {
  success: false;
  error: string;
  code: string;
  statusCode: number;
  fields?: import('./ValidationError').FieldError[];
  data?: any;
  timestamp: string;
} {
  // ValidationError
  if (isValidationError(error)) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      fields: error.fields,
      timestamp: new Date().toISOString(),
    };
  }

  // ApiError
  if (isApiError(error)) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      data: error.data,
      timestamp: new Date().toISOString(),
    };
  }

  // 일반 Error
  return {
    success: false,
    error: error.message || '서버 오류가 발생했습니다',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Express 에러 핸들러 미들웨어
 * 
 * Express에서 사용할 수 있는 에러 핸들러입니다.
 * 
 * @example
 * ```typescript
 * import express from 'express';
 * import { errorHandler } from '@/shared/errors';
 * 
 * const app = express();
 * 
 * // 라우트 정의
 * app.get('/api/products', ...);
 * 
 * // 에러 핸들러 (마지막에 등록)
 * app.use(errorHandler);
 * ```
 */
export function errorHandler(
  error: any,
  req: any,
  res: any,
  next: any
): void {
  // 로그 출력 (프로덕션에서는 로깅 서비스로 전송)
  console.error('[Error]', error);

  // JSON 응답
  const errorJson = errorToJson(error);
  res.status(errorJson.statusCode).json(errorJson);
}
