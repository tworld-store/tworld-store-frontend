/**
 * ═══════════════════════════════════════════════════
 * API.JS - 데이터 관리 클래스 (수정완료)
 * ═══════════════════════════════════════════════════
 * 
 * products.json의 실제 구조에 맞춰 수정:
 * - deviceOptions (배열) → devices (객체)로 변환
 * - subsidies 구조 유지 (change, port, new)
 * - Cloudinary 설정 "tworld-store"로 변경
 */

class DataAPI {
    constructor() {
        // 데이터 URL (상대 경로)
        this.productsUrl = 'data/products.json';
        this.imagesIndexUrl = 'data/images-index.json';
        this.imagesDevicesUrl = 'data/images-devices.json';
        this.imagesDetailBaseUrl = 'data/images-detail';
        
        // 캐시
        this.cache = {
            products: null,
            imagesIndex: null,
            imagesDevices: null,
            imagesDetail: {}
        };
        
        // 캐시 유효 시간 (밀리초)
        this.cacheTimeout = 5 * 60 * 1000; // 5분
        
        // 캐시 타임스탬프
        this.cacheTime = {
            products: 0,
            imagesIndex: 0,
            imagesDevices: 0,
            imagesDetail: {}
        };
        
        // 데이터 저장소
        this.products = {
            devices: {},
            plans: {},
            subsidies: {
                change: [],
                port: [],
                new: []
            }
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * products.json 로드 (핵심 수정!)
     * ───────────────────────────────────────────────
     */
    async loadProducts() {
        try {
            // 캐시 확인
            const now = Date.now();
            if (this.cache.products && (now - this.cacheTime.products < this.cacheTimeout)) {
                console.log('✅ products.json 캐시 사용');
                return this.cache.products;
            }
            
            // 데이터 로드
            console.log('🔄 products.json 로드 중...');
            const response = await fetch(this.productsUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to load products.json: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 원본 데이터:', data);
            
            // ✅ 데이터 검증
            if (!data.deviceOptions || !Array.isArray(data.deviceOptions)) {
                throw new Error('deviceOptions 배열이 없습니다');
            }
            
            if (!data.plans || !Array.isArray(data.plans)) {
                throw new Error('plans 배열이 없습니다');
            }
            
            if (!data.subsidies) {
                throw new Error('subsidies 객체가 없습니다');
            }
            
            // ✅ deviceOptions (배열) → devices (객체)로 변환
            console.log('🔄 deviceOptions 변환 중...');
            const devicesMap = {};
            
            data.deviceOptions.forEach((option, index) => {
                try {
                    // deviceId 파싱 (예: "갤럭시S24_256GB")
                    const parts = option.deviceId.split('_');
                    const modelName = parts[0]; // "갤럭시S24"
                    const capacityStr = parts[1]; // "256GB"
                    
                    // 브랜드 추출
                    let brand = "기타";
                    if (modelName.includes("갤럭시") || modelName.includes("Galaxy")) {
                        brand = "삼성";
                    } else if (modelName.includes("아이폰") || modelName.includes("iPhone")) {
                        brand = "애플";
                    } else if (modelName.includes("LG")) {
                        brand = "LG";
                    }
                    
                    // devices 맵에 모델 추가
                    if (!devicesMap[modelName]) {
                        devicesMap[modelName] = {
                            model: modelName,
                            brand: brand,
                            options: []
                        };
                    }
                    
                    // 옵션 추가
                    devicesMap[modelName].options.push({
                        deviceId: option.deviceId,
                        colorOptionId: option.colorOptionId || option.deviceId,
                        capacity: parseInt(capacityStr) || 256,
                        price: parseInt(option.price) || 0,
                        color: option.color || "기본색상",
                        colorHex: option.colorHex || "#000000",
                        visible: option.visible === "Y" || option.visible === true
                    });
                    
                } catch (err) {
                    console.warn(`⚠️ deviceOption[${index}] 변환 실패:`, err, option);
                }
            });
            
            console.log('✅ devices 변환 완료:', Object.keys(devicesMap).length, '개 모델');
            
            // ✅ plans 배열 → 객체로 변환
            const plansMap = {};
            data.plans.forEach((plan, index) => {
                try {
                    plansMap[plan.planId || plan.id] = {
                        id: plan.planId || plan.id,
                        name: plan.name || plan.planName,
                        monthlyFee: parseInt(plan.monthlyFee || plan.price) || 0,
                        category: plan.category || "일반",
                        data: plan.data || "무제한",
                        voice: plan.voice || "무제한",
                        sms: plan.sms || "무제한"
                    };
                } catch (err) {
                    console.warn(`⚠️ plan[${index}] 변환 실패:`, err, plan);
                }
            });
            
            console.log('✅ plans 변환 완료:', Object.keys(plansMap).length, '개');
            
            // ✅ subsidies 구조 그대로 사용
            const subsidiesData = {
                change: data.subsidies.change || [],
                port: data.subsidies.port || [],
                new: data.subsidies.new || []
            };
            
            console.log('✅ subsidies 로드 완료:', {
                change: subsidiesData.change.length,
                port: subsidiesData.port.length,
                new: subsidiesData.new.length
            });
            
            // ✅ 변환된 데이터 저장
            this.products = {
                devices: devicesMap,
                plans: plansMap,
                subsidies: subsidiesData
            };
            
            // 캐시 저장
            this.cache.products = this.products;
            this.cacheTime.products = now;
            
            console.log('✅ products.json 로드 완료!');
            return this.products;
            
        } catch (error) {
            console.error('❌ products.json 로드 실패:', error);
            throw error;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * images-index.json 로드
     * ───────────────────────────────────────────────
     */
    async loadImagesIndex() {
        try {
            // 캐시 확인
            const now = Date.now();
            if (this.cache.imagesIndex && (now - this.cacheTime.imagesIndex < this.cacheTimeout)) {
                return this.cache.imagesIndex;
            }
            
            const response = await fetch(this.imagesIndexUrl);
            if (!response.ok) {
                console.warn('⚠️ images-index.json 없음 (Admin 개발 전이므로 정상)');
                return null;
            }
            
            const data = await response.json();
            this.cache.imagesIndex = data;
            this.cacheTime.imagesIndex = now;
            
            return data;
        } catch (error) {
            console.warn('⚠️ images-index.json 로드 실패:', error.message);
            return null;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * images-devices.json 로드
     * ───────────────────────────────────────────────
     */
    async loadImagesDevices() {
        try {
            const now = Date.now();
            if (this.cache.imagesDevices && (now - this.cacheTime.imagesDevices < this.cacheTimeout)) {
                return this.cache.imagesDevices;
            }
            
            const response = await fetch(this.imagesDevicesUrl);
            if (!response.ok) {
                console.warn('⚠️ images-devices.json 없음');
                return null;
            }
            
            const data = await response.json();
            this.cache.imagesDevices = data;
            this.cacheTime.imagesDevices = now;
            
            return data;
        } catch (error) {
            console.warn('⚠️ images-devices.json 로드 실패:', error.message);
            return null;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 기기 옵션 가져오기
     * ───────────────────────────────────────────────
     */
    async getDeviceOption(deviceId) {
        await this.loadProducts();
        
        // deviceId 파싱 (예: "갤럭시S24_256GB")
        const modelName = deviceId.split('_')[0];
        const deviceModel = this.products.devices[modelName];
        
        if (!deviceModel) {
            console.error(`❌ 모델을 찾을 수 없습니다: ${modelName}`);
            return null;
        }
        
        // 해당 deviceId를 가진 옵션 찾기
        const option = deviceModel.options.find(opt => opt.deviceId === deviceId);
        
        if (!option) {
            console.error(`❌ 옵션을 찾을 수 없습니다: ${deviceId}`);
            return null;
        }
        
        return {
            ...option,
            model: modelName,
            brand: deviceModel.brand
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 모든 기기 목록 가져오기 (devices.html용)
     * ───────────────────────────────────────────────
     */
    async getAllDevices() {
        await this.loadProducts();
        
        const devices = [];
        
        Object.values(this.products.devices).forEach(deviceModel => {
            // 각 모델의 첫 번째 옵션을 대표로 사용
            const firstOption = deviceModel.options[0];
            
            if (firstOption && firstOption.visible !== false) {
                devices.push({
                    model: deviceModel.model,
                    brand: deviceModel.brand,
                    deviceId: firstOption.deviceId,
                    price: firstOption.price,
                    options: deviceModel.options
                });
            }
        });
        
        return devices;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 가져오기
     * ───────────────────────────────────────────────
     */
    async getPlan(planId) {
        await this.loadProducts();
        return this.products.plans[planId] || null;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 모든 요금제 가져오기
     * ───────────────────────────────────────────────
     */
    async getAllPlans() {
        await this.loadProducts();
        return Object.values(this.products.plans);
    }
    
    /**
     * ───────────────────────────────────────────────
     * 지원금 가져오기
     * ───────────────────────────────────────────────
     */
    async getSubsidy(deviceId, planId, joinType) {
        await this.loadProducts();
        
        // joinType 매핑: "기기변경" → "change"
        const typeMap = {
            "기기변경": "change",
            "번호이동": "port",
            "신규가입": "new"
        };
        
        const subsidyType = typeMap[joinType] || joinType;
        const subsidies = this.products.subsidies[subsidyType];
        
        if (!subsidies) {
            console.error(`❌ 지원금 타입을 찾을 수 없습니다: ${joinType}`);
            return null;
        }
        
        // 조합ID로 검색: "deviceId_planId"
        const subsidyId = `${deviceId}_${planId}_${joinType}`;
        const subsidy = subsidies.find(s => 
            s.id === subsidyId || 
            (s.deviceId === deviceId && s.planId === planId)
        );
        
        if (!subsidy) {
            console.warn(`⚠️ 지원금 정보 없음: ${subsidyId}`);
            return {
                common: 0,
                additional: 0,
                select: 0,
                phoneTotal: 0
            };
        }
        
        return {
            common: parseInt(subsidy.subsidies?.common) || 0,
            additional: parseInt(subsidy.subsidies?.additional) || 0,
            select: parseInt(subsidy.subsidies?.select) || 0,
            phoneTotal: parseInt(subsidy.subsidies?.phoneTotal) || 0
        };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 카드 데이터 가져오기 (devices.html용) ⭐
     * ───────────────────────────────────────────────
     * 
     * images-devices.json + products.json 통합
     */
    async getCardData(modelName) {
        try {
            // 1. 이미지 데이터 로드
            const imagesDevices = await this.loadImagesDevices();
            
            if (!imagesDevices || !imagesDevices.devices) {
                console.warn('⚠️ images-devices.json 없음 (Admin 개발 전)');
                // Placeholder 데이터 반환
                return this._getPlaceholderCardData(modelName);
            }
            
            const imageData = imagesDevices.devices[modelName];
            
            if (!imageData || !imageData.visible) {
                console.warn(`⚠️ ${modelName} 이미지 정보 없음`);
                return null;
            }
            
            // 2. 기본 옵션에서 deviceId 생성
            const defaultOpts = imageData.card.default;
            const deviceId = `${modelName}_${defaultOpts.capacity}GB`;
            
            // 3. products.json에서 데이터 조회
            const device = await this.getDeviceOption(deviceId);
            const plan = await this.getPlan(defaultOpts.plan_id);
            const subsidy = await this.getSubsidy(
                deviceId,
                defaultOpts.plan_id,
                defaultOpts.join_type
            );
            
            if (!device || !plan || !subsidy) {
                console.warn(`⚠️ ${modelName} 완전한 데이터 없음`);
                return null;
            }
            
            // 4. 통합 반환
            return {
                model: modelName,
                device: device,
                plan: plan,
                subsidy: subsidy,
                image: imageData
            };
            
        } catch (error) {
            console.error(`❌ getCardData(${modelName}) 실패:`, error);
            return this._getPlaceholderCardData(modelName);
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * Placeholder 카드 데이터 (Admin 개발 전)
     * ───────────────────────────────────────────────
     */
    _getPlaceholderCardData(modelName) {
        // products.json에서 첫 번째 옵션 가져오기
        const deviceModel = this.products.devices[modelName];
        
        if (!deviceModel || !deviceModel.options[0]) {
            return null;
        }
        
        const firstOption = deviceModel.options[0];
        
        return {
            model: modelName,
            device: {
                model: modelName,
                brand: deviceModel.brand,
                deviceId: firstOption.deviceId,
                price: firstOption.price,
                capacity: firstOption.capacity,
                color: firstOption.color
            },
            plan: {
                id: "0청년99",
                name: "0 청년 99",
                monthlyFee: 99000
            },
            subsidy: {
                common: 300000,
                additional: 100000,
                select: 0,
                phoneTotal: 400000
            },
            image: {
                card: {
                    title: modelName,
                    subtitle: "placeholder",
                    default: {
                        color: firstOption.color,
                        capacity: firstOption.capacity,
                        plan_id: "0청년99",
                        join_type: "기기변경"
                    }
                },
                thumbnails: {},
                badge: null,
                sort_order: 999,
                visible: true
            }
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