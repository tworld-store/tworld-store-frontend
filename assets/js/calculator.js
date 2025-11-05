/**
 * ============================================
 * Price Calculator
 * ============================================
 * 가격 계산 로직
 */

class Calculator {
  /**
   * 가격 계산
   */
  static async calculate(options) {
    const {
      deviceOptionId,
      planId,
      subscriptionType,
      discountType,  // '공통지원' or '선택약정'
      installmentMonths
    } = options;
    
    try {
      // 1. 데이터 로드
      const device = await API.getDevice(deviceOptionId);
      const plans = await API.getPlans();
      const plan = plans.find(p => p.id === planId);
      const subsidy = await API.getSubsidy(deviceOptionId, planId, subscriptionType);
      
      if (!device || !plan || !subsidy) {
        console.error('계산에 필요한 데이터를 찾을 수 없습니다');
        return null;
      }
      
      // 2. 지원금 계산
      let subsidyAmount = subsidy.common || 0;  // 공통지원금
      
      if (discountType === '공통지원') {
        subsidyAmount += subsidy.additional || 0;  // 추가지원금
      } else if (discountType === '선택약정') {
        // 선택약정은 25% 할인
        subsidyAmount = Math.floor(device.price * 0.25);
      }
      
      // 3. 기기 할부금 계산
      const devicePrice = device.price;
      const deviceAfterSubsidy = devicePrice - subsidyAmount;
      const deviceMonthly = installmentMonths > 0 
        ? Math.ceil(deviceAfterSubsidy / installmentMonths / 10) * 10  // 10원 단위 올림
        : 0;
      
      // 4. 요금제
      const planMonthly = plan.price;
      
      // 5. 월 납부액
      const monthlyTotal = deviceMonthly + planMonthly;
      
      return {
        device: {
          price: devicePrice,
          subsidy: subsidyAmount,
          afterSubsidy: deviceAfterSubsidy,
          monthly: deviceMonthly
        },
        plan: {
          monthly: planMonthly
        },
        monthly: monthlyTotal,
        total: deviceAfterSubsidy + (planMonthly * (installmentMonths || 1)),
        breakdown: {
          devicePrice,
          subsidyAmount,
          deviceAfterSubsidy,
          deviceMonthly,
          planMonthly,
          monthlyTotal
        }
      };
      
    } catch (error) {
      console.error('❌ 가격 계산 실패:', error);
      return null;
    }
  }
  
  /**
   * 숫자를 천 단위 구분자로 포맷
   */
  static formatNumber(num) {
    return num.toLocaleString('ko-KR');
  }
  
  /**
   * 가격 포맷 (원 포함)
   */
  static formatPrice(num) {
    return `${this.formatNumber(num)}원`;
  }
}
