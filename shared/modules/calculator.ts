/**
 * 가격 계산 모듈
 * 
 * products.json 데이터를 기반으로 휴대폰 요금을 계산합니다.
 * 
 * 주요 기능:
 * - 월 기기 할부금 계산 (공시지원 / 선택약정)
 * - 월 통신 요금 계산 (약정할인 적용)
 * - 예상 월 납부액 계산
 * - 공시지원 vs 선택약정 비교
 * 
 * @module calculator
 * @version 1.0.0
 */

import type {
  Device,
  Plan,
  Subsidy,
  JoinType,
  ProductsData,
  GlobalSettings,
} from './products';

import type {
  ContractType,
  InstallmentMonths,
  CalculationInput,
  CalculationResult,
  CalculatorOptions,
  MonthlyDeviceFeeParams,
  MonthlyPlanFeeParams,
} from './calculation';

import { JOIN_TYPE_NAMES } from './products';

/**
 * 가격 계산기 클래스
 * 
 * products.json의 GlobalSettings를 기반으로 초기화하거나
 * 커스텀 옵션으로 생성할 수 있습니다.
 * 
 * @example
 * ```typescript
 * const calculator = new PriceCalculator({
 *   installmentInterestRate: 0.059,  // 5.9%
 *   selectiveDiscountRate: 0.25,     // 25%
 *   vatRate: 0.1,                    // 10%
 *   bundleDiscountRate: 0.10         // 10%
 * });
 * 
 * const result = calculator.calculate({
 *   device: selectedDevice,
 *   plan: selectedPlan,
 *   subsidy: selectedSubsidy,
 *   joinType: 'change',
 *   installmentMonths: 24,
 *   contractType: '공시지원',
 *   bundleDiscount: true
 * });
 * ```
 */
export class PriceCalculator {
  /** 할부 이자율 (연) - 예: 0.059 = 5.9% */
  private installmentInterestRate: number;
  
  /** 선택약정 할인율 - 예: 0.25 = 25% */
  private selectiveDiscountRate: number;
  
  /** 부가세율 - 예: 0.1 = 10% */
  private vatRate: number;
  
  /** 결합할인율 - 예: 0.10 = 10% */
  private bundleDiscountRate: number;

  /**
   * PriceCalculator 생성자
   * 
   * @param options - 계산 옵션 (선택사항)
   * @param options.installmentInterestRate - 할부 이자율 (기본값: 0.059)
   * @param options.selectiveDiscountRate - 선택약정 할인율 (기본값: 0.25)
   * @param options.vatRate - 부가세율 (기본값: 0.1)
   * @param options.bundleDiscountRate - 결합할인율 (기본값: 0.10)
   */
  constructor(options: CalculatorOptions = {}) {
    this.installmentInterestRate = options.installmentInterestRate ?? 0.059;
    this.selectiveDiscountRate = options.selectiveDiscountRate ?? 0.25;
    this.vatRate = options.vatRate ?? 0.1;
    this.bundleDiscountRate = options.bundleDiscountRate ?? 0.10;
  }

  /**
   * GlobalSettings로부터 PriceCalculator 인스턴스 생성
   * 
   * @param settings - products.json의 settings 객체
   * @returns PriceCalculator 인스턴스
   * 
   * @example
   * ```typescript
   * const data = await loadProductsData();
   * const calculator = PriceCalculator.fromSettings(data.settings);
   * ```
   */
  static fromSettings(settings: GlobalSettings): PriceCalculator {
    return new PriceCalculator({
      installmentInterestRate: settings.installmentInterestRate,
      selectiveDiscountRate: settings.selectiveDiscountRate,
      vatRate: settings.vatRate,
    });
  }

  /**
   * 전체 가격 계산 (메인 함수)
   * 
   * 선택한 기기, 요금제, 지원금을 기반으로
   * 월 납부액과 상세 내역을 계산합니다.
   * 
   * @param input - 계산 입력 파라미터
   * @returns 계산 결과 (월 납부액, 상세 내역 등)
   * 
   * @throws {Error} 유효하지 않은 입력값인 경우
   * 
   * @example
   * ```typescript
   * const result = calculator.calculate({
   *   device: { id: '갤럭시S24_256GB', price: 1250000, ... },
   *   plan: { id: '0청년109', basePrice: 109000, ... },
   *   subsidy: { common: 300000, additional: 100000, select: 50000, ... },
   *   joinType: 'change',
   *   installmentMonths: 24,
   *   contractType: '공시지원',
   *   bundleDiscount: true
   * });
   * 
   * console.log(`월 납부액: ${result.totalMonthlyFee}원`);
   * ```
   */
  calculate(input: CalculationInput): CalculationResult {
    // 입력값 검증
    this.validateInput(input);

    const {
      device,
      plan,
      subsidy,
      joinType,
      installmentMonths,
      contractType,
      bundleDiscount = false,
    } = input;

    // 1. 월 기기 할부금 계산
    const monthlyDeviceFee = this.calculateMonthlyDevice({
      devicePrice: device.price,
      installmentMonths,
      contractType,
      subsidy,
    });

    // 2. 월 통신 요금 계산
    const monthlyPlanFee = this.calculateMonthlyPlan({
      planBasePrice: plan.basePrice,
      contractType,
      bundleDiscount,
    });

    // 3. 예상 월 납부액 (기기 + 통신)
    const totalMonthlyFee = monthlyDeviceFee + monthlyPlanFee;

    // 4. 적용된 지원금 계산
    const appliedSubsidy = this.calculateAppliedSubsidy(contractType, subsidy);

    // 5. 실제 기기 부담금
    const deviceNetPrice = device.price - appliedSubsidy;

    // 6. 선택약정 할인 (해당 시)
    const selectiveDiscount =
      contractType === '선택약정'
        ? Math.floor(plan.basePrice * this.selectiveDiscountRate)
        : 0;

    // 7. 결합할인 (해당 시)
    const bundleDiscountAmount = bundleDiscount
      ? Math.floor(plan.basePrice * this.bundleDiscountRate)
      : 0;

    // 8. 가입 유형 한글명
    const joinTypeName = JOIN_TYPE_NAMES[joinType];

    return {
      monthlyDeviceFee,
      monthlyPlanFee,
      totalMonthlyFee,
      breakdown: {
        devicePrice: device.price,
        appliedSubsidy,
        deviceNetPrice,
        monthlyDevice: monthlyDeviceFee,
        planBasePrice: plan.basePrice,
        selectiveDiscount,
        bundleDiscountAmount,
        monthlyPlan: monthlyPlanFee,
        vatIncluded: true,
      },
      contract: {
        joinType,
        joinTypeName,
        contractType,
        installmentMonths,
      },
    };
  }

  /**
   * 월 기기 할부금 계산
   * 
   * 약정 유형에 따라 지원금을 차감하고 할부금을 계산합니다.
   * 
   * @param params - 계산 파라미터
   * @returns 월 기기 할부금 (원)
   * 
   * @example
   * ```typescript
   * // 공시지원: 출고가 - (공시지원금 + 추가지원금)
   * const monthlyFee = calculator.calculateMonthlyDevice({
   *   devicePrice: 1250000,
   *   installmentMonths: 24,
   *   contractType: '공시지원',
   *   subsidy: { common: 300000, additional: 100000, select: 50000, ... }
   * });
   * // => (1250000 - 400000) / 24 = 35416원
   * ```
   */
  calculateMonthlyDevice(params: MonthlyDeviceFeeParams): number {
    const { devicePrice, installmentMonths, contractType, subsidy } = params;

    // 일시불인 경우
    if (installmentMonths === 0) {
      return 0;
    }

    // 적용 지원금 계산
    const appliedSubsidy = this.calculateAppliedSubsidy(contractType, subsidy);

    // 실제 부담금
    const netPrice = devicePrice - appliedSubsidy;

    // 할부금 계산 (이자 포함)
    const monthlyPayment = this.calculateInstallment(
      netPrice,
      installmentMonths,
      this.installmentInterestRate
    );

    return Math.floor(monthlyPayment);
  }

  /**
   * 월 통신 요금 계산
   * 
   * 약정 유형과 결합할인 여부에 따라 할인을 적용합니다.
   * 
   * @param params - 계산 파라미터
   * @returns 월 통신 요금 (원)
   * 
   * @example
   * ```typescript
   * // 선택약정 + 결합할인
   * const monthlyPlan = calculator.calculateMonthlyPlan({
   *   planBasePrice: 109000,
   *   contractType: '선택약정',
   *   bundleDiscount: true
   * });
   * // => 109000 - (109000 * 0.25) - (109000 * 0.10) = 70850원
   * ```
   */
  calculateMonthlyPlan(params: MonthlyPlanFeeParams): number {
    const { planBasePrice, contractType, bundleDiscount = false } = params;

    let discountedPrice = planBasePrice;

    // 1. 선택약정 할인 적용
    if (contractType === '선택약정') {
      const selectiveDiscount = Math.floor(
        planBasePrice * this.selectiveDiscountRate
      );
      discountedPrice -= selectiveDiscount;
    }

    // 2. 결합할인 적용
    if (bundleDiscount) {
      const bundleDiscountAmount = Math.floor(
        planBasePrice * this.bundleDiscountRate
      );
      discountedPrice -= bundleDiscountAmount;
    }

    return Math.floor(discountedPrice);
  }

  /**
   * 적용 지원금 계산
   * 
   * 약정 유형에 따라 적용되는 지원금을 계산합니다.
   * - 공시지원: 공시지원금 + 추가지원금
   * - 선택약정: 선택약정 할인금
   * 
   * @param contractType - 약정 유형
   * @param subsidy - 지원금 객체
   * @returns 적용 지원금 (원)
   * 
   * @example
   * ```typescript
   * const subsidy = { common: 300000, additional: 100000, select: 50000, ... };
   * 
   * calculator.calculateAppliedSubsidy('공시지원', subsidy);
   * // => 300000 + 100000 = 400000원
   * 
   * calculator.calculateAppliedSubsidy('선택약정', subsidy);
   * // => 50000원
   * ```
   */
  private calculateAppliedSubsidy(
    contractType: ContractType,
    subsidy: Subsidy
  ): number {
    if (contractType === '공시지원') {
      return subsidy.common + subsidy.additional;
    } else {
      return subsidy.select;
    }
  }

  /**
   * 할부금 계산 (이자 포함)
   * 
   * 원금균등상환 방식으로 월 할부금을 계산합니다.
   * 
   * @param principal - 원금 (지원금 차감 후)
   * @param months - 할부 개월 수
   * @param annualRate - 연 이자율 (예: 0.059)
   * @returns 월 할부금 (원)
   * 
   * @throws {Error} 유효하지 않은 할부 개월 수
   * 
   * @example
   * ```typescript
   * // 850,000원을 24개월, 연 5.9% 이자로 할부
   * const monthly = calculator.calculateInstallment(850000, 24, 0.059);
   * // => 약 37,708원
   * ```
   */
  private calculateInstallment(
    principal: number,
    months: InstallmentMonths,
    annualRate: number
  ): number {
    // 일시불
    if (months === 0) {
      return 0;
    }

    // 무이자 할부 (이자율이 0인 경우)
    if (annualRate === 0) {
      return principal / months;
    }

    // 월 이자율
    const monthlyRate = annualRate / 12;

    // 원리금균등상환 공식
    // 월 할부금 = 원금 × (월 이자율 × (1 + 월 이자율)^개월 수) / ((1 + 월 이자율)^개월 수 - 1)
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return numerator / denominator;
  }

  /**
   * 공시지원 vs 선택약정 비교
   * 
   * 동일한 조건에서 두 약정 유형을 비교하여
   * 어느 것이 더 유리한지 계산합니다.
   * 
   * @param input - 계산 입력 파라미터 (contractType 제외)
   * @returns 비교 결과
   * 
   * @example
   * ```typescript
   * const comparison = calculator.compare({
   *   device: selectedDevice,
   *   plan: selectedPlan,
   *   subsidy: selectedSubsidy,
   *   joinType: 'change',
   *   installmentMonths: 24,
   *   bundleDiscount: true,
   *   contractType: '공시지원' // 이 값은 무시됨
   * });
   * 
   * console.log('공시지원 월 납부:', comparison.commonSupport.monthlyFee);
   * console.log('선택약정 월 납부:', comparison.selectiveContract.monthlyFee);
   * console.log('추천:', comparison.recommendation);
   * console.log('차액:', comparison.difference);
   * ```
   */
  compare(input: Omit<CalculationInput, 'contractType'>): {
    /** 공시지원 결과 */
    commonSupport: {
      monthlyFee: number;
      totalCost: number;
    };
    /** 선택약정 결과 */
    selectiveContract: {
      monthlyFee: number;
      totalCost: number;
    };
    /** 월 납부액 차이 (절대값) */
    difference: number;
    /** 추천 약정 유형 */
    recommendation: ContractType;
  } {
    // 1. 공시지원 계산
    const commonResult = this.calculate({
      ...input,
      contractType: '공시지원',
    });

    const commonTotalCost =
      commonResult.totalMonthlyFee * input.installmentMonths;

    // 2. 선택약정 계산
    const selectiveResult = this.calculate({
      ...input,
      contractType: '선택약정',
    });

    const selectiveTotalCost =
      selectiveResult.totalMonthlyFee * input.installmentMonths;

    // 3. 차이 계산
    const difference = Math.abs(
      commonResult.totalMonthlyFee - selectiveResult.totalMonthlyFee
    );

    // 4. 추천 (총 비용이 낮은 쪽)
    const recommendation: ContractType =
      commonTotalCost <= selectiveTotalCost ? '공시지원' : '선택약정';

    return {
      commonSupport: {
        monthlyFee: commonResult.totalMonthlyFee,
        totalCost: commonTotalCost,
      },
      selectiveContract: {
        monthlyFee: selectiveResult.totalMonthlyFee,
        totalCost: selectiveTotalCost,
      },
      difference,
      recommendation,
    };
  }

  /**
   * 입력값 유효성 검증
   * 
   * @param input - 계산 입력 파라미터
   * @throws {Error} 유효하지 않은 입력값
   */
  private validateInput(input: CalculationInput): void {
    const { device, plan, subsidy, installmentMonths } = input;

    // 기기 가격
    if (!device || typeof device.price !== 'number' || device.price <= 0) {
      throw new Error('유효하지 않은 기기 가격입니다.');
    }

    // 요금제 기본료
    if (!plan || typeof plan.basePrice !== 'number' || plan.basePrice <= 0) {
      throw new Error('유효하지 않은 요금제 가격입니다.');
    }

    // 지원금
    if (!subsidy) {
      throw new Error('지원금 정보가 없습니다.');
    }

    // 할부 개월
    const validMonths: InstallmentMonths[] = [0, 12, 24, 36];
    if (!validMonths.includes(installmentMonths)) {
      throw new Error(
        `유효하지 않은 할부 개월입니다. (가능: ${validMonths.join(', ')})`
      );
    }
  }
}

/**
 * 유틸리티 함수: 지원금 조회
 * 
 * ProductsData에서 특정 조합의 지원금을 찾습니다.
 * 
 * @param data - products.json 데이터
 * @param deviceId - 기기 ID
 * @param planId - 요금제 ID
 * @param joinType - 가입 유형
 * @returns 지원금 객체 또는 null
 * 
 * @example
 * ```typescript
 * const subsidy = findSubsidy(
 *   productsData,
 *   '갤럭시S24_256GB',
 *   '0청년109',
 *   'change'
 * );
 * 
 * if (subsidy) {
 *   console.log('공시지원금:', subsidy.common);
 * }
 * ```
 */
export function findSubsidy(
  data: ProductsData,
  deviceId: string,
  planId: string,
  joinType: JoinType
): Subsidy | null {
  return (
    data.subsidies[joinType].find(
      (s) => s.deviceId === deviceId && s.planId === planId
    ) || null
  );
}

/**
 * 유틸리티 함수: 기기별 지원금 목록 조회
 * 
 * @param data - products.json 데이터
 * @param deviceId - 기기 ID
 * @returns 가입 유형별 지원금 배열
 * 
 * @example
 * ```typescript
 * const subsidies = getSubsidiesByDevice(productsData, '갤럭시S24_256GB');
 * console.log('기기변경:', subsidies.change.length);
 * console.log('번호이동:', subsidies.transfer.length);
 * console.log('신규가입:', subsidies.new.length);
 * ```
 */
export function getSubsidiesByDevice(
  data: ProductsData,
  deviceId: string
): Record<JoinType, Subsidy[]> {
  return {
    change: data.subsidies.change.filter((s) => s.deviceId === deviceId),
    transfer: data.subsidies.transfer.filter((s) => s.deviceId === deviceId),
    new: data.subsidies.new.filter((s) => s.deviceId === deviceId),
  };
}

/**
 * 유틸리티 함수: 요금제별 지원금 목록 조회
 * 
 * @param data - products.json 데이터
 * @param planId - 요금제 ID
 * @returns 가입 유형별 지원금 배열
 * 
 * @example
 * ```typescript
 * const subsidies = getSubsidiesByPlan(productsData, '0청년109');
 * console.log('이 요금제를 지원하는 기기:', subsidies.change.length);
 * ```
 */
export function getSubsidiesByPlan(
  data: ProductsData,
  planId: string
): Record<JoinType, Subsidy[]> {
  return {
    change: data.subsidies.change.filter((s) => s.planId === planId),
    transfer: data.subsidies.transfer.filter((s) => s.planId === planId),
    new: data.subsidies.new.filter((s) => s.planId === planId),
  };
}
