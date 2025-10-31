/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 가격 계산 엔진 v3.0
 * ═══════════════════════════════════════════════════
 * 
 * 개선사항 (v2.0 → v3.0):
 * - settings 동적 로드 (하드코딩 제거)
 * - 초기화 필수 (init() 호출 필요)
 * - 에러 처리 강화
 * 
 * 작성일: 2025-10-31
 * 버전: 3.0.0
 */

/**
 * ───────────────────────────────────────────────
 * Calculator 클래스
 * ───────────────────────────────────────────────
 */
class Calculator {
    constructor() {
        // 설정 (init()에서 로드)
        this.config = null;
        
        // 초기화 상태
        this.initialized = false;
        
        console.log('📐 Calculator 인스턴스 생성');
    }
    
    /**
     * ───────────────────────────────────────────────
     * 초기화 (settings 로드) ★ 필수
     * ───────────────────────────────────────────────
     * 
     * ⚠️ 중요: calculate() 호출 전에 반드시 실행해야 함
     * 
     * 사용 예시:
     * await calculator.init();
     * const result = calculator.calculate(...);
     */
    async init() {
        // 이미 초기화되었으면 스킵
        if (this.initialized) {
            console.log('✅ Calculator 이미 초기화됨');
            return;
        }
        
        console.log('🔄 Calculator 초기화 중...');
        
        try {
            // api.js의 getSettings() 사용
            const settings = await api.getSettings();
            
            // 설정값 파싱 및 검증
            this.config = {
                // 할부 이자율 (0.059 → 5.9%)
                interestRate: this._parseFloat(settings.할부이자율, 0.059) * 100,
                
                // 반올림 단위 (10원 단위)
                roundUnit: this._parseInt(settings.반올림단위, 10),
                
                // 선택약정 요금 할인율 (0.25 → 25%)
                selectPlanDiscountRate: this._parseFloat(settings.선약할인율, 0.25),
                
                // 할부 개월 옵션 [0, 12, 24, 36]
                installmentOptions: settings.할부개월옵션 || [0, 12, 24, 36],
                
                // 기타 설정
                siteName: settings.사이트명 || '티월드스토어',
                contactPhone: settings.상담전화 || '1588-0011'
            };
            
            // 초기화 완료 플래그
            this.initialized = true;
            
            console.log('✅ Calculator 초기화 완료:', this.config);
            
        } catch (error) {
            console.error('❌ Calculator 초기화 실패:', error);
            throw new Error('Calculator 초기화 실패. settings를 로드할 수 없습니다.');
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 전체 가격 계산 (통합)
     * ───────────────────────────────────────────────
     * 
     * @param {object} device - 기기 정보
     * @param {object} plan - 요금제 정보
     * @param {object} subsidy - 지원금 정보
     * @param {object} options - 계산 옵션
     * @returns {object} 계산 결과
     * 
     * options:
     * - discountType: 'subsidy' (지원금약정) | 'select' (선택약정)
     * - installmentMonths: 0 | 12 | 24 | 36
     * - internetTv: 'none' | 'internet' | 'both'
     */
    calculate(device, plan, subsidy, options = {}) {
        // 초기화 체크
        if (!this.initialized) {
            throw new Error('Calculator가 초기화되지 않았습니다. init()를 먼저 호출하세요.');
        }
        
        // 기본 옵션
        const {
            discountType = 'subsidy',
            installmentMonths = 24,
            internetTv = 'none'
        } = options;
        
        // 1. 출고가
        const releasePrice = device.price || device.출고가;
        
        // 2. 지원금 계산 (약정 타입별)
        let totalSubsidy = 0;
        let subsidyBreakdown = {};
        
        if (discountType === 'subsidy') {
            // 지원금약정: 공통 + 추가
            const common = subsidy.common || subsidy.공통지원금 || 0;
            const additional = subsidy.additional || subsidy.추가지원금 || 0;
            
            subsidyBreakdown = {
                common: common,
                extra: additional,
                select: 0
            };
            totalSubsidy = common + additional;
            
        } else {
            // 선택약정: 선약지원금만
            const select = subsidy.select || subsidy.선약지원금 || 0;
            
            subsidyBreakdown = {
                common: 0,
                extra: 0,
                select: select
            };
            totalSubsidy = select;
        }
        
        // 3. 할부원금
        const installmentPrincipal = releasePrice - totalSubsidy;
        
        // 4. 월 할부금 계산 (이자 포함)
        let monthlyInstallment = 0;
        
        if (installmentMonths === 0) {
            // 일시불
            monthlyInstallment = 0;
        } else {
            monthlyInstallment = this._calculateInstallment(
                installmentPrincipal,
                installmentMonths,
                this.config.interestRate,
                this.config.roundUnit
            );
        }
        
        // 5. 요금제 기본료
        const basePlanFee = plan.price || plan.기본요금;
        
        // 6. 요금 할인 계산
        let planDiscount = 0;
        
        if (discountType === 'select') {
            // 선택약정: 통신요금 25% 할인
            planDiscount = Math.floor(
                basePlanFee * this.config.selectPlanDiscountRate
            );
        }
        
        // 7. 결합 할인 계산
        const bundleDiscount = this._calculateBundleDiscount(basePlanFee, internetTv);
        
        // 8. 월 통신요금
        const monthlyPlanFee = basePlanFee - planDiscount - bundleDiscount;
        
        // 9. 월 총 납부액
        const monthlyTotal = monthlyInstallment + monthlyPlanFee;
        
        // 결과 반환
        return {
            // 기기 관련
            releasePrice: releasePrice,
            subsidy: {
                total: totalSubsidy,
                breakdown: subsidyBreakdown
            },
            installmentPrincipal: installmentPrincipal,
            installmentMonths: installmentMonths,
            monthlyInstallment: this._roundPrice(monthlyInstallment, this.config.roundUnit),
            
            // 요금제 관련
            basePlanFee: basePlanFee,
            planDiscount: planDiscount,
            bundleDiscount: bundleDiscount,
            monthlyPlanFee: monthlyPlanFee,
            
            // 합계
            monthlyTotal: this._roundPrice(monthlyTotal, this.config.roundUnit),
            
            // 옵션 정보
            options: {
                discountType: discountType,
                installmentMonths: installmentMonths,
                internetTv: internetTv
            }
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 할부금 계산 (이자 포함)
     * ───────────────────────────────────────────────
     * @private
     */
    _calculateInstallment(principal, months, interestRate, roundUnit) {
        // 월 이자율
        const monthlyRate = (interestRate / 100) / 12;
        
        // 원리금균등상환 공식
        const multiplier = Math.pow(1 + monthlyRate, months);
        const monthlyPayment = principal * (monthlyRate * multiplier) / (multiplier - 1);
        
        // 반올림
        return this._roundPrice(monthlyPayment, roundUnit);
    }
    
    /**
     * ───────────────────────────────────────────────
     * 결합 할인 계산
     * ───────────────────────────────────────────────
     * @private
     */
    _calculateBundleDiscount(baseFee, internetTv) {
        if (internetTv === 'internet') {
            return 5000;  // 인터넷 -5,000원
        } else if (internetTv === 'both') {
            return 10000;  // 인터넷+TV -10,000원
        }
        return 0;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 가격 반올림 (설정 단위)
     * ───────────────────────────────────────────────
     * @private
     */
    _roundPrice(price, roundUnit) {
        return Math.round(price / roundUnit) * roundUnit;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 안전한 정수 파싱
     * ───────────────────────────────────────────────
     * @private
     */
    _parseInt(value, defaultValue) {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        
        const num = parseInt(String(value), 10);
        return isNaN(num) ? defaultValue : num;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 안전한 실수 파싱
     * ───────────────────────────────────────────────
     * @private
     */
    _parseFloat(value, defaultValue) {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        
        const num = parseFloat(String(value));
        return isNaN(num) ? defaultValue : num;
    }
}

/**
 * ═══════════════════════════════════════════════════
 * 전역 인스턴스
 * ═══════════════════════════════════════════════════
 */
const calculator = new Calculator();

/**
 * ═══════════════════════════════════════════════════
 * 유틸리티 함수 (기존 유지)
 * ═══════════════════════════════════════════════════
 */

/**
 * 가격 포맷팅 (예: 1234567 → "1,234,567원")
 */
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0원';
    }
    
    return price.toLocaleString('ko-KR') + '원';
}

/**
 * 월 납부액 포맷팅 (예: 135590 → "135,590원/월")
 */
function formatMonthly(price) {
    return formatPrice(price) + '/월';
}

/**
 * 할인 포맷팅 (예: -5000 → "-5,000원")
 */
function formatDiscount(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
        return '-0원';
    }
    
    const formatted = Math.abs(amount).toLocaleString('ko-KR');
    return `-${formatted}원`;
}

/**
 * 약정 타입 이름 변환
 */
function getDiscountTypeName(discountType) {
    return discountType === 'subsidy' ? '지원금약정' : '선택약정';
}

/**
 * 할부 개월 표시 (0 → "일시불", 24 → "24개월")
 */
function formatInstallmentMonths(months) {
    return months === 0 ? '일시불' : `${months}개월`;
}

/**
 * ═══════════════════════════════════════════════════
 * 사용 방법
 * ═══════════════════════════════════════════════════
 * 
 * // 1. 페이지 로드 시 초기화 (반드시 필요!)
 * document.addEventListener('DOMContentLoaded', async () => {
 *     try {
 *         // Calculator 초기화
 *         await calculator.init();
 *         
 *         // API 데이터 로드
 *         await api.loadProducts();
 *         
 *         // 페이지 렌더링
 *         renderPage();
 *     } catch (error) {
 *         console.error('초기화 실패:', error);
 *     }
 * });
 * 
 * // 2. 가격 계산
 * const result = calculator.calculate(device, plan, subsidy, {
 *     discountType: 'subsidy',
 *     installmentMonths: 24,
 *     internetTv: 'none'
 * });
 * 
 * // 3. 결과 표시
 * console.log('월 총 납부액:', formatMonthly(result.monthlyTotal));
 * 
 * ═══════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════
 * v2.0 → v3.0 마이그레이션 가이드
 * ═══════════════════════════════════════════════════
 * 
 * 변경사항:
 * 
 * 1. CALCULATOR_CONFIG 제거
 *    ❌ v2.0: const CALCULATOR_CONFIG = { ... };
 *    ✅ v3.0: settings에서 자동 로드
 * 
 * 2. 초기화 필수
 *    ❌ v2.0: calculatePrice(...) 바로 호출
 *    ✅ v3.0: await calculator.init() 먼저 호출
 * 
 * 3. 함수 호출 방식
 *    ❌ v2.0: calculatePrice(device, plan, subsidy, options)
 *    ✅ v3.0: calculator.calculate(device, plan, subsidy, options)
 * 
 * 4. 데이터 필드명 호환
 *    v2.0 (한글): 출고가, 공통지원금, 기본요금
 *    v3.0 (영어): price, common, price
 *    → 둘 다 지원 (자동 변환)
 * 
 * 예시:
 * 
 * // v2.0 (기존)
 * const result = calculatePrice(device, plan, subsidy, {
 *     discountType: 'subsidy',
 *     installmentMonths: 24
 * });
 * 
 * // v3.0 (신규)
 * await calculator.init();  // ← 추가 필요
 * const result = calculator.calculate(device, plan, subsidy, {
 *     discountType: 'subsidy',
 *     installmentMonths: 24
 * });
 * 
 * ═══════════════════════════════════════════════════
 */