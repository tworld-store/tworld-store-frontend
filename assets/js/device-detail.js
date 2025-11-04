/**
 * Device Detail JavaScript - 개선 버전
 * 
 * 주요 개선사항:
 * 1. 가격 계산 로직 수정 (공통/추가/선약 지원금 정확히 매핑)
 * 2. 요금 상세 내역 업데이트
 * 3. 약정 방식별 표시/숨김 처리
 */

// ============================================
// 전역 변수
// ============================================
let productsData = null;
let currentDevice = null;
let allDeviceOptions = [];

const currentSelections = {
  colorId: null,
  storage: null,
  subscriptionType: 'change', // 기본값: 기기변경
  planId: null,
  discountType: 'subsidy', // 기본값: 공통지원금 약정
  installmentMonths: 36 // 기본값: 36개월
};

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 Device Detail 페이지 초기화 시작');
  
  try {
    // 1. URL 파라미터에서 기기 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('id');
    
    if (!deviceId) {
      alert('기기 정보를 찾을 수 없습니다.');
      window.location.href = './devices.html';
      return;
    }
    
    // 2. API 데이터 로드
    const api = new DataAPI();
    productsData = await api.load();
    
    console.log('✅ Products 데이터 로드 완료');
    
    // 3. 현재 기기 찾기
    currentDevice = productsData.devices.find(d => d.id === deviceId);
    
    if (!currentDevice) {
      alert('기기를 찾을 수 없습니다.');
      window.location.href = './devices.html';
      return;
    }
    
    // 4. 같은 모델의 모든 용량 옵션 로드
    allDeviceOptions = productsData.devices.filter(d => d.model === currentDevice.model);
    console.log(`📦 "${currentDevice.model}" 모델의 용량 옵션: ${allDeviceOptions.length}개`);
    
    // 5. UI 렌더링
    renderProductInfo();
    renderStorageOptions();
    renderColorOptions();
    renderImageSlider();
    
    // 6. 기본 요금제 설정
    if (currentDevice.displaySettings && currentDevice.displaySettings.planId) {
      currentSelections.planId = currentDevice.displaySettings.planId;
      updateSelectedPlan();
    }
    
    // 7. 이벤트 리스너 등록
    attachEventListeners();
    
    // 8. 초기 가격 계산
    await calculateAndUpdatePrice();
    
    console.log('✅ 초기화 완료');
    
  } catch (error) {
    console.error('❌ 초기화 오류:', error);
    alert('데이터를 불러오는 중 오류가 발생했습니다.');
  }
});

// ============================================
// 렌더링 함수들
// ============================================

/**
 * 기기 정보 렌더링
 */
function renderProductInfo() {
  document.getElementById('productBrand').textContent = currentDevice.brand;
  document.getElementById('productModel').textContent = currentDevice.model;
  document.getElementById('productPrice').textContent = 
    `${currentDevice.price.toLocaleString()}원`;
}

/**
 * 용량 선택 옵션 렌더링
 */
function renderStorageOptions() {
  const container = document.getElementById('storageGroup');
  container.innerHTML = '';
  
  // 용량별로 고유한 옵션만 표시
  const uniqueStorages = [...new Set(allDeviceOptions.map(d => d.storage))].sort((a, b) => a - b);
  
  uniqueStorages.forEach(storage => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.setAttribute('data-storage', storage);
    btn.textContent = `${storage}GB`;
    
    // 현재 선택된 용량이면 active
    if (storage === currentDevice.storage) {
      btn.classList.add('active');
      currentSelections.storage = storage;
    }
    
    btn.addEventListener('click', handleStorageChange);
    container.appendChild(btn);
  });
}

/**
 * 색상 선택 옵션 렌더링
 */
function renderColorOptions() {
  const container = document.getElementById('colorChips');
  container.innerHTML = '';
  
  if (!currentDevice.colors || currentDevice.colors.length === 0) {
    console.warn('색상 옵션이 없습니다.');
    return;
  }
  
  currentDevice.colors.forEach((color, index) => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.style.backgroundColor = color.hex;
    chip.setAttribute('data-color-id', color.id);
    chip.setAttribute('title', color.name);
    
    // 첫 번째 색상을 기본 선택
    if (index === 0) {
      chip.classList.add('active');
      currentSelections.colorId = color.id;
    }
    
    chip.addEventListener('click', handleColorChange);
    container.appendChild(chip);
  });
}

/**
 * 이미지 슬라이더 렌더링
 */
function renderImageSlider() {
  const container = document.getElementById('imageSlider');
  container.innerHTML = '';
  
  // 선택된 색상의 이미지
  const selectedColor = currentDevice.colors.find(c => c.id === currentSelections.colorId);
  if (!selectedColor || !selectedColor.images || !selectedColor.images.main) {
    console.warn('이미지가 없습니다.');
    return;
  }
  
  selectedColor.images.main.forEach(imageUrl => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<img src="${imageUrl}" alt="${currentDevice.model} ${selectedColor.name}">`;
    container.appendChild(slide);
  });
  
  // Swiper 초기화
  new Swiper('.product-swiper', {
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    }
  });
}

/**
 * 선택된 요금제 표시 업데이트
 */
function updateSelectedPlan() {
  const plan = productsData.plans.find(p => p.id === currentSelections.planId);
  
  if (plan) {
    document.getElementById('selectedPlanName').textContent = plan.name;
    document.getElementById('selectedPlanPrice').textContent = 
      `${plan.price.toLocaleString()}원/월`;
  } else {
    document.getElementById('selectedPlanName').textContent = '요금제를 선택해주세요';
    document.getElementById('selectedPlanPrice').textContent = '-';
  }
}

// ============================================
// 이벤트 핸들러들
// ============================================

/**
 * 이벤트 리스너 등록
 */
function attachEventListeners() {
  // 가입유형 버튼
  document.querySelectorAll('#subscriptionGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', handleSubscriptionChange);
  });
  
  // 할인유형 버튼
  document.querySelectorAll('#discountGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', handleDiscountChange);
  });
  
  // 할부개월 버튼
  document.querySelectorAll('#installmentGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', handleInstallmentChange);
  });
  
  // 요금제 선택 버튼
  document.getElementById('planSelectBtn').addEventListener('click', () => {
    // TODO: 요금제 팝업 열기 (다음 단계)
    alert('요금제 선택 팝업은 다음 단계에서 구현됩니다.');
  });
  
  // 액션 버튼
  document.getElementById('consultBtn').addEventListener('click', () => {
    alert('상담신청 기능은 구현 예정입니다.');
  });
  
  document.getElementById('applyBtn').addEventListener('click', () => {
    alert('주문하기 기능은 구현 예정입니다.');
  });
}

/**
 * 색상 변경 핸들러
 */
function handleColorChange(event) {
  const colorId = event.target.getAttribute('data-color-id');
  currentSelections.colorId = colorId;
  
  // 색상칩 active 상태 변경
  document.querySelectorAll('.color-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 이미지 슬라이더 다시 렌더링
  renderImageSlider();
}

/**
 * 용량 변경 핸들러
 */
function handleStorageChange(event) {
  const storage = parseInt(event.target.getAttribute('data-storage'));
  currentSelections.storage = storage;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#storageGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 선택한 용량의 기기로 currentDevice 업데이트
  currentDevice = allDeviceOptions.find(d => d.storage === storage);
  
  // 출고가 업데이트
  document.getElementById('productPrice').textContent = 
    `${currentDevice.price.toLocaleString()}원`;
  
  // 색상 선택기 다시 렌더링
  renderColorOptions();
  
  // 이미지 슬라이더 다시 렌더링
  renderImageSlider();
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 가입유형 변경 핸들러
 */
function handleSubscriptionChange(event) {
  const type = event.target.getAttribute('data-type');
  currentSelections.subscriptionType = type;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#subscriptionGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 할인유형 변경 핸들러
 */
function handleDiscountChange(event) {
  const type = event.target.getAttribute('data-type');
  currentSelections.discountType = type;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#discountGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 할부개월 변경 핸들러
 */
function handleInstallmentChange(event) {
  const months = parseInt(event.target.getAttribute('data-months'));
  currentSelections.installmentMonths = months;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#installmentGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

// ============================================
// 가격 계산 및 업데이트
// ============================================

/**
 * 가격 계산 및 UI 업데이트
 */
async function calculateAndUpdatePrice() {
  try {
    // 요금제가 선택되지 않았으면 계산 불가
    if (!currentSelections.planId) {
      console.log('⚠️ 요금제가 선택되지 않았습니다.');
      return;
    }
    
    // 1. 지원금 조회
    const subsidy = findSubsidy();
    if (!subsidy) {
      console.error('지원금 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 2. 요금제 정보
    const plan = productsData.plans.find(p => p.id === currentSelections.planId);
    if (!plan) {
      console.error('요금제를 찾을 수 없습니다.');
      return;
    }
    
    // 3. 가격 계산
    const priceResult = calculatePrice({
      devicePrice: currentDevice.price,
      subsidy: subsidy,
      planPrice: plan.price,
      installmentMonths: currentSelections.installmentMonths,
      discountType: currentSelections.discountType,
      settings: productsData.settings
    });
    
    console.log('💰 계산 결과:', priceResult);
    
    // 4. UI 업데이트
    updatePriceDetailCard(priceResult);
    updateBottomBar(priceResult);
    
  } catch (error) {
    console.error('❌ 가격 계산 오류:', error);
  }
}

/**
 * 지원금 조회
 */
function findSubsidy() {
  const subsidyType = currentSelections.subscriptionType;
  const subsidies = productsData.subsidies[subsidyType];
  
  if (!subsidies) {
    console.warn(`지원금 데이터가 없습니다: ${subsidyType}`);
    return null;
  }
  
  // ★ products.json의 id는 한글로 끝나므로 매핑 필요
  // 영문 → 한글 변환
  const typeMapping = {
    'change': '기변',
    'port': '번이',
    'new': '신규'
  };
  
  const koreanType = typeMapping[subsidyType];
  
  // 조합ID로 검색 (한글 사용)
  const combinationId = `${currentDevice.id}_${currentSelections.planId}_${koreanType}`;
  const subsidy = subsidies.find(s => s.id === combinationId);
  
  if (!subsidy) {
    console.warn(`지원금을 찾을 수 없습니다: ${combinationId}`);
    console.log('사용 가능한 지원금 ID:', subsidies.map(s => s.id));
  }
  
  return subsidy;
}

/**
 * 가격 계산 (핵심 로직)
 * 
 * @param {Object} params
 * @returns {Object} 계산 결과
 */
function calculatePrice(params) {
  const {
    devicePrice,
    subsidy,
    planPrice,
    installmentMonths,
    discountType,
    settings
  } = params;
  
  const interestRate = settings['할부이자율'] || 0.059;
  
  let result = {};
  
  // ==========================================
  // 지원금 약정
  // ==========================================
  if (discountType === 'subsidy') {
    const commonSubsidy = subsidy.common || 0;
    const additionalSubsidy = subsidy.additional || 0;
    const phoneDiscount = commonSubsidy + additionalSubsidy;
    const principal = devicePrice - phoneDiscount;
    const monthlyDevice = calculateInstallment(principal, installmentMonths, interestRate);
    
    // 요금제 할인 없음
    const planDiscount = 0;
    const monthlyPlan = planPrice;
    
    result = {
      devicePrice,
      commonSubsidy,
      additionalSubsidy,
      selectSubsidy: 0,
      phoneDiscount,
      principal,
      monthlyDevice,
      planPrice,
      planDiscount,
      monthlyPlan,
      total: monthlyDevice + monthlyPlan
    };
  }
  // ==========================================
  // 선택약정
  // ==========================================
  else if (discountType === 'selective') {
    const selectSubsidy = subsidy.select || 0;
    const phoneDiscount = selectSubsidy;
    const principal = devicePrice - phoneDiscount;
    const monthlyDevice = calculateInstallment(principal, installmentMonths, interestRate);
    
    // 요금제 25% 할인
    const planDiscount = Math.floor(planPrice * 0.25);
    const monthlyPlan = planPrice - planDiscount;
    
    result = {
      devicePrice,
      commonSubsidy: 0,
      additionalSubsidy: 0,
      selectSubsidy,
      phoneDiscount,
      principal,
      monthlyDevice,
      planPrice,
      planDiscount,
      monthlyPlan,
      total: monthlyDevice + monthlyPlan
    };
  }
  
  return result;
}

/**
 * 원리금균등상환 방식 월 할부금 계산
 */
function calculateInstallment(principal, months, annualRate) {
  if (months === 0) return principal; // 일시불
  
  const monthlyRate = annualRate / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;
  
  return Math.floor(numerator / denominator); // 1원 단위 절사
}

/**
 * 요금 상세 내역 카드 업데이트
 */
function updatePriceDetailCard(priceResult) {
  const isSubsidy = currentSelections.discountType === 'subsidy';
  
  // 출고가
  document.getElementById('detailDevicePrice').textContent = 
    `${priceResult.devicePrice.toLocaleString()}원`;
  
  // ==========================================
  // 지원금 약정일 때
  // ==========================================
  if (isSubsidy) {
    // 공통지원금 표시
    document.getElementById('detailCommonSubsidyRow').style.display = 'flex';
    document.getElementById('detailCommonSubsidy').textContent = 
      `-${priceResult.commonSubsidy.toLocaleString()}원`;
    
    // 추가지원금 표시
    document.getElementById('detailAdditionalSubsidyRow').style.display = 'flex';
    document.getElementById('detailAdditionalSubsidy').textContent = 
      `-${priceResult.additionalSubsidy.toLocaleString()}원`;
    
    // 선약지원금 숨김
    document.getElementById('detailSelectSubsidyRow').style.display = 'none';
    
    // 요금할인 숨김
    document.getElementById('detailPlanDiscountRow').style.display = 'none';
  }
  // ==========================================
  // 선택약정일 때
  // ==========================================
  else {
    // 공통지원금 숨김
    document.getElementById('detailCommonSubsidyRow').style.display = 'none';
    
    // 추가지원금 숨김
    document.getElementById('detailAdditionalSubsidyRow').style.display = 'none';
    
    // 선약지원금 표시
    document.getElementById('detailSelectSubsidyRow').style.display = 'flex';
    document.getElementById('detailSelectSubsidy').textContent = 
      `-${priceResult.selectSubsidy.toLocaleString()}원`;
    
    // 요금할인 표시
    document.getElementById('detailPlanDiscountRow').style.display = 'flex';
    document.getElementById('detailPlanDiscount').textContent = 
      `-${priceResult.planDiscount.toLocaleString()}원`;
  }
  
  // 할부원금
  document.getElementById('detailPrincipal').textContent = 
    `${priceResult.principal.toLocaleString()}원`;
  
  // 월 휴대폰 요금
  document.getElementById('detailMonthlyDevice').textContent = 
    `${priceResult.monthlyDevice.toLocaleString()}원`;
  
  // 요금제 월 기준금액
  document.getElementById('detailPlanPrice').textContent = 
    `${priceResult.planPrice.toLocaleString()}원`;
  
  // 월 통신요금
  document.getElementById('detailMonthlyPlan').textContent = 
    `${priceResult.monthlyPlan.toLocaleString()}원`;
  
  // 최종 금액
  document.getElementById('detailTotalPrice').textContent = 
    `${priceResult.total.toLocaleString()}원`;
}

/**
 * 하단 고정바 업데이트
 */
function updateBottomBar(priceResult) {
  document.getElementById('barMonthlyDevice').textContent = 
    `${priceResult.monthlyDevice.toLocaleString()}원`;
  
  document.getElementById('barMonthlyPlan').textContent = 
    `${priceResult.monthlyPlan.toLocaleString()}원`;
  
  document.getElementById('barTotalPrice').textContent = 
    `${priceResult.total.toLocaleString()}원`;
}
