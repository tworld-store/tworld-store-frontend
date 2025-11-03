/**
 * ═══════════════════════════════════════════════════
 * 기기 목록 페이지 로직 - devices.js
 * ═══════════════════════════════════════════════════
 * 
 * 목차:
 * 1. 전역 변수
 * 2. URL 파라미터 처리
 * 3. 데이터 로드
 * 4. 브랜드 필터링
 * 5. 정렬 처리
 * 6. 기기 카드 생성
 * 7. 이벤트 핸들러
 * 8. 초기화
 */

/* ═══════════════════════════════════════════════════
   1. 전역 변수
   ═══════════════════════════════════════════════════ */

/**
 * API 인스턴스
 */
const api = new DataAPI();

/**
 * 전체 기기 데이터
 */
let allDevices = [];

/**
 * 현재 필터링된 기기 데이터
 */
let filteredDevices = [];

/**
 * 현재 브랜드 필터
 */
let currentBrand = 'samsung'; // 기본값: 삼성

/**
 * 현재 정렬 기준
 */
let currentSort = 'price-asc'; // 기본값: 가격 낮은순

/* ═══════════════════════════════════════════════════
   2. URL 파라미터 처리
   ═══════════════════════════════════════════════════ */

/**
 * URL에서 브랜드 파라미터 추출
 * @returns {string} 브랜드 ('samsung', 'apple', 'other', 'all')
 */
function getBrandFromURL() {
    const params = new URLSearchParams(window.location.search);
    const brand = params.get('brand');
    
    // 유효한 브랜드인지 확인
    const validBrands = ['samsung', 'apple', 'other', 'all'];
    
    if (brand && validBrands.includes(brand.toLowerCase())) {
        return brand.toLowerCase();
    }
    
    // 기본값: 삼성
    return 'samsung';
}

/**
 * URL 업데이트 (브라우저 히스토리)
 * @param {string} brand - 브랜드
 */
function updateURL(brand) {
    const url = new URL(window.location.href);
    
    if (brand === 'all') {
        url.searchParams.delete('brand');
    } else {
        url.searchParams.set('brand', brand);
    }
    
    // URL 업데이트 (페이지 리로드 없이)
    window.history.pushState({}, '', url);
}

/* ═══════════════════════════════════════════════════
   3. 데이터 로드
   ═══════════════════════════════════════════════════ */

/**
 * 기기 데이터 로드
 */
async function loadDevices() {
    try {
        console.log('🔄 기기 데이터 로딩 중...');
        
        // 1. API로부터 전체 데이터 로드
        const data = await api.fetchProducts();
        
        if (!data || !data.devices || data.devices.length === 0) {
            throw new Error('기기 데이터가 없습니다.');
        }
        
        // 2. 전역 변수에 저장
        allDevices = data.devices;
        
        console.log(`✅ 기기 데이터 로드 완료: ${allDevices.length}개`);
        
        // 3. 필터링 & 렌더링
        applyFilters();
        
    } catch (error) {
        console.error('❌ 기기 데이터 로드 실패:', error);
        showError();
    }
}

/* ═══════════════════════════════════════════════════
   4. 브랜드 필터링
   ═══════════════════════════════════════════════════ */

/**
 * 브랜드 필터 적용
 */
function applyFilters() {
    // 1. 브랜드별 필터링
    if (currentBrand === 'all') {
        filteredDevices = [...allDevices];
    } else {
        filteredDevices = allDevices.filter(device => {
            const deviceBrand = device.brand.toLowerCase();
            
            // 브랜드 매칭
            if (currentBrand === 'samsung') {
                return deviceBrand.includes('삼성') || deviceBrand.includes('samsung');
            } else if (currentBrand === 'apple') {
                return deviceBrand.includes('애플') || deviceBrand.includes('apple');
            } else if (currentBrand === 'other') {
                // 삼성, 애플이 아닌 모든 기기
                const isSamsung = deviceBrand.includes('삼성') || deviceBrand.includes('samsung');
                const isApple = deviceBrand.includes('애플') || deviceBrand.includes('apple');
                return !isSamsung && !isApple;
            }
            
            return false;
        });
    }
    
    console.log(`📱 필터링 결과: ${filteredDevices.length}개 (브랜드: ${currentBrand})`);
    
    // 2. 정렬 적용
    applySorting();
    
    // 3. UI 업데이트
    updatePageTitle();
    updateDeviceCount();
    renderDevices();
}

/**
 * 페이지 타이틀 업데이트
 */
function updatePageTitle() {
    const titleElement = document.getElementById('page-title');
    if (!titleElement) return;
    
    const titles = {
        'samsung': '삼성전자',
        'apple': '애플',
        'other': '기타 브랜드',
        'all': '전체 기기'
    };
    
    titleElement.textContent = titles[currentBrand] || '전체 기기';
}

/**
 * 기기 개수 업데이트
 */
function updateDeviceCount() {
    const countElement = document.getElementById('device-count');
    if (!countElement) return;
    
    countElement.textContent = filteredDevices.length;
}

/* ═══════════════════════════════════════════════════
   5. 정렬 처리
   ═══════════════════════════════════════════════════ */

/**
 * 정렬 적용
 */
function applySorting() {
    switch (currentSort) {
        case 'price-asc':
            // 가격 낮은순
            filteredDevices.sort((a, b) => a.price - b.price);
            break;
            
        case 'price-desc':
            // 가격 높은순
            filteredDevices.sort((a, b) => b.price - a.price);
            break;
            
        case 'name-asc':
            // 이름순 (ㄱ-ㅎ)
            filteredDevices.sort((a, b) => a.model.localeCompare(b.model, 'ko'));
            break;
            
        case 'latest':
            // 최신순 (ID 역순으로 가정)
            filteredDevices.reverse();
            break;
            
        default:
            // 기본: 가격 낮은순
            filteredDevices.sort((a, b) => a.price - b.price);
    }
    
    console.log(`🔄 정렬: ${currentSort}`);
}

/* ═══════════════════════════════════════════════════
   6. 기기 카드 생성
   ═══════════════════════════════════════════════════ */

/**
 * 기기 목록 렌더링
 */
function renderDevices() {
    const grid = document.getElementById('device-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid || !emptyState) return;
    
    // 1. 기기가 없는 경우
    if (filteredDevices.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hide');
        return;
    }
    
    // 2. 빈 상태 숨기기
    emptyState.classList.add('hide');
    
    // 3. 기기 카드 생성
    grid.innerHTML = filteredDevices.map(device => createDeviceCard(device)).join('');
    
    // 4. 카드 클릭 이벤트 등록
    attachCardClickEvents();
}

/**
 * 기기 카드 HTML 생성
 * @param {Object} device - 기기 데이터
 * @returns {string} HTML 문자열
 */
function createDeviceCard(device) {
    // 1. 기본 정보 추출
    const deviceId = device.id;
    const brand = device.brand;
    const model = device.model;
    const storage = device.storage;
    const price = device.price;
    
    // 2. 이미지 URL 생성 (첫 번째 색상 사용)
    const firstColor = device.colors && device.colors[0];
    const imageUrl = firstColor && firstColor.imageUrl 
        ? firstColor.imageUrl 
        : './assets/images/placeholder/device.svg';
    
    // 3. 가격 포맷팅
    const formattedPrice = formatNumber(price);
    
    // 4. 출고가 기준 월 납부액 계산 (예시: 24개월 할부)
    const monthlyPayment = Math.floor(price / 24);
    const formattedMonthly = formatNumber(monthlyPayment);
    
    // 5. HTML 반환
    return `
        <article class="device-card" data-device-id="${deviceId}" role="button" tabindex="0">
            <div class="device-image">
                <img src="${imageUrl}" alt="${model}" loading="lazy" onerror="this.onerror=null; this.src='./assets/images/placeholder/device.svg';">
            </div>
            <div class="device-info">
                <div class="device-brand">${brand}</div>
                <h3 class="device-name">${model}</h3>
                <div class="device-storage">${storage}GB</div>
                <div class="device-price">
                    <div class="device-price-label">출고가</div>
                    <div class="device-price-value">
                        ${formattedPrice}
                        <span class="device-price-unit">원</span>
                    </div>
                    <div class="device-price-label" style="margin-top: 8px; font-size: 0.875rem;">
                        월 약 ${formattedMonthly}원 (24개월)
                    </div>
                </div>
            </div>
        </article>
    `;
}

/**
 * 카드 클릭 이벤트 등록
 */
function attachCardClickEvents() {
    const cards = document.querySelectorAll('.device-card');
    
    cards.forEach(card => {
        // 클릭 이벤트
        card.addEventListener('click', handleCardClick);
        
        // 키보드 이벤트 (Enter/Space)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick.call(card, e);
            }
        });
    });
}

/**
 * 카드 클릭 핸들러
 */
function handleCardClick(e) {
    e.preventDefault();
    
    const card = this;
    const deviceId = card.dataset.deviceId;
    
    if (deviceId) {
        // device 객체 찾기
        const device = allDevices.find(d => d.id === deviceId);
        if (device && device.model) {
            // 모델명으로 상세 페이지 이동
            window.location.href = `./device-detail.html?model=${encodeURIComponent(device.model)}`;
        }
    }
}

/* ═══════════════════════════════════════════════════
   7. 이벤트 핸들러
   ═══════════════════════════════════════════════════ */

/**
 * 브랜드 탭 클릭 핸들러
 * @param {Event} e - 클릭 이벤트
 */
function handleBrandTabClick(e) {
    const tab = e.target.closest('.brand-tab');
    if (!tab) return;
    
    const brand = tab.dataset.brand;
    
    // 1. 탭 활성화 상태 변경
    document.querySelectorAll('.brand-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    
    // 2. 현재 브랜드 업데이트
    currentBrand = brand;
    
    // 3. URL 업데이트
    updateURL(brand);
    
    // 4. 필터 적용
    applyFilters();
}

/**
 * 정렬 선택 변경 핸들러
 * @param {Event} e - 변경 이벤트
 */
function handleSortChange(e) {
    const sortValue = e.target.value;
    
    // 1. 현재 정렬 업데이트
    currentSort = sortValue;
    
    // 2. 정렬 적용 & 렌더링
    applySorting();
    renderDevices();
}

/**
 * 필터 초기화 버튼 클릭
 */
function handleResetFilterClick() {
    // 1. 브랜드를 'all'로 변경
    currentBrand = 'all';
    
    // 2. URL 업데이트
    updateURL('all');
    
    // 3. 탭 활성화 상태 초기화
    document.querySelectorAll('.brand-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    
    // 4. 필터 적용
    applyFilters();
}

/**
 * 다시 시도 버튼 클릭
 */
function handleRetryClick() {
    // 에러 메시지 숨기기
    hideError();
    
    // 스켈레톤 표시
    showSkeleton();
    
    // 데이터 다시 로드
    loadDevices();
}

/**
 * 모바일 메뉴 버튼 클릭
 */
function handleMobileMenuClick() {
    const header = document.querySelector('.header');
    const btn = document.querySelector('.mobile-menu-btn');
    
    header.classList.toggle('menu-open');
    
    const isOpen = header.classList.contains('menu-open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
}

/**
 * 에러 메시지 표시
 */
function showError() {
    const grid = document.getElementById('device-grid');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    
    if (grid) {
        grid.innerHTML = '';
    }
    
    if (emptyState) {
        emptyState.classList.add('hide');
    }
    
    if (errorMessage) {
        errorMessage.classList.remove('hide');
    }
}

/**
 * 에러 메시지 숨기기
 */
function hideError() {
    const errorMessage = document.getElementById('error-message');
    
    if (errorMessage) {
        errorMessage.classList.add('hide');
    }
}

/**
 * 스켈레톤 표시
 */
function showSkeleton() {
    const grid = document.getElementById('device-grid');
    
    if (grid) {
        const skeletonHTML = Array(8).fill(0).map(() => {
            return '<div class="device-skeleton"></div>';
        }).join('');
        
        grid.innerHTML = skeletonHTML;
    }
}

/* ═══════════════════════════════════════════════════
   8. 초기화
   ═══════════════════════════════════════════════════ */

/**
 * 브랜드 탭 초기 상태 설정
 */
function initBrandTabs() {
    const tabs = document.querySelectorAll('.brand-tab');
    
    tabs.forEach(tab => {
        const brand = tab.dataset.brand;
        
        if (brand === currentBrand) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        }
    });
}

/**
 * 정렬 선택 초기 상태 설정
 */
function initSortSelect() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.value = currentSort;
    }
}

/**
 * 이벤트 리스너 등록
 */
function attachEventListeners() {
    // 1. 브랜드 탭
    const brandTabs = document.querySelectorAll('.brand-tab');
    brandTabs.forEach(tab => {
        tab.addEventListener('click', handleBrandTabClick);
    });
    
    // 2. 정렬 선택
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // 3. 필터 초기화 버튼
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', handleResetFilterClick);
    }
    
    // 4. 다시 시도 버튼
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', handleRetryClick);
    }
    
    // 5. 모바일 메뉴 버튼
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', handleMobileMenuClick);
    }
    
    console.log('✅ 이벤트 리스너 등록 완료');
}

/**
 * 페이지 초기화
 */
async function init() {
    console.log('🚀 기기 목록 페이지 초기화 시작');
    
    try {
        // 1. URL에서 브랜드 추출
        currentBrand = getBrandFromURL();
        console.log(`📌 초기 브랜드: ${currentBrand}`);
        
        // 2. 브랜드 탭 초기 상태 설정
        initBrandTabs();
        
        // 3. 정렬 선택 초기 상태 설정
        initSortSelect();
        
        // 4. 이벤트 리스너 등록
        attachEventListeners();
        
        // 5. 기기 데이터 로드
        await loadDevices();
        
        console.log('✅ 기기 목록 페이지 초기화 완료');
        
    } catch (error) {
        console.error('❌ 초기화 실패:', error);
        showError();
    }
}

/* ═══════════════════════════════════════════════════
   DOM 로드 완료 후 초기화
   ═══════════════════════════════════════════════════ */

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', init);
