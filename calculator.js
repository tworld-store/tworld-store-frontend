/**
 * 가격 계산기 로직
 */

// 상태 관리
const state = {
  devices: [],
  plans: [],
  settings: {},
  selected: {
    device: null,        // 선택된 기기 그룹 (id)
    colorOption: null,   // 선택된 색상옵션 (전체 객체)
    plan: null,          // 선택된 요금제 (전체 객체)
    joinType: null       // 선택된 가입유형
  }
};

/**
 * 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 데이터 로드
    await loadData();
    
    // 기기 목록 렌더링
    renderDevices();
    
  } catch (error) {
    console.error('초기화 실패:', error);
    showError('devices-loading', '데이터를 불러오는데 실패했습니다.');
  }
});

/**
 * 데이터 로드
 */
async function loadData() {
  const data = await api.load();
  state.devices = data.devices || [];
  state.plans = data.plans || [];
  state.settings = data.settings || {};
  
  console.log('✅ 데이터 로드 완료', {
    devices: state.devices.length,
    plans: state.plans.length
  });
}

/**
 * 기기 목록 렌더링
 */
function renderDevices() {
  const loading = document.getElementById('devices-loading');
  const grid = document.getElementById('devices-grid');
  
  loading.classList.add('hidden');
  grid.classList.remove('hidden');
  
  // 기기 그룹별로 묶기 (같은 id끼리)
  const deviceGroups = {};
  state.devices.forEach(device => {
    if (!deviceGroups[device.id]) {
      deviceGroups[device.id] = [];
    }
    deviceGroups[device.id].push(device);
  });
  
  // 렌더링
  grid.innerHTML = Object.entries(deviceGroups).map(([id, devices]) => {
    const firstDevice = devices[0];
    return `
      <div class="device-card border-2 rounded-lg p-4 cursor-pointer hover:border-blue-600 transition"
           onclick="selectDevice('${id}')">
        <div class="text-center">
          <div class="text-4xl mb-2">📱</div>
          <h3 class="font-bold text-lg">${firstDevice.brand}</h3>
          <p class="text-gray-600">${firstDevice.model}</p>
          <p class="text-sm text-gray-500 mt-2">${firstDevice.storage}GB</p>
          <p class="text-blue-600 font-bold mt-2">${formatPrice(firstDevice.price)}</p>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 기기 선택
 */
function selectDevice(deviceId) {
  state.selected.device = deviceId;
  state.selected.colorOption = null;
  state.selected.plan = null;
  state.selected.joinType = null;
  
  // UI 업데이트
  updateDeviceSelection();
  showColorOptions(deviceId);
  resetSteps(2);
  
  console.log('기기 선택:', deviceId);
}

/**
 * 기기 선택 UI 업데이트
 */
function updateDeviceSelection() {
  // 모든 기기 카드 선택 해제
  document.querySelectorAll('.device-card').forEach(card => {
    card.classList.remove('border-blue-600', 'bg-blue-50');
  });
  
  // 선택된 기기 강조
  const selectedCard = event?.currentTarget;
  if (selectedCard) {
    selectedCard.classList.add('border-blue-600', 'bg-blue-50');
  }
}

/**
 * 색상 옵션 표시
 */
function showColorOptions(deviceId) {
  const selectedDeviceSection = document.getElementById('selected-device');
  const colorOptionsDiv = document.getElementById('color-options');
  
  selectedDeviceSection.classList.remove('hidden');
  
  // 해당 기기의 모든 색상 옵션 찾기
  const deviceOptions = state.devices.filter(d => d.id === deviceId);
  
  if (deviceOptions.length === 0) return;
  
  // 기기 정보 표시
  const firstDevice = deviceOptions[0];
  document.getElementById('selected-device-info').innerHTML = `
    <div class="flex items-center">
      <div class="text-3xl mr-4">📱</div>
      <div>
        <h4 class="font-bold text-lg">${firstDevice.brand} ${firstDevice.model}</h4>
        <p class="text-gray-600">${firstDevice.storage}GB</p>
      </div>
    </div>
  `;
  
  // 색상 옵션 표시
  colorOptionsDiv.innerHTML = `
    <h4 class="font-semibold mb-2">색상 선택</h4>
    <div class="flex gap-3 flex-wrap">
      ${deviceOptions.map(device => `
        <button class="color-option px-4 py-2 border-2 rounded-lg hover:border-blue-600 transition"
                onclick="selectColorOption('${device.colorOptionId}')"
                style="border-color: ${device.color?.hex || '#ccc'}">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full" 
                 style="background-color: ${device.color?.hex || '#ccc'}"></div>
            <span class="font-medium">${device.color?.name || '기본'}</span>
          </div>
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * 색상 옵션 선택
 */
function selectColorOption(colorOptionId) {
  const device = state.devices.find(d => d.colorOptionId === colorOptionId);
  if (!device) return;
  
  state.selected.colorOption = device;
  
  // UI 업데이트
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.classList.remove('border-blue-600', 'bg-blue-50');
  });
  event.currentTarget.classList.add('border-blue-600', 'bg-blue-50');
  
  // Step 2 활성화
  enableStep(2);
  renderPlans();
  
  console.log('색상 선택:', device.color?.name);
}

/**
 * 요금제 목록 렌더링
 */
function renderPlans() {
  const disabledDiv = document.getElementById('plans-disabled');
  const grid = document.getElementById('plans-grid');
  
  disabledDiv.classList.add('hidden');
  grid.classList.remove('hidden');
  
  grid.innerHTML = state.plans.map(plan => `
    <div class="plan-card border-2 rounded-lg p-4 cursor-pointer hover:border-blue-600 transition"
         onclick="selectPlan('${plan.id}')">
      <div class="flex items-center justify-between mb-2">
        <span class="text-2xl">${plan.category?.icon || '📱'}</span>
        <span class="text-xs px-2 py-1 rounded" style="background-color: ${plan.color}20; color: ${plan.color}">
          ${plan.category?.name || '일반'}
        </span>
      </div>
      <h3 class="font-bold text-lg mb-1">${plan.name}</h3>
      <p class="text-sm text-gray-600 mb-3">${plan.description || ''}</p>
      <div class="text-blue-600 font-bold text-xl mb-3">${formatPrice(plan.price)}/월</div>
      <div class="text-sm text-gray-600 space-y-1">
        <div>📊 데이터: ${plan.data}</div>
        <div>📞 음성: ${plan.voice}</div>
        ${plan.benefits && plan.benefits.length > 0 ? 
          `<div class="mt-2 pt-2 border-t">
            ${plan.benefits.slice(0, 2).map(b => `<div class="text-xs">✓ ${b}</div>`).join('')}
          </div>` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * 요금제 선택
 */
function selectPlan(planId) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  
  state.selected.plan = plan;
  state.selected.joinType = null;
  
  // UI 업데이트
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('border-blue-600', 'bg-blue-50');
  });
  event.currentTarget.classList.add('border-blue-600', 'bg-blue-50');
  
  // Step 3 활성화
  enableStep(3);
  
  console.log('요금제 선택:', plan.name);
}

/**
 * 가입유형 선택
 */
document.querySelectorAll('.jointype-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const joinType = this.dataset.type;
    selectJoinType(joinType);
  });
});

function selectJoinType(joinType) {
  state.selected.joinType = joinType;
  
  // UI 업데이트
  document.querySelectorAll('.jointype-btn').forEach(btn => {
    btn.classList.remove('border-blue-600', 'bg-blue-50');
  });
  event.currentTarget.classList.add('border-blue-600', 'bg-blue-50');
  
  // 가격 계산
  calculatePrice();
  
  console.log('가입유형 선택:', joinType);
}

/**
 * 가격 계산
 */
async function calculatePrice() {
  const { colorOption, plan, joinType } = state.selected;
  
  if (!colorOption || !plan || !joinType) return;
  
  try {
    // 지원금 찾기
    const subsidy = await api.findSubsidy(colorOption.id, plan.id, joinType);
    
    const devicePrice = colorOption.price;
    const subsidyAmount = subsidy ? subsidy.totalSubsidy : 0;
    const finalPrice = devicePrice - subsidyAmount;
    
    // 결과 표시
    displayResult(devicePrice, subsidyAmount, finalPrice, plan.price);
    
  } catch (error) {
    console.error('가격 계산 실패:', error);
    alert('가격 계산에 실패했습니다.');
  }
}

/**
 * 결과 표시
 */
function displayResult(devicePrice, subsidyAmount, finalPrice, planPrice) {
  const resultDiv = document.getElementById('price-result');
  resultDiv.classList.remove('hidden');
  
  // 가격 표시
  document.getElementById('device-price').textContent = formatPrice(devicePrice);
  document.getElementById('subsidy-amount').textContent = '-' + formatPrice(subsidyAmount);
  document.getElementById('final-price').textContent = formatPrice(finalPrice);
  document.getElementById('plan-price').textContent = formatPrice(planPrice);
  
  // 할부 옵션
  const installmentDiv = document.getElementById('installment-options');
  const months = [0, 12, 24, 36];
  const interestRate = parseFloat(state.settings?.이자율 || 0.059);
  
  installmentDiv.innerHTML = months.map(month => {
    const monthlyPayment = calculateInstallment(finalPrice, month, interestRate);
    return `
      <div class="text-center p-3 bg-white/10 rounded">
        <div class="text-sm mb-1">${month === 0 ? '일시불' : month + '개월'}</div>
        <div class="font-bold text-lg">${formatPrice(monthlyPayment)}</div>
        ${month > 0 ? `<div class="text-xs opacity-75">/ 월</div>` : ''}
      </div>
    `;
  }).join('');
  
  // 스크롤
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Step 활성화
 */
function enableStep(stepNumber) {
  const badge = document.getElementById(`step${stepNumber}-badge`);
  if (badge) {
    badge.classList.remove('bg-gray-300');
    badge.classList.add('bg-blue-600');
  }
  
  if (stepNumber === 2) {
    const grid = document.getElementById('plans-grid');
    const disabled = document.getElementById('plans-disabled');
    grid.classList.remove('hidden');
    disabled.classList.add('hidden');
  }
  
  if (stepNumber === 3) {
    const grid = document.getElementById('jointypes-grid');
    const disabled = document.getElementById('jointypes-disabled');
    grid.classList.remove('hidden');
    disabled.classList.add('hidden');
  }
}

/**
 * Step 초기화
 */
function resetSteps(fromStep) {
  for (let i = fromStep; i <= 3; i++) {
    const badge = document.getElementById(`step${i}-badge`);
    if (badge) {
      badge.classList.remove('bg-blue-600');
      badge.classList.add('bg-gray-300');
    }
  }
  
  if (fromStep <= 2) {
    document.getElementById('plans-grid').classList.add('hidden');
    document.getElementById('plans-disabled').classList.remove('hidden');
  }
  
  if (fromStep <= 3) {
    document.getElementById('jointypes-grid').classList.add('hidden');
    document.getElementById('jointypes-disabled').classList.remove('hidden');
  }
  
  document.getElementById('price-result').classList.add('hidden');
}

/**
 * 상담 신청 페이지로 이동
 */
function goToConsult() {
  // 선택 정보를 세션 스토리지에 저장
  const consultData = {
    device: state.selected.colorOption,
    plan: state.selected.plan,
    joinType: state.selected.joinType
  };
  
  sessionStorage.setItem('consultData', JSON.stringify(consultData));
  
  // 상담 페이지로 이동 (나중에 만들 예정)
  alert('상담 신청 페이지는 곧 준비됩니다!');
  // window.location.href = 'contact.html';
}
