/**
 * ============================================
 * Plan Modal Module - plan-modal.js
 * ============================================
 * 
 * 요금제 선택 모달 팝업 독립 모듈
 * 
 * 사용법:
 * const planModal = new PlanModal(productsData.plans);
 * planModal.open();
 * planModal.onSelect((selectedPlan) => { ... });
 */

class PlanModal {
  /**
   * 생성자
   * @param {Array} plans - 요금제 데이터 배열
   * @param {Object} options - 옵션
   */
  constructor(plans = [], options = {}) {
    this.plans = plans;
    this.options = {
      modalId: 'plan-modal',
      onSelectCallback: null,
      ...options
    };
    
    this.selectedPlan = null;
    this.currentCategory = 'all';
    
    // 초기화
    this.init();
    
    console.log('✅ PlanModal 초기화 완료', {
      totalPlans: this.plans.length,
      categories: this.getCategories()
    });
  }
  
  /**
   * 초기화
   */
  init() {
    // 모달 DOM이 이미 존재하는지 확인
    this.modal = document.getElementById(this.options.modalId);
    
    if (!this.modal) {
      console.warn('⚠️ 모달 DOM을 찾을 수 없습니다. HTML에 모달 구조를 먼저 추가하세요.');
      return;
    }
    
    // DOM 요소 캐싱
    this.overlay = this.modal.querySelector('.plan-modal__overlay');
    this.closeBtn = this.modal.querySelector('.plan-modal__close');
    this.tabsContainer = this.modal.querySelector('.plan-modal__tabs');
    this.planList = this.modal.querySelector('.plan-list');
    this.selectedInfo = this.modal.querySelector('.plan-modal__selected-info');
    this.selectedName = this.modal.querySelector('.plan-modal__selected-name');
    this.selectedPrice = this.modal.querySelector('.plan-modal__selected-price');
    this.selectBtn = this.modal.querySelector('.plan-modal__select-btn');
    
    // 이벤트 리스너 등록
    this.attachEventListeners();
    
    // 초기 렌더링
    this.renderTabs();
    this.renderPlanList();
  }
  
  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners() {
    // 오버레이 클릭 시 닫기
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    
    // 닫기 버튼
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
    
    // 선택 버튼
    if (this.selectBtn) {
      this.selectBtn.addEventListener('click', () => this.confirmSelection());
    }
  }
  
  /**
   * 모달 열기
   */
  open() {
    if (!this.modal) {
      console.error('❌ 모달을 열 수 없습니다. 모달 DOM이 없습니다.');
      return;
    }
    
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    
    console.log('✅ 모달 열림');
  }
  
  /**
   * 모달 닫기
   */
  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    document.body.style.overflow = ''; // 스크롤 복원
    
    // 선택 초기화 (선택적)
    // this.selectedPlan = null;
    // this.updateSelectedInfo();
    
    console.log('✅ 모달 닫힘');
  }
  
  /**
   * 카테고리 추출
   */
  getCategories() {
    const categories = new Map();
    
    // '전체' 카테고리 추가
    categories.set('all', {
      id: 'all',
      name: '전체',
      icon: '📋'
    });
    
    // plans에서 카테고리 추출
    this.plans.forEach(plan => {
      if (plan.category && !categories.has(plan.category.id)) {
        categories.set(plan.category.id, plan.category);
      }
    });
    
    return Array.from(categories.values());
  }
  
  /**
   * 카테고리 탭 렌더링
   */
  renderTabs() {
    if (!this.tabsContainer) return;
    
    const categories = this.getCategories();
    
    this.tabsContainer.innerHTML = categories.map(cat => `
      <button 
        class="plan-tab ${cat.id === this.currentCategory ? 'active' : ''}" 
        data-category="${cat.id}"
      >
        <span class="plan-tab__icon">${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join('');
    
    // 탭 클릭 이벤트
    this.tabsContainer.querySelectorAll('.plan-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        this.switchCategory(category);
      });
    });
  }
  
  /**
   * 카테고리 전환
   */
  switchCategory(categoryId) {
    this.currentCategory = categoryId;
    
    // 탭 활성화 상태 변경
    this.tabsContainer.querySelectorAll('.plan-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === categoryId);
    });
    
    // 요금제 목록 다시 렌더링
    this.renderPlanList();
    
    console.log('✅ 카테고리 전환:', categoryId);
  }
  
  /**
   * 요금제 목록 필터링
   */
  getFilteredPlans() {
    if (this.currentCategory === 'all') {
      return this.plans;
    }
    
    return this.plans.filter(plan => 
      plan.category && plan.category.id === this.currentCategory
    );
  }
  
  /**
   * 요금제 목록 렌더링
   */
  renderPlanList() {
    if (!this.planList) return;
    
    const filteredPlans = this.getFilteredPlans();
    
    if (filteredPlans.length === 0) {
      this.planList.innerHTML = '';
      return;
    }
    
    this.planList.innerHTML = filteredPlans.map(plan => this.createPlanCardHTML(plan)).join('');
    
    // 카드 클릭 이벤트
    this.planList.querySelectorAll('.plan-card').forEach(card => {
      card.addEventListener('click', () => {
        const planId = card.dataset.planId;
        this.selectPlan(planId);
      });
    });
  }
  
  /**
   * 요금제 카드 HTML 생성
   */
  createPlanCardHTML(plan) {
    const isSelected = this.selectedPlan && this.selectedPlan.id === plan.id;
    
    return `
      <div 
        class="plan-card ${isSelected ? 'selected' : ''}" 
        data-plan-id="${plan.id}"
      >
        <div class="plan-card__left">
          <div class="plan-card__color" style="background: ${plan.color || '#3617CE'};"></div>
          <div class="plan-card__info">
            <div class="plan-card__header">
              ${plan.category ? `<span class="plan-card__category">${plan.category.icon} ${plan.category.name}</span>` : ''}
            </div>
            <div class="plan-card__name">${plan.name}</div>
            <div class="plan-card__desc">${plan.description || ''}</div>
            <div class="plan-card__specs">
              <span class="plan-card__spec">데이터 ${plan.data || '-'}</span>
              <span class="plan-card__spec">음성 ${plan.voice || '-'}</span>
              <span class="plan-card__spec">문자 ${plan.sms || '-'}</span>
            </div>
            ${plan.benefits && plan.benefits.length > 0 ? `
              <div class="plan-card__benefits">
                ${plan.benefits.map(benefit => `
                  <span class="plan-card__benefit">🎁 ${benefit}</span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="plan-card__right">
          <div class="plan-card__price">
            <div class="plan-card__amount">${plan.price.toLocaleString()}원</div>
            <div class="plan-card__period">/월</div>
          </div>
          <div class="plan-card__arrow">›</div>
        </div>
        <div class="plan-card__check">✓</div>
      </div>
    `;
  }
  
  /**
   * 요금제 선택
   */
  selectPlan(planId) {
    const plan = this.plans.find(p => p.id === planId);
    
    if (!plan) {
      console.error('❌ 요금제를 찾을 수 없습니다:', planId);
      return;
    }
    
    this.selectedPlan = plan;
    
    // UI 업데이트
    this.updateSelectedInfo();
    this.updateCardSelection();
    
    console.log('✅ 요금제 선택:', plan.name);
  }
  
  /**
   * 선택된 요금제 정보 업데이트
   */
  updateSelectedInfo() {
    if (!this.selectedInfo || !this.selectedName || !this.selectedPrice || !this.selectBtn) {
      return;
    }
    
    if (this.selectedPlan) {
      this.selectedInfo.classList.add('active');
      this.selectedName.textContent = this.selectedPlan.name;
      this.selectedPrice.textContent = this.selectedPlan.price.toLocaleString() + '원';
      this.selectBtn.disabled = false;
    } else {
      this.selectedInfo.classList.remove('active');
      this.selectBtn.disabled = true;
    }
  }
  
  /**
   * 카드 선택 상태 업데이트
   */
  updateCardSelection() {
    if (!this.planList) return;
    
    this.planList.querySelectorAll('.plan-card').forEach(card => {
      const isSelected = card.dataset.planId === this.selectedPlan?.id;
      card.classList.toggle('selected', isSelected);
    });
  }
  
  /**
   * 선택 확정
   */
  confirmSelection() {
    if (!this.selectedPlan) {
      console.warn('⚠️ 선택된 요금제가 없습니다.');
      return;
    }
    
    console.log('✅ 선택 확정:', this.selectedPlan.name);
    
    // 콜백 실행
    if (this.options.onSelectCallback) {
      this.options.onSelectCallback(this.selectedPlan);
    }
    
    // 모달 닫기
    this.close();
  }
  
  /**
   * 선택 콜백 등록
   */
  onSelect(callback) {
    this.options.onSelectCallback = callback;
  }
  
  /**
   * 요금제 데이터 업데이트
   */
  updatePlans(plans) {
    this.plans = plans;
    this.renderTabs();
    this.renderPlanList();
    
    console.log('✅ 요금제 데이터 업데이트:', plans.length);
  }
  
  /**
   * 선택된 요금제 초기화
   */
  clearSelection() {
    this.selectedPlan = null;
    this.updateSelectedInfo();
    this.updateCardSelection();
  }
  
  /**
   * 특정 요금제를 미리 선택
   */
  preselectPlan(planId) {
    this.selectPlan(planId);
  }
}

// ============================================
// 전역 Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlanModal;
}

// ============================================
// 초기화 로그
// ============================================

console.log('✅ PlanModal 모듈 로드 완료');
