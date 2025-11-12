/**
 * 유효성 검증 에러 클래스
 * 
 * 폼 입력값이나 API 파라미터의 유효성 검증 실패 시 사용합니다.
 * 필드별 에러 메시지를 관리할 수 있습니다.
 * 
 * @module errors/ValidationError
 * @version 1.0.0
 */

/**
 * 필드 에러
 * 
 * 개별 필드의 유효성 검증 에러를 나타냅니다.
 */
export interface FieldError {
  /**
   * 필드명
   * 
   * @example "customerName", "phone", "email"
   */
  field: string;

  /**
   * 에러 메시지
   * 
   * @example "고객명을 입력해주세요", "올바른 전화번호 형식이 아닙니다"
   */
  message: string;

  /**
   * 검증 규칙
   * 
   * @example "required", "minLength", "email", "phone"
   */
  rule?: string;

  /**
   * 추가 정보
   * 
   * @example { min: 2, max: 50 }
   */
  meta?: any;
}

/**
 * 유효성 검증 에러 클래스
 * 
 * 단일 필드 또는 여러 필드의 유효성 검증 실패를 처리합니다.
 * 
 * @example
 * ```typescript
 * // 단일 필드 에러
 * throw new ValidationError('phone', '올바른 전화번호 형식이 아닙니다');
 * 
 * // 여러 필드 에러
 * const errors: FieldError[] = [
 *   { field: 'customerName', message: '고객명을 입력해주세요', rule: 'required' },
 *   { field: 'phone', message: '올바른 전화번호 형식이 아닙니다', rule: 'phone' }
 * ];
 * throw new ValidationError(errors);
 * 
 * // 에러 핸들러에서
 * if (error instanceof ValidationError) {
 *   return res.status(400).json({
 *     success: false,
 *     error: '입력값이 올바르지 않습니다',
 *     code: 'VALIDATION_ERROR',
 *     fields: error.fields,
 *     timestamp: new Date().toISOString()
 *   });
 * }
 * ```
 */
export class ValidationError extends Error {
  /**
   * 에러 코드
   */
  public readonly code: string = 'VALIDATION_ERROR';

  /**
   * HTTP 상태 코드
   */
  public readonly statusCode: number = 400;

  /**
   * 필드별 에러 목록
   */
  public readonly fields: FieldError[];

  /**
   * ValidationError 생성자
   * 
   * @param fieldOrErrors - 필드명 또는 필드 에러 배열
   * @param message - 에러 메시지 (fieldOrErrors가 문자열일 때만)
   * @param rule - 검증 규칙 (선택)
   * @param meta - 추가 정보 (선택)
   * 
   * @example
   * ```typescript
   * // 방법 1: 단일 필드
   * throw new ValidationError('phone', '올바른 전화번호 형식이 아닙니다', 'phone');
   * 
   * // 방법 2: 여러 필드
   * throw new ValidationError([
   *   { field: 'name', message: '이름을 입력해주세요', rule: 'required' },
   *   { field: 'phone', message: '전화번호를 입력해주세요', rule: 'required' }
   * ]);
   * ```
   */
  constructor(
    fieldOrErrors: string | FieldError[],
    message?: string,
    rule?: string,
    meta?: any
  ) {
    // 메시지 생성
    const errorMessage =
      typeof fieldOrErrors === 'string'
        ? message || '입력값이 올바르지 않습니다'
        : '입력값이 올바르지 않습니다';

    super(errorMessage);

    this.name = 'ValidationError';

    // 필드 에러 배열 설정
    if (typeof fieldOrErrors === 'string') {
      // 단일 필드 에러
      this.fields = [
        {
          field: fieldOrErrors,
          message: message!,
          rule,
          meta,
        },
      ];
    } else {
      // 여러 필드 에러
      this.fields = fieldOrErrors;
    }

    // TypeScript에서 Error를 상속받을 때 필요
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * 특정 필드의 에러 메시지 가져오기
   * 
   * @param field - 필드명
   * @returns 에러 메시지 (없으면 undefined)
   * 
   * @example
   * ```typescript
   * const error = new ValidationError([
   *   { field: 'name', message: '이름을 입력해주세요' },
   *   { field: 'phone', message: '전화번호를 입력해주세요' }
   * ]);
   * 
   * error.getFieldError('name');  // '이름을 입력해주세요'
   * error.getFieldError('email'); // undefined
   * ```
   */
  getFieldError(field: string): string | undefined {
    const fieldError = this.fields.find((f) => f.field === field);
    return fieldError?.message;
  }

  /**
   * 특정 필드에 에러가 있는지 확인
   * 
   * @param field - 필드명
   * @returns 에러 존재 여부
   * 
   * @example
   * ```typescript
   * if (error.hasFieldError('phone')) {
   *   console.log('전화번호 에러:', error.getFieldError('phone'));
   * }
   * ```
   */
  hasFieldError(field: string): boolean {
    return this.fields.some((f) => f.field === field);
  }

  /**
   * 모든 필드 에러 메시지를 배열로 가져오기
   * 
   * @returns 에러 메시지 배열
   * 
   * @example
   * ```typescript
   * const messages = error.getAllMessages();
   * // ['이름을 입력해주세요', '전화번호를 입력해주세요']
   * ```
   */
  getAllMessages(): string[] {
    return this.fields.map((f) => f.message);
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
      fields: this.fields,
    };
  }
}

/**
 * 유효성 검증 에러 생성 헬퍼 함수들
 */

/**
 * 필수 필드 에러
 * 
 * @param field - 필드명
 * @param label - 필드 레이블 (한글)
 * @returns ValidationError 인스턴스
 * 
 * @example
 * ```typescript
 * throw requiredField('customerName', '고객명');
 * // => "고객명을 입력해주세요"
 * ```
 */
export function requiredField(field: string, label: string): ValidationError {
  return new ValidationError(field, `${label}을(를) 입력해주세요`, 'required');
}

/**
 * 최소 길이 에러
 * 
 * @param field - 필드명
 * @param label - 필드 레이블
 * @param minLength - 최소 길이
 * @returns ValidationError 인스턴스
 * 
 * @example
 * ```typescript
 * throw minLengthError('password', '비밀번호', 8);
 * // => "비밀번호는 최소 8자 이상이어야 합니다"
 * ```
 */
export function minLengthError(
  field: string,
  label: string,
  minLength: number
): ValidationError {
  return new ValidationError(
    field,
    `${label}은(는) 최소 ${minLength}자 이상이어야 합니다`,
    'minLength',
    { min: minLength }
  );
}

/**
 * 최대 길이 에러
 * 
 * @param field - 필드명
 * @param label - 필드 레이블
 * @param maxLength - 최대 길이
 * @returns ValidationError 인스턴스
 * 
 * @example
 * ```typescript
 * throw maxLengthError('message', '메시지', 500);
 * // => "메시지는 최대 500자까지 입력 가능합니다"
 * ```
 */
export function maxLengthError(
  field: string,
  label: string,
  maxLength: number
): ValidationError {
  return new ValidationError(
    field,
    `${label}은(는) 최대 ${maxLength}자까지 입력 가능합니다`,
    'maxLength',
    { max: maxLength }
  );
}

/**
 * 잘못된 형식 에러
 * 
 * @param field - 필드명
 * @param label - 필드 레이블
 * @param format - 형식 (예: 'email', 'phone', 'url')
 * @returns ValidationError 인스턴스
 * 
 * @example
 * ```typescript
 * throw invalidFormatError('email', '이메일', 'email');
 * // => "올바른 이메일 형식이 아닙니다"
 * 
 * throw invalidFormatError('phone', '전화번호', 'phone');
 * // => "올바른 전화번호 형식이 아닙니다"
 * ```
 */
export function invalidFormatError(
  field: string,
  label: string,
  format: string
): ValidationError {
  const formatLabels: Record<string, string> = {
    email: '이메일',
    phone: '전화번호',
    url: 'URL',
    date: '날짜',
  };

  const formatLabel = formatLabels[format] || label;

  return new ValidationError(
    field,
    `올바른 ${formatLabel} 형식이 아닙니다`,
    'format',
    { format }
  );
}

/**
 * 범위 에러
 * 
 * @param field - 필드명
 * @param label - 필드 레이블
 * @param min - 최소값
 * @param max - 최대값
 * @returns ValidationError 인스턴스
 * 
 * @example
 * ```typescript
 * throw rangeError('age', '나이', 0, 120);
 * // => "나이는 0~120 사이의 값이어야 합니다"
 * ```
 */
export function rangeError(
  field: string,
  label: string,
  min: number,
  max: number
): ValidationError {
  return new ValidationError(
    field,
    `${label}은(는) ${min}~${max} 사이의 값이어야 합니다`,
    'range',
    { min, max }
  );
}

/**
 * 여러 필드 에러를 하나의 ValidationError로 결합
 * 
 * @param errors - FieldError 배열
 * @returns ValidationError 인스턴스
 * 
 * @example
 * ```typescript
 * const errors: FieldError[] = [];
 * 
 * if (!name) {
 *   errors.push({ field: 'name', message: '이름을 입력해주세요' });
 * }
 * 
 * if (!phone) {
 *   errors.push({ field: 'phone', message: '전화번호를 입력해주세요' });
 * }
 * 
 * if (errors.length > 0) {
 *   throw combineErrors(errors);
 * }
 * ```
 */
export function combineErrors(errors: FieldError[]): ValidationError {
  return new ValidationError(errors);
}
