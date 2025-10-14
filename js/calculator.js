/**
 * Calculator Alpine.js 앱
 */

function calculatorApp() {
  return {
    // 상태
    loading: true,
    currentStep: 1,
    
    // 데이터
    devices: [],
    plans: [],
    categories: [],
    
    // 선택된 값
    selectedDevice: null,
    selectedPlan: null,
    selectedCategory: '전체',
    joinType: null,
    contractType: null,  // 지원금약정 or 선택약정
    installmentMonths: null,  // 0, 12, 24, 36
    
    // 계산 결과
    pricing: {
      basePrice: 0,
      commonSubsidy: 0,
      additionalSubsidy: 0,
      selectSubsidy: 0,
      planDiscount: 0,
      finalDevicePrice: 0,
      monthlyInstallment: 0,
      monthlyPlan: 0,
      totalMonthly: 0
    },
    
    // 할부 이자율 (연 5.9%)
    interestRate: 5.9 / 100 / 12,
    
    /**
     * 초기화
     */
    async init() {
      try {
        this.loading = true;
        
        // 데이터 로드
        this.devices = await DataAPI.getDevices();
        this.plans = await DataAPI.getPlans();
        this.categories = await DataAPI.getCategories();
        
        console.log('데이터 로드 완료:', {
          devices: this.devices.length,
          plans: this.plans.length,
          categories: this.categories.length
        });
        
      } catch (error) {
        console.error('초기화 실패:', error);
        alert('데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 기기 선택
     */
    selectDevice(device) {
      this.selectedDevice = device;
      this.goToStep(2);
    },
    
    /**
     * 요금제 선택
     */
    selectPlan(plan) {
      this.selectedPlan = plan;
    },
    
    /**
     * 가입유형 선택
     */
    selectJoinType(type) {
      this.joinType = type;
    },
    
    /**
     * 약정 유형 선택
     */
    selectContractType(type) {
      this.contractType = type;
    },
    
    /**
     * 할부 개월수 선택
     */
    selectInstallment(months) {
      this.installmentMonths = months;
    },
    
    /**
     * 단계 이동
     */
    goToStep(step) {
      // 유효성 검사
      if (step > 1 && !this.selectedDevice) {
        alert('기기를 먼저 선택해주세요.');
        return;
      }
      if (step > 2 && !this.selectedPlan) {
        alert('요금제를 먼저 선택해주세요.');
        return;
      }
      if (step > 3 && !this.joinType) {
        alert('가입유형을 먼저 선택해주세요.');
        return;
      }
      if (step > 4 && !this.contractType) {
        alert('약정 유형을 먼저 선택해주세요.');
        return;
      }
      
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    /**
     * 필터링된 요금제
     */
    get filteredPlans() {
      if (this.selectedCategory === '전체') {
        return this.plans;
      }
      return this.plans.filter(p => p.카테고리명 === this.selectedCategory);
    },
    
    /**
     * 최종 가격 계산
     */
    async calculateFinalPrice() {
      try {
        this.loading = true;
        
        // 지원금 정보 가져오기
        const subsidy = await DataAPI.getSubsidy(
          this.selectedDevice.기기옵션ID,
          this.selectedPlan.요금제ID,
          this.joinType
        );
        
        if (!subsidy) {
          alert('해당 조합의 지원금 정보가 없습니다.');
          this.goToStep(1);
          return;
        }
        
        // 기기 출고가
        const basePrice = this.selectedDevice.출고가;
        
        // 약정에 따른 지원금 및 할인 계산
        let commonSubsidy = 0;
        let additionalSubsidy = 0;
        let selectSubsidy = 0;
        let planDiscount = 0;
        let finalDevicePrice = 0;
        
        if (this.contractType === '지원금약정') {
          // 지원금약정: 공통지원금 + 추가지원금
          commonSubsidy = subsidy.공통지원금 || 0;
          additionalSubsidy = subsidy.추가지원금 || 0;
          finalDevicePrice = basePrice - commonSubsidy - additionalSubsidy;
          
        } else if (this.contractType === '선택약정') {
          // 선택약정: 선약지원금 + 요금제 25% 할인
          selectSubsidy = subsidy.선약지원금 || 0;
          planDiscount = this.selectedPlan.기본요금 * 0.25 * 24; // 24개월 총 할인액
          finalDevicePrice = basePrice - selectSubsidy;
        }
        
        // 월 할부금 계산
        let monthlyInstallment = 0;
        if (this.installmentMonths === 0) {
          // 일시불
          monthlyInstallment = 0;
        } else {
          // 원리금균등상환
          const n = this.installmentMonths;
          const rate = this.interestRate;
          monthlyInstallment = finalDevicePrice * 
            (rate * Math.pow(1 + rate, n)) / 
            (Math.pow(1 + rate, n) - 1);
          
          // 100원 단위 반올림
          monthlyInstallment = Math.round(monthlyInstallment / 100) * 100;
        }
        
        // 월 요금제 (선택약정이면 25% 할인)
        let monthlyPlan = this.selectedPlan.기본요금;
        if (this.contractType === '선택약정') {
          monthlyPlan = monthlyPlan * 0.75; // 25% 할인
        }
        
        // 결과 저장
        this.pricing = {
          basePrice,
          commonSubsidy,
          additionalSubsidy,
          selectSubsidy,
          planDiscount,
          finalDevicePrice,
          monthlyInstallment,
          monthlyPlan,
          totalMonthly: monthlyInstallment + monthlyPlan
        };
        
        this.goToStep(6);
        
      } catch (error) {
        console.error('가격 계산 실패:', error);
        alert('가격 계산 중 오류가 발생했습니다.');
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 상담 신청 페이지로 이동
     */
    goToConsultation() {
      // 선택한 정보를 sessionStorage에 저장
      const consultData = {
        device: {
          id: this.selectedDevice.기기옵션ID,
          model: this.selectedDevice.모델명,
          color: this.selectedDevice.색상명,
          storage: this.selectedDevice.용량
        },
        plan: {
          id: this.selectedPlan.요금제ID,
          name: this.selectedPlan.요금제명
        },
        joinType: this.joinType,
        contractType: this.contractType,
        installmentMonths: this.installmentMonths,
        pricing: this.pricing
      };
      
      sessionStorage.setItem('consultData', JSON.stringify(consultData));
      window.location.href = '/contact.html';
    },
    
    /**
     * 가격 포맷팅
     */
    formatPrice(price) {
      if (!price && price !== 0) return '0원';
      return Math.round(price).toLocaleString('ko-KR') + '원';
    }
  };
}

// 전역으로 노출
window.calculatorApp = calculatorApp;
