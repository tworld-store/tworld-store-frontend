/**
 * Device Detail JavaScript - 개선 버전 (최종)
 * 
 * 주요 개선사항:
 * 1. 요금 상세 내역 카드 추가 (약정별 표시/숨김)
 * 2. Glassmorphism 디자인 적용
 * 3. 가격 계산 로직 수정 (영문→한글 매핑)
 * 4. 하단 고정바 tnshop 스타일
 * 5. URL 파라미터: 구버전 방식 (?id=...) 유지
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
    
    console.log('📱 기기 ID:', deviceId);
    
    // 2. API 데이터 로드
    const api = new DataAPI();
    productsData = await api.load();
    
    console.log('✅ Products 데이터 로드 완료');
    
    // 3. 현재 기기 찾기
    currentDevice = productsData.devices.find(d => d.id === deviceId);
    
    if (!currentDevice) {
      console.error('❌ 기기를 찾을 수 없음. deviceId:', deviceId);
      console.log('사용 가능한 기기 ID 목록:');
      productsData.devices.forEach(d => console.log('  -', d.id));
      
      alert('기기를 찾을 수 없습니다.');
      window.location.href = './devices.html';
      return;
    }
    
    console.log('✅ 기기 찾음:', currentDevice.model);
    
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
    
    // 7. 색상 기본값 설정 (첫 번째 색상 자동 선택)
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
// UI 렌더링 함수들
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
  
  allDeviceOptions.forEach(device => {
    const button = document.createElement('button');
    button.className = 'storage-option';
    button.textContent = `${device.storage}GB`;
    button.dataset.deviceId = device.id;
    button.dataset.storage = device.storage;
    
    // 현재 기기면 활성화
    if (device.id === currentDevice.id) {
      button.classList.add('active');
      currentSelections.storage = device.storage;
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
  const colorNameElement = document.getElementById('selected-color-name');
  if (colorNameElement && currentSelections.colorId) {
    const selectedColor = currentDevice.colors.find(c => c.id === currentSelections.colorId);
    if (selectedColor) {
      colorNameElement.textContent = selectedColor.name;
    }
  }
}

/**
 * 색상 UI 업데이트
 */
function updateColorUI() {
  document.querySelectorAll('.color-chip').forEach(chip => {
    if (chip.dataset.colorId === currentSelections.colorId) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  
  const colorNameElement = document.getElementById('selected-color-name');
  if (colorNameElement && currentSelections.colorId) {
    const selectedColor = currentDevice.colors.find(c => c.id === currentSelections.colorId);
    if (selectedColor) {
      colorNameElement.textContent = selectedColor.name;
    }
  }
}

/**
 * 이미지 슬라이더 렌더링 (임시)
 */
function renderImageSlider() {
  // TODO: Swiper.js 구현
  console.log('📷 이미지 슬라이더 렌더링 (추후 구현)');
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
  // 가입유형 라디오 버튼
  document.querySelectorAll('input[name="subscription-type"]').forEach(radio => {
    radio.addEventListener('change', handleSubscriptionTypeChange);
  });
  
  // 할인유형 라디오 버튼
  document.querySelectorAll('input[name="discount-type"]').forEach(radio => {
    radio.addEventListener('change', handleDiscountTypeChange);
  });
  
  // 할부개월 셀렉트
  const installmentSelect = document.getElementById('installment-months');
  if (installmentSelect) {
    installmentSelect.addEventListener('change', handleInstallmentChange);
  }
  
  // 요금제 선택 버튼
  const planButton = document.getElementById('open-plan-selector');
  if (planButton) {
    planButton.addEventListener('click', openPlanSelector);
  }
  
  // 상담신청 버튼
  const consultButton = document.getElementById('consult-button');
  if (consultButton) {
    consultButton.addEventListener('click', handleConsultClick);
  }
  
  // 주문하기 버튼
  const orderButton = document.getElementById('order-button');
  if (orderButton) {
    orderButton.addEventListener('click', handleOrderClick);
  }
}

/**
 * 용량 변경 처리
 */
async function handleStorageChange(e) {
  const newDeviceId = e.currentTarget.dataset.deviceId;
  
  if (newDeviceId === currentDevice.id) return;
  
  // URL 업데이트 및 페이지 이동 (구버전 방식)
  window.location.href = `device-detail.html?id=${newDeviceId}`;
}

/**
 * 색상 변경 처리
 */
async function handleColorChange(e) {
  const colorId = e.currentTarget.dataset.colorId;
  
  if (colorId === currentSelections.colorId) return;
  
  currentSelections.colorId = colorId;
  
  // UI 업데이트
  updateColorUI();
  
  // 이미지 변경 (TODO)
  console.log('색상 변경:', colorId);
  
  // 가격 재계산
  await calculateAndUpdatePrice();
}

/**
 * 가입유형 변경 처리
 */
async function handleSubscriptionTypeChange(e) {
  currentSelections.subscriptionType = e.target.value;
  console.log('가입유형 변경:', currentSelections.subscriptionType);
  
  await calculateAndUpdatePrice();
}

/**
 * 할인유형 변경 처리
 */
async function handleDiscountTypeChange(e) {
  currentSelections.discountType = e.target.value;
  console.log('할인유형 변경:', currentSelections.discountType);
  
  await calculateAndUpdatePrice();
}

/**
 * 할부개월 변경 처리
 */
async function handleInstallmentChange(e) {
  currentSelections.installmentMonths = parseInt(e.target.value, 10);
  console.log('할부개월 변경:', currentSelections.installmentMonths);
  
  await calculateAndUpdatePrice();
}

/**
 * 요금제 선택 팝업 열기
 */
function openPlanSelector() {
  // TODO: 요금제 선택 팝업 구현 (Phase 4)
  console.log('요금제 선택 팝업 열기');
  alert('요금제 선택 기능은 Phase 4에서 구현 예정입니다.');
}

/**
 * 상담신청 버튼 클릭
 */
function handleConsultClick() {
  const phoneNumber = productsData?.settings?.['상담전화'] || '1588-0011';
  const confirmMsg = `상담 전화 ${phoneNumber}로 연결하시겠습니까?`;
  
  if (confirm(confirmMsg)) {
    window.location.href = `tel:${phoneNumber}`;
  }
}

/**
 * 주문하기 버튼 클릭
 */
function handleOrderClick() {
  // TODO: 주문 페이지 이동 또는 상담 신청 로직
  console.log('주문하기 클릭');
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
    
    // Calculator 사용
    const calculator = new PriceCalculator(productsData);
    
    // 계산 파라미터
    const params = {
      deviceId: currentDevice.id,
      planId: currentSelections.planId,
      subscriptionType: currentSelections.subscriptionType,
      discountType: currentSelections.discountType,
      installmentMonths: currentSelections.installmentMonths
    };
    
    console.log('💰 가격 계산 중...', params);
    
    const result = calculator.calculate(params);
    
    console.log('✅ 계산 완료:', result);
    
    // UI 업데이트
    updatePriceUI(result);
    
  } catch (error) {
    console.error('❌ 가격 계산 오류:', error);
  }
}

/**
 * 가격 UI 업데이트
 */
function updatePriceUI(result) {
  // 월 휴대폰 요금
  const phoneMonthlyElement = document.getElementById('phone-monthly');
  if (phoneMonthlyElement) {
    phoneMonthlyElement.textContent = result.phoneMonthly.toLocaleString() + '원';
  }
  
  // 월 통신요금
  const planMonthlyElement = document.getElementById('plan-monthly');
  if (planMonthlyElement) {
    planMonthlyElement.textContent = result.planMonthly.toLocaleString() + '원';
  }
  
  // 월 예상 납부 금액
  const totalMonthlyElements = document.querySelectorAll('.total-monthly');
  totalMonthlyElements.forEach(el => {
    el.textContent = result.totalMonthly.toLocaleString() + '원';
  });
  
  // 요금 상세 내역 업데이트
  updatePriceDetailCard(result);
}

/**
 * 요금 상세 내역 카드 업데이트
 */
function updatePriceDetailCard(result) {
  // 출고가
  const devicePriceElement = document.getElementById('detail-device-price');
  if (devicePriceElement) {
    devicePriceElement.textContent = result.devicePrice.toLocaleString() + '원';
  }
  
  // 공통지원금 (지원금 약정만 표시)
  const commonRow = document.getElementById('common-subsidy-row');
  const commonValueElement = document.getElementById('detail-common-subsidy');
  if (currentSelections.discountType === 'subsidy') {
    if (commonRow) commonRow.style.display = 'flex';
    if (commonValueElement) {
      commonValueElement.textContent = '-' + result.commonSubsidy.toLocaleString() + '원';
    }
  } else {
    if (commonRow) commonRow.style.display = 'none';
  }
  
  // 추가지원금 (지원금 약정만 표시)
  const additionalRow = document.getElementById('additional-subsidy-row');
  const additionalValueElement = document.getElementById('detail-additional-subsidy');
  if (currentSelections.discountType === 'subsidy') {
    if (additionalRow) additionalRow.style.display = 'flex';
    if (additionalValueElement) {
      additionalValueElement.textContent = '-' + result.additionalSubsidy.toLocaleString() + '원';
    }
  } else {
    if (additionalRow) additionalRow.style.display = 'none';
  }
  
  // 선약지원금 (선택약정만 표시)
  const selectRow = document.getElementById('select-subsidy-row');
  const selectValueElement = document.getElementById('detail-select-subsidy');
  if (currentSelections.discountType === 'selective') {
    if (selectRow) selectRow.style.display = 'flex';
    if (selectValueElement) {
      selectValueElement.textContent = '-' + result.selectSubsidy.toLocaleString() + '원';
    }
  } else {
    if (selectRow) selectRow.style.display = 'none';
  }
  
  // 할부원금
  const installmentElement = document.getElementById('detail-installment-principal');
  if (installmentElement) {
    installmentElement.textContent = result.installmentPrincipal.toLocaleString() + '원';
  }
  
  // 요금제 월 기준금액
  const planPriceElement = document.getElementById('detail-plan-price');
  if (planPriceElement) {
    planPriceElement.textContent = result.planPrice.toLocaleString() + '원';
  }
  
  // 요금할인 25% (선택약정만 표시)
  const planDiscountRow = document.getElementById('plan-discount-row');
  const planDiscountElement = document.getElementById('detail-plan-discount');
  if (currentSelections.discountType === 'selective') {
    if (planDiscountRow) planDiscountRow.style.display = 'flex';
    if (planDiscountElement) {
      planDiscountElement.textContent = '-' + result.planDiscount.toLocaleString() + '원';
    }
  } else {
    if (planDiscountRow) planDiscountRow.style.display = 'none';
  }
}