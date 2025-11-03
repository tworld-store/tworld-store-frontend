/**
 * ═══════════════════════════════════════════════════
 * 메인 페이지 로직 - main.js
 * ═══════════════════════════════════════════════════
 * 
 * 목차:
 * 1. 전역 변수
 * 2. Swiper 초기화
 * 3. 데이터 로드
 * 4. 기기 카드 생성
 * 5. 브랜드 필터링
 * 6. 이벤트 핸들러
 * 7. 초기화
 */

/* ═══════════════════════════════════════════════════
   1. 전역 변수
   ═══════════════════════════════════════════════════ */

/**
 * API 인스턴스
 */
const api = new DataAPI();

/**
 * Swiper 인스턴스
 */
let heroSwiper = null;

/**
 * 현재 선택된 브랜드
 */
let currentBrand = 'all';

/**
 * 전체 기기 데이터
 */
let allDevices = [];

/**
 * 화면에 표시할 기기 개수
 */
const DISPLAY_COUNT = 8;

/* ═══════════════════════════════════════════════════
   2. Swiper 초기화
   ═══════════════════════════════════════════════════ */

/**
 * 히어로 배너 Swiper 초기화
 */
function initHeroSwiper() {
    heroSwiper = new Swiper('.hero-swiper', {
        // 기본 설정
        loop: true,                    // 무한 루프
        speed: 600,                    // 전환 속도 (ms)
        effect: 'fade',                // 페이드 효과
        fadeEffect: {
            crossFade: true
        },
        
        // 자동 재생
        autoplay: {
            delay: 5000,               // 5초 간격
            disableOnInteraction: false, // 사용자 조작 후에도 자동 재생
            pauseOnMouseEnter: true    // 마우스 오버 시 일시 정지
        },
        
        // 페이지네이션 (하단 점)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '" role="button" aria-label="슬라이드 ' + (index + 1) + '"></span>';
            }
        },
        
        // 좌우 버튼 (Desktop)
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        
        // 키보드 제어
        keyboard: {
            enabled: true,
            onlyInViewport: true
        },
        
        // 접근성
        a11y: {
            enabled: true,
            prevSlideMessage: '이전 슬라이드',
            nextSlideMessage: '다음 슬라이드',
            firstSlideMessage: '첫 번째 슬라이드',
            lastSlideMessage: '마지막 슬라이드'
        }
    });
    
    console.log('✅ Swiper 초기화 완료');
}

/* ═══════════════════════════════════════════════════
   3. 데이터 로드
   ═══════════════════════════════════════════════════ */

/**
 * 인기 기기 데이터 로드
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
        
        // 3. 기기 카드 렌더링
        renderDevices(currentBrand);
        
    } catch (error) {
        console.error('❌ 기기 데이터 로드 실패:', error);
        showError();
    }
}

/* ═══════════════════════════════════════════════════
   4. 기기 카드 생성
   ═══════════════════════════════════════════════════ */

/**
 * 기기 카드 렌더링
 * @param {string} brand - 브랜드 필터 ('all', 'samsung', 'apple', 'lg')
 */
function renderDevices(brand = 'all') {
    const grid = document.getElementById('device-grid');
    if (!grid) return;
    
    // 1. 브랜드별 필터링
    let filteredDevices = allDevices;
    
    if (brand !== 'all') {
        filteredDevices = allDevices.filter(device => {
            const deviceBrand = device.brand.toLowerCase();
            
            // 브랜드 매칭 (한글/영문)
            if (brand === 'samsung') {
                return deviceBrand === '삼성' || deviceBrand === 'samsung';
            } else if (brand === 'apple') {
                return deviceBrand === '애플' || deviceBrand === 'apple';
            } else if (brand === 'lg') {
                return deviceBrand === 'lg';
            }
            return false;
        });
    }
    
    // 1.5. 모델명 기준 중복 제거 (각 모델의 첫 번째 용량만 표시)
    const seenModels = new Set();
    const uniqueDevices = filteredDevices.filter(device => {
        if (seenModels.has(device.model)) {
            return false; // 이미 표시한 모델은 제외
        }
        seenModels.add(device.model);
        return true;
    });
    
    // 2. 상위 N개만 선택
    const displayDevices = uniqueDevices.slice(0, DISPLAY_COUNT);
    
    console.log(`📱 렌더링: ${displayDevices.length}개 기기 (브랜드: ${brand}, 중복 제거 후)`);
    
    // 3. HTML 생성
    if (displayDevices.length === 0) {
        grid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1;">
                <p>해당 브랜드의 기기가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = displayDevices.map(device => createDeviceCard(device)).join('');
    
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
    
    // 4. 월 납부액 계산 (단순 24개월 할부, 추후 Admin에서 요금제 반영)
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
                    <div class="device-price-value">
                        ${formattedPrice}원
                    </div>
                    <div class="device-price-monthly">
                        월 ${formattedMonthly}원
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
   5. 브랜드 필터링
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
    
    // 3. 기기 목록 다시 렌더링
    renderDevices(brand);
    
    console.log(`🔄 브랜드 필터: ${brand}`);
}

/* ═══════════════════════════════════════════════════
   6. 이벤트 핸들러
   ═══════════════════════════════════════════════════ */

/**
 * 빠른 상담 버튼 클릭
 */
function handleQuickConsultClick() {
    // 전화 상담 (실제 전화번호로 수정 필요)
    window.location.href = 'tel:1588-0011';
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
 * 에러 메시지 표시
 */
function showError() {
    const grid = document.getElementById('device-grid');
    const errorMessage = document.getElementById('error-message');
    
    if (grid) {
        grid.innerHTML = '';
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
        const skeletonHTML = Array(DISPLAY_COUNT).fill(0).map((_, index) => {
            const hideClass = index >= 4 ? ' hide-mobile' : '';
            return `<div class="device-skeleton${hideClass}"></div>`;
        }).join('');
        
        grid.innerHTML = skeletonHTML;
    }
}

/* ═══════════════════════════════════════════════════
   7. 초기화
   ═══════════════════════════════════════════════════ */

/**
 * 이벤트 리스너 등록
 */
function attachEventListeners() {
    // 1. 브랜드 탭
    const brandTabs = document.querySelectorAll('.brand-tab');
    brandTabs.forEach(tab => {
        tab.addEventListener('click', handleBrandTabClick);
    });
    
    // 2. 빠른 상담 버튼
    const quickConsultBtn = document.getElementById('quick-consult-btn');
    if (quickConsultBtn) {
        quickConsultBtn.addEventListener('click', handleQuickConsultClick);
    }
    
    // 3. 모바일 메뉴 버튼
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', handleMobileMenuClick);
    }
    
    // 4. 다시 시도 버튼
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', handleRetryClick);
    }
    
    console.log('✅ 이벤트 리스너 등록 완료');
}

/**
 * 페이지 초기화
 */
async function init() {
    console.log('🚀 메인 페이지 초기화 시작');
    
    try {
        // 1. Swiper 초기화
        initHeroSwiper();
        
        // 2. 이벤트 리스너 등록
        attachEventListeners();
        
        // 3. 기기 데이터 로드
        await loadDevices();
        
        console.log('✅ 메인 페이지 초기화 완료');
        
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

// 페이지 언로드 시 Swiper 정리
window.addEventListener('beforeunload', () => {
    if (heroSwiper) {
        heroSwiper.destroy(true, true);
    }
});
