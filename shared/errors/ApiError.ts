/**
 * API 에러 클래스
 * 
 * Firebase Functions API에서 발생하는 에러를 표준화합니다.
 * HTTP 상태 코드와 에러 코드를 포함합니다.
 * 
 * @module errors/ApiError
 * @version 1.0.0
 */

/**
 * API 에러 클래스
 * 
 * Firebase Functions에서 발생하는 모든 에러는 이 클래스를 사용합니다.
 * 
 * @example
 * ```typescript
 * // 사용 예시
 * throw new ApiError(
 *   'PRODUCT_NOT_FOUND',
 *   '상품을 찾을 수 없습니다',
 *   404
 * );
 * 
 * // 에러 핸들러에서
 * if (error instanceof ApiError) {
 *   return res.status(error.statusCode).json({
 *     success: false,
 *     error: error.message,
 *     code: error.code,
 *     timestamp: new Date().toISOString()
 *   });
 * }
 * ```
 */
export class ApiError extends Error {
  /**
   * 에러 코드
   * 
   * API 에러를 구분하는 고유 코드입니다.
   * 
   * @example "PRODUCT_NOT_FOUND", "INVALID_REQUEST"
   */
  public readonly code: string;

  /**
   * HTTP 상태 코드
   * 
   * @example 400, 404, 500
   */
  public readonly statusCode: number;

  /**
   * 추가 데이터
   * 
   * 에러와 관련된 추가 정보를 담을 수 있습니다.
   */
  public readonly data?: any;

  /**
   * ApiError 생성자
   * 
   * @param code - 에러 코드
   * @param message - 에러 메시지 (사용자에게 표시될 메시지)
   * @param statusCode - HTTP 상태 코드 (기본값: 500)
   * @param data - 추가 데이터 (선택)
   * 
   * @example
   * ```typescript
   * // 404 에러
   * throw new ApiError(
   *   'PRODUCT_NOT_FOUND',
   *   '상품을 찾을 수 없습니다',
   *   404
   * );
   * 
   * // 400 에러 (추가 데이터 포함)
   * throw new ApiError(
   *   'INVALID_REQUEST',
   *   '잘못된 요청입니다',
   *   400,
   *   { field: 'email', reason: 'Invalid format' }
   * );
   * ```
   */
  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    data?: any
  ) {
    super(message);
    
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;

    // TypeScript에서 Error를 상속받을 때 필요
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * JSON 직렬화
   * 
   * JSON.stringify() 호출 시 자동으로 호출됩니다.
   * 
   * @returns 직렬화된 에러 객체
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
    };
  }
}

/**
 * 미리 정의된 API 에러 생성 헬퍼 함수들
 */

/**
 * 400 Bad Request 에러
 * 
 * 잘못된 요청 시 사용합니다.
 * 
 * @param message - 에러 메시지
 * @param data - 추가 데이터
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw badRequest('필수 파라미터가 누락되었습니다', { missing: ['name', 'phone'] });
 * ```
 */
export function badRequest(message: string, data?: any): ApiError {
  return new ApiError('INVALID_REQUEST', message, 400, data);
}

/**
 * 401 Unauthorized 에러
 * 
 * 인증이 필요한 경우 사용합니다.
 * 
 * @param message - 에러 메시지 (기본값: '인증이 필요합니다')
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw unauthorized('로그인이 필요합니다');
 * ```
 */
export function unauthorized(message: string = '인증이 필요합니다'): ApiError {
  return new ApiError('UNAUTHORIZED', message, 401);
}

/**
 * 403 Forbidden 에러
 * 
 * 권한이 없는 경우 사용합니다.
 * 
 * @param message - 에러 메시지 (기본값: '권한이 없습니다')
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw forbidden('관리자만 접근할 수 있습니다');
 * ```
 */
export function forbidden(message: string = '권한이 없습니다'): ApiError {
  return new ApiError('FORBIDDEN', message, 403);
}

/**
 * 404 Not Found 에러
 * 
 * 리소스를 찾을 수 없는 경우 사용합니다.
 * 
 * @param resource - 리소스 이름
 * @param id - 리소스 ID (선택)
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw notFound('상품', 'galaxy-s24');
 * // => "상품을 찾을 수 없습니다"
 * ```
 */
export function notFound(resource: string, id?: string): ApiError {
  const message = id
    ? `${resource}(${id})을 찾을 수 없습니다`
    : `${resource}을 찾을 수 없습니다`;
  
  return new ApiError('NOT_FOUND', message, 404, { resource, id });
}

/**
 * 409 Conflict 에러
 * 
 * 중복된 리소스가 있는 경우 사용합니다.
 * 
 * @param message - 에러 메시지
 * @param data - 추가 데이터
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw conflict('이미 존재하는 이메일입니다', { email: 'test@example.com' });
 * ```
 */
export function conflict(message: string, data?: any): ApiError {
  return new ApiError('CONFLICT', message, 409, data);
}

/**
 * 429 Too Many Requests 에러
 * 
 * Rate Limit 초과 시 사용합니다.
 * 
 * @param retryAfter - 재시도 가능 시간 (초)
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw tooManyRequests(60);
 * // => "요청 한도를 초과했습니다. 60초 후 다시 시도해주세요"
 * ```
 */
export function tooManyRequests(retryAfter: number = 60): ApiError {
  return new ApiError(
    'RATE_LIMIT_EXCEEDED',
    `요청 한도를 초과했습니다. ${retryAfter}초 후 다시 시도해주세요`,
    429,
    { retryAfter }
  );
}

/**
 * 500 Internal Server Error
 * 
 * 예상하지 못한 서버 에러 시 사용합니다.
 * 
 * @param message - 에러 메시지 (기본값: '서버 오류가 발생했습니다')
 * @param originalError - 원본 에러 객체 (선택)
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * try {
 *   // 어떤 작업
 * } catch (error) {
 *   throw internalError('데이터 처리 중 오류가 발생했습니다', error);
 * }
 * ```
 */
export function internalError(
  message: string = '서버 오류가 발생했습니다',
  originalError?: any
): ApiError {
  return new ApiError('INTERNAL_ERROR', message, 500, {
    originalError: originalError?.message || String(originalError),
  });
}

/**
 * 503 Service Unavailable 에러
 * 
 * 서비스 일시 중단 시 사용합니다.
 * 
 * @param message - 에러 메시지 (기본값: '서비스를 일시적으로 사용할 수 없습니다')
 * @returns ApiError 인스턴스
 * 
 * @example
 * ```typescript
 * throw serviceUnavailable('서버 점검 중입니다');
 * ```
 */
export function serviceUnavailable(
  message: string = '서비스를 일시적으로 사용할 수 없습니다'
): ApiError {
  return new ApiError('SERVICE_UNAVAILABLE', message, 503);
}
