/**
 * 유틸리티 함수 모음 - utils.js
 * 
 * 프로젝트 전반에서 사용되는 공통 유틸리티 함수들
 */

// ============================================
// 숫자 포맷팅
// ============================================

/**
 * 숫자를 천 단위 구분 기호와 함께 포맷팅
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} 포맷팅된 문자열
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('ko-KR');
}

/**
 * 숫자를 원화 형식으로 포맷팅
 * @param {number} num - 포맷팅할 숫자
 * @param {boolean} includeUnit - "원" 단위 포함 여부
 * @returns {string} 포맷팅된 문자열
 * @example
 * formatCurrency(1234567) // "1,234,567원"
 * formatCurrency(1234567, false) // "1,234,567"
 */
function formatCurrency(num, includeUnit = true) {
  const formatted = formatNumber(num);
  return includeUnit ? `${formatted}원` : formatted;
}

/**
 * 문자열에서 숫자만 추출
 * @param {string} str - 문자열
 * @returns {number} 추출된 숫자
 * @example
 * extractNumber("1,234,567원") // 1234567
 */
function extractNumber(str) {
  if (typeof str !== 'string') {
    return 0;
  }
  const cleaned = str.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

/**
 * 반올림 (지정된 단위로)
 * @param {number} num - 반올림할 숫자
 * @param {number} unit - 반올림 단위 (기본: 1)
 * @returns {number} 반올림된 숫자
 * @example
 * roundToUnit(1234, 10) // 1230
 * roundToUnit(1235, 10) // 1240
 */
function roundToUnit(num, unit = 1) {
  return Math.round(num / unit) * unit;
}

// ============================================
// 날짜 처리
// ============================================

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @param {Date|string|number} date - 날짜 객체, ISO 문자열, 또는 timestamp
 * @returns {string} 포맷팅된 날짜 문자열
 * @example
 * formatDate(new Date()) // "2025-11-03"
 */
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 날짜를 YYYY-MM-DD HH:mm:ss 형식으로 포맷팅
 * @param {Date|string|number} date - 날짜 객체, ISO 문자열, 또는 timestamp
 * @returns {string} 포맷팅된 날짜시간 문자열
 * @example
 * formatDateTime(new Date()) // "2025-11-03 15:30:45"
 */
function formatDateTime(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 현재 시간 반환 (ISO 8601 형식)
 * @returns {string} ISO 8601 형식 문자열
 * @example
 * getCurrentTimestamp() // "2025-11-03T15:30:45.123Z"
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// ============================================
// 로컬 스토리지
// ============================================

/**
 * 로컬 스토리지에 데이터 저장
 * @param {string} key - 저장 키
 * @param {*} value - 저장할 값 (객체는 자동으로 JSON 변환)
 * @returns {boolean} 성공 여부
 */
function saveToStorage(key, value) {
  try {
    const data = typeof value === 'object' 
      ? JSON.stringify(value) 
      : String(value);
    localStorage.setItem(key, data);
    return true;
  } catch (error) {
    errorLog('로컬 스토리지 저장 실패:', error);
    return false;
  }
}

/**
 * 로컬 스토리지에서 데이터 불러오기
 * @param {string} key - 불러올 키
 * @param {*} defaultValue - 기본값 (데이터가 없을 때)
 * @returns {*} 불러온 데이터 또는 기본값
 */
function loadFromStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    if (data === null) {
      return defaultValue;
    }
    
    // JSON 파싱 시도
    try {
      return JSON.parse(data);
    } catch {
      // JSON이 아니면 원본 문자열 반환
      return data;
    }
  } catch (error) {
    errorLog('로컬 스토리지 로드 실패:', error);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에서 데이터 삭제
 * @param {string} key - 삭제할 키
 * @returns {boolean} 성공 여부
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    errorLog('로컬 스토리지 삭제 실패:', error);
    return false;
  }
}

/**
 * 로컬 스토리지 전체 초기화
 * @returns {boolean} 성공 여부
 */
function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    errorLog('로컬 스토리지 초기화 실패:', error);
    return false;
  }
}

// ============================================
// URL 파라미터
// ============================================

/**
 * URL 쿼리 파라미터 가져오기
 * @param {string} key - 파라미터 키
 * @returns {string|null} 파라미터 값
 * @example
 * // URL: ?id=abc123&name=test
 * getQueryParam('id') // "abc123"
 */
function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

/**
 * URL 쿼리 파라미터 전체 가져오기
 * @returns {Object} 파라미터 객체
 * @example
 * // URL: ?id=abc123&name=test
 * getAllQueryParams() // { id: "abc123", name: "test" }
 */
function getAllQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
}

/**
 * URL 쿼리 파라미터 추가/변경
 * @param {string} key - 파라미터 키
 * @param {string} value - 파라미터 값
 * @param {boolean} reload - 페이지 리로드 여부
 */
function setQueryParam(key, value, reload = false) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  
  if (reload) {
    window.location.href = url.toString();
  } else {
    window.history.pushState({}, '', url.toString());
  }
}

// ============================================
// DOM 조작
// ============================================

/**
 * 요소 표시
 * @param {HTMLElement|string} element - 요소 또는 선택자
 */
function showElement(element) {
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
  if (el) {
    el.style.display = 'block';
  }
}

/**
 * 요소 숨기기
 * @param {HTMLElement|string} element - 요소 또는 선택자
 */
function hideElement(element) {
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
  if (el) {
    el.style.display = 'none';
  }
}

/**
 * 요소 토글 (표시/숨김)
 * @param {HTMLElement|string} element - 요소 또는 선택자
 */
function toggleElement(element) {
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

/**
 * 클래스 토글
 * @param {HTMLElement|string} element - 요소 또는 선택자
 * @param {string} className - 클래스명
 */
function toggleClass(element, className) {
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
  if (el) {
    el.classList.toggle(className);
  }
}

// ============================================
// 스크롤
// ============================================

/**
 * 부드러운 스크롤
 * @param {HTMLElement|string} target - 대상 요소 또는 선택자
 * @param {number} offset - 오프셋 (px)
 */
function smoothScrollTo(target, offset = 0) {
  const element = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
  
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * 페이지 최상단으로 스크롤
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * 현재 스크롤 위치 반환
 * @returns {number} 스크롤 위치 (px)
 */
function getScrollPosition() {
  return window.pageYOffset || document.documentElement.scrollTop;
}

// ============================================
// 디바이스 감지
// ============================================

/**
 * 모바일 디바이스 여부 확인
 * @returns {boolean} 모바일 여부
 */
function isMobile() {
  return window.innerWidth <= UI_CONFIG.MOBILE_BREAKPOINT;
}

/**
 * 태블릿 디바이스 여부 확인
 * @returns {boolean} 태블릿 여부
 */
function isTablet() {
  return window.innerWidth > UI_CONFIG.MOBILE_BREAKPOINT && 
         window.innerWidth <= UI_CONFIG.TABLET_BREAKPOINT;
}

/**
 * 데스크톱 디바이스 여부 확인
 * @returns {boolean} 데스크톱 여부
 */
function isDesktop() {
  return window.innerWidth > UI_CONFIG.TABLET_BREAKPOINT;
}

/**
 * 터치 디바이스 여부 확인
 * @returns {boolean} 터치 지원 여부
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ============================================
// 검증
// ============================================

/**
 * 이메일 형식 검증
 * @param {string} email - 이메일 주소
 * @returns {boolean} 유효 여부
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * 전화번호 형식 검증 (한국)
 * @param {string} phone - 전화번호
 * @returns {boolean} 유효 여부
 */
function isValidPhone(phone) {
  // 숫자만 추출
  const cleaned = phone.replace(/[^0-9]/g, '');
  // 10자리 또는 11자리
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * 빈 문자열 또는 null/undefined 체크
 * @param {*} value - 체크할 값
 * @returns {boolean} 비어있는지 여부
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
}

// ============================================
// 딜레이/타이머
// ============================================

/**
 * 지연 실행 (Promise 기반)
 * @param {number} ms - 밀리초
 * @returns {Promise<void>}
 * @example
 * await delay(1000); // 1초 대기
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} Debounced 함수
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
 * Throttle 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (밀리초)
 * @returns {Function} Throttled 함수
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

// ============================================
// 복사
// ============================================

/**
 * 클립보드에 텍스트 복사
 * @param {string} text - 복사할 텍스트
 * @returns {Promise<boolean>} 성공 여부
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    errorLog('클립보드 복사 실패:', error);
    return false;
  }
}

// ============================================
// 랜덤
// ============================================

/**
 * 랜덤 정수 생성
 * @param {number} min - 최소값 (포함)
 * @param {number} max - 최대값 (포함)
 * @returns {number} 랜덤 정수
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 랜덤 문자열 생성
 * @param {number} length - 문자열 길이
 * @returns {string} 랜덤 문자열
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================
// 객체 처리
// ============================================

/**
 * 깊은 복사 (Deep Clone)
 * @param {*} obj - 복사할 객체
 * @returns {*} 복사된 객체
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 객체 병합 (Deep Merge)
 * @param {Object} target - 대상 객체
 * @param {Object} source - 소스 객체
 * @returns {Object} 병합된 객체
 */
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * 객체 여부 확인
 * @param {*} item - 체크할 항목
 * @returns {boolean} 객체 여부
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// ============================================
// 전역 Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatNumber,
    formatCurrency,
    extractNumber,
    roundToUnit,
    formatDate,
    formatDateTime,
    getCurrentTimestamp,
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    clearStorage,
    getQueryParam,
    getAllQueryParams,
    setQueryParam,
    showElement,
    hideElement,
    toggleElement,
    toggleClass,
    smoothScrollTo,
    scrollToTop,
    getScrollPosition,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isValidEmail,
    isValidPhone,
    isEmpty,
    delay,
    debounce,
    throttle,
    copyToClipboard,
    getRandomInt,
    generateRandomString,
    deepClone,
    deepMerge,
    isObject
  };
}

// ============================================
// 초기화 로그
// ============================================

debugLog('Utils 로드 완료');
