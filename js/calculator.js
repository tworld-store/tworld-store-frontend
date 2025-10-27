/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 가격 계산 엔진 v2.0
 * ═══════════════════════════════════════════════════
 * 
 * 변경사항:
 * - 조합ID 기반 지원금 조회
 * - 기기옵션ID = 모델명_용량 (색상 제외)
 */

class PriceCalculator {
    /**
     * 생성자
     */
    constructor() {
        // 기본 설정값
        this.config = {
            interestRate: 5.9,  // 연 이자율 (%)
            chargeDiscountRate: 0.25  // 선택약정 요금 할인율 (25%)
        };
        
        // 월 이자율 계산
        this.monthlyRate = (this.config.interestRate / 100) / 12;
    }
    
    /**
     * ───────────────────────────────────────────────
     * ★ 메인 계산 함수 ★
     * ───────────────────────────────────────────────
     * @param {string} deviceOptionId - 기기옵션ID (모델명_용량)
     * @param {string} planId - 요금제ID
     * @param {string} joinType - 가입유형 (기기변경/번호이동/신규가입)
     * @param {string} discountType - 약정유형 (phone=지원금약정, charge=선택약정)
     * @param {number} installmentMonths - 할부개월 (0/12/24/36)
     * @returns {Promise<Object>} 계산 결과
     */
    async calculate(deviceOptionId, planId, joinType, discountType, installmentMonths = 24) {
        try {
            // 1. 필수값 검증
            this._validateInputs(deviceOptionId, planId, joinType, discountType, installmentMonths);
            
            // 2. 조합ID 생성
            const combinationId = this._createCombinationId(deviceOptionId, planId, joinType);
            console.log('📋 조합ID:', combinationId);
            
            // 3. 데이터 로드
            const device = await this._getDevice(deviceOptionId);
            const plan = await this._getPlan(planId);
            const subsidy = await this._getSubsidyByCombinationId(combinationId, joinType);
            
            console.log('✅ 데이터 로드 완료:', { device, plan, subsidy });
            
            // 4. 약정별 계산 분기
            if (discountType === 'phone') {
                return this._calculatePhoneDiscount(device, plan, subsidy, installmentMonths);
            } else {
                return this._calculateChargeDiscount(device, plan, subsidy, installmentMonths);
            }
            
        } catch (error) {
            console.error('❌ 가격 계산 오류:', error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 조합ID 생성
     * ───────────────────────────────────────────────
     * 형식: 기기옵션ID_요금제ID_가입유형
     * 예시: "갤럭시 S24_128GB_0청년109_기변"
     */
    _createCombinationId(deviceOptionId, planId, joinType) {
        // 가입유형 매핑
        const joinTypeMap = {
            '기기변경': '기변',
            '번호이동': '번이',
            '신규가입': '신규'
        };
        
        const shortJoinType = joinTypeMap[joinType];
        
        if (!shortJoinType) {
            throw new Error(`올바르지 않은 가입유형: ${joinType}`);
        }
        
        return `${deviceOptionId}_${planId}_${shortJoinType}`;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 지원금약정 계산
     * ───────────────────────────────────────────────
     */
    _calculatePhoneDiscount(device, plan, subsidy, installmentMonths) {
        const factoryPrice = device.출고가;
        const planPrice = plan.기본요금;
        
        // 지원금 계산
        const commonSubsidy = subsidy.공통지원금 || 0;
        const additionalSubsidy = subsidy.추가지원금 || 0;
        const totalSubsidy = commonSubsidy + additionalSubsidy;
        
        // 할부원금 = 출고가 - 총지원금
        const installmentPrincipal = factoryPrice - totalSubsidy;
        
        // 월 할부금 계산
        const monthlyInstallment = this._calculateInstallment(
            installmentPrincipal, 
            installmentMonths
        );
        
        // 요금 할인 없음
        const chargeDiscount = 0;
        const monthlyCharge = planPrice;
        
        // 월 총 납부액
        const totalMonthly = monthlyInstallment + monthlyCharge;
        
        return {
            약정유형: '지원금약정',
            출고가: factoryPrice,
            공통지원금: commonSubsidy,
            추가지원금: additionalSubsidy,
            총지원금: totalSubsidy,
            할부원금: installmentPrincipal,
            할부개월: installmentMonths,
            월할부금: monthlyInstallment,
            요금제기본료: planPrice,
            요금할인: chargeDiscount,
            월통신요금: monthlyCharge,
            월총납부액: totalMonthly,
            // 화면 표시용
            display: {
                공통지원금표시: true,
                공통지원금: commonSubsidy,
                추가지원금: additionalSubsidy
            }
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 선택약정 계산
     * ───────────────────────────────────────────────
     */
    _calculateChargeDiscount(device, plan, subsidy, installmentMonths) {
        const factoryPrice = device.출고가;
        const planPrice = plan.기본요금;
        
        // ★ 선약지원금만 사용 ★
        const selectSubsidy = subsidy.선약지원금 || 0;
        const totalSubsidy = selectSubsidy;
        
        // 할부원금 = 출고가 - 선약지원금
        const installmentPrincipal = factoryPrice - totalSubsidy;
        
        // 월 할부금 계산
        const monthlyInstallment = this._calculateInstallment(
            installmentPrincipal, 
            installmentMonths
        );
        
        // ★ 요금 25% 할인 ★
        const chargeDiscount = Math.round(planPrice * this.config.chargeDiscountRate);
        const monthlyCharge = planPrice - chargeDiscount;
        
        // 월 총 납부액
        const totalMonthly = monthlyInstallment + monthlyCharge;
        
        return {
            약정유형: '선택약정',
            출고가: factoryPrice,
            공통지원금: 0,  // 선택약정에는 공통지원금 없음
            추가지원금: selectSubsidy,  // ★ 선약지원금을 "추가지원금"으로 표시 ★
            총지원금: totalSubsidy,
            할부원금: installmentPrincipal,
            할부개월: installmentMonths,
            월할부금: monthlyInstallment,
            요금제기본료: planPrice,
            요금할인: chargeDiscount,
            월통신요금: monthlyCharge,
            월총납부액: totalMonthly,
            // 화면 표시용
            display: {
                공통지원금표시: false,  // ★ 공통지원금 행 숨김 ★
                공통지원금: 0,
                추가지원금: selectSubsidy
            }
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 할부금 계산 (원리금균등상환)
     * ───────────────────────────────────────────────
     */
    _calculateInstallment(principal, months) {
        // 일시불
        if (months === 0) {
            return 0;
        }
        
        // 무이자 할부
        if (this.monthlyRate === 0) {
            return Math.round(principal / months / 100) * 100;
        }
        
        // 원리금균등상환 공식
        const rate = this.monthlyRate;
        const numerator = principal * rate * Math.pow(1 + rate, months);
        const denominator = Math.pow(1 + rate, months) - 1;
        const monthly = numerator / denominator;
        
        // 100원 단위 반올림
        return Math.round(monthly / 100) * 100;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 입력값 검증
     * ───────────────────────────────────────────────
     */
    _validateInputs(deviceOptionId, planId, joinType, discountType, installmentMonths) {
        if (!deviceOptionId) {
            throw new Error('기기를 선택해주세요');
        }
        
        if (!planId) {
            throw new Error('요금제를 선택해주세요');
        }
        
        const validJoinTypes = ['기기변경', '번호이동', '신규가입'];
        if (!validJoinTypes.includes(joinType)) {
            throw new Error('올바른 가입유형을 선택해주세요');
        }
        
        const validDiscountTypes = ['phone', 'charge'];
        if (!validDiscountTypes.includes(discountType)) {
            throw new Error('올바른 약정유형을 선택해주세요');
        }
        
        const validMonths = [0, 12, 24, 36];
        if (!validMonths.includes(installmentMonths)) {
            throw new Error('올바른 할부개월을 선택해주세요');
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기기 정보 가져오기
     * ───────────────────────────────────────────────
     * 기기옵션ID로 조회 (모델명_용량)
     */
    async _getDevice(deviceOptionId) {
        const data = await api.load();
        
        // 기기옵션ID와 일치하는 첫 번째 기기 찾기
        // (같은 기기옵션ID면 색상만 다르고 가격은 동일)
        const device = data.devices.find(d => {
            const optionId = `${d.모델명}_${d.용량}GB`;
            return optionId === deviceOptionId;
        });
        
        if (!device) {
            throw new Error(`기기를 찾을 수 없습니다: ${deviceOptionId}`);
        }
        
        return device;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 정보 가져오기
     * ───────────────────────────────────────────────
     */
    async _getPlan(planId) {
        const data = await api.load();
        const plan = data.plans.find(p => p.요금제ID === planId);
        
        if (!plan) {
            throw new Error(`요금제를 찾을 수 없습니다: ${planId}`);
        }
        
        return plan;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 조합ID로 지원금 조회 ★ 핵심 변경 ★
     * ───────────────────────────────────────────────
     */
    async _getSubsidyByCombinationId(combinationId, joinType) {
        const data = await api.load();
        
        // 가입유형에 따른 지원금 배열 선택
        const subsidyMap = {
            '기기변경': 'change',
            '번호이동': 'port',
            '신규가입': 'new'
        };
        
        const subsidyKey = subsidyMap[joinType];
        const subsidies = data.subsidies[subsidyKey];
        
        if (!subsidies) {
            throw new Error(`지원금 데이터를 찾을 수 없습니다: ${joinType}`);
        }
        
        // ★ 조합ID로 검색 ★
        const subsidy = subsidies.find(s => s.조합ID === combinationId);
        
        if (!subsidy) {
            throw new Error(
                `해당 조합의 지원금 정보가 없습니다.\n` +
                `조합ID: ${combinationId}\n` +
                `확인: 스프레드시트의 지원금 시트를 확인하세요.`
            );
        }
        
        // 노출여부 확인
        if (subsidy.노출여부 !== 'Y') {
            throw new Error(`이 조합은 현재 판매하지 않습니다: ${combinationId}`);
        }
        
        return subsidy;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 설정 업데이트
     * ───────────────────────────────────────────────
     */
    updateConfig(newConfig) {
        if (newConfig.interestRate !== undefined) {
            this.config.interestRate = newConfig.interestRate;
            this.monthlyRate = (newConfig.interestRate / 100) / 12;
        }
        
        if (newConfig.chargeDiscountRate !== undefined) {
            this.config.chargeDiscountRate = newConfig.chargeDiscountRate;
        }
        
        console.log('✅ Calculator 설정 업데이트:', this.config);
    }
}

// ═══════════════════════════════════════════════════
// 전역 인스턴스 생성
// ═══════════════════════════════════════════════════

const calculator = new PriceCalculator();

// 전역 변수로 노출
if (typeof window !== 'undefined') {
    window.calculator = calculator;
    window.PriceCalculator = PriceCalculator;
    console.log('✅ 가격 계산 엔진 v2.0 로드 완료');
}