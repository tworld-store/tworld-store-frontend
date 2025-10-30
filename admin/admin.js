/* ============================================
   Admin.js - SKT 쇼핑몰 관리자 JavaScript
   
   주요 기능:
   1. SPA 라우팅 (페이지 전환)
   2. 상태 관리 (현재 페이지, 브랜드, 모델 등)
   3. 템플릿 렌더링
   4. 기기 관리 로직 (브랜드 → 모델 → 5개 탭)
   5. 이벤트 핸들러
   ============================================ */

// ============================================
// 1. 전역 상태 관리
// ============================================

/**
 * 애플리케이션의 전역 상태를 관리하는 객체
 * 현재 어떤 페이지, 브랜드, 모델, 탭을 보고 있는지 추적합니다.
 */
const AppState = {
    // 현재 표시 중인 페이지 (dashboard, devices, main-page, plans, settings)
    currentPage: 'dashboard',
    
    // 기기 관리에서 선택된 브랜드 (samsung, apple, others)
    selectedBrand: null,
    
    // 기기 관리에서 선택된 모델 (galaxy-s24, galaxy-zflip7 등)
    selectedModel: null,
    
    // 기기 상세에서 선택된 탭 (basic, card, thumbnail, gallery, detail-page)
    selectedTab: 'basic',
    
    // 임시 데이터 저장소 (이미지 업로드 등에 사용)
    tempData: {}
};

/**
 * 상태를 업데이트하는 함수
 * @param {Object} newState - 업데이트할 상태 객체
 * 
 * 예시:
 * setState({ currentPage: 'devices', selectedBrand: 'samsung' })
 */
function setState(newState) {
    // 기존 상태에 새로운 상태를 병합
    Object.assign(AppState, newState);
    
    // 디버깅용 콘솔 출력
    console.log('State updated:', AppState);
}

// ============================================
// 2. 템플릿 렌더링 시스템
// ============================================

/**
 * HTML 템플릿을 가져와서 콘텐츠 영역에 렌더링하는 함수
 * @param {string} templateId - 템플릿의 ID (예: 'template-dashboard')
 * @param {string} targetId - 렌더링할 타겟 요소의 ID (기본값: 'content')
 */
function renderTemplate(templateId, targetId = 'content') {
    // 1. 템플릿 요소 찾기
    const template = document.getElementById(templateId);
    
    // 템플릿이 없으면 에러
    if (!template) {
        console.error(`Template not found: ${templateId}`);
        return;
    }
    
    // 2. 타겟 요소 찾기
    const target = document.getElementById(targetId);
    
    if (!target) {
        console.error(`Target element not found: ${targetId}`);
        return;
    }
    
    // 3. 템플릿 내용을 복사해서 타겟에 삽입
    const content = template.content.cloneNode(true);
    target.innerHTML = '';
    target.appendChild(content);
    
    console.log(`Rendered template: ${templateId}`);
}

/**
 * 페이지 제목을 업데이트하는 함수
 * @param {string} title - 새로운 페이지 제목
 */
function updatePageTitle(title) {
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// ============================================
// 3. 네비게이션 시스템 (페이지 전환)
// ============================================

/**
 * 메뉴 아이템의 active 상태를 업데이트하는 함수
 * @param {string} pageName - 활성화할 페이지 이름
 */
function updateMenuActive(pageName) {
    // 모든 메뉴 아이템에서 active 클래스 제거
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 현재 페이지에 해당하는 메뉴 아이템에 active 클래스 추가
    const activeMenuItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
}

/**
 * 페이지를 전환하는 메인 함수
 * @param {string} pageName - 이동할 페이지 이름
 * 
 * 페이지별 처리:
 * - dashboard: 대시보드 표시
 * - devices: 기기 관리 (브랜드 선택부터 시작)
 * - main-page: 메인 페이지 관리
 * - plans: 요금제 관리
 * - settings: 설정
 */
function navigateTo(pageName) {
    console.log(`Navigating to: ${pageName}`);
    
    // 상태 업데이트
    setState({ 
        currentPage: pageName,
        // 페이지 전환 시 하위 선택 초기화
        selectedBrand: null,
        selectedModel: null,
        selectedTab: 'basic'
    });
    
    // 메뉴 active 상태 업데이트
    updateMenuActive(pageName);
    
    // 페이지별 처리
    switch(pageName) {
        case 'dashboard':
            renderDashboard();
            break;
            
        case 'devices':
            renderDevicesBrands();
            break;
            
        case 'main-page':
            renderMainPage();
            break;
            
        case 'plans':
            renderPlans();
            break;
            
        case 'settings':
            renderSettings();
            break;
            
        default:
            console.error(`Unknown page: ${pageName}`);
            renderDashboard();
    }
}

// ============================================
// 4. 페이지 렌더링 함수들
// ============================================

/**
 * 대시보드 페이지 렌더링
 */
function renderDashboard() {
    updatePageTitle('대시보드');
    renderTemplate('template-dashboard');
    
    // 대시보드 이벤트 바인딩
    bindDashboardEvents();
}

/**
 * 기기 관리 - 브랜드 선택 페이지 렌더링
 */
function renderDevicesBrands() {
    updatePageTitle('기기 관리');
    renderTemplate('template-devices-brands');
    
    // 브랜드 카드 클릭 이벤트 바인딩
    bindBrandCardEvents();
}

/**
 * 기기 관리 - 특정 브랜드의 모델 목록 렌더링
 * @param {string} brand - 브랜드 이름 (samsung, apple, others)
 */
function renderDevicesModels(brand) {
    setState({ selectedBrand: brand });
    
    // 브랜드별 제목 설정
    const brandTitles = {
        samsung: '삼성',
        apple: '애플',
        others: '기타'
    };
    
    updatePageTitle(`기기 관리 - ${brandTitles[brand]}`);
    
    // 브랜드별로 다른 템플릿 로드
    // 현재는 삼성만 구현되어 있음
    if (brand === 'samsung') {
        renderTemplate('template-devices-samsung');
    } else {
        // TODO: 애플, 기타 브랜드 템플릿 추가
        renderTemplate('template-devices-samsung');
    }
    
    // 뒤로가기 버튼 이벤트 바인딩
    bindBackToBrandsEvent();
    
    // 모델 카드 클릭 이벤트 바인딩
    bindModelCardEvents();
}

/**
 * 기기 관리 - 특정 모델의 상세 페이지 렌더링 (5개 탭)
 * @param {string} model - 모델 이름 (galaxy-s24, galaxy-zflip7 등)
 */
function renderDeviceDetail(model) {
    setState({ selectedModel: model, selectedTab: 'basic' });
    
    // 모델별 표시 이름
    const modelTitles = {
        'galaxy-s24': '갤럭시 S24',
        'galaxy-zflip7': '갤럭시 Z플립7',
        'galaxy-s25fe': '갤럭시 S25 FE'
    };
    
    updatePageTitle(`기기 관리 - ${modelTitles[model] || model}`);
    
    // 모델 상세 템플릿 렌더링
    renderTemplate('template-device-detail');
    
    // 뒤로가기 버튼 이벤트 바인딩
    bindBackToModelsEvent();
    
    // 탭 전환 이벤트 바인딩
    bindDeviceTabEvents();
    
    // 첫 번째 탭(기본 정보) 렌더링
    renderDeviceTab('basic');
}

/**
 * 기기 상세 - 특정 탭 렌더링
 * @param {string} tabName - 탭 이름 (basic, card, thumbnail, gallery, detail-page)
 */
function renderDeviceTab(tabName) {
    setState({ selectedTab: tabName });
    
    // 탭 버튼 active 상태 업데이트
    updateDeviceTabActive(tabName);
    
    // 탭별 템플릿 ID 매핑
    const tabTemplates = {
        basic: 'template-tab-basic',
        card: 'template-tab-card',
        thumbnail: 'template-tab-thumbnail',
        gallery: 'template-tab-gallery',
        'detail-page': 'template-tab-detail-page'
    };
    
    // 탭 콘텐츠 렌더링
    const templateId = tabTemplates[tabName];
    if (templateId) {
        renderTemplate(templateId, 'tab-content');
        
        // 탭별 이벤트 바인딩
        bindTabSpecificEvents(tabName);
    } else {
        console.error(`Unknown tab: ${tabName}`);
    }
}

/**
 * 탭 버튼의 active 상태 업데이트
 * @param {string} tabName - 활성화할 탭 이름
 */
function updateDeviceTabActive(tabName) {
    // 모든 탭 버튼에서 active 클래스 제거
    document.querySelectorAll('.device-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('border-blue-600', 'text-blue-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    // 현재 탭 버튼에 active 클래스 추가
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        activeTab.classList.add('border-blue-600', 'text-blue-600');
    }
}

/**
 * 메인 페이지 관리 렌더링 (추후 구현)
 */
function renderMainPage() {
    updatePageTitle('메인 페이지 관리');
    
    // TODO: 메인 페이지 템플릿 추가
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">메인 페이지 관리</h3>
            <p class="text-gray-600">메인 페이지 이미지 관리 기능은 Phase 3-2에서 구현됩니다.</p>
            <div class="mt-4 space-y-2 text-sm text-gray-600">
                <p>• 히어로 슬라이더</p>
                <p>• 인기 기기 설정</p>
                <p>• 중간 배너</p>
                <p>• 하단 프로모션</p>
            </div>
        </div>
    `;
}

/**
 * 요금제 관리 렌더링 (추후 구현)
 */
function renderPlans() {
    updatePageTitle('요금제 관리');
    
    // TODO: 요금제 관리 템플릿 추가
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">요금제 관리</h3>
            <p class="text-gray-600">카테고리 아이콘 관리 기능은 Phase 3-2에서 구현됩니다.</p>
            <div class="mt-4 space-y-2 text-sm text-gray-600">
                <p>• 5GX 아이콘</p>
                <p>• 청년 아이콘</p>
                <p>• 시니어 아이콘</p>
                <p>• LTE 아이콘</p>
            </div>
        </div>
    `;
}

/**
 * 설정 페이지 렌더링 (추후 구현)
 */
function renderSettings() {
    updatePageTitle('설정');
    
    // TODO: 설정 템플릿 추가
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Cloudinary 설정 -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">
                    <i class="fas fa-cloud-upload-alt text-blue-600 mr-2"></i>
                    Cloudinary 설정
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cloud Name</label>
                        <input type="text" 
                               placeholder="your-cloud-name"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Upload Preset</label>
                        <input type="text" 
                               placeholder="your-upload-preset"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    </div>
                    <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>
                        저장
                    </button>
                </div>
            </div>
            
            <!-- GitHub 설정 -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">
                    <i class="fab fa-github text-gray-900 mr-2"></i>
                    GitHub 설정
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Repository URL</label>
                        <input type="text" 
                               placeholder="https://github.com/username/repo"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Personal Access Token</label>
                        <input type="password" 
                               placeholder="ghp_xxxxxxxxxxxx"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    </div>
                    <div class="flex gap-4">
                        <button class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-check mr-2"></i>
                            연결 테스트
                        </button>
                        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// 5. 이벤트 바인딩 함수들
// ============================================

/**
 * 대시보드 이벤트 바인딩
 */
function bindDashboardEvents() {
    // "수정하기" 버튼 클릭 시 기기 관리로 이동
    document.querySelectorAll('.bg-orange-50 button').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo('devices');
        });
    });
}

/**
 * 브랜드 카드 클릭 이벤트 바인딩
 */
function bindBrandCardEvents() {
    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('click', function() {
            const brand = this.getAttribute('data-brand');
            console.log(`Brand selected: ${brand}`);
            
            // 브랜드별 모델 목록 렌더링
            renderDevicesModels(brand);
        });
    });
}

/**
 * 모델 카드 클릭 이벤트 바인딩
 */
function bindModelCardEvents() {
    document.querySelectorAll('.model-card').forEach(card => {
        card.addEventListener('click', function() {
            const model = this.getAttribute('data-model');
            console.log(`Model selected: ${model}`);
            
            // 모델 상세 페이지 렌더링
            renderDeviceDetail(model);
        });
    });
}

/**
 * 기기 상세 탭 클릭 이벤트 바인딩
 */
function bindDeviceTabEvents() {
    document.querySelectorAll('.device-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log(`Tab selected: ${tabName}`);
            
            // 탭 콘텐츠 렌더링
            renderDeviceTab(tabName);
        });
    });
}

/**
 * "브랜드 선택으로 돌아가기" 버튼 이벤트 바인딩
 */
function bindBackToBrandsEvent() {
    const backBtn = document.querySelector('.back-to-brands');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            renderDevicesBrands();
        });
    }
}

/**
 * "모델 목록으로 돌아가기" 버튼 이벤트 바인딩
 */
function bindBackToModelsEvent() {
    const backBtn = document.querySelector('.back-to-models');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // 현재 선택된 브랜드의 모델 목록으로 돌아가기
            if (AppState.selectedBrand) {
                renderDevicesModels(AppState.selectedBrand);
            } else {
                // 브랜드가 없으면 브랜드 선택으로
                renderDevicesBrands();
            }
        });
    }
}

/**
 * 각 탭별 특정 이벤트 바인딩
 * @param {string} tabName - 탭 이름
 */
function bindTabSpecificEvents(tabName) {
    switch(tabName) {
        case 'basic':
            bindBasicTabEvents();
            break;
        case 'card':
            bindCardTabEvents();
            break;
        case 'thumbnail':
            bindThumbnailTabEvents();
            break;
        case 'gallery':
            bindGalleryTabEvents();
            break;
        case 'detail-page':
            bindDetailPageTabEvents();
            break;
    }
}

/**
 * [탭1] 기본 정보 탭 이벤트 바인딩
 */
function bindBasicTabEvents() {
    // 저장 버튼 클릭
    const saveBtn = document.querySelector('#tab-content button');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('기본 정보 저장');
            
            // TODO: 실제 저장 로직 구현
            showToast('기본 정보가 저장되었습니다.', 'success');
        });
    }
}

/**
 * [탭2] 카드 설정 탭 이벤트 바인딩
 */
function bindCardTabEvents() {
    // 가격 계산하기 버튼
    const calcBtn = document.querySelector('.bg-green-600');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            console.log('가격 계산 시작');
            
            // TODO: 실제 가격 계산 로직 구현
            // products.json에서 데이터 조회 후 계산
            
            showToast('가격이 계산되었습니다.', 'success');
        });
    }
    
    // 저장 버튼
    const saveBtn = document.querySelector('.bg-blue-600');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('카드 설정 저장');
            
            // TODO: 실제 저장 로직 구현
            showToast('카드 설정이 저장되었습니다.', 'success');
        });
    }
}

/**
 * [탭3] 썸네일 관리 탭 이벤트 바인딩
 */
function bindThumbnailTabEvents() {
    // 업로드 버튼들
    const uploadBtns = document.querySelectorAll('#tab-content .bg-blue-600');
    uploadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('썸네일 업로드 클릭');
            
            // TODO: Phase 3-2에서 Cloudinary 업로드 구현
            showToast('이미지 업로드 기능은 Phase 3-2에서 구현됩니다.', 'info');
        });
    });
    
    // 색상 추가 버튼
    const addColorBtn = document.querySelector('#tab-content .border-gray-300');
    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => {
            console.log('색상 추가 클릭');
            
            // TODO: 색상 추가 로직 구현
            showToast('색상 추가 기능은 Phase 3-2에서 구현됩니다.', 'info');
        });
    }
}

/**
 * [탭4] 갤러리 관리 탭 이벤트 바인딩
 */
function bindGalleryTabEvents() {
    // 펼치기/접기 버튼들
    document.querySelectorAll('.fa-chevron-down').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.border-gray-200');
            const gallery = parent.querySelector('.grid');
            
            if (gallery) {
                // 갤러리 토글
                gallery.style.display = gallery.style.display === 'none' ? 'grid' : 'none';
                
                // 아이콘 회전
                this.classList.toggle('fa-chevron-down');
                this.classList.toggle('fa-chevron-up');
            }
        });
    });
    
    // 이미지 추가 버튼
    document.querySelectorAll('.fa-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('갤러리 이미지 추가');
            
            // TODO: Phase 3-2에서 이미지 업로드 구현
            showToast('이미지 업로드 기능은 Phase 3-2에서 구현됩니다.', 'info');
        });
    });
}

/**
 * [탭5] 상세 페이지 탭 이벤트 바인딩
 */
function bindDetailPageTabEvents() {
    // 이미지 업로드 버튼들
    document.querySelectorAll('#tab-content .bg-blue-600').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('상세 페이지 이미지 업로드');
            
            // TODO: Phase 3-2에서 이미지 업로드 구현
            showToast('이미지 업로드 기능은 Phase 3-2에서 구현됩니다.', 'info');
        });
    });
    
    // 섹션 삭제 버튼들
    document.querySelectorAll('.fa-trash').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('.border-gray-200');
            
            if (confirm('이 섹션을 삭제하시겠습니까?')) {
                section.remove();
                showToast('섹션이 삭제되었습니다.', 'success');
            }
        });
    });
    
    // 섹션 추가 버튼
    const addSectionBtn = document.querySelector('#tab-content .border-gray-300');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => {
            console.log('섹션 추가');
            
            // TODO: 섹션 추가 로직 구현
            showToast('섹션 추가 기능은 Phase 3-2에서 구현됩니다.', 'info');
        });
    }
}

// ============================================
// 6. 유틸리티 함수들
// ============================================

/**
 * 토스트 알림 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // 아이콘 선택
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const iconClass = icons[type] || icons.info;
    
    // 토스트 내용
    toast.innerHTML = `
        <i class="fas ${iconClass} text-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue'}-600"></i>
        <span>${message}</span>
    `;
    
    // body에 추가
    document.body.appendChild(toast);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * 로딩 상태 표시/숨김
 * @param {boolean} show - true면 표시, false면 숨김
 */
function setLoading(show) {
    const content = document.getElementById('content');
    if (show) {
        content.classList.add('loading');
    } else {
        content.classList.remove('loading');
    }
}

/**
 * 모달 표시 함수 (추후 구현용)
 * @param {string} title - 모달 제목
 * @param {string} content - 모달 내용 (HTML)
 */
function showModal(title, content) {
    // TODO: Phase 3-2에서 모달 구현
    console.log('Modal:', title, content);
}

// ============================================
// 7. API 연동 함수들 (Phase 3-2~3-4에서 구현)
// ============================================

/**
 * Cloudinary에 이미지 업로드 (Phase 3-2에서 구현)
 * @param {File} file - 업로드할 파일
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
async function uploadToCloudinary(file) {
    // TODO: Phase 3-2에서 구현
    console.log('Cloudinary upload:', file.name);
    
    // 임시 반환값
    return 'https://via.placeholder.com/400';
}

/**
 * images.json 파일 읽기 (Phase 3-3에서 구현)
 * @returns {Promise<Object>} images.json 데이터
 */
async function loadImagesJson() {
    // TODO: Phase 3-3에서 구현
    console.log('Loading images.json');
    
    // 임시 반환값
    return {};
}

/**
 * images.json 파일 저장 및 GitHub 커밋 (Phase 3-4에서 구현)
 * @param {Object} data - 저장할 데이터
 * @returns {Promise<boolean>} 성공 여부
 */
async function saveToGitHub(data) {
    // TODO: Phase 3-4에서 구현
    console.log('Saving to GitHub:', data);
    
    // 임시 반환값
    return true;
}

// ============================================
// 8. 초기화 함수
// ============================================

/**
 * 애플리케이션 초기화
 * 페이지 로드 시 실행되는 메인 초기화 함수
 */
function initApp() {
    console.log('=== Admin App Initialized ===');
    console.log('Initial State:', AppState);
    
    // 1. 메뉴 클릭 이벤트 바인딩
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            navigateTo(pageName);
        });
    });
    
    // 2. 초기 페이지 렌더링 (대시보드)
    renderDashboard();
    
    // 3. 전역 저장 버튼 이벤트 (추후 구현)
    const globalSaveBtn = document.querySelector('header .bg-blue-600');
    if (globalSaveBtn) {
        globalSaveBtn.addEventListener('click', () => {
            console.log('Global save clicked');
            showToast('저장 기능은 Phase 3-4에서 구현됩니다.', 'info');
        });
    }
    
    // 4. 키보드 단축키 설정 (선택사항)
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S: 저장
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            console.log('Save shortcut pressed');
            showToast('저장 단축키가 실행되었습니다.', 'info');
        }
        
        // ESC: 모달 닫기 (추후 구현)
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.remove();
            }
        }
    });
    
    console.log('=== Admin App Ready ===');
}

// ============================================
// 9. 앱 시작
// ============================================

/**
 * DOM이 완전히 로드된 후 앱 초기화 실행
 */
document.addEventListener('DOMContentLoaded', initApp);

// ============================================
// 10. 디버깅용 전역 객체 노출
// ============================================

/**
 * 개발자 도구 콘솔에서 사용할 수 있도록 전역 객체 노출
 * 
 * 사용 예시:
 * - AdminDebug.state : 현재 상태 확인
 * - AdminDebug.navigateTo('devices') : 페이지 이동
 * - AdminDebug.showToast('테스트', 'success') : 토스트 테스트
 */
window.AdminDebug = {
    state: AppState,
    navigateTo,
    showToast,
    setLoading,
    renderDashboard,
    renderDevicesBrands,
    renderDevicesModels,
    renderDeviceDetail,
    version: '1.0.0 - Phase 3-1'
};

console.log('💡 Tip: 콘솔에서 AdminDebug 객체를 사용해보세요!');
console.log('예시: AdminDebug.navigateTo("devices")');