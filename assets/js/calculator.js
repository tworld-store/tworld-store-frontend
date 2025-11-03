/**
 * PriceCalculator 클래스 - calculator.js
 * 
 * 휴대폰 가격 계산 로직 (할부금, 통신요금, 총액)
 */

/**
 * PriceCalculator 클래스
 * 
 * 주요 기능:
 * 1. 월 할부금 계산 (이자 포함)
 * 2. 월 통신요금 계산 (선택약정 할인 적용)
 * 3. 총 월 납부액 계산
 */
class PriceCalculator {
  /**
   * 생성자
   * @param {Object} settings - 전역 설정 객체 (products.json의 settings)
   */
  constructor(settings = {}) {
    // 설정값 (products.json > settings 또는 기본값)
    this.interestRate = settings['할부이자율'] || PRICE_CONFIG.INTEREST_RATE;
    this.roundUnit = settings['반올림단위'] || PRICE_CONFIG.ROUND_UNIT;
    this.selectiveDiscountRate = settings['선약할인율'] || PRICE_CONFIG.SELECTIVE_DISCOUNT_RATE;
    
    debugLog('PriceCalculator 초기화', {
      interestRate: this.interestRate,
      roundUnit: this.roundUnit,
      selectiveDiscountRate: this.selectiveDiscountRate
    });
  }
  
  // ============================================
  // Public Methods
  // ============================================
  
  /**
   * 전체 가격 계산
   * @param {Object} params - 계산 파라미터
   * @param {number} params.devicePrice - 기기 출고가
   * @param {Object|null} params.subsidy - 지원금 객체
   * @param {number} params.planPrice - 요금제 가격
   * @param {number} params.installmentMonths - 할부 개월 수
   * @param {string} params.discountType - 할인 유형 ('subsidy' | 'selective')
   * @returns {Object} 계산 결과
   */
  calculate(params) {
    try {
      const {
        devicePrice,
        subsidy,
        planPrice,
        installmentMonths,
        discountType
      } = params;
      
      // 입력값 검증
      this._validateParams(params);
      
      debugLog('가격 계산 시작', params);
      
      // 1. 할부원금 계산
      const principal = this._calculatePrincipal(
        devicePrice,
        subsidy,
        discountType
      );
      
      // 2. 월 할부금 계산 (이자 포함)
      const monthlyInstallment = this._calculateMonthlyInstallment(
        principal,
        installmentMonths
      );
      
      // 3. 월 통신요금 계산
      const monthlyPlanFee = this._calculateMonthlyPlanFee(
        planPrice,
        discountType
      );
      
      // 4. 총 월 납부액 계산
      const totalMonthly = monthlyInstallment + monthlyPlanFee;
      
      // 5. 결과 객체
      const result = {
        // 기본 정보
        devicePrice: devicePrice,
        planPrice: planPrice,
        installmentMonths: installmentMonths,
        discountType: discountType,
        
        // 지원금 정보
        commonSubsidy: subsidy ? subsidy.common : 0,
        additionalSubsidy: subsidy ? subsidy.additional : 0,
        selectSubsidy: subsidy ? subsidy.select : 0,
        
        // 계산 결과
        principal: principal,
        monthlyInstallment: monthlyInstallment,
        monthlyPlanFee: monthlyPlanFee,
        totalMonthly: totalMonthly,
        
        // 참고 정보
        totalDevicePayment: monthlyInstallment * installmentMonths,
        totalPlanPayment: monthlyPlanFee * installmentMonths,
        grandTotal: totalMonthly * installmentMonths
      };
      
      debugLog('가격 계산 완료', result);
      return result;
      
    } catch (error) {
      errorLog('가격 계산 오류:', error);
      throw error;
    }
  }
  
  /**
   * 월 할부금만 계산 (간단 버전)
   * @param {number} devicePrice - 기기 출고가
   * @param {number} subsidy - 총 지원금
   * @param {number} installmentMonths - 할부 개월 수
   * @returns {number} 월 할부금
   */
  calculateInstallment(devicePrice, subsidy, installmentMonths) {
    const principal = devicePrice - subsidy;
    return this._calculateMonthlyInstallment(principal, installmentMonths);
  }
  
  /**
   * 총 지원금 계산
   * @param {Object} subsidy - 지원금 객체
   * @param {string} discountType - 할인 유형 ('subsidy' | 'selective')
   * @returns {number} 총 지원금
   */
  getTotalSubsidy(subsidy, discountType) {
    if (!subsidy) return 0;
    
    if (discountType === 'subsidy') {
      // 공시지원: 공통 + 추가
      return subsidy.common + subsidy.additional;
    } else {
      // 선택약정: 선택약정 지원금
      return subsidy.select;
    }
  }
  
  // ============================================
  // Private Methods
  // ============================================
  
  /**
   * 입력값 검증
   * @private
   * @param {Object} params - 검증할 파라미터
   * @throws {Error} 유효하지 않은 입력값
   */
  _validateParams(params) {
    const { devicePrice, planPrice, installmentMonths, discountType } = params;
    
    if (typeof devicePrice !== 'number' || devicePrice <= 0) {
      throw new Error('기기 가격이 유효하지 않습니다');
    }
    
    if (typeof planPrice !== 'number' || planPrice <= 0) {
      throw new Error('요금제 가격이 유효하지 않습니다');
    }
    
    if (typeof installmentMonths !== 'number' || installmentMonths <= 0) {
      throw new Error('할부 개월이 유효하지 않습니다');
    }
    
    if (!['subsidy', 'selective'].includes(discountType)) {
      throw new Error('할인 유형이 유효하지 않습니다');
    }
  }
  
  /**
   * 할부원금 계산
   * @private
   * @param {number} devicePrice - 기기 출고가
   * @param {Object|null} subsidy - 지원금 객체
   * @param {string} discountType - 할인 유형
   * @returns {number} 할부원금
   */
  _calculatePrincipal(devicePrice, subsidy, discountType) {
    // 지원금이 없으면 출고가 전액
    if (!subsidy) {
      return devicePrice;
    }
    
    let totalSubsidy = 0;
    
    if (discountType === 'subsidy') {
      // 공시지원: 공통지원금 + 추가지원금
      totalSubsidy = subsidy.common + subsidy.additional;
    } else if (discountType === 'selective') {
      // 선택약정: 선택약정 지원금
      totalSubsidy = subsidy.select;
    }
    
    // 할부원금 = 출고가 - 지원금
    const principal = devicePrice - totalSubsidy;
    
    // 음수 방지
    return Math.max(0, principal);
  }
  
  /**
   * 월 할부금 계산 (이자 포함)
   * @private
   * @param {number} principal - 할부원금
   * @param {number} months - 할부 개월 수
   * @returns {number} 월 할부금 (반올림 적용)
   */
  _calculateMonthlyInstallment(principal, months) {
    // 할부원금이 0이면 월 할부금도 0
    if (principal <= 0) {
      return 0;
    }
    
    // 월 이자율
    const monthlyRate = this.interestRate / 12;
    
    // 할부 계산 공식 (원리금균등상환)
    // M = P × [r(1+r)^n] / [(1+r)^n - 1]
    // M: 월 할부금, P: 원금, r: 월 이자율, n: 개월 수
    
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    
    let monthlyPayment = numerator / denominator;
    
    // 반올림 적용
    monthlyPayment = roundToUnit(monthlyPayment, this.roundUnit);
    
    return monthlyPayment;
  }
  
  /**
   * 월 통신요금 계산
   * @private
   * @param {number} planPrice - 요금제 원래 가격
   * @param {string} discountType - 할인 유형
   * @returns {number} 월 통신요금 (반올림 적용)
   */
  _calculateMonthlyPlanFee(planPrice, discountType) {
    let monthlyFee = planPrice;
    
    if (discountType === 'selective') {
      // 선택약정: 요금제의 25% 할인
      const discount = planPrice * this.selectiveDiscountRate;
      monthlyFee = planPrice - discount;
    }
    
    // 반올림 적용
    monthlyFee = roundToUnit(monthlyFee, this.roundUnit);
    
    return monthlyFee;
  }
  
  // ============================================
  // 유틸리티 메서드
  // ============================================
  
  /**
   * 가격 비교 (공시지원 vs 선택약정)
   * @param {Object} params - 계산 파라미터
   * @returns {Object} 비교 결과
   */
  compare(params) {
    // 공시지원 계산
    const subsidyResult = this.calculate({
      ...params,
      discountType: 'subsidy'
    });
    
    // 선택약정 계산
    const selectiveResult = this.calculate({
      ...params,
      discountType: 'selective'
    });
    
    // 차이 계산
    const difference = {
      monthlyInstallment: subsidyResult.monthlyInstallment - selectiveResult.monthlyInstallment,
      monthlyPlanFee: subsidyResult.monthlyPlanFee - selectiveResult.monthlyPlanFee,
      totalMonthly: subsidyResult.totalMonthly - selectiveResult.totalMonthly,
      grandTotal: subsidyResult.grandTotal - selectiveResult.grandTotal
    };
    
    // 추천 (총액 기준)
    const recommended = subsidyResult.grandTotal < selectiveResult.grandTotal 
      ? 'subsidy' 
      : 'selective';
    
    return {
      subsidy: subsidyResult,
      selective: selectiveResult,
      difference: difference,
      recommended: recommended
    };
  }
  
  /**
   * 할부 개월별 비교
   * @param {Object} baseParams - 기본 파라미터
   * @param {Array<number>} months - 비교할 할부 개월 배열
   * @returns {Array<Object>} 개월별 계산 결과
   */
  compareInstallments(baseParams, months = [24, 30, 36]) {
    return months.map(month => {
      const result = this.calculate({
        ...baseParams,
        installmentMonths: month
      });
      return {
        months: month,
        ...result
      };
    });
  }
  
  /**
   * 요금제별 비교
   * @param {Object} baseParams - 기본 파라미터
   * @param {Array<Object>} plans - 비교할 요금제 배열
   * @returns {Array<Object>} 요금제별 계산 결과
   */
  async comparePlans(baseParams, plans) {
    return plans.map(plan => {
      const result = this.calculate({
        ...baseParams,
        planPrice: plan.price
      });
      return {
        planId: plan.id,
        planName: plan.name,
        ...result
      };
    });
  }
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 간단한 월 납부액 계산 (지원금 없음, 이자 없음)
 * @param {number} devicePrice - 기기 가격
 * @param {number} planPrice - 요금제 가격
 * @param {number} months - 할부 개월
 * @returns {Object} 계산 결과
 */
function simpleCalculate(devicePrice, planPrice, months) {
  const monthlyInstallment = Math.round(devicePrice / months);
  const totalMonthly = monthlyInstallment + planPrice;
  
  return {
    monthlyInstallment,
    monthlyPlanFee: planPrice,
    totalMonthly
  };
}

/**
 * 할인율 계산
 * @param {number} originalPrice - 원래 가격
 * @param {number} discountedPrice - 할인 가격
 * @returns {number} 할인율 (0~1 사이)
 */
function calculateDiscountRate(originalPrice, discountedPrice) {
  if (originalPrice <= 0) return 0;
  return (originalPrice - discountedPrice) / originalPrice;
}

/**
 * 할인 금액 계산
 * @param {number} price - 원래 가격
 * @param {number} rate - 할인율 (0~1 사이)
 * @returns {number} 할인 금액
 */
function calculateDiscount(price, rate) {
  return price * rate;
}

// ============================================
// 전역 Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PriceCalculator,
    simpleCalculate,
    calculateDiscountRate,
    calculateDiscount
  };
}

// ============================================
// 초기화 로그
// ============================================

debugLog('Calculator 모듈 로드 완료');
