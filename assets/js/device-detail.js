/**
 * Device Detail JavaScript - v2.0 (Calculator 호환)
 * 
 * URL 구조: device-detail.html?model=갤럭시S24
 * - 모델명만 파라미터로 전달
 * - 용량/색상은 페이지 내에서 선택
 * 
 * v2.0 변경사항:
 * - PriceCalculator v2.0 호환 (ID 기반 인터페이스)
 * - updatePriceUI() 함수 필드명 수정
 */

// ============================================
// 전역 변수
// ============================================
let productsData = null;
let currentDevice = null;
let allModelDevices = []; // 같은 모델의 모든 용량 옵션

const currentSelections = {
  deviceId: null, // 현재 선택된 device ID (용량 포함)
  colorId: null,
  subscriptionType: 'change',
  planId: null,
  discountType: 'subsidy',
  installmentMonths: 36
};

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 Device Detail 페이지 초기화 시작');
  
  try {
    // 1. URL에서 모델명 추출
    const urlParams = new URLSearchParams(window.location.search);
    const modelName = urlParams.get('model');
    
    if (!modelName) {
      alert('기기 정보를 찾을 수 없습니다.');
      window.location.href = './devices.html';
      return;
    }
    
    console.log('📱 모델명:', modelName);
    
    // 2. API 데이터 로드
    const api = new DataAPI();
    productsData = await FetchProducts();
    console.log('✅ Products 데이터 로드 완료');
    
    // 3. 해당 모델의 모든 용량 옵션 찾기
    allModelDevices = productsData.devices.filter(d => d.model === modelName);
    
    if (allModelDevices.length === 0) {
      console.error('❌ 모델을 찾을 수 없음:', modelName);
      alert('기기를 찾을 수 없습니다.');
      window.location.href = './devices.html';
      return;
    }
    
    console.log(`✅ "${modelName}" 모델 찾음, 용량 옵션: ${allModelDevices.length}개`);
    
    // 4. 기본값: 첫 번째 용량 선택
    currentDevice = allModelDevices[0];
    currentSelections.deviceId = currentDevice.id;
    console.log(`✅ 기본 용량 선택: ${currentDevice.storage}GB`);
    
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
    
    // 7. 색상 기본값 설정
    if (currentDevice.colors && currentDevice.colors.length > 0) {
      currentSelections.colorId = currentDevice.colors[0].id;
    }
    
    // 8. 이벤트 리스너 등록
    attachEventListeners();
    
    // 9. 초기 가격 계산
    await calculateAndUpdatePrice();
    
    console.log('✅ 초기화 완료');
    
  } catch (error) {
    console.error('❌ 초기화 오류:', error);
    alert('데이터를 불러오는 중 오류가 발생했습니다.');
  }
});

// ============================================
// UI 렌더링
// ============================================

/**
 * 상품 정보 렌더링
 */
function renderProductInfo() {
  // 브랜드
  const brandElement = document.getElementById('product-brand');
  if (brandElement) {
    brandElement.textContent = currentDevice.brand;
  }
  
  // 모델명
  const modelElement = document.getElementById('product-model');
  if (modelElement) {
    modelElement.textContent = currentDevice.model;
  }
  
  // 출고가
  updatePrice();
}

/**
 * 출고가 업데이트
 */
function updatePrice() {
  const priceElement = document.getElementById('product-price');
  if (priceElement) {
    priceElement.textContent = currentDevice.price.toLocaleString() + '원';
  }
}

/**
 * 용량 옵션 렌더링
 */
function renderStorageOptions() {
  const container = document.querySelector('.storage-options');
  if (!container) return;
  
  container.innerHTML = '';
  
  allModelDevices.forEach(device => {
    const button = document.createElement('button');
    button.className = 'storage-option';
    button.textContent = `${device.storage}GB`;
    button.dataset.deviceId = device.id;
    button.dataset.storage = device.storage;
    
    // 현재 선택된 용량이면 활성화
    if (device.id === currentSelections.deviceId) {
      button.classList.add('active');
    }
    
    button.addEventListener('click', handleStorageChange);
    
    container.appendChild(button);
  });
}

/**
 * 색상 옵션 렌더링
 */
function renderColorOptions() {
  const container = document.querySelector('.color-options');
  if (!container || !currentDevice.colors) return;
  
  container.innerHTML = '';
  
  currentDevice.colors.forEach(color => {
    const button = document.createElement('button');
    button.className = 'color-chip';
    button.style.backgroundColor = color.hex;
    button.title = color.name;
    button.dataset.colorId = color.id;
    button.dataset.colorName = color.name;
    
    // 현재 선택된 색상이면 활성화
    if (currentSelections.colorId === color.id) {
      button.classList.add('active');
    }
    
    button.addEventListener('click', handleColorChange);
    
    container.appendChild(button);
  });
  
  // 색상명 표시
  updateColorName();
}

/**
 * 색상명 업데이트
 */
function updateColorName() {
  const colorNameElement = document.getElementById('selected-color-name');
  if (!colorNameElement || !currentSelections.colorId) return;
  
  const selectedColor = currentDevice.colors.find(c => c.id === currentSelections.colorId);
  if (selectedColor) {
    colorNameElement.textContent = selectedColor.name;
  }
}

/**
 * 이미지 슬라이더 렌더링
 */
function renderImageSlider() {
  // TODO: Swiper.js 구현
  console.log('📷 이미지 슬라이더 렌더링');
}

/**
 * 선택된 요금제 업데이트
 */
function updateSelectedPlan() {
  const plan = productsData.plans.find(p => p.id === currentSelections.planId);
  if (!plan) return;
  
  const planNameElement = document.getElementById('selected-plan-name');
  if (planNameElement) {
    planNameElement.textContent = plan.name;
  }
  
  const planPriceElement = document.getElementById('selected-plan-price');
  if (planPriceElement) {
    planPriceElement.textContent = `월 ${plan.price.toLocaleString()}원`;
  }
}

// ============================================
// 이벤트 핸들러
// ============================================

/**
 * 이벤트 리스너 등록
 */
function attachEventListeners() {
  // 가입유형
  document.querySelectorAll('input[name="subscription-type"]').forEach(radio => {
    radio.addEventListener('change', handleSubscriptionTypeChange);
  });
  
  // 할인유형
  document.querySelectorAll('input[name="discount-type"]').forEach(radio => {
    radio.addEventListener('change', handleDiscountTypeChange);
  });
  
  // 할부개월
  const installmentSelect = document.getElementById('installment-months');
  if (installmentSelect) {
    installmentSelect.addEventListener('change', handleInstallmentChange);
  }
  
  // 요금제 선택
  const planButton = document.getElementById('open-plan-selector');
  if (planButton) {
    planButton.addEventListener('click', openPlanSelector);
  }
  
  // 상담신청
  const consultButton = document.getElementById('consult-button');
  if (consultButton) {
    consultButton.addEventListener('click', handleConsultClick);
  }
  
  // 주문하기
  const orderButton = document.getElementById('order-button');
  if (orderButton) {
    orderButton.addEventListener('click', handleOrderClick);
  }
}

/**
 * 용량 변경 처리 (URL 변경 없이 클라이언트에서 처리)
 */
async function handleStorageChange(e) {
  const newDeviceId = e.currentTarget.dataset.deviceId;
  
  if (newDeviceId === currentSelections.deviceId) return;
  
  console.log('📦 용량 변경:', newDeviceId);
  
  // 1. 새 device 찾기
  const newDevice = allModelDevices.find(d => d.id === newDeviceId);
  if (!newDevice) {
    console.error('❌ device를 찾을 수 없음:', newDeviceId);
    return;
  }
  
  // 2. currentDevice 업데이트
  currentDevice = newDevice;
  currentSelections.deviceId = newDevice.id;
  
  // 3. 색상 기본값 재설정
  if (currentDevice.colors && currentDevice.colors.length > 0) {
    currentSelections.colorId = currentDevice.colors[0].id;
  }
  
  // 4. UI 업데이트
  updatePrice();
  updateStorageButtons();
  renderColorOptions(); // 색상 옵션 다시 렌더링
  
  // 5. 가격 재계산
  await calculateAndUpdatePrice();
}

/**
 * 용량 버튼 활성화 상태 업데이트
 */
function updateStorageButtons() {
  document.querySelectorAll('.storage-option').forEach(btn => {
    if (btn.dataset.deviceId === currentSelections.deviceId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * 색상 변경 처리 (URL 변경 없이 클라이언트에서 처리)
 */
async function handleColorChange(e) {
  const colorId = e.currentTarget.dataset.colorId;
  
  if (colorId === currentSelections.colorId) return;
  
  console.log('🎨 색상 변경:', colorId);
  
  currentSelections.colorId = colorId;
  
  // UI 업데이트
  updateColorButtons();
  updateColorName();
  
  // 이미지 변경 (TODO)
  
  // 가격은 색상에 영향 없음 (재계산 불필요)
}

/**
 * 색상 버튼 활성화 상태 업데이트
 */
function updateColorButtons() {
  document.querySelectorAll('.color-chip').forEach(btn => {
    if (btn.dataset.colorId === currentSelections.colorId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * 가입유형 변경
 */
async function handleSubscriptionTypeChange(e) {
  currentSelections.subscriptionType = e.target.value;
  console.log('📱 가입유형 변경:', currentSelections.subscriptionType);
  await calculateAndUpdatePrice();
}

/**
 * 할인유형 변경
 */
async function handleDiscountTypeChange(e) {
  currentSelections.discountType = e.target.value;
  console.log('💰 할인유형 변경:', currentSelections.discountType);
  await calculateAndUpdatePrice();
}

/**
 * 할부개월 변경
 */
async function handleInstallmentChange(e) {
  currentSelections.installmentMonths = parseInt(e.target.value, 10);
  console.log('📅 할부개월 변경:', currentSelections.installmentMonths);
  await calculateAndUpdatePrice();
}

/**
 * 요금제 선택 팝업
 */
function openPlanSelector() {
  console.log('📋 요금제 선택 팝업');
  alert('요금제 선택 기능은 Phase 4에서 구현 예정입니다.');
}

/**
 * 상담신청
 */
function handleConsultClick() {
  const phoneNumber = productsData?.settings?.['상담전화'] || '1588-0011';
  if (confirm(`상담 전화 ${phoneNumber}로 연결하시겠습니까?`)) {
    window.location.href = `tel:${phoneNumber}`;
  }
}

/**
 * 주문하기
 */
function handleOrderClick() {
  console.log('🛒 주문하기');
  alert('주문 기능은 추후 구현 예정입니다.\n상담신청을 이용해주세요.');
}

// ============================================
// 가격 계산
// ============================================

/**
 * 가격 계산 및 UI 업데이트
 */
async function calculateAndUpdatePrice() {
  try {
    if (!currentSelections.planId) {
      console.warn('⚠️ 요금제가 선택되지 않음');
      return;
    }
    
    const calculator = new PriceCalculator(productsData);
    
    const params = {
      deviceId: currentSelections.deviceId,
      planId: currentSelections.planId,
      subscriptionType: currentSelections.subscriptionType,
      discountType: currentSelections.discountType,
      installmentMonths: currentSelections.installmentMonths
    };
    
    console.log('💰 가격 계산 중...', params);
    
    const result = calculator.calculate(params);
    
    console.log('✅ 계산 완료:', result);
    
    updatePriceUI(result);
    
  } catch (error) {
    console.error('❌ 가격 계산 오류:', error);
    alert('가격 계산 중 오류가 발생했습니다.\n' + error.message);
  }
}

/**
 * 가격 UI 업데이트
 * 
 * ★★★ v2.0 수정 사항 ★★★
 * PriceCalculator v2.0의 반환 필드명에 맞게 수정:
 * - result.monthlyInstallment (월 할부금)
 * - result.monthlyPlanFee (월 통신요금)
 * - result.totalMonthly (월 총액)
 */
function updatePriceUI(result) {
  // ============================================
  // 1. 하단 고정 바
  // ============================================
  
  // 월 휴대폰 요금
  const barMonthlyDevice = document.getElementById('barMonthlyDevice');
  if (barMonthlyDevice) {
    barMonthlyDevice.textContent = result.monthlyInstallment.toLocaleString() + '원';
  }
  
  // 월 통신요금
  const barMonthlyPlan = document.getElementById('barMonthlyPlan');
  if (barMonthlyPlan) {
    barMonthlyPlan.textContent = result.monthlyPlanFee.toLocaleString() + '원';
  }
  
  // 월 총액
  const barTotalPrice = document.getElementById('barTotalPrice');
  if (barTotalPrice) {
    barTotalPrice.textContent = result.totalMonthly.toLocaleString() + '원';
  }
  
  // ============================================
  // 2. 가격 상세 섹션 - 월 휴대폰 요금
  // ============================================
  
  const detailMonthlyDevice = document.getElementById('detailMonthlyDevice');
  if (detailMonthlyDevice) {
    detailMonthlyDevice.textContent = result.monthlyInstallment.toLocaleString() + '원';
  }
  
  // ============================================
  // 3. 가격 상세 섹션 - 출고가
  // ============================================
  
  const detailDevicePrice = document.getElementById('detailDevicePrice');
  if (detailDevicePrice) {
    detailDevicePrice.textContent = result.devicePrice.toLocaleString() + '원';
  }
  
  // ============================================
  // 4. 가격 상세 섹션 - 공통지원금
  // ============================================
  
  const detailCommonSubsidy = document.getElementById('detailCommonSubsidy');
  if (detailCommonSubsidy) {
    detailCommonSubsidy.textContent = '-' + result.commonSubsidy.toLocaleString() + '원';
  }
  
  // ============================================
  // 5. 가격 상세 섹션 - 추가지원금
  // ============================================
  
  const detailAdditionalSubsidy = document.getElementById('detailAdditionalSubsidy');
  if (detailAdditionalSubsidy) {
    detailAdditionalSubsidy.textContent = '-' + result.additionalSubsidy.toLocaleString() + '원';
  }
  
  // ============================================
  // 6. 가격 상세 섹션 - 선택약정지원금 (선택약정일 때만 표시)
  // ============================================
  
  const detailSelectSubsidy = document.getElementById('detailSelectSubsidy');
  const detailSelectSubsidyRow = detailSelectSubsidy?.closest('.detail-row');
  
  if (result.discountType === 'selective') {
    // 선택약정일 때 표시
    if (detailSelectSubsidy) {
      detailSelectSubsidy.textContent = '-' + result.selectSubsidy.toLocaleString() + '원';
    }
    if (detailSelectSubsidyRow) {
      detailSelectSubsidyRow.style.display = 'flex';
    }
  } else {
    // 지원금 약정일 때 숨김
    if (detailSelectSubsidyRow) {
      detailSelectSubsidyRow.style.display = 'none';
    }
  }
  
  // ============================================
  // 7. 가격 상세 섹션 - 할부원금
  // ============================================
  
  const detailPrincipal = document.getElementById('detailPrincipal');
  if (detailPrincipal) {
    detailPrincipal.textContent = result.principal.toLocaleString() + '원';
  }
  
  // ============================================
  // 8. 가격 상세 섹션 - 월 통신요금
  // ============================================
  
  const detailMonthlyPlan = document.getElementById('detailMonthlyPlan');
  if (detailMonthlyPlan) {
    detailMonthlyPlan.textContent = result.monthlyPlanFee.toLocaleString() + '원';
  }
  
  // ============================================
  // 9. 가격 상세 섹션 - 요금제 원래 가격
  // ============================================
  
  const detailPlanPrice = document.getElementById('detailPlanPrice');
  if (detailPlanPrice) {
    detailPlanPrice.textContent = result.planPrice.toLocaleString() + '원';
  }
  
  // ============================================
  // 10. 가격 상세 섹션 - 요금할인 (선택약정일 때만 표시)
  // ============================================
  
  const detailPlanDiscount = document.getElementById('detailPlanDiscount');
  const detailPlanDiscountRow = document.getElementById('detailPlanDiscountRow');
  
  if (result.discountType === 'selective') {
    // 선택약정일 때 표시
    if (detailPlanDiscount) {
      detailPlanDiscount.textContent = '-' + result.planDiscount.toLocaleString() + '원';
    }
    if (detailPlanDiscountRow) {
      detailPlanDiscountRow.style.display = 'flex';
    }
  } else {
    // 지원금 약정일 때 숨김
    if (detailPlanDiscountRow) {
      detailPlanDiscountRow.style.display = 'none';
    }
  }
  
  // ============================================
  // 11. 가격 상세 섹션 - 최종 월 총액
  // ============================================
  
  const detailTotalPrice = document.getElementById('detailTotalPrice');
  if (detailTotalPrice) {
    detailTotalPrice.textContent = result.totalMonthly.toLocaleString() + '원';
  }
  
  debugLog('가격 UI 업데이트 완료', result);
}
