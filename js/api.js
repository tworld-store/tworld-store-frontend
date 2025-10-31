/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 통합 데이터 API v3.0
 * ═══════════════════════════════════════════════════
 * 
 * 개선사항 (v2.0 → v3.0):
 * - settings 접근 간소화 (parsed 제거)
 * - 데이터 검증 강화
 * - 에러 메시지 개선
 * 
 * 작성일: 2025-10-31
 * 버전: 3.0.0
 */

/**
 * ───────────────────────────────────────────────
 * DataAPI 클래스
 * ───────────────────────────────────────────────
 */
class DataAPI {
    constructor() {
        // 기본 URL 설정
        this.productsUrl = 'data/products.json';
        this.imagesIndexUrl = 'images/images-index.json';
        this.imagesDevicesUrl = 'images/images-devices.json';
        this.imagesDetailBaseUrl = 'images/images-detail';
        
        // 캐시 저장소
        this.cache = {
            products: null,
            imagesIndex: null,
            imagesDevices: null,
            imagesDetail: {}
        };
        
        // 캐시 타임스탬프
        this.cacheTime = {
            products: 0,
            imagesIndex: 0,
            imagesDevices: 0,
            imagesDetail: {}
        };
        
        // 캐시 유효 시간
        this.cacheExpiry = 5 * 60 * 1000;  // 5분
        
        console.log('✅ DataAPI v3.0 초기화 완료');
    }
    
    /**
     * ═══════════════════════════════════════════════════
     * products.json 관련
     * ═══════════════════════════════════════════════════
     */
    
    /**
     * ───────────────────────────────────────────────
     * products.json 로드
     * ───────────────────────────────────────────────
     */
    async loadProducts() {
        const now = Date.now();
        
        // 캐시 확인
        if (this.cache.products && (now - this.cacheTime.products) < this.cacheExpiry) {
            console.log('📦 products.json 캐시 사용');
            return this.cache.products;
        }
        
        console.log('🔄 products.json 로드 중...');
        
        try {
            const response = await fetch(this.productsUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // ★ 데이터 검증 (v3.0 강화)
            this._validateProductsData(data);
            
            // 캐시 저장
            this.cache.products = data;
            this.cacheTime.products = now;
            
            console.log('✅ products.json 로드 완료');
            console.log(`  devices: ${data.devices.length}개`);
            console.log(`  plans: ${data.plans.length}개`);
            
            return data;
            
        } catch (error) {
            console.error('❌ products.json 로드 실패:', error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * products.json 데이터 검증 (v3.0 강화)
     * ───────────────────────────────────────────────
     * @private
     */
    _validateProductsData(data) {
        const errors = [];
        
        // 1. 필수 섹션 확인
        if (!data.metadata) {
            errors.push('metadata 섹션 누락');
        }
        
        if (!data.devices || !Array.isArray(data.devices)) {
            errors.push('devices 배열 누락 또는 형식 오류');
        }
        
        if (!data.plans || !Array.isArray(data.plans)) {
            errors.push('plans 배열 누락 또는 형식 오류');
        }
        
        if (!data.subsidies || typeof data.subsidies !== 'object') {
            errors.push('subsidies 섹션 누락');
        } else {
            // subsidies 하위 섹션 확인
            ['change', 'port', 'new'].forEach(type => {
                if (!data.subsidies[type] || !Array.isArray(data.subsidies[type])) {
                    errors.push(`subsidies.${type} 배열 누락`);
                }
            });
        }
        
        if (!data.settings || typeof data.settings !== 'object') {
            errors.push('settings 섹션 누락');
        }
        
        // 2. devices 필드 검증
        if (data.devices && Array.isArray(data.devices)) {
            data.devices.forEach((device, i) => {
                if (!device.id) {
                    errors.push(`devices[${i}]: id 필드 누락`);
                }
                
                if (!device.brand) {
                    errors.push(`devices[${i}]: brand 필드 누락`);
                }
                
                if (!device.model) {
                    errors.push(`devices[${i}]: model 필드 누락`);
                }
                
                if (typeof device.price !== 'number' || device.price < 0) {
                    errors.push(`devices[${i}]: price 필드 오류 (${device.price})`);
                }
                
                if (!device.color || !device.color.name) {
                    errors.push(`devices[${i}]: color.name 필드 누락`);
                }
            });
        }
        
        // 3. plans 필드 검증
        if (data.plans && Array.isArray(data.plans)) {
            data.plans.forEach((plan, i) => {
                if (!plan.id) {
                    errors.push(`plans[${i}]: id 필드 누락`);
                }
                
                if (!plan.name) {
                    errors.push(`plans[${i}]: name 필드 누락`);
                }
                
                if (typeof plan.price !== 'number' || plan.price < 0) {
                    errors.push(`plans[${i}]: price 필드 오류 (${plan.price})`);
                }
                
                if (!plan.category) {
                    errors.push(`plans[${i}]: category 필드 누락`);
                }
            });
        }
        
        // 4. subsidies 필드 검증
        if (data.subsidies) {
            ['change', 'port', 'new'].forEach(type => {
                if (data.subsidies[type] && Array.isArray(data.subsidies[type])) {
                    data.subsidies[type].forEach((subsidy, i) => {
                        if (!subsidy.id) {
                            errors.push(`subsidies.${type}[${i}]: id 필드 누락`);
                        }
                        
                        if (!subsidy.deviceId) {
                            errors.push(`subsidies.${type}[${i}]: deviceId 필드 누락`);
                        }
                        
                        if (!subsidy.planId) {
                            errors.push(`subsidies.${type}[${i}]: planId 필드 누락`);
                        }
                        
                        // 지원금 필드 확인
                        const hasCommon = typeof subsidy.common === 'number';
                        const hasSelect = typeof subsidy.select === 'number';
                        
                        if (!hasCommon && !hasSelect) {
                            errors.push(`subsidies.${type}[${i}]: 지원금 필드 누락 (common 또는 select 필요)`);
                        }
                    });
                }
            });
        }
        
        // 5. settings 필드 검증 (v3.0 업데이트)
        if (data.settings) {
            const requiredSettings = [
                '할부개월옵션',
                '할부이자율',
                '반올림단위',
                '선약할인율'
            ];
            
            requiredSettings.forEach(key => {
                if (data.settings[key] === undefined || data.settings[key] === null) {
                    errors.push(`settings.${key} 필드 누락`);
                }
            });
        }
        
        // 6. 에러 처리
        if (errors.length > 0) {
            console.error('❌ products.json 검증 실패:');
            errors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err}`);
            });
            throw new Error(`데이터 검증 실패 (${errors.length}개 오류)`);
        }
        
        console.log('✅ products.json 검증 완료');
    }
    
    /**
     * ───────────────────────────────────────────────
     * settings 조회 (v3.0 간소화)
     * ───────────────────────────────────────────────
     * 
     * ⚠️ v2.0과의 차이:
     * v2.0: data.settings.parsed.할부개월옵션
     * v3.0: data.settings.할부개월옵션
     */
    async getSettings() {
        const data = await this.loadProducts();
        
        // v3.0: settings 직접 반환 (parsed 구조 제거됨)
        return data.settings;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기기 목록 조회
     * ───────────────────────────────────────────────
     */
    async getDevices(brand = null) {
        const data = await this.loadProducts();
        let devices = data.devices;
        
        // 브랜드 필터
        if (brand) {
            devices = devices.filter(d => d.brand === brand);
        }
        
        return devices;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 기기 조회
     * ───────────────────────────────────────────────
     */
    async getDevice(deviceId) {
        const data = await this.loadProducts();
        const device = data.devices.find(d => d.id === deviceId);
        
        if (!device) {
            console.warn(`기기를 찾을 수 없습니다: ${deviceId}`);
            return null;
        }
        
        return device;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 목록 조회
     * ───────────────────────────────────────────────
     */
    async getPlans(category = null) {
        const data = await this.loadProducts();
        let plans = data.plans;
        
        // 카테고리 필터
        if (category) {
            plans = plans.filter(p => p.category.id === category);
        }
        
        return plans;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 요금제 조회
     * ───────────────────────────────────────────────
     */
    async getPlan(planId) {
        const data = await this.loadProducts();
        const plan = data.plans.find(p => p.id === planId);
        
        if (!plan) {
            console.warn(`요금제를 찾을 수 없습니다: ${planId}`);
            return null;
        }
        
        return plan;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 지원금 조회
     * ───────────────────────────────────────────────
     */
    async getSubsidy(deviceId, planId, joinType = 'change') {
        const data = await this.loadProducts();
        
        // joinType 검증
        const validTypes = ['change', 'port', 'new'];
        if (!validTypes.includes(joinType)) {
            console.warn(`유효하지 않은 가입유형: ${joinType}`);
            joinType = 'change';
        }
        
        const subsidies = data.subsidies[joinType];
        const subsidy = subsidies.find(s => 
            s.deviceId === deviceId && s.planId === planId
        );
        
        if (!subsidy) {
            console.warn(`지원금을 찾을 수 없습니다: ${deviceId} + ${planId} (${joinType})`);
            return null;
        }
        
        return subsidy;
    }
    
    /**
     * ═══════════════════════════════════════════════════
     * images.json 관련 (기존 유지)
     * ═══════════════════════════════════════════════════
     */
    
    async loadImagesIndex() {
        const now = Date.now();
        
        if (this.cache.imagesIndex && (now - this.cacheTime.imagesIndex) < this.cacheExpiry) {
            console.log('📦 images-index.json 캐시 사용');
            return this.cache.imagesIndex;
        }
        
        console.log('🔄 images-index.json 로드 중...');
        
        try {
            const response = await fetch(this.imagesIndexUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.imagesIndex = data;
            this.cacheTime.imagesIndex = now;
            
            console.log('✅ images-index.json 로드 완료');
            
            return data;
            
        } catch (error) {
            console.error('❌ images-index.json 로드 실패:', error);
            throw error;
        }
    }
    
    async loadImagesDevices() {
        const now = Date.now();
        
        if (this.cache.imagesDevices && (now - this.cacheTime.imagesDevices) < this.cacheExpiry) {
            console.log('📦 images-devices.json 캐시 사용');
            return this.cache.imagesDevices;
        }
        
        console.log('🔄 images-devices.json 로드 중...');
        
        try {
            const response = await fetch(this.imagesDevicesUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.imagesDevices = data;
            this.cacheTime.imagesDevices = now;
            
            console.log('✅ images-devices.json 로드 완료');
            
            return data;
            
        } catch (error) {
            console.error('❌ images-devices.json 로드 실패:', error);
            throw error;
        }
    }
    
    async loadImagesDetail(modelName) {
        const now = Date.now();
        
        // 모델별 캐시 확인
        if (this.cache.imagesDetail[modelName] && 
            (now - this.cacheTime.imagesDetail[modelName]) < this.cacheExpiry) {
            console.log(`📦 images-detail/${modelName}.json 캐시 사용`);
            return this.cache.imagesDetail[modelName];
        }
        
        console.log(`🔄 images-detail/${modelName}.json 로드 중...`);
        
        try {
            const url = `${this.imagesDetailBaseUrl}/${modelName}.json`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.imagesDetail[modelName] = data;
            this.cacheTime.imagesDetail[modelName] = now;
            
            console.log(`✅ images-detail/${modelName}.json 로드 완료`);
            
            return data;
            
        } catch (error) {
            console.error(`❌ images-detail/${modelName}.json 로드 실패:`, error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 캐시 초기화
     * ───────────────────────────────────────────────
     */
    clearCache() {
        this.cache = {
            products: null,
            imagesIndex: null,
            imagesDevices: null,
            imagesDetail: {}
        };
        
        this.cacheTime = {
            products: 0,
            imagesIndex: 0,
            imagesDevices: 0,
            imagesDetail: {}
        };
        
        console.log('🗑️ 캐시 초기화 완료');
    }
}

/**
 * ═══════════════════════════════════════════════════
 * 전역 인스턴스
 * ═══════════════════════════════════════════════════
 */
const api = new DataAPI();

/**
 * ═══════════════════════════════════════════════════
 * v2.0 → v3.0 마이그레이션 가이드
 * ═══════════════════════════════════════════════════
 * 
 * 주요 변경사항:
 * 
 * 1. settings 접근 방식 변경
 *    ❌ v2.0: const settings = data.settings.parsed;
 *    ✅ v3.0: const settings = data.settings;
 * 
 * 2. 필드명 변경 (products.json v2.0)
 *    v1.0 (한글):
 *    - device.출고가 → device.price
 *    - subsidy.공통지원금 → subsidy.common
 *    - plan.기본요금 → plan.price
 *    
 *    v2.0 (영어):
 *    - device.price ✓
 *    - subsidy.common ✓
 *    - plan.price ✓
 * 
 * 3. 데이터 검증 강화
 *    - 필수 필드 누락 검사
 *    - 타입 검사
 *    - 지원금 필드 검사
 *    - settings 필드 검사
 * 
 * 예시:
 * 
 * // v2.0 (기존)
 * const data = await api.loadProducts();
 * const settings = data.settings.parsed;
 * const rate = settings.할부이자율;
 * 
 * // v3.0 (신규)
 * const settings = await api.getSettings();
 * const rate = settings.할부이자율;
 * 
 * ═══════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════
 * 하위 호환성 함수들 (Phase 1-2 HTML과의 호환)
 * ═══════════════════════════════════════════════════
 */

/**
 * 기기 카드 데이터 조회 (devices.html, index.html용)
 * @param {string} brand - 브랜드 필터 (선택)
 * @returns {Promise<Array>} 기기 목록
 */
api.getCardData = async function(brand = null) {
    return await api.getDevices(brand);
};

/**
 * 특정 모델의 이미지 데이터 조회 (device-detail.html용)
 * @param {string} modelName - 모델명
 * @returns {Promise<Object>} 이미지 데이터
 */
api.getModelImages = async function(modelName) {
    try {
        // 모델명을 파일명으로 변환 (공백 제거)
        const fileName = modelName.replace(/\s+/g, '');
        const url = `${api.imagesDetailBaseUrl}/${fileName}.json`;
        
        console.log(`🖼️ 이미지 로드: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn(`이미지 파일 없음: ${url}`);
            return null;
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error(`이미지 로드 실패 (${modelName}):`, error);
        return null;
    }
};