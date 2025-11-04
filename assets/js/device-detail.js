/**
 * 상품 상세 페이지 - device-detail.js
 * 
 * 주요 기능:
 * 1. URL에서 기기 ID 추출
 * 2. products.json 데이터 로드
 * 3. 이미지 슬라이더 초기화
 * 4. 색상/옵션 선택
 * 5. 실시간 가격 계산
 * 6. 탭 전환 (상품내용/FAQ)
 * 7. FAQ 아코디언
 * 8. CTA Bar 업데이트
 */

// ============================================
// 전역 변수
// ============================================

// Swiper 인스턴스
let productSwiper = null;

// 현재 기기 데이터
let currentDevice = null;

// 현재 모델의 모든 용량 옵션들
let allDeviceOptions = [];

// 전체 products.json 데이터
let productsData = null;

// 현재 선택 상태
let currentSelections = {
  deviceId: null,            // 현재 선택된 기기옵션ID (모델+용량)
  storage: null,             // 선택된 용량
  colorId: null,              // 색상 ID
  subscriptionType: 'change', // 가입유형 (change/port/new)
  planId: null,              // 요금제 ID
  discountType: 'subsidy',    // 할인유형 (subsidy/selective)
  installmentMonths: 24      // 할부개월
};

// ============================================
// 페이지 초기화
// ============================================

/**
 * 페이지 로드 시 초기화 함수
 */
async function initDeviceDetailPage() {
  try {
    console.log('상품 상세 페이지 초기화 시작...');
    
    // 1. URL에서 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');
    const deviceId = urlParams.get('id');
    
    console.log('📍 URL 파라미터:', { model, deviceId });
    
    if (!model && !deviceId) {
      showError('모델 또는 기기 ID가 없습니다.');
      setTimeout(() => {
        window.location.href = './devices.html';
      }, 2000);
      return;
    }
    
    // 2. products.json 로드
    productsData = await loadProductsData();
    if (!productsData) {
      showError('데이터를 불러오는데 실패했습니다.');
      return;
    }
    
    console.log('📦 products.json 로드 완료, 기기 수:', productsData.devices.length);
    
    // 3. 기기 찾기 (model 우선, 없으면 id 사용)
    if (model) {
      console.log(`🔍 모델 "${model}"로 검색 중...`);
      
      // 전체 기기 목록 확인
      const allModels = productsData.devices.map(d => d.model);
      console.log('📋 사용 가능한 모델들:', allModels.slice(0, 5));
      
      // 검색어 전처리: 앞뒤 공백 제거
      const trimmedModel = model.trim();
      
      // 1단계: 정확 일치 검색 (trim 적용)
      currentDevice = productsData.devices.find(d => 
        d.model && d.model.trim() === trimmedModel
      );
      
      if (!currentDevice) {
        // 2단계: 대소문자 무시 + 공백 정규화 (연속된 공백을 하나로)
        const normalizedModel = trimmedModel.toLowerCase().replace(/\s+/g, ' ');
        
        currentDevice = productsData.devices.find(d => {
          if (!d.model) return false;
          const normalizedDeviceModel = d.model.trim().toLowerCase().replace(/\s+/g, ' ');
          return normalizedDeviceModel === normalizedModel;
        });
        
        console.log(`2단계 검색 (대소문자 무시 + 공백 정규화): ${currentDevice ? '성공' : '실패'}`);
      }
      
      if (!currentDevice) {
        // 3단계: 모든 공백 제거 후 비교 (최종 방어선)
        const noSpaceModel = trimmedModel.toLowerCase().replace(/\s/g, '');
        
        currentDevice = productsData.devices.find(d => {
          if (!d.model) return false;
          const noSpaceDeviceModel = d.model.trim().toLowerCase().replace(/\s/g, '');
          return noSpaceDeviceModel === noSpaceModel;
        });
        
        console.log(`3단계 검색 (공백 제거): ${currentDevice ? '성공' : '실패'}`);
      }
      
      console.log(`모델 "${model}"로 검색 결과:`, currentDevice ? currentDevice.id : 'null');
    } else {
      // 기기 ID로 직접 검색 (하위 호환)
      console.log(`🔍 기기 ID "${deviceId}"로 검색 중...`);
      currentDevice = productsData.devices.find(d => d.id === deviceId);
      console.log(`기기 ID "${deviceId}"로 검색 결과:`, currentDevice ? currentDevice.id : 'null');
    }
    
    if (!currentDevice) {
      console.error('❌ 기기를 찾을 수 없습니다.', { model, deviceId });
      showError('해당 기기를 찾을 수 없습니다.');
      setTimeout(() => {
        window.location.href = './devices.html';
      }, 2000);
      return;
    }
    
    console.log('✅ 현재 기기:', currentDevice);
    
    // 4. 같은 모델의 모든 용량 옵션 찾기
    allDeviceOptions = productsData.devices.filter(d => d.model === currentDevice.model);
    console.log(`📦 "${currentDevice.model}" 모델의 용량 옵션: ${allDeviceOptions.length}개`);
    
    // 5. 기본 정보 렌더링
    renderDeviceInfo();
    
    // 6. 용량 선택기 렌더링
    renderStorageOptions();
    
    // 7. 이미지 슬라이더 초기화
    renderImageSlider();
    
    // 8. 색상 선택기 렌더링
    renderColorOptions();
    
    // 9. 요금제 선택기 렌더링
    renderPlanOptions();
    
    // 10. 이벤트 리스너 등록
    registerEventListeners();
    
    // 9. 초기 가격 계산 (displaySettings 기준)
    if (currentDevice.displaySettings) {
      currentSelections.subscriptionType = currentDevice.displaySettings.subscriptionType;
      currentSelections.planId = currentDevice.displaySettings.planId;
      currentSelections.installmentMonths = currentDevice.displaySettings.installmentMonths;
      
      // UI 업데이트
      updateSubscriptionTypeUI();
      updatePlanUI();
      updateInstallmentUI();
    }
    
    // 10. 초기 가격 계산
    await calculateAndUpdatePrice();
    
    console.log('페이지 초기화 완료!');
    
  } catch (error) {
    console.error('페이지 초기화 오류:', error);
    showError('페이지를 불러오는 중 오류가 발생했습니다.');
  }
}

// ============================================
// 데이터 로드
// ============================================

/**
 * URL에서 모델명 추출 후 기기 ID로 변환
 * @returns {string|null} 기기 ID
 */
function getDeviceIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // model 파라미터 우선 확인
  const model = urlParams.get('model');
  if (model && productsData) {
    // 해당 모델의 첫 번째 기기 찾기
    const device = productsData.devices.find(d => d.model === model);
    if (device) {
      console.log(`모델 "${model}"의 첫 번째 기기: ${device.id}`);
      return device.id;
    }
  }
  
  // 하위 호환: id 파라미터도 지원
  return urlParams.get('id');
}

/**
 * products.json 데이터 로드
 * @returns {Promise<Object|null>} products.json 데이터
 */
async function loadProductsData() {
  try {
    // API 클래스 사용 (api.js에서 정의됨)
    const api = new DataAPI();
    const data = await api.fetchProducts();
    return data;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    return null;
  }
}

// ============================================
// UI 렌더링
// ============================================

/**
 * 기기 기본 정보 렌더링
 */
function renderDeviceInfo() {
  // 제품명
  document.getElementById('productName').textContent = 
    `${currentDevice.brand} ${currentDevice.model}`;
  
  // 출고가
  document.getElementById('productPrice').textContent = 
    `${currentDevice.price.toLocaleString()}원`;
}

/**
 * 용량 선택기 렌더링
 */
function renderStorageOptions() {
  const container = document.getElementById('storageGroup');
  container.innerHTML = '';
  
  // 용량별로 고유한 옵션만 표시
  const uniqueStorages = [...new Set(allDeviceOptions.map(d => d.storage))].sort((a, b) => a - b);
  
  uniqueStorages.forEach((storage, index) => {
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
    
    // 이벤트 리스너
    btn.addEventListener('click', handleStorageChange);
    
    container.appendChild(btn);
  });
  
  console.log('용량 선택기 렌더링 완료:', uniqueStorages);
}

/**
 * 이미지 슬라이더 렌더링 및 초기화
 */
function renderImageSlider() {
  const wrapper = document.getElementById('productImageWrapper');
  
  // 색상별로 이미지 생성 (placeholder 사용)
  currentDevice.colors.forEach(color => {
    // 각 색상당 4개 이미지 (예시)
    for (let i = 1; i <= 4; i++) {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.setAttribute('data-color-id', color.id);
      
      const img = document.createElement('img');
      // 실제 이미지가 있으면 사용, 없으면 placeholder
      if (color.images && color.images.main && color.images.main[i-1]) {
        img.src = color.images.main[i-1];
      } else {
        img.src = './assets/images/placeholder/detail-default.svg';
      }
      img.alt = `${currentDevice.model} ${color.name} 이미지 ${i}`;
      
      slide.appendChild(img);
      wrapper.appendChild(slide);
    }
  });
  
  // Swiper 초기화
  productSwiper = new Swiper('.product-swiper', {
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  });
  
  console.log('이미지 슬라이더 초기화 완료');
}

/**
 * 색상 선택기 렌더링
 */
function renderColorOptions() {
  const container = document.getElementById('colorSelector');
  container.innerHTML = '';
  
  currentDevice.colors.forEach((color, index) => {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'color';
    input.id = `color-${color.id}`;
    input.value = color.id;
    if (index === 0) {
      input.checked = true;
      currentSelections.colorId = color.id;
      document.getElementById('selectedColorName').textContent = color.name;
    }
    
    const label = document.createElement('label');
    label.setAttribute('for', `color-${color.id}`);
    label.style.backgroundColor = color.hex;
    
    const srOnly = document.createElement('span');
    srOnly.className = 'sr-only';
    srOnly.textContent = color.name;
    label.appendChild(srOnly);
    
    colorItem.appendChild(input);
    colorItem.appendChild(label);
    container.appendChild(colorItem);
    
    // 이벤트 리스너
    input.addEventListener('change', handleColorChange);
  });
  
  console.log('색상 선택기 렌더링 완료');
}

/**
 * 요금제 선택기 렌더링
 */
function renderPlanOptions() {
  const planList = document.getElementById('planList');
  planList.innerHTML = '';
  
  productsData.plans.forEach(plan => {
    const planItem = document.createElement('div');
    planItem.className = 'plan-item';
    planItem.setAttribute('data-plan-id', plan.id);
    
    const planName = document.createElement('div');
    planName.className = 'plan-name';
    planName.textContent = plan.name;
    
    const planPrice = document.createElement('div');
    planPrice.className = 'plan-price';
    planPrice.textContent = `${plan.price.toLocaleString()}원/월`;
    
    const planData = document.createElement('div');
    planData.className = 'plan-data';
    planData.textContent = plan.data;
    
    planItem.appendChild(planName);
    planItem.appendChild(planPrice);
    planItem.appendChild(planData);
    planList.appendChild(planItem);
    
    // 이벤트 리스너
    planItem.addEventListener('click', () => handlePlanChange(plan.id));
  });
  
  console.log('요금제 선택기 렌더링 완료');
}

// ============================================
// 이벤트 핸들러
// ============================================

/**
 * 이벤트 리스너 등록
 */
function registerEventListeners() {
  // 가입유형 버튼
  document.querySelectorAll('#subscriptionTypeGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', handleSubscriptionTypeChange);
  });
  
  // 요금제 선택 버튼 (펼치기/접기)
  document.getElementById('planSelectBtn').addEventListener('click', togglePlanList);
  
  // 할인유형 버튼
  document.querySelectorAll('#discountTypeGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', handleDiscountTypeChange);
  });
  
  // 할부개월 버튼
  document.querySelectorAll('#installmentGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', handleInstallmentChange);
  });
  
  // 신청하기 버튼
  document.getElementById('applyBtn').addEventListener('click', handleApplyClick);
  
  // 탭 버튼
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', handleTabChange);
  });
  
  // FAQ 아코디언
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', handleFAQToggle);
  });
  
  console.log('이벤트 리스너 등록 완료');
}

/**
 * 색상 변경 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleColorChange(event) {
  const colorId = event.target.value;
  currentSelections.colorId = colorId;
  
  // 색상명 업데이트
  const selectedColor = currentDevice.colors.find(c => c.id === colorId);
  if (selectedColor) {
    document.getElementById('selectedColorName').textContent = selectedColor.name;
  }
  
  // 이미지 슬라이더 업데이트
  updateImageSlider(colorId);
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 용량 변경 핸들러
 * @param {Event} event - 이벤트 객체
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
  
  if (!currentDevice) {
    console.error('선택한 용량의 기기를 찾을 수 없습니다:', storage);
    return;
  }
  
  console.log(`용량 변경: ${storage}GB, 새 기기:`, currentDevice);
  
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
 * 이미지 슬라이더 업데이트 (색상별 필터링)
 * @param {string} colorId - 색상 ID
 */
function updateImageSlider(colorId) {
  // 모든 슬라이드 숨기기
  const allSlides = document.querySelectorAll('.swiper-slide');
  allSlides.forEach(slide => {
    if (slide.getAttribute('data-color-id') === colorId) {
      slide.style.display = 'flex';
    } else {
      slide.style.display = 'none';
    }
  });
  
  // Swiper 업데이트
  if (productSwiper) {
    productSwiper.update();
    productSwiper.slideTo(0); // 첫 번째 슬라이드로 이동
  }
}

/**
 * 가입유형 변경 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleSubscriptionTypeChange(event) {
  const value = event.target.getAttribute('data-value');
  currentSelections.subscriptionType = value;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#subscriptionTypeGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 요금제 목록 펼치기/접기
 */
function togglePlanList() {
  const planList = document.getElementById('planList');
  const btn = document.getElementById('planSelectBtn');
  
  if (planList.style.display === 'none' || planList.style.display === '') {
    planList.style.display = 'block';
    btn.classList.add('active');
  } else {
    planList.style.display = 'none';
    btn.classList.remove('active');
  }
}

/**
 * 요금제 변경 핸들러
 * @param {string} planId - 요금제 ID
 */
function handlePlanChange(planId) {
  currentSelections.planId = planId;
  
  // 선택된 요금제 정보 가져오기
  const selectedPlan = productsData.plans.find(p => p.id === planId);
  if (!selectedPlan) return;
  
  // 버튼 텍스트 업데이트
  document.getElementById('selectedPlanText').textContent = 
    `${selectedPlan.name} (${selectedPlan.price.toLocaleString()}원)`;
  
  // 목록에서 선택 표시
  document.querySelectorAll('.plan-item').forEach(item => {
    item.classList.remove('selected');
  });
  document.querySelector(`[data-plan-id="${planId}"]`).classList.add('selected');
  
  // 목록 접기
  document.getElementById('planList').style.display = 'none';
  document.getElementById('planSelectBtn').classList.remove('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 할인유형 변경 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleDiscountTypeChange(event) {
  const value = event.target.getAttribute('data-value');
  currentSelections.discountType = value;
  
  // 버튼 active 상태 변경
  document.querySelectorAll('#discountTypeGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 가격 재계산
  calculateAndUpdatePrice();
}

/**
 * 할부개월 변경 핸들러
 * @param {Event} event - 이벤트 객체
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

/**
 * 신청하기 버튼 클릭 핸들러
 */
function handleApplyClick() {
  // TODO: 상담 신청 폼 팝업 또는 페이지 이동
  alert('상담 신청 기능은 추후 구현됩니다.');
  console.log('현재 선택 상태:', currentSelections);
}

/**
 * 탭 변경 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleTabChange(event) {
  const tabName = event.target.getAttribute('data-tab');
  
  // 탭 버튼 active 상태 변경
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 탭 패널 표시/숨김
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

/**
 * FAQ 아코디언 토글 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleFAQToggle(event) {
  const faqItem = event.currentTarget.closest('.faq-item');
  const answer = faqItem.querySelector('.faq-answer');
  
  // 현재 항목이 열려있는지 확인
  const isActive = faqItem.classList.contains('active');
  
  // 모든 FAQ 항목 닫기
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
    item.querySelector('.faq-answer').style.display = 'none';
  });
  
  // 클릭한 항목만 열기/닫기
  if (!isActive) {
    faqItem.classList.add('active');
    answer.style.display = 'block';
  }
}

// ============================================
// 가격 계산
// ============================================

/**
 * 가격 계산 및 UI 업데이트
 */
async function calculateAndUpdatePrice() {
  try {
    // 1. 선택값 검증
    if (!currentSelections.planId) {
      console.log('요금제가 선택되지 않았습니다.');
      return;
    }
    
    // 2. 지원금 조회
    const subsidy = findSubsidy();
    if (!subsidy) {
      console.warn('지원금 정보를 찾을 수 없습니다.');
      // 기본값으로 계산
    }
    
    // 3. 요금제 정보
    const plan = productsData.plans.find(p => p.id === currentSelections.planId);
    if (!plan) {
      console.error('요금제를 찾을 수 없습니다.');
      return;
    }
    
    // 4. 가격 계산
    const calculator = new PriceCalculator(productsData.settings);
    const priceResult = calculator.calculate({
      devicePrice: currentDevice.price,
      subsidy: subsidy,
      planPrice: plan.price,
      installmentMonths: currentSelections.installmentMonths,
      discountType: currentSelections.discountType
    });
    
    console.log('계산 결과:', priceResult);
    
    // 5. UI 업데이트
    updatePriceDisplay(priceResult);
    updateCTABar(priceResult);
    
  } catch (error) {
    console.error('가격 계산 오류:', error);
  }
}

/**
 * 지원금 조회
 * @returns {Object|null} 지원금 정보
 */
function findSubsidy() {
  const subsidyType = currentSelections.subscriptionType;
  const subsidies = productsData.subsidies[subsidyType];
  
  if (!subsidies) return null;
  
  // 조합ID로 검색: deviceId_planId_subscriptionType
  const combinationId = `${currentDevice.id}_${currentSelections.planId}_${subsidyType}`;
  
  const subsidy = subsidies.find(s => s.id === combinationId);
  
  if (!subsidy) {
    console.warn(`지원금을 찾을 수 없습니다: ${combinationId}`);
  }
  
  return subsidy;
}

/**
 * 가격 표시 업데이트 (옵션 영역)
 * @param {Object} priceResult - 계산된 가격 결과
 */
function updatePriceDisplay(priceResult) {
  // 월 할부금
  document.getElementById('monthlyInstallment').textContent = 
    `${priceResult.monthlyInstallment.toLocaleString()}원`;
  
  // 월 할부금 상세 (할부원금 ÷ 개월수)
  const installmentDetail = `${priceResult.principal.toLocaleString()}원 ÷ ${currentSelections.installmentMonths}개월`;
  document.getElementById('installmentDetail').textContent = installmentDetail;
  
  // 월 통신요금
  document.getElementById('monthlyPlan').textContent = 
    `${priceResult.monthlyPlanFee.toLocaleString()}원`;
  
  // 월 통신요금 상세 (요금제명)
  const plan = productsData.plans.find(p => p.id === currentSelections.planId);
  const planDetail = plan ? `${plan.name} 요금제` : '-';
  document.getElementById('planDetail').textContent = planDetail;
  
  // 총 월 납부액
  document.getElementById('totalMonthly').textContent = 
    `${priceResult.totalMonthly.toLocaleString()}원`;
}

/**
 * CTA Bar 가격 업데이트
 * @param {Object} priceResult - 계산된 가격 결과
 */
function updateCTABar(priceResult) {
  // 월 휴대폰요금 (할부금)
  document.getElementById('ctaInstallment').innerHTML = 
    `${priceResult.monthlyInstallment.toLocaleString()}<span>원</span>`;
  
  // 월 통신요금
  document.getElementById('ctaPlanFee').innerHTML = 
    `${priceResult.monthlyPlanFee.toLocaleString()}<span>원</span>`;
  
  // 월 예상 납부금액 (총액)
  document.getElementById('ctaTotalPrice').innerHTML = 
    `${priceResult.totalMonthly.toLocaleString()}<span>원</span>`;
}

// ============================================
// UI 업데이트 헬퍼
// ============================================

/**
 * 가입유형 UI 업데이트 (초기화 시)
 */
function updateSubscriptionTypeUI() {
  document.querySelectorAll('#subscriptionTypeGroup .option-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-value') === currentSelections.subscriptionType) {
      btn.classList.add('active');
    }
  });
}

/**
 * 요금제 UI 업데이트 (초기화 시)
 */
function updatePlanUI() {
  if (!currentSelections.planId) return;
  
  const selectedPlan = productsData.plans.find(p => p.id === currentSelections.planId);
  if (!selectedPlan) return;
  
  document.getElementById('selectedPlanText').textContent = 
    `${selectedPlan.name} (${selectedPlan.price.toLocaleString()}원)`;
  
  // 목록에서 선택 표시
  const planItem = document.querySelector(`[data-plan-id="${currentSelections.planId}"]`);
  if (planItem) {
    planItem.classList.add('selected');
  }
}

/**
 * 할부개월 UI 업데이트 (초기화 시)
 */
function updateInstallmentUI() {
  document.querySelectorAll('#installmentGroup .option-btn').forEach(btn => {
    const months = parseInt(btn.getAttribute('data-months'));
    if (months === currentSelections.installmentMonths) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ============================================
// 유틸리티
// ============================================

/**
 * 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showError(message) {
  alert(message);
  console.error(message);
}

// ============================================
// 페이지 로드 시 실행
// ============================================

document.addEventListener('DOMContentLoaded', initDeviceDetailPage);
