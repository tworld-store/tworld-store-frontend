/**
 * 유효성 검증 모듈
 * 
 * 데이터 유효성 및 폼 입력값을 검증합니다.
 * 
 * 주요 기능:
 * - products.json 데이터 검증 (기기, 요금제, 지원금)
 * - 폼 입력값 검증 (전화번호, 이메일, 필수값)
 * - 상담 신청 폼 전체 검증
 * 
 * @module validators
 * @version 1.0.0
 */

import type {
  Device,
  Plan,
  Subsidy,
  JoinType,
  ProductsData,
  Brand,
} from './products';

import type { ContractType, InstallmentMonths } from './calculation';

/**
 * 검증 결과 인터페이스
 */
export interface ValidationResult {
  /** 검증 성공 여부 */
  valid: boolean;
  /** 에러 메시지 (검증 실패 시) */
  errors?: string[];
}

/**
 * 필드별 검증 결과
 */
export interface FieldValidationResult {
  /** 필드명 */
  field: string;
  /** 검증 성공 여부 */
  valid: boolean;
  /** 에러 메시지 */
  message?: string;
}

/**
 * 상담 신청 폼 데이터
 */
export interface ConsultationFormData {
  /** 고객명 */
  customerName: string;
  /** 전화번호 */
  phone: string;
  /** 기기 ID */
  deviceId: string;
  /** 요금제 ID */
  planId: string;
  /** 가입 유형 */
  joinType: JoinType;
  /** 약정 유형 */
  contractType: ContractType;
  /** 할부 개월 */
  installmentMonths: InstallmentMonths;
  /** 개인정보 동의 */
  agreeToPrivacy: boolean;
  /** 추가 메시지 (선택) */
  message?: string;
}

/**
 * 유효성 검증 클래스
 * 
 * 모든 검증 메서드는 static으로 제공됩니다.
 * 
 * @example
 * ```typescript
 * // 전화번호 검증
 * const isValid = Validators.phone('010-1234-5678');
 * 
 * // 기기 ID 검증
 * const deviceExists = Validators.deviceId(data, '갤럭시S24_256GB');
 * 
 * // 상담 신청 폼 전체 검증
 * const result = Validators.consultationForm(formData, productsData);
 * if (!result.valid) {
 *   console.error('검증 실패:', result.errors);
 * }
 * ```
 */
export class Validators {
  /**
   * 필수값 검증
   * 
   * @param value - 검증할 값
   * @param fieldName - 필드명 (에러 메시지용)
   * @returns 검증 결과
   * 
   * @example
   * ```typescript
   * Validators.required('', '고객명');
   * // => { valid: false, message: '고객명을 입력해주세요.' }
   * 
   * Validators.required('홍길동', '고객명');
   * // => { valid: true }
   * ```
   */
  static required(
    value: any,
    fieldName: string
  ): { valid: boolean; message?: string } {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '');

    if (isEmpty) {
      return {
        valid: false,
        message: `${fieldName}을(를) 입력해주세요.`,
      };
    }

    return { valid: true };
  }

  /**
   * 최소 길이 검증
   * 
   * @param value - 검증할 문자열
   * @param minLength - 최소 길이
   * @param fieldName - 필드명
   * @returns 검증 결과
   * 
   * @example
   * ```typescript
   * Validators.minLength('홍', 2, '고객명');
   * // => { valid: false, message: '고객명은 최소 2자 이상이어야 합니다.' }
   * ```
   */
  static minLength(
    value: string,
    minLength: number,
    fieldName: string
  ): { valid: boolean; message?: string } {
    if (!value || value.length < minLength) {
      return {
        valid: false,
        message: `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`,
      };
    }

    return { valid: true };
  }

  /**
   * 최대 길이 검증
   * 
   * @param value - 검증할 문자열
   * @param maxLength - 최대 길이
   * @param fieldName - 필드명
   * @returns 검증 결과
   */
  static maxLength(
    value: string,
    maxLength: number,
    fieldName: string
  ): { valid: boolean; message?: string } {
    if (value && value.length > maxLength) {
      return {
        valid: false,
        message: `${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다.`,
      };
    }

    return { valid: true };
  }

  /**
   * 전화번호 형식 검증
   * 
   * 지원 형식:
   * - 010-1234-5678
   * - 010-123-5678
   * - 01012345678
   * - 02-1234-5678 (지역번호)
   * - 031-123-4567 (지역번호)
   * 
   * @param phone - 전화번호
   * @returns 검증 성공 여부
   * 
   * @example
   * ```typescript
   * Validators.phone('010-1234-5678');  // true
   * Validators.phone('01012345678');    // true
   * Validators.phone('02-1234-5678');   // true
   * Validators.phone('invalid');        // false
   * ```
   */
  static phone(phone: string): boolean {
    if (!phone) return false;

    // 하이픈 제거
    const cleaned = phone.replace(/-/g, '');

    // 휴대폰 번호 (010, 011, 016, 017, 018, 019)
    const mobilePattern = /^01[0-9]{8,9}$/;

    // 지역번호 (02, 031-064)
    const localPattern = /^(02|0[3-9]{1}[0-9]{1})[0-9]{7,8}$/;

    return mobilePattern.test(cleaned) || localPattern.test(cleaned);
  }

  /**
   * 이메일 형식 검증
   * 
   * @param email - 이메일 주소
   * @returns 검증 성공 여부
   * 
   * @example
   * ```typescript
   * Validators.email('user@example.com');  // true
   * Validators.email('invalid');           // false
   * ```
   */
  static email(email: string): boolean {
    if (!email) return false;

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  /**
   * 기기 ID 존재 여부 검증
   * 
   * @param data - products.json 데이터
   * @param deviceId - 검증할 기기 ID
   * @returns 검증 성공 여부
   * 
   * @example
   * ```typescript
   * const exists = Validators.deviceId(productsData, '갤럭시S24_256GB');
   * if (!exists) {
   *   console.error('존재하지 않는 기기입니다.');
   * }
   * ```
   */
  static deviceId(data: ProductsData, deviceId: string): boolean {
    return data.devices.some((device) => device.id === deviceId);
  }

  /**
   * 요금제 ID 존재 여부 검증
   * 
   * @param data - products.json 데이터
   * @param planId - 검증할 요금제 ID
   * @returns 검증 성공 여부
   */
  static planId(data: ProductsData, planId: string): boolean {
    return data.plans.some((plan) => plan.id === planId);
  }

  /**
   * 브랜드 유효성 검증
   * 
   * @param brand - 검증할 브랜드
   * @returns 검증 성공 여부
   */
  static brand(brand: string): brand is Brand {
    const validBrands: Brand[] = ['samsung', 'apple', 'etc'];
    return validBrands.includes(brand as Brand);
  }

  /**
   * 가입 유형 유효성 검증
   * 
   * @param joinType - 검증할 가입 유형
   * @returns 검증 성공 여부
   */
  static joinType(joinType: string): joinType is JoinType {
    const validTypes: JoinType[] = ['change', 'transfer', 'new'];
    return validTypes.includes(joinType as JoinType);
  }

  /**
   * 약정 유형 유효성 검증
   * 
   * @param contractType - 검증할 약정 유형
   * @returns 검증 성공 여부
   */
  static contractType(contractType: string): contractType is ContractType {
    return contractType === '공시지원' || contractType === '선택약정';
  }

  /**
   * 할부 개월 유효성 검증
   * 
   * @param months - 검증할 할부 개월
   * @returns 검증 성공 여부
   */
  static installmentMonths(months: number): months is InstallmentMonths {
    const validMonths: InstallmentMonths[] = [0, 12, 24, 36];
    return validMonths.includes(months as InstallmentMonths);
  }

  /**
   * 지원금 조합 존재 여부 검증
   * 
   * 특정 기기 + 요금제 + 가입유형 조합의 지원금이 존재하는지 검증합니다.
   * 
   * @param data - products.json 데이터
   * @param deviceId - 기기 ID
   * @param planId - 요금제 ID
   * @param joinType - 가입 유형
   * @returns 검증 성공 여부
   * 
   * @example
   * ```typescript
   * const exists = Validators.subsidyExists(
   *   productsData,
   *   '갤럭시S24_256GB',
   *   '0청년109',
   *   'change'
   * );
   * 
   * if (!exists) {
   *   console.error('해당 조합의 지원금이 없습니다.');
   * }
   * ```
   */
  static subsidyExists(
    data: ProductsData,
    deviceId: string,
    planId: string,
    joinType: JoinType
  ): boolean {
    return data.subsidies[joinType].some(
      (subsidy) => subsidy.deviceId === deviceId && subsidy.planId === planId
    );
  }

  /**
   * 기기 + 요금제 + 가입유형 조합 전체 검증
   * 
   * 1. 기기 존재 여부
   * 2. 요금제 존재 여부
   * 3. 지원금 조합 존재 여부
   * 
   * @param data - products.json 데이터
   * @param deviceId - 기기 ID
   * @param planId - 요금제 ID
   * @param joinType - 가입 유형
   * @returns 검증 결과
   * 
   * @example
   * ```typescript
   * const result = Validators.validateCombination(
   *   productsData,
   *   '갤럭시S24_256GB',
   *   '0청년109',
   *   'change'
   * );
   * 
   * if (!result.valid) {
   *   console.error('검증 실패:', result.errors);
   * }
   * ```
   */
  static validateCombination(
    data: ProductsData,
    deviceId: string,
    planId: string,
    joinType: JoinType
  ): ValidationResult {
    const errors: string[] = [];

    // 1. 기기 존재 여부
    if (!this.deviceId(data, deviceId)) {
      errors.push(`존재하지 않는 기기입니다: ${deviceId}`);
    }

    // 2. 요금제 존재 여부
    if (!this.planId(data, planId)) {
      errors.push(`존재하지 않는 요금제입니다: ${planId}`);
    }

    // 3. 가입 유형 유효성
    if (!this.joinType(joinType)) {
      errors.push(`유효하지 않은 가입 유형입니다: ${joinType}`);
    }

    // 4. 지원금 조합 존재 여부 (기기와 요금제가 유효한 경우에만)
    if (errors.length === 0) {
      if (!this.subsidyExists(data, deviceId, planId, joinType)) {
        errors.push(
          `해당 조합의 지원금이 존재하지 않습니다: ${deviceId} + ${planId} (${joinType})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 상담 신청 폼 전체 검증
   * 
   * 모든 필수 필드와 데이터 조합을 검증합니다.
   * 
   * @param formData - 폼 데이터
   * @param productsData - products.json 데이터
   * @returns 검증 결과
   * 
   * @example
   * ```typescript
   * const formData: ConsultationFormData = {
   *   customerName: '홍길동',
   *   phone: '010-1234-5678',
   *   deviceId: '갤럭시S24_256GB',
   *   planId: '0청년109',
   *   joinType: 'change',
   *   contractType: '공시지원',
   *   installmentMonths: 24,
   *   agreeToPrivacy: true,
   *   message: '상담 요청드립니다.'
   * };
   * 
   * const result = Validators.consultationForm(formData, productsData);
   * 
   * if (result.valid) {
   *   // 폼 제출
   * } else {
   *   // 에러 표시
   *   console.error(result.errors);
   * }
   * ```
   */
  static consultationForm(
    formData: ConsultationFormData,
    productsData: ProductsData
  ): ValidationResult {
    const errors: string[] = [];

    // 1. 고객명 검증
    const nameCheck = this.required(formData.customerName, '고객명');
    if (!nameCheck.valid) {
      errors.push(nameCheck.message!);
    } else {
      const lengthCheck = this.minLength(formData.customerName, 2, '고객명');
      if (!lengthCheck.valid) {
        errors.push(lengthCheck.message!);
      }
    }

    // 2. 전화번호 검증
    const phoneRequiredCheck = this.required(formData.phone, '전화번호');
    if (!phoneRequiredCheck.valid) {
      errors.push(phoneRequiredCheck.message!);
    } else if (!this.phone(formData.phone)) {
      errors.push('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
    }

    // 3. 기기 ID 검증
    if (!this.deviceId(productsData, formData.deviceId)) {
      errors.push('선택한 기기가 유효하지 않습니다.');
    }

    // 4. 요금제 ID 검증
    if (!this.planId(productsData, formData.planId)) {
      errors.push('선택한 요금제가 유효하지 않습니다.');
    }

    // 5. 가입 유형 검증
    if (!this.joinType(formData.joinType)) {
      errors.push('유효하지 않은 가입 유형입니다.');
    }

    // 6. 약정 유형 검증
    if (!this.contractType(formData.contractType)) {
      errors.push('유효하지 않은 약정 유형입니다.');
    }

    // 7. 할부 개월 검증
    if (!this.installmentMonths(formData.installmentMonths)) {
      errors.push('유효하지 않은 할부 개월입니다. (0, 12, 24, 36개월 중 선택)');
    }

    // 8. 지원금 조합 검증 (기기, 요금제, 가입유형이 모두 유효한 경우)
    if (
      this.deviceId(productsData, formData.deviceId) &&
      this.planId(productsData, formData.planId) &&
      this.joinType(formData.joinType)
    ) {
      if (
        !this.subsidyExists(
          productsData,
          formData.deviceId,
          formData.planId,
          formData.joinType
        )
      ) {
        errors.push('선택한 조합에 대한 지원금 정보가 없습니다.');
      }
    }

    // 9. 개인정보 동의 검증
    if (!formData.agreeToPrivacy) {
      errors.push('개인정보 수집 및 이용에 동의해주세요.');
    }

    // 10. 추가 메시지 길이 검증 (선택사항)
    if (formData.message) {
      const messageCheck = this.maxLength(formData.message, 500, '추가 메시지');
      if (!messageCheck.valid) {
        errors.push(messageCheck.message!);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 필드별 개별 검증 (실시간 검증용)
   * 
   * 각 필드를 개별적으로 검증하여 즉시 피드백을 제공할 때 사용합니다.
   * 
   * @param field - 필드명
   * @param value - 필드값
   * @param productsData - products.json 데이터 (필요 시)
   * @returns 필드 검증 결과
   * 
   * @example
   * ```typescript
   * // 실시간 검증
   * const result = Validators.validateField(
   *   'phone',
   *   '010-1234-5678',
   *   productsData
   * );
   * 
   * if (!result.valid) {
   *   showError(result.message);
   * }
   * ```
   */
  static validateField(
    field: keyof ConsultationFormData,
    value: any,
    productsData?: ProductsData
  ): FieldValidationResult {
    switch (field) {
      case 'customerName': {
        const requiredCheck = this.required(value, '고객명');
        if (!requiredCheck.valid) {
          return {
            field,
            valid: false,
            message: requiredCheck.message,
          };
        }
        const lengthCheck = this.minLength(value, 2, '고객명');
        if (!lengthCheck.valid) {
          return {
            field,
            valid: false,
            message: lengthCheck.message,
          };
        }
        return { field, valid: true };
      }

      case 'phone': {
        const requiredCheck = this.required(value, '전화번호');
        if (!requiredCheck.valid) {
          return {
            field,
            valid: false,
            message: requiredCheck.message,
          };
        }
        if (!this.phone(value)) {
          return {
            field,
            valid: false,
            message: '올바른 전화번호 형식이 아닙니다.',
          };
        }
        return { field, valid: true };
      }

      case 'deviceId': {
        if (!productsData) {
          return {
            field,
            valid: false,
            message: '데이터를 불러올 수 없습니다.',
          };
        }
        if (!this.deviceId(productsData, value)) {
          return {
            field,
            valid: false,
            message: '선택한 기기가 유효하지 않습니다.',
          };
        }
        return { field, valid: true };
      }

      case 'planId': {
        if (!productsData) {
          return {
            field,
            valid: false,
            message: '데이터를 불러올 수 없습니다.',
          };
        }
        if (!this.planId(productsData, value)) {
          return {
            field,
            valid: false,
            message: '선택한 요금제가 유효하지 않습니다.',
          };
        }
        return { field, valid: true };
      }

      case 'agreeToPrivacy': {
        if (!value) {
          return {
            field,
            valid: false,
            message: '개인정보 수집 및 이용에 동의해주세요.',
          };
        }
        return { field, valid: true };
      }

      case 'message': {
        if (value) {
          const lengthCheck = this.maxLength(value, 500, '추가 메시지');
          if (!lengthCheck.valid) {
            return {
              field,
              valid: false,
              message: lengthCheck.message,
            };
          }
        }
        return { field, valid: true };
      }

      default:
        return { field, valid: true };
    }
  }
}

/**
 * 타입 가드: Device 객체 검증
 * 
 * @param obj - 검증할 객체
 * @returns Device 타입 여부
 */
export function isDevice(obj: any): obj is Device {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.brand === 'string' &&
    typeof obj.model === 'string' &&
    typeof obj.storage === 'number' &&
    typeof obj.price === 'number' &&
    Array.isArray(obj.colors)
  );
}

/**
 * 타입 가드: Plan 객체 검증
 * 
 * @param obj - 검증할 객체
 * @returns Plan 타입 여부
 */
export function isPlan(obj: any): obj is Plan {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.basePrice === 'number' &&
    typeof obj.data === 'string' &&
    typeof obj.call === 'string' &&
    typeof obj.sms === 'string'
  );
}

/**
 * 타입 가드: Subsidy 객체 검증
 * 
 * @param obj - 검증할 객체
 * @returns Subsidy 타입 여부
 */
export function isSubsidy(obj: any): obj is Subsidy {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.deviceId === 'string' &&
    typeof obj.planId === 'string' &&
    typeof obj.common === 'number' &&
    typeof obj.additional === 'number' &&
    typeof obj.select === 'number'
  );
}
