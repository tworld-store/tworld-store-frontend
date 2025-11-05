/**
 * ═══════════════════════════════════════════════════
 * 기기 상세 페이지 - device-detail.js
 * ═══════════════════════════════════════════════════
 * 
 * 기능:
 * - products.json 로드
 * - URL 파라미터로 모델명 받기
 * - 용량/색상 선택
 * - 가입유형/요금제/할부개월/할인방법 선택
 * - 가격 실시간 계산
 * - 하단 바 업데이트
 * - 이미지 슬라이더
 * - 탭 & FAQ
 */

/* ═══════════════════════════════════════════════════
   전역 변수
   ═══════════════════════════════════════════════════ */

let productsData = null;          // products.json 데이터
let currentDevice = null;         // 현재 선택된 기기 (특정 용량/색상)
let allDeviceOptions = [];        // 같은 모델의 모든 용량 옵션들
let currentSelections = {         // 현재 선택 상태
  storage: null,                  // 용량 (GB)
  colorId: null,                  // 색상 ID
  colorName: '',                  // 색상 이름
  subscriptionType: 'change',     // 가입유형 (change/port/new)
  planId: null,                   // 요금제 ID
  planName: '',                   // 요금제 이름
  planPrice: 0,                   // 요금제 가격
  installmentMonths: 24,          // 할부개월
  discountMethod: 'common'        // 할인방법 (common/select)
};

/* ═══════════════════════════════════════════════════
   초기화
   ═══════════════════════════════════════════════════ */

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 Device Detail 페이지 초기화 시작');
  
  try {
    // 1. products.json 로드
    await loadProductsData();
    
    // 2. URL 파라미터에서 모델명 추출
    const urlParams = new URLSearchParams(window.location.search);
    const modelName = urlParams.get('model');
    
    if (!modelName) {
      showError('모델명이 지정되지 않았습니다.');
      return;
    }
    
    console.log(`🔍 요청된 모델: ${modelName}`);
    
    // 3. 해당 모델의 모든 용량 옵션 찾기
    allDeviceOptions = productsData.devices.filter(d => d.model === modelName && d.visible);
    
    if (allDeviceOptions.length === 0) {
      showError('해당 모델을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`📦 "${modelName}" 모델의 용량 옵션: ${allDeviceOptions.length}개`);
    
    // 4. 첫 번째 용량을 기본값으로 선택
    currentDevice = allDeviceOptions[0];
    currentSelections.storage = currentDevice.storage;
    
    // 5. 첫 번째 색상을 기본값으로 선택
    if (currentDevice.colors && currentDevice.colors.length > 0) {
      currentSelections.colorId = currentDevice.colors[0].id;
      currentSelections.colorName = currentDevice.colors[0].name;
    }
    
    // 6. UI 렌더링
    renderProductInfo();
    renderStorageOptions();
    renderColorOptions();
    renderImageSlider();
    renderSubscriptionTypeButtons();
    renderInstallmentButtons();
    renderDiscountButtons();
    
    // 7. 이벤트 리스너 등록
    initEventListeners();
    
    // 8. 초기 가격 계산
    calculateAndUpdatePrice();
    
    console.log('✅ Device Detail 페이지 초기화 완료');
    
  } catch (error) {
    console.error('❌ 초기화 실패:', error);
    showError('페이지를 불러오는 중 오류가 발생했습니다.');
  }
});

/* ═══════════════════════════════════════════════════
   데이터 로드
   ═══════════════════════════════════════════════════ */

/**
 * products.json 로드
 */
async function loadProductsData() {
  try {
    const response = await API.getProducts();
    productsData = response;
    console.log('✅ products.json 로드 완료');
  } catch (error) {
    console.error('❌ products.json 로드 실패:', error);
    throw error;
  }
}

/* ═══════════════════════════════════════════════════
   렌더링 함수들
   ═══════════════════════════════════════════════════ */

/**
 * 제품 정보 렌더링
 */
function renderProductInfo() {
  document.querySelector('.product-info__brand').textContent = currentDevice.brand;
  document.querySelector('.product-info__name').textContent = currentDevice.model;
  
  // 용량과 색상 표시
  const storageText = `${currentDevice.storage}GB · ${currentSelections.colorName}`;
  document.querySelector('.product-info__storage').textContent = storageText;
}

/**
 * 용량 선택 버튼 렌더링
 */
function renderStorageOptions() {
  const container = document.getElementById('storage-group');
  container.innerHTML = '';
  
  // 용량별로 고유한 옵션만 표시
  const uniqueStorages = [...new Set(allDeviceOptions.map(d => d.storage))].sort((a, b) => a - b);
  
  uniqueStorages.forEach(storage => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-group__item';
    btn.setAttribute('data-storage', storage);
    btn.textContent = `${storage}GB`;
    
    if (storage === currentDevice.storage) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', handleStorageChange);
    container.appendChild(btn);
  });
}

/**
 * 색상 선택 칩 렌더링
 */
function renderColorOptions() {
  const container = document.getElementById('color-group');
  container.innerHTML = '';
  
  if (!currentDevice.colors || currentDevice.colors.length === 0) {
    return;
  }
  
  currentDevice.colors.forEach(color => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'color-chip';
    chip.style.backgroundColor = color.hex;
    chip.setAttribute('data-color-id', color.id);
    chip.setAttribute('data-color-name', color.name);
    chip.setAttribute('aria-label', color.name);
    
    if (color.id === currentSelections.colorId) {
      chip.classList.add('active');
    }
    
    chip.addEventListener('click', handleColorChange);
    container.appendChild(chip);
  });
  
  // 색상 이름 업데이트
  document.getElementById('color-name').textContent = currentSelections.colorName;
}

/**
 * 이미지 슬라이더 렌더링
 */
function renderImageSlider() {
  const selectedColor = currentDevice.colors.find(c => c.id === currentSelections.colorId);
  
  if (!selectedColor || !selectedColor.images) {
    return;
  }
  
  // 메인 이미지
  const mainImg = document.querySelector('.image-main img');
  if (mainImg && selectedColor.images.main && selectedColor.images.main.length > 0) {
    mainImg.src = selectedColor.images.main[0];
    mainImg.alt = `${currentDevice.model} ${selectedColor.name}`;
  }
  
  // 썸네일 이미지들
  const thumbsContainer = document.querySelector('.image-thumbs');
  if (thumbsContainer && selectedColor.images.main) {
    thumbsContainer.innerHTML = '';
    
    selectedColor.images.main.forEach((imgSrc, index) => {
      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'image-thumb' + (index === 0 ? ' active' : '');
      
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `${currentDevice.model} ${selectedColor.name} ${index + 1}`;
      
      thumbDiv.appendChild(img);
      thumbDiv.addEventListener('click', () => handleThumbClick(imgSrc, thumbDiv));
      thumbsContainer.appendChild(thumbDiv);
    });
  }
}

/**
 * 가입유형 버튼 렌더링
 */
function renderSubscriptionTypeButtons() {
  const container = document.getElementById('subscription-group');
  
  const types = [
    { value: 'change', label: '기기변경' },
    { value: 'port', label: '번호이동' },
    { value: 'new', label: '신규가입' }
  ];
  
  container.innerHTML = '';
  
  types.forEach(type => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-group__item';
    btn.setAttribute('data-subscription-type', type.value);
    btn.textContent = type.label;
    
    if (type.value === currentSelections.subscriptionType) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', handleSubscriptionTypeChange);
    container.appendChild(btn);
  });
}

/**
 * 할부개월 버튼 렌더링
 */
function renderInstallmentButtons() {
  const container = document.getElementById('installment-group');
  
  const months = [24, 30, 36];
  
  container.innerHTML = '';
  
  months.forEach(month => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-group__item';
    btn.setAttribute('data-months', month);
    btn.textContent = `${month}개월`;
    
    if (month === currentSelections.installmentMonths) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', handleInstallmentChange);
    container.appendChild(btn);
  });
}

/**
 * 할인방법 버튼 렌더링
 */
function renderDiscountButtons() {
  const container = document.getElementById('discount-group');
  
  const methods = [
    { value: 'common', label: '공통지원' },
    { value: 'select', label: '선택약정 25%할인' }
  ];
  
  container.innerHTML = '';
  
  methods.forEach(method => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-group__item';
    btn.setAttribute('data-discount-method', method.value);
    btn.textContent = method.label;
    
    if (method.value === currentSelections.discountMethod) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', handleDiscountChange);
    container.appendChild(btn);
  });
}

/* ═══════════════════════════════════════════════════
   이벤트 핸들러
   ═══════════════════════════════════════════════════ */

/**
 * 용량 변경 핸들러
 */
function handleStorageChange(event) {
  const storage = parseInt(event.target.getAttribute('data-storage'));
  currentSelections.storage = storage;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#storage-group .btn-group__item').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 선택한 용량의 기기로 currentDevice 업데이트
  currentDevice = allDeviceOptions.find(d => d.storage === storage);
  
  // 첫 번째 색상으로 초기화
  if (currentDevice.colors && currentDevice.colors.length > 0) {
    currentSelections.colorId = currentDevice.colors[0].id;
    currentSelections.colorName = currentDevice.colors[0].name;
  }
  
  // UI 업데이트
  renderProductInfo();
  renderColorOptions();
  renderImageSlider();
  calculateAndUpdatePrice();
  
  console.log(`✅ 용량 변경: ${storage}GB`);
}

/**
 * 색상 변경 핸들러
 */
function handleColorChange(event) {
  const colorId = event.target.getAttribute('data-color-id');
  const colorName = event.target.getAttribute('data-color-name');
  
  currentSelections.colorId = colorId;
  currentSelections.colorName = colorName;
  
  // 색상 칩 active 상태 변경
  document.querySelectorAll('.color-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 색상 이름 업데이트
  document.getElementById('color-name').textContent = colorName;
  
  // 제품 정보 업데이트
  renderProductInfo();
  
  // 이미지 업데이트
  renderImageSlider();
  
  console.log(`✅ 색상 변경: ${colorName}`);
}

/**
 * 썸네일 클릭 핸들러
 */
function handleThumbClick(imgSrc, thumbElement) {
  // 메인 이미지 변경
  const mainImg = document.querySelector('.image-main img');
  if (mainImg) {
    mainImg.src = imgSrc;
  }
  
  // 썸네일 active 상태 변경
  document.querySelectorAll('.image-thumb').forEach(thumb => {
    thumb.classList.remove('active');
  });
  thumbElement.classList.add('active');
}

/**
 * 가입유형 변경 핸들러
 */
function handleSubscriptionTypeChange(event) {
  const type = event.target.getAttribute('data-subscription-type');
  currentSelections.subscriptionType = type;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#subscription-group .btn-group__item').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
  
  console.log(`✅ 가입유형 변경: ${type}`);
}

/**
 * 할부개월 변경 핸들러
 */
function handleInstallmentChange(event) {
  const months = parseInt(event.target.getAttribute('data-months'));
  currentSelections.installmentMonths = months;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#installment-group .btn-group__item').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
  
  console.log(`✅ 할부개월 변경: ${months}개월`);
}

/**
 * 할인방법 변경 핸들러
 */
function handleDiscountChange(event) {
  const method = event.target.getAttribute('data-discount-method');
  currentSelections.discountMethod = method;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#discount-group .btn-group__item').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
  
  console.log(`✅ 할인방법 변경: ${method}`);
}

/**
 * 요금제 선택 버튼 클릭 핸들러
 */
function handlePlanSelectClick() {
  // TODO: plan-modal 연동 (추후 구현)
  console.log('📞 요금제 선택 모달 열기 (추후 구현)');
  alert('요금제 선택 기능은 추후 구현 예정입니다.');
}

/* ═══════════════════════════════════════════════════
   가격 계산
   ═══════════════════════════════════════════════════ */

/**
 * 가격 계산 및 UI 업데이트
 */
function calculateAndUpdatePrice() {
  if (!productsData || !currentDevice) {
    return;
  }
  
  try {
    // Calculator 클래스 사용
    const priceData = Calculator.calculate({
      device: currentDevice,
      planPrice: currentSelections.planPrice,
      subscriptionType: currentSelections.subscriptionType,
      installmentMonths: currentSelections.installmentMonths,
      discountMethod: currentSelections.discountMethod,
      subsidies: productsData.subsidies,
      deviceId: currentDevice.id,
      planId: currentSelections.planId
    });
    
    // 가격 상세 카드 업데이트
    updatePriceDetailCard(priceData);
    
    // 하단 바 업데이트
    updateBottomBar(priceData);
    
    console.log('💰 가격 계산 완료:', priceData);
    
  } catch (error) {
    console.error('❌ 가격 계산 실패:', error);
  }
}

/**
 * 가격 상세 카드 업데이트
 */
function updatePriceDetailCard(priceData) {
  // 월 휴대폰 요금
  const phoneMonthly = document.getElementById('phone-monthly');
  if (phoneMonthly) {
    phoneMonthly.textContent = priceData.phoneMonthly.toLocaleString() + '원';
  }
  
  // 출고가
  document.querySelector('[data-price="factory"]').textContent = 
    priceData.factoryPrice.toLocaleString() + '원';
  
  // 공통지원금
  document.querySelector('[data-price="common-subsidy"]').textContent = 
    '-' + priceData.commonSubsidy.toLocaleString() + '원';
  
  // 추가지원금
  document.querySelector('[data-price="additional-subsidy"]').textContent = 
    '-' + priceData.additionalSubsidy.toLocaleString() + '원';
  
  // 할부원금
  document.querySelector('[data-price="installment-principal"]').textContent = 
    priceData.installmentPrincipal.toLocaleString() + '원';
  
  // 월 통신요금
  const planMonthly = document.getElementById('plan-monthly');
  if (planMonthly) {
    planMonthly.textContent = priceData.planMonthly.toLocaleString() + '원';
  }
  
  // 요금제 월 기준금액
  document.querySelector('[data-price="plan-base"]').textContent = 
    priceData.planBasePrice.toLocaleString() + '원';
  
  // 요금할인
  document.querySelector('[data-price="plan-discount"]').textContent = 
    '-' + priceData.planDiscount.toLocaleString() + '원';
  
  // 월 예상 납부 금액
  const totalMonthly = document.getElementById('total-monthly');
  if (totalMonthly) {
    totalMonthly.textContent = priceData.totalMonthly.toLocaleString() + '원';
  }
}

/**
 * 하단 바 가격 업데이트
 */
function updateBottomBar(priceData) {
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
}

/* ═══════════════════════════════════════════════════
   이벤트 리스너 초기화
   ═══════════════════════════════════════════════════ */

/**
 * 전역 이벤트 리스너 등록
 */
function initEventListeners() {
  // 요금제 선택 버튼
  const planSelectBtn = document.getElementById('plan-selector');
  if (planSelectBtn) {
    planSelectBtn.addEventListener('click', handlePlanSelectClick);
  }
  
  // 주문하기 버튼
  const orderBtn = document.getElementById('order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      console.log('🛒 주문하기 클릭');
      alert('주문하기 기능은 추후 구현 예정입니다.');
    });
  }
  
  // 탭 전환
  document.querySelectorAll('.tab').forEach((tab, index) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content')[index].classList.add('active');
    });
  });
  
  // FAQ 아코디언
  document.querySelectorAll('.faq-item__q').forEach(q => {
    q.addEventListener('click', () => {
      q.closest('.faq-item').classList.toggle('open');
    });
  });
}

/* ═══════════════════════════════════════════════════
   유틸리티
   ═══════════════════════════════════════════════════ */

/**
 * 에러 메시지 표시
 */
function showError(message) {
  console.error('❌', message);
  alert(message);
  // TODO: 더 나은 에러 UI 구현
}
