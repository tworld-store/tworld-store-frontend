/**
 * 가격 계산 관련 타입 정의
 * 
 * calculator.ts 모듈에서 사용하는 타입들
 * 
 * @module types/calculation
 * @version 1.0.0
 */

import type { Device, Plan, Subsidy, JoinType } from './products';

/**
 * 약정 유형
 */
export type ContractType = '공시지원' | '선택약정';

/**
 * 할부 개월 수
 */
export type InstallmentMonths = 0 | 12 | 24 | 36;

/**
 * 가격 계산 입력 파라미터
 * 
 * calculator.calculate() 함수의 입력값
 */
export interface CalculationInput {
  /** 선택한 기기 */
  device: Device;
  
  /** 선택한 요금제 */
  plan: Plan;
  
  /** 해당 조합의 지원금 */
  subsidy: Subsidy;
  
  /** 가입 유형 */
  joinType: JoinType;
  
  /** 할부 개월 수 (0은 일시불) */
  installmentMonths: InstallmentMonths;
  
  /** 약정 유형 */
  contractType: ContractType;
  
  /** 결합할인 여부 (인터넷+TV) */
  bundleDiscount?: boolean;
}

/**
 * 가격 계산 결과
 * 
 * calculator.calculate() 함수의 반환값
 */
export interface CalculationResult {
  /** 월 휴대폰 요금 (기기 할부금) */
  monthlyDeviceFee: number;
  
  /** 월 통신 요금 (요금제 - 할인) */
  monthlyPlanFee: number;
  
  /** 예상 월 납부액 (기기 + 통신) */
  totalMonthlyFee: number;
  
  /** 상세 내역 */
  breakdown: {
    /** 기기 출고가 */
    devicePrice: number;
    
    /** 적용된 지원금 */
    appliedSubsidy: number;
    
    /** 실제 기기 부담금 */
    deviceNetPrice: number;
    
    /** 월 기기 할부금 */
    monthlyDevice: number;
    
    /** 요금제 기본료 */
    planBasePrice: number;
    
    /** 선택약정 할인 (해당 시) */
    selectiveDiscount: number;
    
    /** 결합할인 (해당 시) */
    bundleDiscountAmount: number;
    
    /** 월 통신료 */
    monthlyPlan: number;
    
    /** 부가세 포함 여부 */
    vatIncluded: boolean;
  };
  
  /** 계약 정보 */
  contract: {
    /** 가입 유형 */
    joinType: JoinType;
    
    /** 가입 유형 한글명 */
    joinTypeName: string;
    
    /** 약정 유형 */
    contractType: ContractType;
    
    /** 할부 개월 */
    installmentMonths: InstallmentMonths;
  };
}

/**
 * 가격 계산 옵션
 * 
 * calculator 인스턴스 생성 시 사용
 */
export interface CalculatorOptions {
  /** 할부 이자율 (연) */
  installmentInterestRate?: number;
  
  /** 선택약정 할인율 */
  selectiveDiscountRate?: number;
  
  /** 부가세율 */
  vatRate?: number;
  
  /** 결합할인율 */
  bundleDiscountRate?: number;
}

/**
 * 월 휴대폰 요금 계산 파라미터
 */
export interface MonthlyDeviceFeeParams {
  /** 기기 출고가 */
  devicePrice: number;
  
  /** 할부 개월 */
  installmentMonths: InstallmentMonths;
  
  /** 약정 유형 */
  contractType: ContractType;
  
  /** 지원금 */
  subsidy: Subsidy;
}

/**
 * 월 통신 요금 계산 파라미터
 */
export interface MonthlyPlanFeeParams {
  /** 요금제 기본료 */
  planBasePrice: number;
  
  /** 약정 유형 */
  contractType: ContractType;
  
  /** 결합할인 여부 */
  bundleDiscount?: boolean;
}
