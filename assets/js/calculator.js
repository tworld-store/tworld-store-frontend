/**
 * PriceCalculator 클래스 - calculator.js (v2.0)
 * 
 * 휴대폰 가격 계산 로직 (할부금, 통신요금, 총액)
 * 
 * v2.0 변경사항:
 * - productsData 전체를 생성자에서 받음
 * - calculate()가 ID 기반 파라미터를 받아서 내부적으로 데이터 조회
 * - 모든 페이지에서 일관된 인터페이스로 사용 가능
 */

/**
 * PriceCalculator 클래스
 * 
 * 주요 기능:
 * 1. 기기/요금제/지원금 데이터 조회
 * 2. 월 할부금 계산 (이자 포함)
 * 3. 월 통신요금 계산 (선택약정 할인 적용)
 * 4. 총 월 납부액 계산
 */
class PriceCalculator {
  /**
   * 생성자
   * @param {Object} productsData - products.json 전체 데이터
   */
  constructor(productsData) {
    // 전체 데이터 저장
    this.productsData = productsData;
    
    // 설정값 추출 (products.json > settings 또는 기본값)
    this.settings = productsData.settings || {};
    this.interestRate = this.settings['할부이자율'] || PRICE_CONFIG.INTEREST_RATE;
    this.roundUnit = this.settings['반올림단위'] || PRICE_CONFIG.ROUND_UNIT;
    this.selectiveDiscountRate = this.settings['선약할인율'] || PRICE_CONFIG.SELECTIVE_DISCOUNT_RATE;
    
    debugLog('PriceCalculator v2.0 초기화', {
      interestRate: this.interestRate,
      roundUnit: this.roundUnit,
      selectiveDiscountRate: this.selectiveDiscountRate,
      devices: productsData.devices?.length || 0,
      plans: productsData.plans?.length || 0
    });
  }
  
  // ============================================
  // Public Methods
  // ============================================
  
  /**
   * 전체 가격 계산 (ID 기반 인터페이스)
   * @param {Object} params - 계산 파라미터
   * @param {string} params.deviceId - 기기 ID (예: '갤럭시S24_256GB')
   * @param {string} params.planId - 요금제 ID (예: '프리미엄')
   * @param {string} params.subscriptionType - 가입유형 ('change' | 'port' | 'new')
   * @param {string} params.discountType - 할인 유형 ('subsidy' | 'selective')
   * @param {number} params.installmentMonths - 할부 개월 수 (24, 30, 36)
   * @returns {Object} 계산 결과
   */
  calculate(params) {
    try {
      const {
        deviceId,
        planId,
        subscriptionType,
        discountType,
        installmentMonths
      } = params;
      
      // 입력값 검증
      this._validateParams(params);
      
      debugLog('가격 계산 시작', params);
      
      // 1. 데이터 조회
      const device = this._getDevice(deviceId);
      const plan = this._getPlan(planId);
      const subsidy = this._getSubsidy(deviceId, planId, subscriptionType);
      
      // 조회 결과 검증
      if (!device) {
        throw new Error(`기기를 찾을 수 없습니다: ${deviceId}`);
      }
      if (!plan) {
        throw new Error(`요금제를 찾을 수 없습니다: ${planId}`);
      }
      
      // 지원금이 없으면 경고 (에러는 아님)
      if (!subsidy) {
        console.warn('⚠️ 지원금 정보를 찾을 수 없습니다:', {
          deviceId,
          planId,
          subscriptionType
        });
      }
      
      debugLog('데이터 조회 완료', {
        device: device.model,
        devicePrice: device.price,
        plan: plan.name,
        planPrice: plan.price,
        subsidy: subsidy || null
      });
      
      // 2. 가격 추출
      const devicePrice = device.price;
      const planPrice = plan.price;
      
      // 3. 할부원금 계산
      const principal = this._calculatePrincipal(
        devicePrice,
        subsidy,
        discountType
      );
      
      // 4. 월 할부금 계산 (이자 포함)
      const monthlyInstallment = this._calculateMonthlyInstallment(
        principal,
        installmentMonths
      );
      
      // 5. 월 통신요금 계산
      const monthlyPlanFee = this._calculateMonthlyPlanFee(
        planPrice,
        discountType
      );
      
      // 6. 총 월 납부액 계산
      const totalMonthly = monthlyInstallment + monthlyPlanFee;
      
      // 7. 결과 객체 생성
      const result = {
        // 기본 정보
        deviceId: deviceId,
        deviceModel: device.model,
        devicePrice: devicePrice,
        planId: planId,
        planName: plan.name,
        planPrice: planPrice,
        installmentMonths: installmentMonths,
        subscriptionType: subscriptionType,
        discountType: discountType,
        
        // 지원금 정보
        commonSubsidy: subsidy ? subsidy.common : 0,
        additionalSubsidy: subsidy ? subsidy.additional : 0,
        selectSubsidy: subsidy ? subsidy.select : 0,
        totalSubsidy: subsidy ? this._getTotalSubsidy(subsidy, discountType) : 0,
        
        // 계산 결과
        principal: principal,
        monthlyInstallment: monthlyInstallment,
        monthlyPlanFee: monthlyPlanFee,
        totalMonthly: totalMonthly,
        
        // 선택약정 할인 정보 (선택약정일 때만)
        planDiscount: discountType === 'selective' 
          ? Math.floor(planPrice * this.selectiveDiscountRate)
          : 0,
        
        // 참고 정보 (전체 납부액)
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
   * 지원금 약정 vs 선택약정 비교
   * @param {Object} params - 계산 파라미터 (deviceId, planId 등)
   * @returns {Object} 비교 결과
   */
  compareDiscountTypes(params) {
    // 지원금 약정으로 계산
    const subsidyResult = this.calculate({
      ...params,
      discountType: 'subsidy'
    });
    
    // 선택약정으로 계산
    const selectiveResult = this.calculate({
      ...params,
      discountType: 'selective'
    });
    
    // 차이 계산
    const difference = subsidyResult.totalMonthly - selectiveResult.totalMonthly;
    const recommended = difference > 0 ? 'selective' : 'subsidy';
    
    return {
      subsidy: subsidyResult,
      selective: selectiveResult,
      difference: Math.abs(difference),
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
  
  // ============================================
  // Private Methods - 데이터 조회
  // ============================================
  
  /**
   * 기기 조회
   * @private
   * @param {string} deviceId - 기기 ID
   * @returns {Object|null} 기기 객체
   */
  _getDevice(deviceId) {
    if (!this.productsData.devices) {
      console.error('❌ productsData.devices가 없습니다');
      return null;
    }
    
    return this.productsData.devices.find(d => d.id === deviceId) || null;
  }
  
  /**
   * 요금제 조회
   * @private
   * @param {string} planId - 요금제 ID
   * @returns {Object|null} 요금제 객체
   */
  _getPlan(planId) {
    if (!this.productsData.plans) {
      console.error('❌ productsData.plans가 없습니다');
      return null;
    }
    
    return this.productsData.plans.find(p => p.id === planId) || null;
  }
  
  /**
   * 지원금 조회
   * @private
   * @param {string} deviceId - 기기 ID
   * @param {string} planId - 요금제 ID
   * @param {string} subscriptionType - 가입유형
   * @returns {Object|null} 지원금 객체
   */
  _getSubsidy(deviceId, planId, subscriptionType) {
    if (!this.productsData.subsidies) {
      console.error('❌ productsData.subsidies가 없습니다');
      return null;
    }
    
    // 가입유형별 지원금 배열
    const subsidies = this.productsData.subsidies[subscriptionType];
    
    if (!subsidies) {
      console.warn(`⚠️ 가입유형 "${subscriptionType}"의 지원금 데이터가 없습니다`);
      return null;
    }
    
    // 기기ID와 요금제ID가 일치하는 지원금 찾기
    return subsidies.find(s => 
      s.deviceId === deviceId && s.planId === planId
    ) || null;
  }
  
  // ============================================
  // Private Methods - 검증
  // ============================================
  
  /**
   * 입력값 검증
   * @private
   * @param {Object} params - 검증할 파라미터
   * @throws {Error} 유효하지 않은 입력값
   */
  _validateParams(params) {
    const {
      deviceId,
      planId,
      subscriptionType,
      discountType,
      installmentMonths
    } = params;
    
    // 필수 파라미터 검증
    if (!deviceId || typeof deviceId !== 'string') {
      throw new Error('기기 ID가 유효하지 않습니다');
    }
    
    if (!planId || typeof planId !== 'string') {
      throw new Error('요금제 ID가 유효하지 않습니다');
    }
    
    if (!['change', 'port', 'new'].includes(subscriptionType)) {
      throw new Error('가입유형이 유효하지 않습니다');
    }
    
    if (!['subsidy', 'selective'].includes(discountType)) {
      throw new Error('할인 유형이 유효하지 않습니다');
    }
    
    if (typeof installmentMonths !== 'number' || installmentMonths <= 0) {
      throw new Error('할부 개월이 유효하지 않습니다');
    }
  }
  
  // ============================================
  // Private Methods - 계산 로직
  // ============================================
  
  /**
   * 총 지원금 계산
   * @private
   * @param {Object} subsidy - 지원금 객체
   * @param {string} discountType - 할인 유형
   * @returns {number} 총 지원금
   */
  _getTotalSubsidy(subsidy, discountType) {
    if (!subsidy) return 0;
    
    if (discountType === 'subsidy') {
      // 공시지원: 공통 + 추가
      return subsidy.common + subsidy.additional;
    } else {
      // 선택약정: 선택약정 지원금
      return subsidy.select;
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
    
    // 총 지원금 계산
    const totalSubsidy = this._getTotalSubsidy(subsidy, discountType);
    
    // 할부원금 = 출고가 - 지원금
    const principal = devicePrice - totalSubsidy;
    
    // 음수 방지 (지원금이 출고가보다 큰 경우)
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

debugLog('Calculator v2.0 모듈 로드 완료');
