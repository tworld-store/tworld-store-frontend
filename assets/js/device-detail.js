// ============================================
// 탭 전환
// ============================================
document.querySelectorAll('.tab').forEach((tab, index) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content')[index].classList.add('active');
  });
});

// ============================================
// FAQ 아코디언
// ============================================
document.querySelectorAll('.faq-item__q').forEach(q => {
  q.addEventListener('click', () => {
    q.closest('.faq-item').classList.toggle('open');
  });
});

// ============================================
// 옵션 버튼 클릭 이벤트
// ============================================

/**
 * 현재 선택된 옵션 저장
 */
const currentSelections = {
  subscriptionType: 'change',  // 기기변경
  installmentMonths: 24,       // 24개월
  discountType: '공통지원'     // 공통지원
};

/**
 * 버튼 그룹 클릭 처리
 */
document.querySelectorAll('.btn-group__item').forEach(btn => {
  btn.addEventListener('click', function() {
    // 같은 그룹 내 버튼에서 active 제거
    const group = this.closest('.btn-group');
    group.querySelectorAll('.btn-group__item').forEach(b => b.classList.remove('active'));
    
    // 현재 버튼 active 추가
    this.classList.add('active');
    
    // 어떤 옵션인지 확인
    if (this.dataset.subscription) {
      // 가입유형 변경
      currentSelections.subscriptionType = this.dataset.subscription;
      console.log('✅ 가입유형 변경:', currentSelections.subscriptionType);
    } else if (this.dataset.installment) {
      // 할부개월 변경
      currentSelections.installmentMonths = parseInt(this.dataset.installment);
      console.log('✅ 할부개월 변경:', currentSelections.installmentMonths);
    } else if (this.dataset.discount) {
      // 할인방법 변경
      currentSelections.discountType = this.dataset.discount;
      console.log('✅ 할인방법 변경:', currentSelections.discountType);
      
      // 할인방법 변경 시 가격 표시 항목 토글
      togglePriceDisplay(this.dataset.discount);
    }
    
    // 가격 재계산
    recalculatePrice();
  });
});

/**
 * 할인방법에 따라 가격 표시 항목 토글
 */
function togglePriceDisplay(discountType) {
  const commonSubsidyRow = document.getElementById('common-subsidy-row');
  const planDiscountRow = document.getElementById('plan-discount-row');
  
  if (discountType === '공통지원') {
    // 공통지원: 공통지원금 표시, 요금할인 숨김
    if (commonSubsidyRow) commonSubsidyRow.style.display = 'flex';
    if (planDiscountRow) planDiscountRow.style.display = 'none';
  } else if (discountType === '선택약정') {
    // 선택약정: 공통지원금 숨김, 요금할인 표시
    if (commonSubsidyRow) commonSubsidyRow.style.display = 'none';
    if (planDiscountRow) planDiscountRow.style.display = 'flex';
  }
}

/**
 * 가격 재계산 (임시)
 * TODO: 실제로는 PriceCalculator를 사용해야 함
 */
function recalculatePrice() {
  console.log('🔄 가격 재계산 중...', currentSelections);
  
  // 임시 가격 데이터 (테스트용)
  const testData = {
    devicePrice: 946000,
    commonSubsidy: currentSelections.discountType === '공통지원' ? 300000 : 0,
    additionalSubsidy: 80000,
    selectSubsidy: 16000,
    principal: currentSelections.discountType === '공통지원' ? 566000 : 850000,
    monthlyInstallment: currentSelections.discountType === '공통지원' ? 23583 : 35417,
    planBasePrice: 125000,
    planDiscount: currentSelections.discountType === '선택약정' ? 31250 : 0,
    monthlyPlanFee: currentSelections.discountType === '선택약정' ? 93750 : 125000,
    totalMonthly: 0
  };
  
  testData.totalMonthly = testData.monthlyInstallment + testData.monthlyPlanFee;
  
  updatePriceDisplay(testData);
}

/**
 * 가격 UI 업데이트
 */
function updatePriceDisplay(data) {
  // 월 휴대폰 요금 상세
  const devicePrice = document.getElementById('device-price');
  const commonSubsidy = document.getElementById('common-subsidy');
  const additionalSubsidy = document.getElementById('additional-subsidy');
  const principal = document.getElementById('principal');
  const phoneMonthly = document.getElementById('phone-monthly');
  
  if (devicePrice) devicePrice.textContent = data.devicePrice.toLocaleString() + '원';
  if (commonSubsidy) commonSubsidy.textContent = '-' + data.commonSubsidy.toLocaleString() + '원';
  if (additionalSubsidy) additionalSubsidy.textContent = '-' + data.additionalSubsidy.toLocaleString() + '원';
  if (principal) principal.textContent = data.principal.toLocaleString() + '원';
  if (phoneMonthly) phoneMonthly.textContent = data.monthlyInstallment.toLocaleString() + '원';
  
  // 월 통신요금 상세
  const planBasePrice = document.getElementById('plan-base-price');
  const planDiscount = document.getElementById('plan-discount');
  const planMonthly = document.getElementById('plan-monthly');
  
  if (planBasePrice) planBasePrice.textContent = data.planBasePrice.toLocaleString() + '원';
  if (planDiscount) planDiscount.textContent = '-' + data.planDiscount.toLocaleString() + '원';
  if (planMonthly) planMonthly.textContent = data.monthlyPlanFee.toLocaleString() + '원';
  
  // 월 총 납부액
  const totalMonthly = document.getElementById('total-monthly');
  if (totalMonthly) totalMonthly.textContent = data.totalMonthly.toLocaleString() + '원';
  
  // 하단바 업데이트
  updateBottomBarPrice({
    phoneMonthly: data.monthlyInstallment,
    planMonthly: data.monthlyPlanFee,
    totalMonthly: data.totalMonthly
  });
}

// 초기 표시 설정 (공통지원이 기본)
togglePriceDisplay('공통지원');

// ============================================
// 가격 업데이트 함수 (JS 연동용)
// ============================================
/**
 * 하단바 가격 업데이트
 * @param {Object} priceData - 가격 정보
 * @param {number} priceData.phoneMonthly - 월 휴대폰 요금
 * @param {number} priceData.planMonthly - 월 통신요금
 * @param {number} priceData.totalMonthly - 월 총 납부액
 */
function updateBottomBarPrice(priceData) {
  // 카드 영역 가격
  const phoneMonthlyCard = document.getElementById('phone-monthly');
  const planMonthlyCard = document.getElementById('plan-monthly');
  const totalMonthlyCard = document.getElementById('total-monthly');
  
  if (phoneMonthlyCard) {
    phoneMonthlyCard.textContent = priceData.phoneMonthly.toLocaleString() + '원';
  }
  if (planMonthlyCard) {
    planMonthlyCard.textContent = priceData.planMonthly.toLocaleString() + '원';
  }
  if (totalMonthlyCard) {
    totalMonthlyCard.textContent = priceData.totalMonthly.toLocaleString() + '원';
  }
  
  // 하단바 가격
  const barPhoneMonthly = document.getElementById('bar-phone-monthly');
  const barPlanMonthly = document.getElementById('bar-plan-monthly');
  const barTotalMonthly = document.getElementById('bar-total-monthly');
  
  if (barPhoneMonthly) {
    barPhoneMonthly.textContent = priceData.phoneMonthly.toLocaleString() + '원';
  }
  if (barPlanMonthly) {
    barPlanMonthly.textContent = priceData.planMonthly.toLocaleString() + '원';
  }
  if (barTotalMonthly) {
    barTotalMonthly.textContent = priceData.totalMonthly.toLocaleString() + '원';
  }
  
  console.log('✅ 하단바 가격 업데이트 완료:', priceData);
}

// ============================================
// 주문하기 버튼
// ============================================
document.getElementById('order-btn')?.addEventListener('click', () => {
  alert('주문하기 기능은 추후 구현 예정입니다.');
});

// ============================================
// Plan Modal 초기화
// ============================================

let planModal = null;

// 테스트용 요금제 데이터 (나중에 products.json에서 로드)
const testPlans = [
  {
    "id": "5GX_프리미어69",
    "category": {
      "id": "5GX",
      "name": "5GX 플랜",
      "icon": "⚡",
      "priority": 1
    },
    "name": "5GX 프리미어 에센셜",
    "description": "SNS 무제한+게임",
    "price": 69000,
    "data": "무제한 (일 10GB 초과시 5Mbps)",
    "voice": "집전화/이동전화 무제한+부가통화 300분",
    "sms": "기본 제공",
    "benefits": [
      "SNS 데이터 무제한",
      "게임 데이터 무제한",
      "OTT 할인"
    ],
    "color": "#3617CE"
  },
  {
    "id": "0청년109",
    "category": {
      "id": "YOUTH",
      "name": "청년",
      "icon": "👨",
      "priority": 2
    },
    "name": "0청년109",
    "description": "SNS 무제한",
    "price": 109000,
    "data": "무제한",
    "voice": "무제한",
    "sms": "무제한",
    "benefits": [
      "YouTube 프리미엄 6개월",
      "네이버웹툰 1년",
      "게임 아이템"
    ],
    "color": "#FF6B6B"
  },
  {
    "id": "0청년69",
    "category": {
      "id": "YOUTH",
      "name": "청년",
      "icon": "👨",
      "priority": 2
    },
    "name": "0청년69",
    "description": "SNS 무제한",
    "price": 69000,
    "data": "200GB",
    "voice": "무제한",
    "sms": "무제한",
    "benefits": [
      "50%할인"
    ],
    "color": "#4ECDC4"
  },
  {
    "id": "시니어A형",
    "category": {
      "id": "SENIOR",
      "name": "시니어",
      "icon": "👴",
      "priority": 3
    },
    "name": "시니어 A형",
    "description": "대용량 + 무제한 통화",
    "price": 45000,
    "data": "100GB",
    "voice": "300분",
    "sms": "무제한",
    "benefits": [
      "안심옵션 기본제공"
    ],
    "color": "#8B4513"
  },
  {
    "id": "프리미엄",
    "category": {
      "id": "5GX",
      "name": "5GX 플랜",
      "icon": "⚡",
      "priority": 1
    },
    "name": "프리미엄",
    "description": "데이터 무제한",
    "price": 95000,
    "data": "무제한",
    "voice": "무제한",
    "sms": "무제한",
    "benefits": [
      "2nd device 지정 2회선 요금무료"
    ],
    "color": "#1976D2"
  }
];

/**
 * 모달 초기화 함수
 */
function initPlanModal() {
  try {
    // PlanModal 인스턴스 생성
    planModal = new PlanModal(testPlans);
    
    // 선택 콜백 등록
    planModal.onSelect((selectedPlan) => {
      console.log('✅ 요금제 선택됨:', selectedPlan);
      
      // 요금제 선택 버튼 텍스트 변경
      updatePlanSelector(selectedPlan);
      
      // currentSelections 업데이트
      if (typeof currentSelections !== 'undefined') {
        currentSelections.planId = selectedPlan.id;
        currentSelections.planName = selectedPlan.name;
        currentSelections.planPrice = selectedPlan.price;
      }
      
      // 가격 재계산 (나중에 구현)
      // recalculatePrice();
    });
    
    console.log('✅ PlanModal 초기화 완료');
  } catch (error) {
    console.error('❌ PlanModal 초기화 실패:', error);
  }
}

/**
 * 선택된 요금제 UI 업데이트
 */
function updatePlanSelector(plan) {
  const planSelectorName = document.querySelector('.plan-selector__name');
  if (planSelectorName) {
    planSelectorName.textContent = `${plan.name} (${plan.price.toLocaleString()}원/월)`;
  }
}

/**
 * DOMContentLoaded 이벤트
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 페이지 로드 완료');
  
  // 모달 초기화
  initPlanModal();
  
  // "요금제 선택" 버튼 이벤트 연결
  const planSelector = document.querySelector('.plan-selector');
  if (planSelector) {
    planSelector.addEventListener('click', function() {
      console.log('🔘 요금제 선택 버튼 클릭');
      if (planModal) {
        planModal.open();
      } else {
        console.error('❌ planModal이 초기화되지 않았습니다');
      }
    });
    console.log('✅ 요금제 선택 버튼 이벤트 연결 완료');
  } else {
    console.warn('⚠️ .plan-selector 요소를 찾을 수 없습니다');
  }
});
