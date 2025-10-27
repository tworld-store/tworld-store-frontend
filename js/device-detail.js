/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 기기 상세 페이지 로직
 * ═══════════════════════════════════════════════════
 * 
 * 용도: device-detail.html 페이지 동작 제어
 * 핵심: 옵션 선택 → 실시간 가격 계산 → 화면 업데이트
 */

class DeviceDetailPage {
    /**
     * 생성자
     */
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
            
            // 1. URL에서 기기ID 가져오기
            const deviceId = this._getDeviceIdFromUrl();
            if (!deviceId) {
                throw new Error('기기 ID가 없습니다');
            }
            
            // 2. 로딩 표시
            this._showLoading();
            
            // 3. 기기 데이터 로드
            await this._loadDeviceData(deviceId);
            
            // 4. UI 생성
            this._buildColorOptions();
            this._buildCapacityOptions();
            this._setDefaultSelections();
            
            // 5. 이벤트 리스너 등록
            this._registerEventListeners();
            
            // 6. 초기 가격 계산
            await this._updatePrice();
            
            // 7. 로딩 숨김
            this._hideLoading();
            
            console.log('✅ 페이지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 초기화 실패:', error);
            this._showError(error.message);
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * URL에서 기기 ID 가져오기
     * ───────────────────────────────────────────────
     */
    _getDeviceIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('device') || params.get('id');
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기기 데이터 로드
     * ───────────────────────────────────────────────
     */
    async _loadDeviceData(deviceId) {
        // API에서 전체 데이터 로드
        const data = await api.load();
        
        // 기기 찾기 (기본 기기 정보)
        const baseDevice = data.devices.find(d => 
            d.기기옵션ID.startsWith(deviceId) || d.기기옵션ID === deviceId
        );
        
        if (!baseDevice) {
            throw new Error('기기를 찾을 수 없습니다');
        }
        
        // 같은 모델의 모든 색상/용량 옵션 찾기
        const modelName = baseDevice.모델명;
        const allOptions = data.devices.filter(d => d.모델명 === modelName);
        
        this.currentDevice = {
            ...baseDevice,
            allOptions: allOptions
        };
        
        // 기본 정보 표시
        this._displayBasicInfo();
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기본 정보 표시
     * ───────────────────────────────────────────────
     */
    _displayBasicInfo() {
        const device = this.currentDevice;
        
        // 제목
        const titleEl = document.querySelector('h1');
        if (titleEl) {
            titleEl.textContent = device.모델명;
        }
        
        // 브랜드
        const brandEl = document.querySelector('.device-brand');
        if (brandEl) {
            brandEl.textContent = device.브랜드;
        }
        
        // 출고가
        const priceEl = document.getElementById('factory-price');
        if (priceEl) {
            priceEl.textContent = formatPrice(device.출고가);
        }
        
        // 메인 이미지
        const mainImageEl = document.getElementById('main-image');
        if (mainImageEl && device.이미지URL) {
            mainImageEl.src = device.이미지URL;
            mainImageEl.alt = device.모델명;
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
        
        // 중복 제거: 같은 색상은 한 번만 표시
        const colors = [...new Map(
            this.currentDevice.allOptions.map(opt => [opt.색상명, opt])
        ).values()];
        
        container.innerHTML = colors.map((option, index) => `
            <input type="radio" 
                   id="color-${index}" 
                   name="product_color" 
                   value="${option.색상명}"
                   class="color-radio"
                   ${index === 0 ? 'checked' : ''}>
            <label for="color-${index}" 
                   class="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center"
                   style="background-color: ${option.색상HEX};"
                   title="${option.색상명}">
                <span class="sr-only">${option.색상명}</span>
            </label>
        `).join('');
        
        // 첫 번째 색상 선택
        if (colors.length > 0) {
            this.currentColor = colors[0].색상명;
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
        
        // 중복 제거: 같은 용량은 한 번만 표시
        const capacities = [...new Set(
            this.currentDevice.allOptions.map(opt => opt.용량)
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
        
        // 첫 번째 용량 선택
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
        // 가입유형
        const joinTypeEl = document.querySelector(`input[name="type_subscription"][value="${this.defaults.joinType}"]`);
        if (joinTypeEl) joinTypeEl.checked = true;
        
        // 약정유형
        const discountTypeEl = document.querySelector(`input[name="type_discount"][value="${this.defaults.discountType}"]`);
        if (discountTypeEl) discountTypeEl.checked = true;
        
        // 할부개월
        const installmentEl = document.querySelector(`input[name="type_period"][value="${this.defaults.installmentMonths}"]`);
        if (installmentEl) installmentEl.checked = true;
        
        // 인터넷+TV
        const internetTvEl = document.querySelector(`input[name="type_other"][value="${this.defaults.internetTv}"]`);
        if (internetTvEl) internetTvEl.checked = true;
    }
    
    /**
     * ───────────────────────────────────────────────
     * ★ 이벤트 리스너 등록 ★
     * ───────────────────────────────────────────────
     */
    _registerEventListeners() {
        // 색상 변경
        document.querySelectorAll('input[name="product_color"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
                this._updatePrice();
            });
        });
        
        // 용량 변경
        document.querySelectorAll('input[name="type_capacity"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentCapacity = parseInt(e.target.value);
                this._updatePrice();
            });
        });
        
        // 가입유형 변경
        document.querySelectorAll('input[name="type_subscription"]').forEach(input => {
            input.addEventListener('change', () => {
                this._updatePrice();
            });
        });
        
        // 약정유형 변경
        document.querySelectorAll('input[name="type_discount"]').forEach(input => {
            input.addEventListener('change', () => {
                this._updatePrice();
            });
        });
        
        // 할부개월 변경
        document.querySelectorAll('input[name="type_period"]').forEach(input => {
            input.addEventListener('change', () => {
                this._updatePrice();
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
     * ★ 가격 업데이트 (핵심 함수) ★
     * ───────────────────────────────────────────────
     */
    async _updatePrice() {
        try {
            // 1. 현재 선택된 기기옵션ID 생성
            const deviceOptionId = this._getCurrentDeviceOptionId();
            if (!deviceOptionId) {
                console.warn('기기 옵션이 선택되지 않았습니다');
                return;
            }
            
            // 2. 요금제 선택 확인
            if (!this.currentPlan) {
                console.log('요금제가 선택되지 않았습니다');
                return;
            }
            
            // 3. 현재 선택값 가져오기
            const joinType = this._getSelectedValue('type_subscription');
            const discountType = this._getSelectedValue('type_discount');
            const installmentMonths = parseInt(this._getSelectedValue('type_period'));
            
            // 4. 가격 계산
            const result = await calculator.calculate(
                deviceOptionId,
                this.currentPlan.요금제ID,
                joinType,
                discountType,
                installmentMonths
            );
            
            // 5. 화면 업데이트
            this._displayPrice(result);
            
        } catch (error) {
            console.error('가격 계산 오류:', error);
            // 에러는 표시하지 않고 조용히 처리
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 현재 선택된 기기옵션ID 생성
     * ───────────────────────────────────────────────
     */
    _getCurrentDeviceOptionId() {
        if (!this.currentColor || !this.currentCapacity) {
            return null;
        }
        
        // allOptions에서 색상+용량에 맞는 옵션 찾기
        const option = this.currentDevice.allOptions.find(opt => 
            opt.색상명 === this.currentColor && opt.용량 === this.currentCapacity
        );
        
        return option ? option.기기옵션ID : null;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 선택된 라디오 버튼 값 가져오기
     * ───────────────────────────────────────────────
     */
    _getSelectedValue(name) {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : null;
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
        
        // 월 총 납부액 (데스크톱)
        this._updateElement('total-month-payment', formatPrice(result.월총납부액));
        
        // 모바일 하단바
        this._updateElement('mobile-phone-price', formatPrice(result.월할부금));
        this._updateElement('mobile-charge-price', formatPrice(result.월통신요금));
        this._updateElement('mobile-total-price', formatPrice(result.월총납부액));
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요소 업데이트 헬퍼
     * ───────────────────────────────────────────────
     */
    _updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    }
    
 /**
 * ───────────────────────────────────────────────
 * 요금제 선택 모달 열기
 * ───────────────────────────────────────────────
 */
    _openPlanModal() {
        if (window.plansModal) {
            window.plansModal.open();
        } else {
            alert('요금제 모달을 로드할 수 없습니다');
        }
    }
    /**
     * ───────────────────────────────────────────────
     * 상담 신청 처리
     * ───────────────────────────────────────────────
     */
    _handleConsult() {
        // 개인정보 동의 확인
        const consentEl = document.getElementById('personal_consent');
        if (consentEl && !consentEl.checked) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        
        // 필수 선택 확인
        if (!this.currentPlan) {
            alert('요금제를 먼저 선택해주세요.');
            return;
        }
        
        // 상담 페이지로 이동
        const params = this._buildOrderParams();
        window.location.href = `contact.html?${params.toString()}`;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 주문하기 처리
     * ───────────────────────────────────────────────
     */
    _handleOrder() {
        // 개인정보 동의 확인
        const consentEl = document.getElementById('personal_consent');
        if (consentEl && !consentEl.checked) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        
        // 필수 선택 확인
        if (!this.currentPlan) {
            alert('요금제를 먼저 선택해주세요.');
            return;
        }
        
        // 주문 페이지로 이동
        const params = this._buildOrderParams();
        window.location.href = `order.html?${params.toString()}`;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 주문 파라미터 생성
     * ───────────────────────────────────────────────
     */
    _buildOrderParams() {
        const params = new URLSearchParams();
        
        params.set('deviceId', this._getCurrentDeviceOptionId());
        params.set('planId', this.currentPlan.요금제ID);
        params.set('joinType', this._getSelectedValue('type_subscription'));
        params.set('discountType', this._getSelectedValue('type_discount'));
        params.set('installment', this._getSelectedValue('type_period'));
        params.set('internetTv', this._getSelectedValue('type_other'));
        
        return params;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 로딩 표시
     * ───────────────────────────────────────────────
     */
    _showLoading() {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="flex justify-center items-center min-h-screen">
                    <div class="text-center">
                        <div class="loading-spinner mb-4"></div>
                        <p class="text-gray-600">로딩 중...</p>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 로딩 숨김
     * ───────────────────────────────────────────────
     */
    _hideLoading() {
        // 실제 컨텐츠가 이미 HTML에 있으므로 별도 처리 불필요
    }
    
    /**
     * ───────────────────────────────────────────────
     * 에러 표시
     * ───────────────────────────────────────────────
     */
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
// 페이지 로드 시 자동 초기화
// ═══════════════════════════════════════════════════

let deviceDetailPage;

document.addEventListener('DOMContentLoaded', async () => {
    deviceDetailPage = new DeviceDetailPage();
    await deviceDetailPage.init();
});

// 전역 변수로 노출
if (typeof window !== 'undefined') {
    window.deviceDetailPage = deviceDetailPage;
    console.log('✅ 기기 상세 페이지 스크립트 로드 완료');
}