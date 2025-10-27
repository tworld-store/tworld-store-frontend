/**
 * ═══════════════════════════════════════════════════
 * SKT 쇼핑몰 - API 클래스
 * ═══════════════════════════════════════════════════
 * 
 * 용도: GitHub Pages의 products.json을 로드하고 데이터 제공
 * 특징: 캐싱, 에러 처리, 브랜드/카테고리별 그룹화
 */

class DataAPI {
    /**
     * 생성자
     */
    constructor() {
        // GitHub Pages URL (실제 배포 시 수정 필요)
        this.jsonUrl = 'https://tworld-store.github.io/tworld-store-data/data/products.json';
        
        // 메모리 캐시
        this.cache = {
            data: null,
            timestamp: null,
            ttl: 3600000 // 1시간 (밀리초)
        };
        
        // 로딩 상태
        this.loading = false;
        this.loadPromise = null;
    }
    
    /**
     * ───────────────────────────────────────────────
     * JSON 데이터 로드 (캐싱 포함)
     * ───────────────────────────────────────────────
     */
    async load() {
        // 1. 캐시 확인
        const now = Date.now();
        if (this.cache.data && this.cache.timestamp) {
            if (now - this.cache.timestamp < this.cache.ttl) {
                console.log('✅ 캐시된 데이터 사용');
                return this.cache.data;
            }
        }
        
        // 2. 이미 로딩 중이면 기존 Promise 반환
        if (this.loading && this.loadPromise) {
            console.log('⏳ 로딩 중... 기존 요청 대기');
            return this.loadPromise;
        }
        
        // 3. 새로운 데이터 로드
        this.loading = true;
        this.loadPromise = this._fetchData();
        
        try {
            const data = await this.loadPromise;
            
            // 캐시 저장
            this.cache.data = data;
            this.cache.timestamp = Date.now();
            
            console.log('✅ 데이터 로드 성공');
            return data;
            
        } catch (error) {
            console.error('❌ 데이터 로드 실패:', error);
            throw error;
            
        } finally {
            this.loading = false;
            this.loadPromise = null;
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 실제 fetch 실행
     * ───────────────────────────────────────────────
     * @private
     */
    async _fetchData() {
        const startTime = performance.now();
        
        try {
            const response = await fetch(this.jsonUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`📊 데이터 로드 완료 (${duration}ms)`);
            
            // 데이터 유효성 검증
            this._validateData(data);
            
            return data;
            
        } catch (error) {
            console.error('Fetch 오류:', error);
            throw new Error(`데이터를 불러올 수 없습니다: ${error.message}`);
        }
    }
    
    /**
     * ───────────────────────────────────────────────
     * 데이터 유효성 검증
     * ───────────────────────────────────────────────
     * @private
     */
    _validateData(data) {
        if (!data) {
            throw new Error('데이터가 비어있습니다');
        }
        
        if (!data.devices || !Array.isArray(data.devices)) {
            throw new Error('기기 데이터가 올바르지 않습니다');
        }
        
        if (!data.plans || !Array.isArray(data.plans)) {
            throw new Error('요금제 데이터가 올바르지 않습니다');
        }
        
        if (!data.subsidies || typeof data.subsidies !== 'object') {
            throw new Error('지원금 데이터가 올바르지 않습니다');
        }
        
        console.log(`✅ 데이터 검증 완료: 기기 ${data.devices.length}개, 요금제 ${data.plans.length}개`);
    }
    
    /**
     * ───────────────────────────────────────────────
     * 기기 목록 조회 (브랜드별 그룹화)
     * ───────────────────────────────────────────────
     * @returns {Object} { samsung: [...], apple: [...], lg: [...] }
     */
    async getDevices() {
        const data = await this.load();
        
        // 브랜드별 그룹화
        const grouped = {
            samsung: [],
            apple: [],
            lg: [],
            other: []
        };
        
        data.devices.forEach(device => {
            const brand = device.brand.toLowerCase();
            
            if (brand.includes('삼성') || brand.includes('samsung')) {
                grouped.samsung.push(device);
            } else if (brand.includes('애플') || brand.includes('apple')) {
                grouped.apple.push(device);
            } else if (brand.includes('lg')) {
                grouped.lg.push(device);
            } else {
                grouped.other.push(device);
            }
        });
        
        return grouped;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 기기 조회
     * ───────────────────────────────────────────────
     * @param {string} deviceId - 기기옵션ID
     * @returns {Object|null}
     */
    async getDevice(deviceId) {
        const data = await this.load();
        
        const device = data.devices.find(d => d.id === deviceId);
        
        if (!device) {
            console.warn(`기기를 찾을 수 없습니다: ${deviceId}`);
            return null;
        }
        
        return device;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 브랜드의 기기 목록 조회
     * ───────────────────────────────────────────────
     * @param {string} brand - 브랜드명 (삼성, 애플, LG 등)
     * @returns {Array}
     */
    async getDevicesByBrand(brand) {
        const data = await this.load();
        
        const brandLower = brand.toLowerCase();
        
        return data.devices.filter(device => {
            const deviceBrand = device.brand.toLowerCase();
            return deviceBrand.includes(brandLower);
        });
    }
    
    /**
     * ───────────────────────────────────────────────
     * 요금제 목록 조회 (카테고리별 그룹화)
     * ───────────────────────────────────────────────
     * @returns {Object} { '5GX': [...], '청년': [...], ... }
     */
    async getPlans() {
        const data = await this.load();
        
        // 카테고리별 그룹화
        const grouped = {};
        
        data.plans.forEach(plan => {
            const category = plan.category.name || '기타';
            
            if (!grouped[category]) {
                grouped[category] = [];
            }
            
            grouped[category].push(plan);
        });
        
        return grouped;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 요금제 조회
     * ───────────────────────────────────────────────
     * @param {string} planId - 요금제ID
     * @returns {Object|null}
     */
    async getPlan(planId) {
        const data = await this.load();
        
        const plan = data.plans.find(p => p.id === planId);
        
        if (!plan) {
            console.warn(`요금제를 찾을 수 없습니다: ${planId}`);
            return null;
        }
        
        return plan;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 카테고리의 요금제 목록 조회
     * ───────────────────────────────────────────────
     * @param {string} categoryId - 카테고리ID
     * @returns {Array}
     */
    async getPlansByCategory(categoryId) {
        const data = await this.load();
        
        return data.plans.filter(plan => plan.category.id === categoryId);
    }
    
    /**
     * ───────────────────────────────────────────────
     * ★ 지원금 조회 (핵심 메서드)
     * ───────────────────────────────────────────────
     * @param {string} deviceId - 기기옵션ID
     * @param {string} planId - 요금제ID
     * @param {string} joinType - 가입유형 (기기변경/번호이동/신규가입)
     * @returns {Object|null}
     */
    async getSubsidy(deviceId, planId, joinType) {
        const data = await this.load();
        
        // 가입유형에 따른 시트 선택
        let subsidySheet;
        
        switch (joinType) {
            case '기기변경':
                subsidySheet = data.subsidies.change;
                break;
            case '번호이동':
                subsidySheet = data.subsidies.port;
                break;
            case '신규가입':
                subsidySheet = data.subsidies.new;
                break;
            default:
                console.error(`알 수 없는 가입유형: ${joinType}`);
                return null;
        }
        
        if (!subsidySheet || !Array.isArray(subsidySheet)) {
            console.error(`지원금 데이터가 없습니다: ${joinType}`);
            return null;
        }
        
        // 조합 찾기
        const subsidy = subsidySheet.find(s => 
            s.deviceId === deviceId && 
            s.planId === planId
        );
        
        if (!subsidy) {
            console.warn(`지원금 정보를 찾을 수 없습니다: ${deviceId} + ${planId} (${joinType})`);
            return null;
        }
        
        return subsidy;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 전역설정 조회
     * ───────────────────────────────────────────────
     * @returns {Object}
     */
    async getSettings() {
        const data = await this.load();
        
        if (!data.settings) {
            console.warn('전역설정이 없습니다');
            return {};
        }
        
        return data.settings.parsed || data.settings.raw || {};
    }
    
    /**
     * ───────────────────────────────────────────────
     * 특정 설정값 조회
     * ───────────────────────────────────────────────
     * @param {string} key - 설정 키
     * @param {*} defaultValue - 기본값
     * @returns {*}
     */
    async getSetting(key, defaultValue = null) {
        const settings = await this.getSettings();
        
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }
    
    /**
     * ───────────────────────────────────────────────
     * 인기 기기 조회 (메인 페이지용)
     * ───────────────────────────────────────────────
     * @param {number} limit - 가져올 개수 (기본 8개)
     * @returns {Array}
     */
    async getPopularDevices(limit = 8) {
        const data = await this.load();
        
        // TODO: 실제로는 조회수나 판매량 기준으로 정렬
        // 현재는 최신순으로 반환
        return data.devices.slice(0, limit);
    }
    
    /**
     * ───────────────────────────────────────────────
     * 검색 (기기 + 요금제)
     * ───────────────────────────────────────────────
     * @param {string} query - 검색어
     * @returns {Object} { devices: [...], plans: [...] }
     */
    async search(query) {
        const data = await this.load();
        
        const queryLower = query.toLowerCase();
        
        const devices = data.devices.filter(device => {
            return device.searchText && device.searchText.includes(queryLower);
        });
        
        const plans = data.plans.filter(plan => {
            return plan.searchText && plan.searchText.includes(queryLower);
        });
        
        return { devices, plans };
    }
    
    /**
     * ───────────────────────────────────────────────
     * 캐시 강제 새로고침
     * ───────────────────────────────────────────────
     */
    async refresh() {
        console.log('🔄 캐시 새로고침...');
        this.cache.data = null;
        this.cache.timestamp = null;
        return await this.load();
    }
    
    /**
     * ───────────────────────────────────────────────
     * 통계 정보 조회
     * ───────────────────────────────────────────────
     * @returns {Object}
     */
    async getStats() {
        const data = await this.load();
        
        return {
            totalDevices: data.devices.length,
            totalPlans: data.plans.length,
            totalSubsidies: {
                change: data.subsidies.change.length,
                port: data.subsidies.port.length,
                new: data.subsidies.new.length
            },
            lastUpdated: data.metadata?.updatedAt || 'Unknown',
            version: data.metadata?.version || '1.0'
        };
    }
}

// ═══════════════════════════════════════════════════
// 전역 인스턴스 생성
// ═══════════════════════════════════════════════════
const api = new DataAPI();

// ═══════════════════════════════════════════════════
// 에러 핸들러 (전역)
// ═══════════════════════════════════════════════════
window.addEventListener('unhandledrejection', function(event) {
    console.error('처리되지 않은 Promise 거부:', event.reason);
    
    // 사용자에게 친절한 메시지 표시
    if (event.reason && event.reason.message) {
        if (event.reason.message.includes('데이터를 불러올 수 없습니다')) {
            alert('데이터를 불러오는 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
        }
    }
});

// ═══════════════════════════════════════════════════
// 개발자 도구용 헬퍼
// ═══════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    window.API = api;
    
    // 개발 모드 감지
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 개발 모드: API 객체가 window.API로 노출되었습니다');
        console.log('사용 예시:');
        console.log('  await API.load()');
        console.log('  await API.getDevices()');
        console.log('  await API.getPlans()');
        console.log('  await API.getStats()');
    }
}

// ═══════════════════════════════════════════════════
// 페이지 로드 시 미리 데이터 로드 (선택사항)
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 페이지 로드 완료, 데이터 미리 로드 중...');
        
        const startTime = performance.now();
        await api.load();
        const duration = (performance.now() - startTime).toFixed(2);
        
        console.log(`✅ 데이터 미리 로드 완료 (${duration}ms)`);
        
        // 통계 정보 로그
        const stats = await api.getStats();
        console.log('📊 통계:', stats);
        
    } catch (error) {
        console.error('❌ 초기 로드 실패:', error);
        
        // 사용자에게 알림
        const errorBanner = document.createElement('div');
        errorBanner.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-3 z-50';
        errorBanner.textContent = '데이터를 불러오는 중 문제가 발생했습니다. 페이지를 새로고침해주세요.';
        document.body.prepend(errorBanner);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            errorBanner.remove();
        }, 5000);
    }
});