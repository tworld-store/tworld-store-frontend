/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - 통합 데이터 API v2.0
 * ═══════════════════════════════════════════════════
 * 
 * 기능:
 * 1. products.json 로드 (기기/요금제/지원금)
 * 2. images.json 로드 (3개 파일)
 * 3. 캐싱 관리
 * 4. 에러 처리
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
        
        // 캐시 저장소 (각 파일별 독립)
        this.cache = {
            products: null,
            imagesIndex: null,
            imagesDevices: null,
            imagesDetail: {}  // 모델별 캐시
        };
        
        // 캐시 타임스탬프
        this.cacheTime = {
            products: 0,
            imagesIndex: 0,
            imagesDevices: 0,
            imagesDetail: {}
        };
        
        // 캐시 유효 시간 (밀리초)
        this.cacheExpiry = 5 * 60 * 1000;  // 5분
        
        console.log('✅ DataAPI 초기화 완료');
    }
    
    /**
     * ═══════════════════════════════════════════════════
     * products.json 관련
     * ═══════════════════════════════════════════════════
     */
    
    /**
     * ───────────────────────────────────────────────
     * products.json 로드 (기존 함수 유지)
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
            
            // 데이터 검증
            this._validateProductsData(data);
            
            // 캐시 저장
            this.cache.products = data;
            this.cacheTime.products = now;
            
            console.log('✅ products.json 로드 완료');
            
            return data;
            
        } catch (error) {
            console.error('❌ products.json 로드 실패:', error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * products.json 데이터 검증
     * ───────────────────────────────────────────────
     */
    _validateProductsData(data) {
        if (!data.deviceOptions || !Array.isArray(data.deviceOptions)) {
            throw new Error('기기 데이터가 올바르지 않습니다');
        }
        
        if (!data.plans || !Array.isArray(data.plans)) {
            throw new Error('요금제 데이터가 올바르지 않습니다');
        }
        
        if (!data.subsidies || typeof data.subsidies !== 'object') {
            throw new Error('지원금 데이터가 올바르지 않습니다');
        }
        
        console.log(`📊 기기 ${data.deviceOptions.length}개, 요금제 ${data.plans.length}개`);
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기기 목록 조회 (브랜드별 그룹화)
     * ───────────────────────────────────────────────
     */
    async getDevices(brand = null) {
        const data = await this.loadProducts();
        let devices = data.deviceOptions.filter(d => d.노출여부 === 'Y');
        
        // 브랜드 필터
        if (brand) {
            devices = devices.filter(d => d.브랜드 === brand);
        }
        
        return devices;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 기기옵션 조회
     * ───────────────────────────────────────────────
     */
    async getDeviceOption(deviceOptionId) {
        const data = await this.loadProducts();
        const device = data.deviceOptions.find(d => d.기기옵션ID === deviceOptionId);
        
        if (!device) {
            console.warn(`기기를 찾을 수 없습니다: ${deviceOptionId}`);
            return null;
        }
        
        return device;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 모델명으로 기기옵션들 조회 (여러 용량)
     * ───────────────────────────────────────────────
     */
    async getDevicesByModel(modelName) {
        const data = await this.loadProducts();
        const devices = data.deviceOptions.filter(d => 
            d.모델명 === modelName && d.노출여부 === 'Y'
        );
        
        return devices;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 목록 조회 (카테고리별 그룹화)
     * ───────────────────────────────────────────────
     */
    async getPlans(categoryId = null) {
        const data = await this.loadProducts();
        let plans = data.plans.filter(p => p.노출여부 === 'Y');
        
        // 카테고리 필터
        if (categoryId) {
            plans = plans.filter(p => p.카테고리ID === categoryId);
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
        const plan = data.plans.find(p => p.요금제ID === planId);
        
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
    async getSubsidy(deviceOptionId, planId, joinType) {
        const data = await this.loadProducts();
        
        // 가입유형별 시트 매핑
        const subsidyKey = {
            '기기변경': 'change',
            '번호이동': 'port',
            '신규가입': 'new'
        }[joinType];
        
        if (!subsidyKey) {
            console.error(`알 수 없는 가입유형: ${joinType}`);
            return null;
        }
        
        const subsidyList = data.subsidies[subsidyKey];
        
        if (!subsidyList || !Array.isArray(subsidyList)) {
            console.error(`지원금 데이터가 없습니다: ${joinType}`);
            return null;
        }
        
        const subsidy = subsidyList.find(s => 
            s.기기옵션ID === deviceOptionId && 
            s.요금제ID === planId &&
            s.노출여부 === 'Y'
        );
        
        if (!subsidy) {
            console.warn(`지원금 정보를 찾을 수 없습니다: ${deviceOptionId} + ${planId} (${joinType})`);
            return null;
        }
        
        return subsidy;
    }
    
    /**
     * ═══════════════════════════════════════════════════
     * images.json 관련 (신규)
     * ═══════════════════════════════════════════════════
     */
    
    /**
     * ───────────────────────────────────────────────
     * images-index.json 로드 (메인 페이지용)
     * ───────────────────────────────────────────────
     */
    async loadImagesIndex() {
        const now = Date.now();
        
        // 캐시 확인
        if (this.cache.imagesIndex && (now - this.cacheTime.imagesIndex) < this.cacheExpiry) {
            console.log('📦 images-index.json 캐시 사용');
            return this.cache.imagesIndex;
        }
        
        console.log('🔄 images-index.json 로드 중...');
        
        try {
            const response = await fetch(this.imagesIndexUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 캐시 저장
            this.cache.imagesIndex = data;
            this.cacheTime.imagesIndex = now;
            
            console.log('✅ images-index.json 로드 완료');
            
            return data;
            
        } catch (error) {
            console.error('❌ images-index.json 로드 실패:', error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * images-devices.json 로드 (기기 목록용)
     * ───────────────────────────────────────────────
     */
    async loadImagesDevices() {
        const now = Date.now();
        
        // 캐시 확인
        if (this.cache.imagesDevices && (now - this.cacheTime.imagesDevices) < this.cacheExpiry) {
            console.log('📦 images-devices.json 캐시 사용');
            return this.cache.imagesDevices;
        }
        
        console.log('🔄 images-devices.json 로드 중...');
        
        try {
            const response = await fetch(this.imagesDevicesUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 캐시 저장
            this.cache.imagesDevices = data;
            this.cacheTime.imagesDevices = now;
            
            console.log('✅ images-devices.json 로드 완료');
            
            return data;
            
        } catch (error) {
            console.error('❌ images-devices.json 로드 실패:', error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * images-detail/{model}.json 로드 (상세 페이지용)
     * ───────────────────────────────────────────────
     * 
     * @param {string} modelName - 모델명 (예: '갤럭시S24')
     */
    async loadImagesDetail(modelName) {
        const now = Date.now();
        
        // 캐시 확인
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
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 캐시 저장
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
     * 특정 모델의 이미지 정보 조회 (통합)
     * ───────────────────────────────────────────────
     * 
     * devices + detail 정보를 한번에 가져옴
     */
    async getModelImages(modelName) {
        const [devicesData, detailData] = await Promise.all([
            this.loadImagesDevices(),
            this.loadImagesDetail(modelName)
        ]);
        
        const deviceInfo = devicesData.devices[modelName];
        
        if (!deviceInfo) {
            console.warn(`이미지 정보를 찾을 수 없습니다: ${modelName}`);
            return null;
        }
        
        return {
            card: deviceInfo.card,
            thumbnails: deviceInfo.thumbnails,
            gallery: detailData.gallery,
            detail_sections: detailData.detail_sections
        };
    }
    
    /**
     * ═══════════════════════════════════════════════════
     * 통합 조회 함수 (products + images)
     * ═══════════════════════════════════════════════════
     */
    
    /**
     * ───────────────────────────────────────────────
     * 카드 표시용 완전한 데이터 조회
     * ───────────────────────────────────────────────
     * 
     * products.json + images.json을 조합하여
     * devices.html 카드에 필요한 모든 정보 반환
     * 
     * @param {string} modelName - 모델명
     * @returns {object} 카드 표시용 완전한 데이터
     */
    async getCardData(modelName) {
        // 1. 이미지 정보 로드
        const imagesData = await this.loadImagesDevices();
        const imageInfo = imagesData.devices[modelName];
        
        if (!imageInfo || !imageInfo.visible) {
            return null;
        }
        
        // 2. 대표 옵션으로 기기옵션ID 생성
        const defaultOpts = imageInfo.card.default;
        const deviceOptionId = `${modelName}_${defaultOpts.capacity}GB`;
        
        // 3. products.json에서 데이터 가져오기
        const device = await this.getDeviceOption(deviceOptionId);
        const plan = await this.getPlan(defaultOpts.plan_id);
        const subsidy = await this.getSubsidy(
            deviceOptionId, 
            defaultOpts.plan_id, 
            defaultOpts.join_type
        );
        
        if (!device || !plan || !subsidy) {
            console.warn(`완전한 데이터를 가져올 수 없습니다: ${modelName}`);
            return null;
        }
        
        // 4. 통합 반환
        return {
            model: modelName,
            image: imageInfo,
            device: device,
            plan: plan,
            subsidy: subsidy
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 캐시 초기화
     * ───────────────────────────────────────────────
     */
    clearCache(type = 'all') {
        if (type === 'all') {
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
            console.log('🗑️ 전체 캐시 초기화');
        } else {
            this.cache[type] = null;
            this.cacheTime[type] = 0;
            console.log(`🗑️ ${type} 캐시 초기화`);
        }
    }
}

/**
 * ───────────────────────────────────────────────
 * 전역 인스턴스 생성
 * ───────────────────────────────────────────────
 */
const api = new DataAPI();

/**
 * ───────────────────────────────────────────────
 * 내보내기
 * ───────────────────────────────────────────────
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataAPI, api };
}