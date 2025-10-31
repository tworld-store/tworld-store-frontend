/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 기기 상세 페이지 v3.0
 * ═══════════════════════════════════════════════════
 * 
 * ✅ 단계별 실시간 가격 반영
 * 1. 색상 선택 → 이미지만 변경
 * 2. 용량 선택 → 출고가 업데이트
 * 3. 요금제 선택 → 요금제 정보 + 통신요금
 * 4. 가입유형/할인방법/할부 → 전체 가격 계산
 */

class DeviceDetailPage {
    constructor() {
        // 현재 선택된 값들
        this.currentDevice = null;
        this.currentPlan = null;
        this.currentColor = null;
        this.currentCapacity = null;
        
        // 기본 선택값
        this.defaults = {
            joinType: '기기변경',
            discountType: 'phone',
            installmentMonths: 24,
            internetTv: 'none'
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * ★ 페이지 초기화 ★
     * ───────────────────────────────────────────────
     */
    async init() {
        try {
            console.log('📱 기기 상세 페이지 초기화 시작...');
            
            const modelName = this._getModelNameFromUrl();
            if (!modelName) {
                throw new Error('모델명이 없습니다');
            }
            
            this._showLoading();
            
            // ★ Calculator 초기화 (settings 로드) ★
            console.log('🔧 Calculator 초기화 중...');
            await calculator.init();
            console.log('✅ Calculator 초기화 완료');
            
            await this._loadDeviceData(modelName);
            
            this._buildColorOptions();
            this._buildCapacityOptions();
            this._setDefaultSelections();
            this._registerEventListeners();
            
            // ✅ 초기 출고가 표시
            this._updateFactoryPrice();
            
            this._hideLoading();
            
            console.log('✅ 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 초기화 실패:', error);
            this._hideLoading();
            this._showError(error.message);
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * URL에서 모델명 가져오기
     * ───────────────────────────────────────────────
     */
    _getModelNameFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('device');
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기기 데이터 로드
     * ───────────────────────────────────────────────
     */
    async _loadDeviceData(modelName) {
        const data = await api.load();
        const allOptions = data.devices.filter(d => d.model === modelName);
        
        if (allOptions.length === 0) {
            throw new Error(`기기를 찾을 수 없습니다: ${modelName}`);
        }
        
        this.currentDevice = {
            ...allOptions[0],
            allOptions: allOptions
        };
        
        console.log(`✅ 기기 로드 완료: ${allOptions.length}개 옵션`);
        
        this._displayBasicInfo();
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기본 정보 표시
     * ───────────────────────────────────────────────
     */
    _displayBasicInfo() {
        const device = this.currentDevice;
        
        const titleEl = document.getElementById('device-model');
        if (titleEl) titleEl.textContent = device.model;
        
        const brandEl = document.getElementById('device-brand');
        if (brandEl) brandEl.textContent = device.brand;
        
        const mainImageEl = document.getElementById('main-image');
        if (mainImageEl && device.image) {
            mainImageEl.src = device.image;
            mainImageEl.alt = device.model;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 색상 옵션 UI 생성
     * ───────────────────────────────────────────────
     */
    _buildColorOptions() {
        const container = document.getElementById('color-options');
        if (!container) return;
        
        const colors = [...new Map(
            this.currentDevice.allOptions.map(opt => [opt.color.name, opt])
        ).values()];
        
        container.innerHTML = colors.map((option, index) => `
            <input type="radio" 
                   id="color-${index}" 
                   name="product_color" 
                   value="${option.color.name}"
                   class="color-radio"
                   ${index === 0 ? 'checked' : ''}>
            <label for="color-${index}" 
                   class="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center"
                   style="background-color: ${option.color.hex};"
                   title="${option.color.name}">
                <span class="sr-only">${option.color.name}</span>
            </label>
        `).join('');
        
        if (colors.length > 0) {
            this.currentColor = colors[0].color.name;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 용량 옵션 UI 생성
     * ───────────────────────────────────────────────
     */
    _buildCapacityOptions() {
        const container = document.getElementById('capacity-options');
        if (!container) return;
        
        const capacities = [...new Set(
            this.currentDevice.allOptions.map(opt => opt.storage)
        )].sort((a, b) => a - b);
        
        container.innerHTML = capacities.map((capacity, index) => `
            <input type="radio" 
                   id="capacity-${capacity}" 
                   name="type_capacity" 
                   value="${capacity}"
                   class="option-radio"
                   ${index === 0 ? 'checked' : ''}>
            <label for="capacity-${capacity}" 
                   class="px-6 py-3 rounded-lg text-center">
                ${capacity}GB
            </label>
        `).join('');
        
        if (capacities.length > 0) {
            this.currentCapacity = capacities[0];
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기본 선택값 설정
     * ───────────────────────────────────────────────
     */
    _setDefaultSelections() {
        const joinTypeEl = document.querySelector(`input[name="type_subscription"][value="${this.defaults.joinType}"]`);
        if (joinTypeEl) joinTypeEl.checked = true;
        
        const discountTypeEl = document.querySelector(`input[name="type_discount"][value="${this.defaults.discountType}"]`);
        if (discountTypeEl) discountTypeEl.checked = true;
        
        const installmentEl = document.querySelector(`input[name="type_period"][value="${this.defaults.installmentMonths}"]`);
        if (installmentEl) installmentEl.checked = true;
        
        const internetTvEl = document.querySelector(`input[name="type_other"][value="${this.defaults.internetTv}"]`);
        if (internetTvEl) internetTvEl.checked = true;
    }
    
    /**
     * ───────────────────────────────────────────────
     * ★ 이벤트 리스너 등록 ★
     * ───────────────────────────────────────────────
     */
    _registerEventListeners() {
        // 1. 색상 변경 → 이미지만 변경
        document.querySelectorAll('input[name="product_color"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
                this._updateImage();
                console.log('✅ 색상 변경:', this.currentColor);
            });
        });
        
        // 2. 용량 변경 → 출고가 + 가격 재계산
        document.querySelectorAll('input[name="type_capacity"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentCapacity = parseInt(e.target.value);
                console.log('✅ 용량 변경:', this.currentCapacity);
                this._updateFactoryPrice();
                this._updatePriceIfReady();
            });
        });
        
        // 3. 가입유형 변경 → 가격 재계산
        document.querySelectorAll('input[name="type_subscription"]').forEach(input => {
            input.addEventListener('change', () => {
                console.log('✅ 가입유형 변경');
                this._updatePriceIfReady();
            });
        });
        
        // 4. 할인방법 변경 → 가격 재계산
        document.querySelectorAll('input[name="type_discount"]').forEach(input => {
            input.addEventListener('change', () => {
                console.log('✅ 할인방법 변경');
                this._updatePriceIfReady();
            });
        });
        
        // 5. 할부기간 변경 → 가격 재계산
        document.querySelectorAll('input[name="type_period"]').forEach(input => {
            input.addEventListener('change', () => {
                console.log('✅ 할부기간 변경');
                this._updatePriceIfReady();
            });
        });
        
        // 요금제 선택 버튼
        const planSelectBtn = document.getElementById('btn-select-plan');
        if (planSelectBtn) {
            planSelectBtn.addEventListener('click', () => {
                this._openPlanModal();
            });
        }
        
        // 상담 신청 버튼
        const consultBtn = document.getElementById('btn-consult');
        if (consultBtn) {
            consultBtn.addEventListener('click', () => {
                this._handleConsult();
            });
        }
        
        // 주문하기 버튼
        const orderBtn = document.getElementById('btn-order');
        if (orderBtn) {
            orderBtn.addEventListener('click', () => {
                this._handleOrder();
            });
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * ✅ 1단계: 이미지 업데이트 (색상 변경 시)
     * ───────────────────────────────────────────────
     */
    _updateImage() {
        const option = this.currentDevice.allOptions.find(opt => 
            opt.color.name === this.currentColor && opt.storage === this.currentCapacity
        );
        
        if (option && option.image) {
            const mainImageEl = document.getElementById('main-image');
            if (mainImageEl) {
                mainImageEl.src = option.image;
            }
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * ✅ 2단계: 출고가 업데이트 (용량 변경 시)
     * ───────────────────────────────────────────────
     */
    _updateFactoryPrice() {
        if (!this.currentCapacity) return;
        
        const option = this.currentDevice.allOptions.find(opt => 
            opt.storage === this.currentCapacity
        );
        
        if (option) {
            const priceEl = document.getElementById('factory-price');
            if (priceEl) {
                priceEl.textContent = formatPrice(option.price);
                console.log('✅ 출고가 업데이트:', option.price);
            }
            
            // display-factory-price도 업데이트
            const displayPriceEl = document.getElementById('display-factory-price');
            if (displayPriceEl) {
                displayPriceEl.textContent = formatPrice(option.price);
            }
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * ✅ 3단계: 요금제 표시 업데이트 (요금제 선택 시 - plans-modal에서 호출)
     * ───────────────────────────────────────────────
     */
    updatePlanDisplay(plan) {
        console.log('✅ 요금제 표시 업데이트:', plan);
        
        this.currentPlan = plan;   
        // 선택된 요금제 정보 박스 보이기
        const infoDiv = document.getElementById('selected-plan-info');
        if (infoDiv) {
            infoDiv.classList.remove('hidden');
        }
        
        // 요금제명 표시
        const planNameEl = document.getElementById('selected-plan-name');
        if (planNameEl) {
            planNameEl.textContent = plan.name;
        }
        
        // 요금제 가격 표시
        const planPriceEl = document.getElementById('selected-plan-price');
        if (planPriceEl) {
            planPriceEl.textContent = formatPrice(plan.price) + '/월';
        }
        
        // 요금제 기본료 표시
        const displayPlanPriceEl = document.getElementById('display-plan-price');
        if (displayPlanPriceEl) {
            displayPlanPriceEl.textContent = formatPrice(plan.price);
        }
        
        // 가격 재계산
        this._updatePriceIfReady();
    }
    
    /**
     * ───────────────────────────────────────────────
     * ✅ 4단계: 조건 확인 후 전체 가격 계산
     * ───────────────────────────────────────────────
     */
    async _updatePriceIfReady() {
        try {
            // 필수 조건 확인
            if (!this.currentCapacity) {
                console.log('⏸️ 용량이 선택되지 않음');
                return;
            }
            
            if (!this.currentPlan) {
                console.log('⏸️ 요금제가 선택되지 않음');
                return;
            }
            
            // 기기옵션ID 생성
            const deviceOptionId = `${this.currentDevice.model}_${this.currentCapacity}GB`;
            
            // 현재 선택값 가져오기
            const joinType = this._getSelectedValue('type_subscription');
            const discountType = this._getSelectedValue('type_discount');
            const installmentMonths = parseInt(this._getSelectedValue('type_period'));
            
            console.log('💰 가격 계산 시작:', {
                deviceOptionId,
                planId: this.currentPlan.id,
                joinType,
                discountType,
                installmentMonths
            });
            
            // 가격 계산
            const result = await calculator.calculate(
                deviceOptionId,
                this.currentPlan.id,
                joinType,
                discountType,
                installmentMonths
            );
            
            console.log('✅ 가격 계산 완료:', result);
            
            // 화면 업데이트
            this._displayPrice(result);
            
        } catch (error) {
            console.error('❌ 가격 계산 오류:', error);
            // 에러 메시지를 사용자에게 표시하지 않음 (선택 중이므로)
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * ★ 가격 화면 표시 ★
     * ───────────────────────────────────────────────
     */
    _displayPrice(result) {
        // 출고가
        this._updateElement('display-factory-price', formatPrice(result.출고가));
        
        // ★ 공통지원금 행 표시/숨김 ★
        const commonSubsidyRow = document.getElementById('common-subsidy-row');
        if (commonSubsidyRow) {
            if (result.display.공통지원금표시) {
                commonSubsidyRow.style.display = 'flex';
                this._updateElement('display-common-subsidy', formatPrice(-result.display.공통지원금));
            } else {
                commonSubsidyRow.style.display = 'none';
            }
        }
        
        // 추가지원금
        this._updateElement('display-additional-subsidy', formatPrice(-result.display.추가지원금));
        
        // 할부원금
        this._updateElement('display-installment-principal', formatPrice(result.할부원금));
        
        // 월 휴대폰 요금
        this._updateElement('phone-month-total', formatPrice(result.월할부금));
        
        // 요금제 기본료
        this._updateElement('display-plan-price', formatPrice(result.요금제기본료));
        
        // 요금할인
        this._updateElement('display-plan-discount', formatPrice(-result.요금할인));
        
        // 월 통신요금
        this._updateElement('charge-month-total', formatPrice(result.월통신요금));
        
        // 월 총 납부액
        this._updateElement('total-month-payment', formatPrice(result.월총납부액));
        
        // 모바일 하단바
        this._updateElement('mobile-phone-price', formatPrice(result.월할부금));
        this._updateElement('mobile-charge-price', formatPrice(result.월통신요금));
        this._updateElement('mobile-total-price', formatPrice(result.월총납부액));
        
        console.log('✅ 가격 화면 업데이트 완료');
    }
    
    /**
     * ───────────────────────────────────────────────
     * 헬퍼 함수들
     * ───────────────────────────────────────────────
     */
    
    _getSelectedValue(name) {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : null;
    }
    
    _updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    }
    
    _openPlanModal() {
        if (window.plansModal) {
            window.plansModal.open();
        } else {
            alert('요금제 모달을 로드할 수 없습니다');
        }
    }
    
    _handleConsult() {
        const consentEl = document.getElementById('personal_consent');
        if (consentEl && !consentEl.checked) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        
        if (!this.currentPlan) {
            alert('요금제를 먼저 선택해주세요.');
            return;
        }
        
        const params = this._buildOrderParams();
        window.location.href = `contact.html?${params.toString()}`;
    }
    
    _handleOrder() {
        const consentEl = document.getElementById('personal_consent');
        if (consentEl && !consentEl.checked) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        
        if (!this.currentPlan) {
            alert('요금제를 먼저 선택해주세요.');
            return;
        }
        
        const params = this._buildOrderParams();
        window.location.href = `order.html?${params.toString()}`;
    }
    
    _buildOrderParams() {
        const params = new URLSearchParams();
        params.set('model', this.currentDevice.model);
        params.set('color', this.currentColor);
        params.set('capacity', this.currentCapacity);
        params.set('deviceOptionId', `${this.currentDevice.model}_${this.currentCapacity}GB`);
        params.set('planId', this.currentPlan.id);
        params.set('joinType', this._getSelectedValue('type_subscription'));
        params.set('discountType', this._getSelectedValue('type_discount'));
        params.set('installment', this._getSelectedValue('type_period'));
        params.set('internetTv', this._getSelectedValue('type_other'));
        return params;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 로딩 오버레이
     * ───────────────────────────────────────────────
     */
    
    _showLoading() {
        const existing = document.getElementById('loading-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3;
                    border-top: 4px solid #0066ff; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #666; font-size: 16px;">로딩 중...</p>
            </div>
        `;
        
        if (!document.getElementById('loading-animation-style')) {
            const style = document.createElement('style');
            style.id = 'loading-animation-style';
            style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
    }
    
    _hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.remove();
    }
    
    _showError(message) {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="flex justify-center items-center min-h-screen">
                    <div class="text-center">
                        <p class="text-red-500 text-xl mb-4">❌ ${message}</p>
                        <button onclick="window.history.back()" 
                                class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                            돌아가기
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// ═══════════════════════════════════════════════════
// 즉시 초기화
// ═══════════════════════════════════════════════════

const deviceDetailPage = new DeviceDetailPage();

if (typeof window !== 'undefined') {
    window.deviceDetailPage = deviceDetailPage;
    window.DeviceDetailPage = DeviceDetailPage;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('📱 DOMContentLoaded 이벤트에서 초기화');
        await deviceDetailPage.init();
    });
} else {
    console.log('📱 DOM이 이미 로드됨, 즉시 초기화');
    deviceDetailPage.init();
}

console.log('✅ 기기 상세 페이지 v3.0 스크립트 로드 완료 (단계별 실시간 가격 반영)');