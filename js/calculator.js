/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 가격 계산 엔진 v2.0
 * ═══════════════════════════════════════════════════
 * 
 * 기능:
 * 1. 지원금약정 / 선택약정 계산
 * 2. 할부 이자 계산
 * 3. 실시간 가격 업데이트
 */

/**
 * ───────────────────────────────────────────────
 * 계산기 설정
 * ───────────────────────────────────────────────
 */
const CALCULATOR_CONFIG = {
    // 할부 이자율 (연 %)
    interestRate: 5.9,
    
    // 반올림 단위
    roundUnit: 10,
    
    // 선택약정 요금 할인율
    selectPlanDiscountRate: 0.25,  // 25%
    
    // 할부 개월 옵션
    installmentOptions: [0, 12, 24, 36]
};

/**
 * ═══════════════════════════════════════════════════
 * 메인 계산 함수
 * ═══════════════════════════════════════════════════
 */

/**
 * ───────────────────────────────────────────────
 * 전체 가격 계산 (통합)
 * ───────────────────────────────────────────────
 * 
 * @param {object} device - 기기 정보 (products.json)
 * @param {object} plan - 요금제 정보 (products.json)
 * @param {object} subsidy - 지원금 정보 (products.json)
 * @param {object} options - 계산 옵션
 * @returns {object} 계산 결과
 * 
 * options:
 * - discountType: 'subsidy' (지원금약정) | 'select' (선택약정)
 * - installmentMonths: 0 | 12 | 24 | 36
 * - internetTv: 'none' | 'internet' | 'both'
 */
function calculatePrice(device, plan, subsidy, options = {}) {
    // 기본 옵션
    const {
        discountType = 'subsidy',  // 지원금약정
        installmentMonths = 24,
        internetTv = 'none'
    } = options;
    
    // 1. 출고가
    const releasePrice = device.출고가;
    
    // 2. 지원금 계산 (약정 타입별)
    let totalSubsidy = 0;
    let subsidyBreakdown = {};
    
    if (discountType === 'subsidy') {
        // 지원금약정: 공통 + 추가
        subsidyBreakdown = {
            common: subsidy.공통지원금,
            extra: subsidy.추가지원금,
            select: 0
        };
        totalSubsidy = subsidy.공통지원금 + subsidy.추가지원금;
        
    } else {
        // 선택약정: 선약지원금만
        subsidyBreakdown = {
            common: 0,
            extra: 0,
            select: subsidy.선약지원금 || 0
        };
        totalSubsidy = subsidy.선약지원금 || 0;
    }
    
    // 3. 할부원금
    const installmentPrincipal = releasePrice - totalSubsidy;
    
    // 4. 월 할부금 계산 (이자 포함)
    let monthlyInstallment = 0;
    
    if (installmentMonths === 0) {
        // 일시불: 할부금 없음
        monthlyInstallment = 0;
    } else {
        monthlyInstallment = calculateInstallment(
            installmentPrincipal, 
            installmentMonths, 
            CALCULATOR_CONFIG.interestRate
        );
    }
    
    // 5. 요금제 기본료
    const basePlanFee = plan.기본요금;
    
    // 6. 요금 할인 (선택약정만)
    let planDiscount = 0;
    
    if (discountType === 'select') {
        planDiscount = Math.round(basePlanFee * CALCULATOR_CONFIG.selectPlanDiscountRate);
    }
    
    // 7. 인터넷/TV 결합 할인
    const bundleDiscount = calculateBundleDiscount(internetTv);
    
    // 8. 최종 월 통신요금
    const monthlyPlanFee = basePlanFee - planDiscount - bundleDiscount;
    
    // 9. 월 총 납부액
    const monthlyTotal = monthlyInstallment + monthlyPlanFee;
    
    // 10. 결과 반환
    return {
        // 기기 관련
        releasePrice: releasePrice,
        subsidy: {
            total: totalSubsidy,
            breakdown: subsidyBreakdown
        },
        installmentPrincipal: installmentPrincipal,
        monthlyInstallment: monthlyInstallment,
        
        // 요금제 관련
        basePlanFee: basePlanFee,
        planDiscount: planDiscount,
        bundleDiscount: bundleDiscount,
        monthlyPlanFee: monthlyPlanFee,
        
        // 합계
        monthlyTotal: monthlyTotal,
        
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
 * 
 * @param {number} principal - 할부원금
 * @param {number} months - 할부 개월
 * @param {number} annualRate - 연 이자율 (%)
 * @returns {number} 월 할부금
 * 
 * 계산 공식:
 * 월 할부금 = 원금 × (월 이자율 × (1 + 월 이자율)^개월) / ((1 + 월 이자율)^개월 - 1)
 */
function calculateInstallment(principal, months, annualRate) {
    if (months === 0 || principal <= 0) {
        return 0;
    }
    
    // 월 이자율
    const monthlyRate = (annualRate / 100) / 12;
    
    // 할부금 계산
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    
    let monthlyPayment = numerator / denominator;
    
    // 반올림
    monthlyPayment = roundToUnit(monthlyPayment, CALCULATOR_CONFIG.roundUnit);
    
    return monthlyPayment;
}

/**
 * ───────────────────────────────────────────────
 * 인터넷/TV 결합 할인 계산
 * ───────────────────────────────────────────────
 * 
 * @param {string} type - 'none' | 'internet' | 'both'
 * @returns {number} 할인 금액
 */
function calculateBundleDiscount(type) {
    const discounts = {
        'none': 0,
        'internet': 5000,    // 인터넷만: 5천원
        'both': 10000        // 인터넷+TV: 1만원
    };
    
    return discounts[type] || 0;
}

/**
 * ═══════════════════════════════════════════════════
 * 비교 계산 함수
 * ═══════════════════════════════════════════════════
 */

/**
 * ───────────────────────────────────────────────
 * 지원금약정 vs 선택약정 비교
 * ───────────────────────────────────────────────
 * 
 * @param {object} device - 기기 정보
 * @param {object} plan - 요금제 정보
 * @param {object} subsidy - 지원금 정보
 * @param {number} months - 할부 개월
 * @returns {object} 비교 결과
 */
function compareDiscountTypes(device, plan, subsidy, months = 24) {
    // 1. 지원금약정 계산
    const subsidyResult = calculatePrice(device, plan, subsidy, {
        discountType: 'subsidy',
        installmentMonths: months,
        internetTv: 'none'
    });
    
    // 2. 선택약정 계산
    const selectResult = calculatePrice(device, plan, subsidy, {
        discountType: 'select',
        installmentMonths: months,
        internetTv: 'none'
    });
    
    // 3. 비교
    const monthlyDiff = subsidyResult.monthlyTotal - selectResult.monthlyTotal;
    const totalDiff = monthlyDiff * months;
    
    // 4. 추천
    let recommendation = '';
    
    if (monthlyDiff > 5000) {
        recommendation = '선택약정이 월 5천원 이상 저렴합니다';
    } else if (monthlyDiff < -5000) {
        recommendation = '지원금약정이 월 5천원 이상 저렴합니다';
    } else {
        recommendation = '두 약정의 차이가 크지 않습니다';
    }
    
    return {
        subsidy: subsidyResult,
        select: selectResult,
        comparison: {
            monthlyDiff: monthlyDiff,
            totalDiff: totalDiff,
            recommendation: recommendation,
            cheaper: monthlyDiff > 0 ? 'select' : 'subsidy'
        }
    };
}

/**
 * ═══════════════════════════════════════════════════
 * 유틸리티 함수
 * ═══════════════════════════════════════════════════
 */

/**
 * ───────────────────────────────────────────────
 * 반올림 (특정 단위로)
 * ───────────────────────────────────────────────
 */
function roundToUnit(value, unit) {
    return Math.round(value / unit) * unit;
}

/**
 * ───────────────────────────────────────────────
 * 가격 포맷팅
 * ───────────────────────────────────────────────
 */
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseInt(String(price).replace(/[^0-9-]/g, '')) || 0;
    }
    
    return price.toLocaleString('ko-KR') + '원';
}

/**
 * ───────────────────────────────────────────────
 * 월 납부액 포맷팅 (강조)
 * ───────────────────────────────────────────────
 */
function formatMonthly(price) {
    return '월 ' + formatPrice(price);
}

/**
 * ───────────────────────────────────────────────
 * 할인 금액 포맷팅 (마이너스 표시)
 * ───────────────────────────────────────────────
 */
function formatDiscount(discount) {
    if (discount === 0) return '0원';
    return '-' + formatPrice(discount);
}

/**
 * ───────────────────────────────────────────────
 * 약정 타입 한글 변환
 * ───────────────────────────────────────────────
 */
function getDiscountTypeName(type) {
    const names = {
        'subsidy': '공시지원금 (지원금약정)',
        'select': '선택약정 (25% 요금할인)'
    };
    
    return names[type] || type;
}

/**
 * ───────────────────────────────────────────────
 * 할부 개월 포맷팅
 * ───────────────────────────────────────────────
 */
function formatInstallmentMonths(months) {
    if (months === 0) return '일시불';
    return `${months}개월`;
}

/**
 * ═══════════════════════════════════════════════════
 * 실시간 계산 헬퍼
 * ═══════════════════════════════════════════════════
 */

/**
 * ───────────────────────────────────────────────
 * device-detail.html 실시간 계산 및 업데이트
 * ───────────────────────────────────────────────
 * 
 * 사용자가 옵션을 변경할 때마다 호출
 */
async function updatePriceDisplay(options) {
    const {
        modelName,
        capacity,
        planId,
        joinType,
        discountType,
        installmentMonths,
        internetTv
    } = options;
    
    try {
        // 1. 기기옵션ID 생성
        const deviceOptionId = `${modelName}_${capacity}GB`;
        
        // 2. 데이터 로드
        const device = await api.getDeviceOption(deviceOptionId);
        const plan = await api.getPlan(planId);
        const subsidy = await api.getSubsidy(deviceOptionId, planId, joinType);
        
        if (!device || !plan || !subsidy) {
            throw new Error('필요한 데이터를 찾을 수 없습니다');
        }
        
        // 3. 가격 계산
        const result = calculatePrice(device, plan, subsidy, {
            discountType: discountType,
            installmentMonths: installmentMonths,
            internetTv: internetTv
        });
        
        // 4. UI 업데이트
        displayPriceResult(result);
        
        return result;
        
    } catch (error) {
        console.error('가격 계산 실패:', error);
        return null;
    }
}

/**
 * ───────────────────────────────────────────────
 * 가격 결과 화면 표시
 * ───────────────────────────────────────────────
 */
function displayPriceResult(result) {
    // 기기 관련
    updateElement('release-price', formatPrice(result.releasePrice));
    updateElement('common-subsidy', formatDiscount(result.subsidy.breakdown.common));
    updateElement('extra-subsidy', formatDiscount(result.subsidy.breakdown.extra));
    updateElement('select-subsidy', formatDiscount(result.subsidy.breakdown.select));
    updateElement('installment-principal', formatPrice(result.installmentPrincipal));
    
    // 할부금
    updateElement('monthly-installment', formatPrice(result.monthlyInstallment));
    
    // 요금제 관련
    updateElement('base-plan-fee', formatPrice(result.basePlanFee));
    updateElement('plan-discount', formatDiscount(result.planDiscount));
    updateElement('bundle-discount', formatDiscount(result.bundleDiscount));
    updateElement('monthly-plan-fee', formatPrice(result.monthlyPlanFee));
    
    // 월 총 납부액 (강조)
    updateElement('monthly-total', formatMonthly(result.monthlyTotal), 'highlight');
    
    // 하단 고정바
    updateElement('footer-monthly-phone', formatPrice(result.monthlyInstallment));
    updateElement('footer-monthly-plan', formatPrice(result.monthlyPlanFee));
    updateElement('footer-monthly-total', formatMonthly(result.monthlyTotal));
}

/**
 * ───────────────────────────────────────────────
 * DOM 요소 업데이트 헬퍼
 * ───────────────────────────────────────────────
 */
function updateElement(id, value, className = '') {
    const element = document.getElementById(id);
    
    if (element) {
        element.textContent = value;
        
        if (className) {
            element.className = className;
        }
    }
}

/**
 * ═══════════════════════════════════════════════════
 * 검증 함수
 * ═══════════════════════════════════════════════════
 */

/**
 * ───────────────────────────────────────────────
 * 계산 옵션 검증
 * ───────────────────────────────────────────────
 */
function validateCalculationOptions(options) {
    const errors = [];
    
    // 할부 개월 검증
    if (!CALCULATOR_CONFIG.installmentOptions.includes(options.installmentMonths)) {
        errors.push(`유효하지 않은 할부 개월: ${options.installmentMonths}`);
    }
    
    // 약정 타입 검증
    if (!['subsidy', 'select'].includes(options.discountType)) {
        errors.push(`유효하지 않은 약정 타입: ${options.discountType}`);
    }
    
    // 결합 옵션 검증
    if (!['none', 'internet', 'both'].includes(options.internetTv)) {
        errors.push(`유효하지 않은 결합 옵션: ${options.internetTv}`);
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * ───────────────────────────────────────────────
 * 내보내기
 * ───────────────────────────────────────────────
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculatePrice,
        calculateInstallment,
        calculateBundleDiscount,
        compareDiscountTypes,
        formatPrice,
        formatMonthly,
        formatDiscount,
        getDiscountTypeName,
        formatInstallmentMonths,
        updatePriceDisplay,
        validateCalculationOptions
    };
}