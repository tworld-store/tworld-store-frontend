/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 공통 유틸리티
 * ═══════════════════════════════════════════════════
 * 
 * 용도: 전역에서 사용되는 헬퍼 함수들
 * 특징: 순수 JavaScript, 프레임워크 독립적
 */

// ═══════════════════════════════════════════════════
// 포맷팅 유틸리티
// ═══════════════════════════════════════════════════

/**
 * 가격 포맷팅
 * @param {number} price - 가격
 * @returns {string} - "1,234,567원"
 */
function formatPrice(price) {
    if (price === null || price === undefined) {
        return '0원';
    }
    
    // 숫자로 변환
    const num = Number(price);
    
    if (isNaN(num)) {
        console.warn(`유효하지 않은 가격: ${price}`);
        return '0원';
    }
    
    return num.toLocaleString('ko-KR') + '원';
}

/**
 * 날짜 포맷팅
 * @param {string|Date} date - 날짜
 * @param {string} format - 포맷 ('date' | 'datetime' | 'time')
 * @returns {string}
 */
function formatDate(date, format = 'date') {
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) {
        console.warn(`유효하지 않은 날짜: ${date}`);
        return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    switch (format) {
        case 'date':
            return `${year}-${month}-${day}`;
        case 'datetime':
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        case 'time':
            return `${hours}:${minutes}:${seconds}`;
        case 'korean':
            return `${year}년 ${month}월 ${day}일`;
        case 'korean-full':
            return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
        default:
            return `${year}-${month}-${day}`;
    }
}

/**
 * 전화번호 포맷팅
 * @param {string} phone - 전화번호
 * @returns {string} - "010-1234-5678"
 */
function formatPhone(phone) {
    if (!phone) return '';
    
    // 숫자만 추출
    const numbers = phone.replace(/[^\d]/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length === 11) {
        return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 10) {
        return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 9) {
        return numbers.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    return numbers;
}

/**
 * 바이트 크기 포맷팅
 * @param {number} bytes - 바이트
 * @returns {string} - "1.5 MB"
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ═══════════════════════════════════════════════════
// 성능 최적화
// ═══════════════════════════════════════════════════

/**
 * 디바운스 (연속 호출 방지)
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function}
 */
function debounce(func, wait = 300) {
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
 * 쓰로틀 (주기적 실행)
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 최소 간격 (ms)
 * @returns {Function}
 */
function throttle(func, limit = 300) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ═══════════════════════════════════════════════════
// DOM 조작 헬퍼
// ═══════════════════════════════════════════════════

/**
 * 로딩 표시
 * @param {HTMLElement} element - 로딩을 표시할 요소
 * @param {string} message - 로딩 메시지
 */
function showLoading(element, message = '로딩 중...') {
    if (!element) return;
    
    const loadingHtml = `
        <div class="loading-container flex flex-col items-center justify-center py-12">
            <div class="loading-spinner mb-4"></div>
            <p class="text-gray-600">${message}</p>
        </div>
    `;
    
    element.innerHTML = loadingHtml;
}

/**
 * 로딩 숨김
 * @param {HTMLElement} element - 로딩을 숨길 요소
 */
function hideLoading(element) {
    if (!element) return;
    
    const loadingContainer = element.querySelector('.loading-container');
    if (loadingContainer) {
        loadingContainer.remove();
    }
}

/**
 * 에러 표시
 * @param {HTMLElement} element - 에러를 표시할 요소
 * @param {string} message - 에러 메시지
 */
function showError(element, message = '오류가 발생했습니다') {
    if (!element) return;
    
    const errorHtml = `
        <div class="error-container bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-lg font-bold text-red-800 mb-2">오류</h3>
            <p class="text-red-600">${message}</p>
            <button onclick="location.reload()" 
                    class="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
                페이지 새로고침
            </button>
        </div>
    `;
    
    element.innerHTML = errorHtml;
}

/**
 * 빈 상태 표시
 * @param {HTMLElement} element - 빈 상태를 표시할 요소
 * @param {string} message - 메시지
 */
function showEmpty(element, message = '데이터가 없습니다') {
    if (!element) return;
    
    const emptyHtml = `
        <div class="empty-container text-center py-12">
            <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p class="text-gray-500 text-lg">${message}</p>
        </div>
    `;
    
    element.innerHTML = emptyHtml;
}

// ═══════════════════════════════════════════════════
// 폼 검증
// ═══════════════════════════════════════════════════

/**
 * 이름 검증
 * @param {string} name - 이름
 * @returns {boolean}
 */
function validateName(name) {
    if (!name || name.trim().length === 0) {
        return false;
    }
    
    // 2-20자, 한글/영문만
    const regex = /^[가-힣a-zA-Z]{2,20}$/;
    return regex.test(name.trim());
}

/**
 * 전화번호 검증
 * @param {string} phone - 전화번호
 * @returns {boolean}
 */
function validatePhone(phone) {
    if (!phone) return false;
    
    // 숫자만 추출
    const numbers = phone.replace(/[^\d]/g, '');
    
    // 9-11자리
    return numbers.length >= 9 && numbers.length <= 11;
}

/**
 * 이메일 검증
 * @param {string} email - 이메일
 * @returns {boolean}
 */
function validateEmail(email) {
    if (!email) return false;
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * 폼 검증 헬퍼
 * @param {Object} fields - { name: value, ... }
 * @param {Object} rules - { name: 'required|name', ... }
 * @returns {Object} - { valid: boolean, errors: {} }
 */
function validateForm(fields, rules) {
    const errors = {};
    let valid = true;
    
    Object.keys(rules).forEach(fieldName => {
        const value = fields[fieldName];
        const ruleList = rules[fieldName].split('|');
        
        ruleList.forEach(rule => {
            // required 규칙
            if (rule === 'required') {
                if (!value || value.trim().length === 0) {
                    errors[fieldName] = '필수 입력 항목입니다';
                    valid = false;
                }
            }
            
            // name 규칙
            if (rule === 'name') {
                if (value && !validateName(value)) {
                    errors[fieldName] = '올바른 이름을 입력해주세요 (2-20자, 한글/영문)';
                    valid = false;
                }
            }
            
            // phone 규칙
            if (rule === 'phone') {
                if (value && !validatePhone(value)) {
                    errors[fieldName] = '올바른 전화번호를 입력해주세요';
                    valid = false;
                }
            }
            
            // email 규칙
            if (rule === 'email') {
                if (value && !validateEmail(value)) {
                    errors[fieldName] = '올바른 이메일을 입력해주세요';
                    valid = false;
                }
            }
        });
    });
    
    return { valid, errors };
}

// ═══════════════════════════════════════════════════
// URL 헬퍼
// ═══════════════════════════════════════════════════

/**
 * URL 파라미터 가져오기
 * @param {string} name - 파라미터 이름
 * @returns {string|null}
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * URL 파라미터 설정
 * @param {string} name - 파라미터 이름
 * @param {string} value - 파라미터 값
 * @param {boolean} pushState - history에 추가할지 여부
 */
function setUrlParam(name, value, pushState = true) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    
    if (pushState) {
        window.history.pushState({}, '', url);
    } else {
        window.history.replaceState({}, '', url);
    }
}

/**
 * URL 파라미터 삭제
 * @param {string} name - 파라미터 이름
 */
function removeUrlParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
}

// ═══════════════════════════════════════════════════
// 로컬 스토리지 헬퍼
// ═══════════════════════════════════════════════════

/**
 * 로컬 스토리지에 저장
 * @param {string} key - 키
 * @param {*} value - 값
 */
function saveToStorage(key, value) {
    try {
        const data = JSON.stringify(value);
        localStorage.setItem(key, data);
    } catch (error) {
        console.error('로컬 스토리지 저장 실패:', error);
    }
}

/**
 * 로컬 스토리지에서 불러오기
 * @param {string} key - 키
 * @param {*} defaultValue - 기본값
 * @returns {*}
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        if (data === null) return defaultValue;
        return JSON.parse(data);
    } catch (error) {
        console.error('로컬 스토리지 로드 실패:', error);
        return defaultValue;
    }
}

/**
 * 로컬 스토리지에서 삭제
 * @param {string} key - 키
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('로컬 스토리지 삭제 실패:', error);
    }
}

// ═══════════════════════════════════════════════════
// 스크롤 헬퍼
// ═══════════════════════════════════════════════════

/**
 * 부드러운 스크롤
 * @param {string|HTMLElement} target - 대상 (선택자 또는 요소)
 * @param {number} offset - 오프셋 (px)
 */
function scrollTo(target, offset = 0) {
    const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
    
    if (!element) return;
    
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    
    window.scrollTo({
        top: y,
        behavior: 'smooth'
    });
}

/**
 * 맨 위로 스크롤
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ═══════════════════════════════════════════════════
// 복사 헬퍼
// ═══════════════════════════════════════════════════

/**
 * 클립보드에 복사
 * @param {string} text - 복사할 텍스트
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('클립보드에 복사됨:', text);
        return true;
    } catch (error) {
        console.error('클립보드 복사 실패:', error);
        
        // Fallback: textarea 사용
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (fallbackError) {
            console.error('Fallback 복사 실패:', fallbackError);
            return false;
        }
    }
}

// ═══════════════════════════════════════════════════
// 디바이스 감지
// ═══════════════════════════════════════════════════

/**
 * 모바일 기기 감지
 * @returns {boolean}
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 터치 기기 감지
 * @returns {boolean}
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * iOS 기기 감지
 * @returns {boolean}
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Android 기기 감지
 * @returns {boolean}
 */
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

// ═══════════════════════════════════════════════════
// 유틸리티
// ═══════════════════════════════════════════════════

/**
 * 랜덤 문자열 생성
 * @param {number} length - 길이
 * @returns {string}
 */
function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 지연 실행
 * @param {number} ms - 밀리초
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 배열 섞기 (Fisher-Yates)
 * @param {Array} array - 배열
 * @returns {Array}
 */
function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 배열 청크 (분할)
 * @param {Array} array - 배열
 * @param {number} size - 청크 크기
 * @returns {Array}
 */
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

// ═══════════════════════════════════════════════════
// 알림 헬퍼
// ═══════════════════════════════════════════════════

/**
 * 토스트 알림 표시
 * @param {string} message - 메시지
 * @param {string} type - 타입 ('success' | 'error' | 'info' | 'warning')
 * @param {number} duration - 지속 시간 (ms)
 */
function showToast(message, type = 'info', duration = 3000) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 색상 설정
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    // 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
    toast.textContent = message;
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // 자동 제거
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 확인 다이얼로그
 * @param {string} message - 메시지
 * @returns {Promise<boolean>}
 */
async function confirm(message) {
    return window.confirm(message);
}

// ═══════════════════════════════════════════════════
// 전역 변수 노출
// ═══════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    // 포맷팅
    window.formatPrice = formatPrice;
    window.formatDate = formatDate;
    window.formatPhone = formatPhone;
    window.formatBytes = formatBytes;
    
    // 성능 최적화
    window.debounce = debounce;
    window.throttle = throttle;
    
    // DOM 조작
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.showError = showError;
    window.showEmpty = showEmpty;
    
    // 폼 검증
    window.validateName = validateName;
    window.validatePhone = validatePhone;
    window.validateEmail = validateEmail;
    window.validateForm = validateForm;
    
    // URL 헬퍼
    window.getUrlParam = getUrlParam;
    window.setUrlParam = setUrlParam;
    window.removeUrlParam = removeUrlParam;
    
    // 스토리지
    window.saveToStorage = saveToStorage;
    window.loadFromStorage = loadFromStorage;
    window.removeFromStorage = removeFromStorage;
    
    // 스크롤
    window.scrollTo = scrollTo;
    window.scrollToTop = scrollToTop;
    
    // 복사
    window.copyToClipboard = copyToClipboard;
    
    // 디바이스
    window.isMobile = isMobile;
    window.isTouchDevice = isTouchDevice;
    window.isIOS = isIOS;
    window.isAndroid = isAndroid;
    
    // 유틸리티
    window.randomString = randomString;
    window.sleep = sleep;
    window.shuffleArray = shuffleArray;
    window.chunkArray = chunkArray;
    
    // 알림
    window.showToast = showToast;
    
    console.log('✅ 공통 유틸리티 로드 완료');
}