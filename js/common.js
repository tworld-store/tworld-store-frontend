/**
 * 공통 유틸리티 함수
 */

/**
 * 가격 포맷팅 (예: 1000000 → "1,000,000원")
 */
function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) {
    return '0원';
  }
  return price.toLocaleString('ko-KR') + '원';
}

/**
 * 숫자만 추출 (예: "1,000,000원" → 1000000)
 */
function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
}

/**
 * 할부 계산
 */
function calculateInstallment(totalPrice, months, interestRate = 0.059) {
  if (months === 0) {
    return totalPrice; // 일시불
  }
  
  // 월 이자율
  const monthlyRate = interestRate / 12;
  
  // 원리금균등상환 공식
  const monthlyPayment = totalPrice * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.round(monthlyPayment);
}

/**
 * 로딩 표시
 */
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">로딩 중...</span>
      </div>
    `;
  }
}

/**
 * 에러 메시지 표시
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p class="font-semibold">오류 발생</p>
        <p class="text-sm mt-1">${message}</p>
      </div>
    `;
  }
}

/**
 * 기기 이미지 URL 생성
 */
function getDeviceImageUrl(device, settings) {
  if (device.image) {
    return device.image;
  }
  
  // 기본 이미지 URL 생성
  const baseUrl = settings?.이미지CDN || 'https://images.tworld-store.com';
  const brand = device.brand || '기타';
  const model = device.model || 'default';
  const color = device.color?.name || 'default';
  
  return `${baseUrl}/devices/${brand}/${model}/${color}.webp`;
}

/**
 * 색상 HEX → RGB 변환
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 디바운스 (연속 입력 방지)
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 전화번호 포맷팅 (예: 01012345678 → 010-1234-5678)
 */
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * 스크롤 최상단 이동
 */
function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

/**
 * 요소로 스크롤
 */
function scrollToElement(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.offsetTop - offset;
    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }
}

/**
 * 로컬 스토리지 안전하게 저장
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('저장 실패:', error);
    return false;
  }
}

/**
 * 로컬 스토리지에서 가져오기
 */
function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('불러오기 실패:', error);
    return defaultValue;
  }
}
