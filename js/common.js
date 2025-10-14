/**
 * 공통 유틸리티 함수
 */

/**
 * 가격 포맷팅
 */
function formatPrice(price) {
  if (!price && price !== 0) return '0원';
  return Math.round(price).toLocaleString('ko-KR') + '원';
}

/**
 * 숫자만 추출
 */
function extractNumbers(str) {
  return str.replace(/[^0-9]/g, '');
}

/**
 * 전화번호 포맷팅
 */
function formatPhoneNumber(phone) {
  const numbers = extractNumbers(phone);
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return numbers;
}

/**
 * 날짜 포맷팅
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시간 포맷팅
 */
function formatTime(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 날짜+시간 포맷팅
 */
function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * 할부 계산 (원리금균등상환)
 */
function calculateInstallment(principal, months, annualRate = 5.9) {
  if (months === 0) return principal;
  
  const monthlyRate = annualRate / 100 / 12;
  const monthly = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
    (Math.pow(1 + monthlyRate, months) - 1);
  
  // 100원 단위 반올림
  return Math.round(monthly / 100) * 100;
}

/**
 * 색상 HEX 유효성 검사
 */
function isValidHex(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * 색상 밝기 계산 (어두운 배경에는 흰 글씨)
 */
function getTextColorForBackground(hexColor) {
  // HEX를 RGB로 변환
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 밝기 계산 (YIQ)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

/**
 * 디바운스 (검색 등에 사용)
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
 * 스로틀 (스크롤 이벤트 등에 사용)
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 로컬 스토리지 헬퍼
 */
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },
  
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  }
};

/**
 * 세션 스토리지 헬퍼
 */
const SessionStorage = {
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('SessionStorage set error:', e);
      return false;
    }
  },
  
  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('SessionStorage get error:', e);
      return null;
    }
  },
  
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('SessionStorage remove error:', e);
      return false;
    }
  },
  
  clear() {
    try {
      sessionStorage.clear();
      return true;
    } catch (e) {
      console.error('SessionStorage clear error:', e);
      return false;
    }
  }
};

/**
 * 쿼리 파라미터 파싱
 */
function getQueryParams() {
  const params = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
}

/**
 * 쿼리 파라미터 설정
 */
function setQueryParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
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
 * 특정 요소로 스크롤
 */
function scrollToElement(selector, offset = 0) {
  const element = document.querySelector(selector);
  if (element) {
    const top = element.offsetTop - offset;
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
}

/**
 * 모바일 여부 확인
 */
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 복사하기
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('복사 실패:', err);
    return false;
  }
}

// 전역으로 노출
window.formatPrice = formatPrice;
window.formatPhoneNumber = formatPhoneNumber;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatDateTime = formatDateTime;
window.calculateInstallment = calculateInstallment;
window.Storage = Storage;
window.SessionStorage = SessionStorage;
window.getQueryParams = getQueryParams;
window.scrollToTop = scrollToTop;
window.scrollToElement = scrollToElement;
window.isMobile = isMobile;
window.copyToClipboard = copyToClipboard;
