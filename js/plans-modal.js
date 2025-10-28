/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 요금제 선택 모달
 * ═══════════════════════════════════════════════════
 * 영문 필드명 버전
 */

class PlansModal {
    constructor() {
        this.modal = null;
        this.plansList = null;
        this.allPlans = [];
        this.selectedPlan = null;
        this.currentCategory = 'all';
    }
    
    /**
     * ───────────────────────────────────────────────
     * 초기화
     * ───────────────────────────────────────────────
     */
    init() {
        this.modal = document.getElementById('plans-modal');
        this.plansList = document.getElementById('plans-list');
        
        if (!this.modal || !this.plansList) {
            console.error('❌ 모달 요소를 찾을 수 없습니다');
            return;
        }
        
        // 카테고리 버튼 이벤트
        document.querySelectorAll('.plan-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this._handleCategoryChange(e.target);
            });
        });
        
        // 모달 외부 클릭 시 닫기
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        console.log('✅ 요금제 모달 초기화 완료');
    }
    
    /**
     * ───────────────────────────────────────────────
     * 모달 열기
     * ───────────────────────────────────────────────
     */
    async open() {
        try {
            // 모달 표시
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 요금제 데이터 로드
            await this._loadPlans();
            
            // 요금제 목록 표시
            this._displayPlans();
            
        } catch (error) {
            console.error('❌ 요금제 로드 실패:', error);
            this.plansList.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500 mb-4">요금제를 불러올 수 없습니다</p>
                    <p class="text-sm text-gray-600 mb-4">${error.message}</p>
                    <button onclick="plansModal.close()" class="text-blue-600">닫기</button>
                </div>
            `;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 모달 닫기
     * ───────────────────────────────────────────────
     */
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 데이터 로드 ✅ 영문 필드명
     * ───────────────────────────────────────────────
     */
    async _loadPlans() {
        if (this.allPlans.length > 0) {
            return; // 이미 로드됨
        }
        
        const data = await api.load();
        
        // ✅ 영문 필드명 사용
        this.allPlans = data.plans || [];
        
        console.log(`✅ 요금제 ${this.allPlans.length}개 로드 완료`);
        
        if (this.allPlans.length === 0) {
            throw new Error('요금제 데이터가 없습니다');
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 카테고리 변경
     * ───────────────────────────────────────────────
     */
    _handleCategoryChange(btn) {
        // 활성화 상태 변경
        document.querySelectorAll('.plan-category-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // 카테고리 저장
        this.currentCategory = btn.dataset.category;
        
        console.log('📂 카테고리 변경:', this.currentCategory);
        
        // 요금제 목록 업데이트
        this._displayPlans();
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 목록 표시 ✅ 영문 필드명
     * ───────────────────────────────────────────────
     */
    _displayPlans() {
        // 카테고리 필터링
        let filteredPlans = this.allPlans;
        
        if (this.currentCategory !== 'all') {
            // ✅ 영문 필드명: category.id 또는 category.name 사용
            filteredPlans = this.allPlans.filter(plan => {
                // category 객체가 있는 경우
                if (plan.category) {
                    return plan.category.id === this.currentCategory || 
                           plan.category.name === this.currentCategory;
                }
                return false;
            });
        }
        
        console.log(`📊 필터링된 요금제: ${filteredPlans.length}개 (카테고리: ${this.currentCategory})`);
        
        // 요금제 없음
        if (filteredPlans.length === 0) {
            this.plansList.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-500">해당 카테고리의 요금제가 없습니다</p>
                </div>
            `;
            return;
        }
        
        // 요금제 카드 생성
        this.plansList.innerHTML = filteredPlans.map(plan => this._createPlanCard(plan)).join('');
        
        // 카드 클릭 이벤트
        this.plansList.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                const planId = card.dataset.planId;
                this._selectPlan(planId);
            });
        });
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 카드 HTML 생성 ✅ 영문 필드명
     * ───────────────────────────────────────────────
     */
    _createPlanCard(plan) {
        // ✅ 영문 필드명 사용
        const isSelected = this.selectedPlan?.id === plan.id;
        
        // 카테고리 정보 추출
        const categoryName = plan.category?.name || '요금제';
        const categoryIcon = plan.category?.icon || '📱';
        const categoryColor = plan.category?.color || '#e5e7eb';
        
        return `
            <div class="plan-card ${isSelected ? 'selected' : ''}" 
                 data-plan-id="${plan.id}">
                <!-- 카테고리 뱃지 -->
                <div class="flex items-center justify-between mb-3">
                    <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                          style="background: ${categoryColor}; color: white;">
                        ${categoryIcon} ${categoryName}
                    </span>
                    ${isSelected ? '<span class="text-blue-600 font-bold">✓ 선택됨</span>' : ''}
                </div>
                
                <!-- 요금제명 -->
                <h3 class="text-xl font-bold mb-2">${plan.name}</h3>
                
                <!-- 간단 설명 -->
                ${plan.description ? `<p class="text-gray-600 text-sm mb-4">${plan.description}</p>` : ''}
                
                <!-- 가격 -->
                <div class="flex items-baseline space-x-2 mb-4">
                    <span class="text-3xl font-bold text-blue-600">${formatPrice(plan.price)}</span>
                    <span class="text-gray-500">/월</span>
                </div>
                
                <!-- 주요 혜택 -->
                ${this._createBenefitsHtml(plan)}
                
                <!-- 선택 버튼 -->
                <button class="w-full mt-4 py-3 rounded-lg font-bold transition
                               ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                    ${isSelected ? '선택됨' : '이 요금제 선택'}
                </button>
            </div>
        `;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 주요 혜택 HTML 생성 ✅ 영문 필드명
     * ───────────────────────────────────────────────
     */
    _createBenefitsHtml(plan) {
        // ✅ 영문 필드명: benefits 배열 사용
        const benefits = plan.benefits || [];
        
        if (benefits.length === 0) return '';
        
        return `
            <div class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-xs text-gray-500 mb-2">주요 혜택</p>
                <ul class="space-y-1">
                    ${benefits.map(benefit => `
                        <li class="text-sm text-gray-700">• ${benefit}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 선택 ✅ 영문 필드명
     * ───────────────────────────────────────────────
     */
    _selectPlan(planId) {
        // ✅ 영문 필드명 사용
        const plan = this.allPlans.find(p => p.id === planId);
        
        if (!plan) {
            console.error('❌ 요금제를 찾을 수 없습니다:', planId);
            return;
        }
        
        this.selectedPlan = plan;
        
        console.log('✅ 요금제 선택:', plan.name);
        
        // device-detail 페이지에 전달
        if (window.deviceDetailPage) {
            window.deviceDetailPage.currentPlan = plan;
            
            // 선택된 요금제 표시 업데이트
            const planNameEl = document.getElementById('selected-plan-name');
            const planPriceEl = document.getElementById('selected-plan-price');
            
            if (planNameEl) {
                planNameEl.textContent = plan.name;
            }
            
            if (planPriceEl) {
                planPriceEl.textContent = formatPrice(plan.price) + '/월';
            }
            
            // 가격 재계산
            window.deviceDetailPage._updatePrice();
        }
        
        // 모달 닫기
        this.close();
        
        // 성공 메시지
        if (typeof showToast === 'function') {
            showToast(`${plan.name} 요금제가 선택되었습니다`);
        }
    }
}

// ═══════════════════════════════════════════════════
// 전역 인스턴스 생성
// ═══════════════════════════════════════════════════

const plansModal = new PlansModal();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    plansModal.init();
});

// 전역 함수로 노출 (HTML에서 호출용)
function openPlanModal() {
    plansModal.open();
}

function closePlanModal() {
    plansModal.close();
}

if (typeof window !== 'undefined') {
    window.plansModal = plansModal;
    window.openPlanModal = openPlanModal;
    window.closePlanModal = closePlanModal;
    console.log('✅ 요금제 모달 스크립트 로드 완료 (영문 필드명)');
}