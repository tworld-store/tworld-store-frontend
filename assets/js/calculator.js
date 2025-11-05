/**
 * ============================================
 * PriceCalculator 클래스 - calculator.js
 * ============================================
 * 
 * 휴대폰 가격 계산 로직 (할부금, 통신요금, 총액)
 * 
 * 주요 기능:
 * 1. 월 할부금 계산 (이자 포함)
 * 2. 월 통신요금 계산 (선택약정 할인 적용)
 * 3. 총 월 납부액 계산
 * 4. products.json 데이터 구조와 100% 호환
 */

class PriceCalculator {
  /**
   * 생성자
   * @param {Object} productsData - products.json 전체 데이터
   */
  constructor(productsData = {}) {
    // settings에서 설정값 가져오기
    const settings = productsData.settings || {};
    
    this.interestRate = settings['할부이자율'] || 0.059;
    this.roundUnit = settings['반올림단위'] || 10;
    this.selectiveDiscountRate = settings['선약할인율'] || 0.25;
    
    // products.json 데이터 저장
    this.productsData = productsData;
    
    console.log('✅ PriceCalculator 초기화 완료', {
      할부이자율: this.interestRate,
      반올림단위: this.roundUnit,
      선약할인율: this.selectiveDiscountRate
    });
  }
  
  /**
   * 전체 가격 계산
   * @param {Object} params - 계산 파라미터
   * @param {string} params.deviceId - 기기 ID (예: "갤럭시S24_256GB")
   * @param {string} params.planId - 요금제 ID (예: "프리미엄")
   * @param {string} params.subscriptionType - 가입유형 ('change'|'port'|'new')
   * @param {string} params.discountType - 할인유형 ('공통지원'|'선택약정')
   * @param {number} params.installmentMonths - 할부개월 (12|24|36)
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
      
      console.log('💰 가격 계산 시작:', params);
      
      // 1. 기기 정보 조회
      const device = this._getDevice(deviceId);
      if (!device) {
        throw new Error(`기기를 찾을 수 없습니다: ${deviceId}`);
      }
      
      // 2. 요금제 정보 조회
      const plan = this._getPlan(planId);
      if (!plan) {
        throw new Error(`요금제를 찾을 수 없습니다: ${planId}`);
      }
      
      // 3. 지원금 정보 조회
      const subsidy = this._getSubsidy(deviceId, planId, subscriptionType);
      
      // 4. 입력값 검증
      this._validateParams(device.price, plan.price, installmentMonths, discountType);
      
      // 5. 할부원금 계산
      const principal = this._calculatePrincipal(
        device.price,
        subsidy,
        discountType
      );
      
      // 6. 월 할부금 계산 (이자 포함)
      const monthlyInstallment = this._calculateMonthlyInstallment(
        principal,
        installmentMonths
      );
      
      // 7. 월 통신요금 계산
      const monthlyPlanFee = this._calculateMonthlyPlanFee(
        plan.price,
        discountType
      );
      
      // 8. 총 월 납부액 계산
      const totalMonthly = monthlyInstallment + monthlyPlanFee;
      
      // 9. 할인 정보 계산
      const planDiscount = discountType === '선택약정' 
        ? Math.floor(plan.price * this.selectiveDiscountRate) 
        : 0;
      
      // 10. 결과 객체 생성
      const result = {
        // 기본 정보
        deviceId: deviceId,
        devicePrice: device.price,
        planId: planId,
        planPrice: plan.price,
        planName: plan.name,
        installmentMonths: installmentMonths,
        discountType: discountType,
        subscriptionType: subscriptionType,
        
        // 지원금 정보 (products.json 키명 그대로 사용)
        commonSubsidy: subsidy ? subsidy.common : 0,          // 공통지원금
        additionalSubsidy: subsidy ? subsidy.additional : 0,  // 추가지원금(온라인)
        selectSubsidy: subsidy ? subsidy.select : 0,          // 선택약정 지원금
        
        // 계산 결과
        principal: principal,              // 할부원금
        monthlyInstallment: monthlyInstallment,  // 월 할부금
        monthlyPlanFee: monthlyPlanFee,    // 월 통신요금
        totalMonthly: totalMonthly,        // 월 총 납부액
        
        // 할인 정보
        planDiscount: planDiscount,  // 요금할인(25%)
        
        // 참고 정보
        totalDevicePayment: monthlyInstallment * installmentMonths,  // 총 할부금
        totalPlanPayment: monthlyPlanFee * installmentMonths,        // 총 통신요금
        grandTotal: totalMonthly * installmentMonths                 // 총 납부액
      };
      
      console.log('✅ 가격 계산 완료:', result);
      return result;
      
    } catch (error) {
      console.error('❌ 가격 계산 오류:', error);
      throw error;
    }
  }
  
  // ============================================
  // Private Methods - 데이터 조회
  // ============================================
  
  /**
   * 기기 정보 조회
   * @private
   * @param {string} deviceId - 기기 ID
   * @returns {Object|null} 기기 객체
   */
  _getDevice(deviceId) {
    if (!this.productsData.devices) {
      throw new Error('products.json에 devices 데이터가 없습니다');
    }
    
    const device = this.productsData.devices.find(d => d.id === deviceId);
    
    if (!device) {
      console.error(`❌ 기기를 찾을 수 없음: ${deviceId}`);
      return null;
    }
    
    return device;
  }
  
  /**
   * 요금제 정보 조회
   * @private
   * @param {string} planId - 요금제 ID
   * @returns {Object|null} 요금제 객체
   */
  _getPlan(planId) {
    if (!this.productsData.plans) {
      throw new Error('products.json에 plans 데이터가 없습니다');
    }
    
    const plan = this.productsData.plans.find(p => p.id === planId);
    
    if (!plan) {
      console.error(`❌ 요금제를 찾을 수 없음: ${planId}`);
      return null;
    }
    
    return plan;
  }
  
  /**
   * 지원금 정보 조회
   * @private
   * @param {string} deviceId - 기기 ID
   * @param {string} planId - 요금제 ID
   * @param {string} subscriptionType - 가입유형 ('change'|'port'|'new')
   * @returns {Object|null} 지원금 객체
   */
  _getSubsidy(deviceId, planId, subscriptionType) {
    if (!this.productsData.subsidies) {
      console.warn('⚠️ products.json에 subsidies 데이터가 없습니다');
      return null;
    }
    
    // 가입유형 매핑 (change -> 기변, port -> 번이, new -> 신규)
    const typeMap = {
      'change': '기변',
      'port': '번이',
      'new': '신규'
    };
    
    const typeKorean = typeMap[subscriptionType];
    
    if (!typeKorean) {
      console.warn(`⚠️ 알 수 없는 가입유형: ${subscriptionType}`);
      return null;
    }
    
    // subsidies.change, subsidies.port, subsidies.new 배열에서 찾기
    const subsidyList = this.productsData.subsidies[subscriptionType];
    
    if (!subsidyList || !Array.isArray(subsidyList)) {
      console.warn(`⚠️ 가입유형 '${subscriptionType}'에 대한 지원금 데이터가 없습니다`);
      return null;
    }
    
    // deviceId와 planId로 찾기
    const subsidy = subsidyList.find(s => 
      s.deviceId === deviceId && s.planId === planId
    );
    
    if (!subsidy) {
      console.warn(`⚠️ 지원금 정보를 찾을 수 없음: deviceId=${deviceId}, planId=${planId}, type=${subscriptionType}`);
      return null;
    }
    
    console.log('✅ 지원금 조회 성공:', subsidy);
    return subsidy;
  }
  
  // ============================================
  // Private Methods - 입력값 검증
  // ============================================
  
  /**
   * 입력값 검증
   * @private
   * @param {number} devicePrice - 기기 가격
   * @param {number} planPrice - 요금제 가격
   * @param {number} installmentMonths - 할부 개월
   * @param {string} discountType - 할인 유형
   * @throws {Error} 유효하지 않은 입력값
   */
  _validateParams(devicePrice, planPrice, installmentMonths, discountType) {
    if (typeof devicePrice !== 'number' || devicePrice <= 0) {
      throw new Error('기기 가격이 유효하지 않습니다');
    }
    
    if (typeof planPrice !== 'number' || planPrice <= 0) {
      throw new Error('요금제 가격이 유효하지 않습니다');
    }
    
    if (typeof installmentMonths !== 'number' || installmentMonths <= 0) {
      throw new Error('할부 개월이 유효하지 않습니다');
    }
    
    if (!['공통지원', '선택약정'].includes(discountType)) {
      throw new Error(`할인 유형이 유효하지 않습니다: ${discountType}`);
    }
  }
  
  // ============================================
  // Private Methods - 가격 계산
  // ============================================
  
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
    
    if (discountType === '공통지원') {
      // 공통지원: 공통지원금 + 추가지원금(온라인)
      totalSubsidy = (subsidy.common || 0) + (subsidy.additional || 0);
      console.log(`  공통지원 계산: ${subsidy.common} + ${subsidy.additional} = ${totalSubsidy}`);
    } else if (discountType === '선택약정') {
      // 선택약정: 선택약정 지원금만
      totalSubsidy = subsidy.select || 0;
      console.log(`  선택약정 계산: ${totalSubsidy}`);
    }
    
    // 할부원금 = 출고가 - 지원금
    const principal = devicePrice - totalSubsidy;
    
    // 음수 방지
    return Math.max(0, principal);
  }
  
  /**
   * 월 할부금 계산 (이자 포함 - 원리금균등상환)
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
    
    // 이자율이 0이면 단순 나눗셈
    if (this.interestRate === 0) {
      return this._roundToUnit(principal / months);
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
    return this._roundToUnit(monthlyPayment);
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
    
    if (discountType === '선택약정') {
      // 선택약정: 요금제의 25% 할인
      const discount = planPrice * this.selectiveDiscountRate;
      monthlyFee = planPrice - discount;
    }
    
    // 반올림 적용
    return this._roundToUnit(monthlyFee);
  }
  
  /**
   * 반올림 처리
   * @private
   * @param {number} value - 반올림할 값
   * @returns {number} 반올림된 값
   */
  _roundToUnit(value) {
    if (this.roundUnit <= 1) {
      return Math.floor(value); // 1원 단위 절사
    }
    
    // 지정된 단위로 반올림
    return Math.round(value / this.roundUnit) * this.roundUnit;
  }
}

// ============================================
// 전역 Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PriceCalculator };
}

// ============================================
// 초기화 로그
// ============================================

console.log('✅ Calculator 모듈 로드 완료');
