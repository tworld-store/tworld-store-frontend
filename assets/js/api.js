/**
 * ═══════════════════════════════════════════════════
 * DataAPI 클래스 - api.js (개선 버전)
 * ═══════════════════════════════════════════════════
 * 
 * products.json 데이터를 로드하고 캐싱하는 API 클래스
 * 
 * 주요 개선사항:
 * - getSubsidy 메서드: 영문→한글 매핑 추가
 * - 디버깅 로그 강화
 */

class DataAPI {
  /**
   * 생성자
   */
  constructor() {
    this.apiUrl = getProductsAPIURL();
    this.cacheEnabled = CACHE_CONFIG.ENABLED;
    this.cacheExpiryTime = CACHE_CONFIG.EXPIRY_TIME;
    this.timeout = API_CONFIG.TIMEOUT;
    
    debugLog('DataAPI 초기화', {
      apiUrl: this.apiUrl,
      cacheEnabled: this.cacheEnabled
    });
  }
  
  // ============================================
  // Public Methods
  // ============================================
  
  /**
   * products.json 데이터 가져오기
   * @returns {Promise<Object>} products.json 데이터
   * @throws {Error} 로드 실패 시
   */
  async fetchProducts() {
    try {
      debugLog('products.json 로드 시작...');
      
      // 1. 캐시 확인
      if (this.cacheEnabled) {
        const cachedData = this._getCachedData();
        if (cachedData) {
          debugLog('캐시된 데이터 사용');
          return cachedData;
        }
      }
      
      // 2. 네트워크에서 로드
      const data = await this._fetchFromNetwork();
      
      // 3. 데이터 검증
      this._validateData(data);
      
      // 4. 캐시 저장
      if (this.cacheEnabled) {
        this._cacheData(data);
      }
      
      debugLog('products.json 로드 완료', data.metadata);
      return data;
      
    } catch (error) {
      errorLog('products.json 로드 실패:', error);
      throw error;
    }
  }
  
  /**
   * 특정 기기 조회
   * @param {string} deviceId - 기기 ID
   * @returns {Promise<Object|null>} 기기 객체 또는 null
   */
  async getDevice(deviceId) {
    try {
      const data = await this.fetchProducts();
      const device = data.devices.find(d => d.id === deviceId);
      
      if (!device) {
        warnLog(`기기를 찾을 수 없습니다: ${deviceId}`);
        return null;
      }
      
      return device;
    } catch (error) {
      errorLog('기기 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 브랜드별 기기 목록 조회
   * @param {string} brand - 브랜드명 (예: "삼성", "애플")
   * @returns {Promise<Array>} 기기 배열
   */
  async getDevicesByBrand(brand) {
    try {
      const data = await this.fetchProducts();
      return data.devices.filter(d => 
        d.brand.toLowerCase() === brand.toLowerCase()
      );
    } catch (error) {
      errorLog('브랜드별 기기 조회 실패:', error);
      return [];
    }
  }
  
  /**
   * 특정 요금제 조회
   * @param {string} planId - 요금제 ID
   * @returns {Promise<Object|null>} 요금제 객체 또는 null
   */
  async getPlan(planId) {
    try {
      const data = await this.fetchProducts();
      const plan = data.plans.find(p => p.id === planId);
      
      if (!plan) {
        warnLog(`요금제를 찾을 수 없습니다: ${planId}`);
        return null;
      }
      
      return plan;
    } catch (error) {
      errorLog('요금제 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 카테고리별 요금제 목록 조회
   * @param {string} categoryId - 카테고리 ID
   * @returns {Promise<Array>} 요금제 배열
   */
  async getPlansByCategory(categoryId) {
    try {
      const data = await this.fetchProducts();
      return data.plans.filter(p => 
        p.category.id === categoryId
      );
    } catch (error) {
      errorLog('카테고리별 요금제 조회 실패:', error);
      return [];
    }
  }
  
  /**
   * ★ 지원금 조회 (개선 버전)
   * 
   * @param {string} subscriptionType - 가입유형 (영문: change/port/new)
   * @param {string} deviceId - 기기 ID
   * @param {string} planId - 요금제 ID
   * @returns {Promise<Object|null>} 지원금 객체 또는 null
   */
  async getSubsidy(subscriptionType, deviceId, planId) {
    try {
      const data = await this.fetchProducts();
      const subsidies = data.subsidies[subscriptionType];
      
      if (!subsidies) {
        warnLog(`지원금 타입을 찾을 수 없습니다: ${subscriptionType}`);
        return null;
      }
      
      // ★ products.json의 id는 한글로 끝나므로 매핑 필요
      // 영문 → 한글 변환
      const typeMapping = {
        'change': '기변',
        'port': '번이',
        'new': '신규'
      };
      
      const koreanType = typeMapping[subscriptionType];
      
      if (!koreanType) {
        errorLog(`알 수 없는 가입유형: ${subscriptionType}`);
        return null;
      }
      
      // 조합ID로 검색 (한글 사용)
      const combinationId = `${deviceId}_${planId}_${koreanType}`;
      const subsidy = subsidies.find(s => s.id === combinationId);
      
      if (!subsidy) {
        warnLog(`지원금을 찾을 수 없습니다: ${combinationId}`);
        debugLog('사용 가능한 지원금 ID:', subsidies.map(s => s.id));
        return null;
      }
      
      debugLog('지원금 조회 성공:', subsidy);
      return subsidy;
      
    } catch (error) {
      errorLog('지원금 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 전역 설정 조회
   * @returns {Promise<Object>} 설정 객체
   */
  async getSettings() {
    try {
      const data = await this.fetchProducts();
      return data.settings;
    } catch (error) {
      errorLog('설정 조회 실패:', error);
      return {};
    }
  }
  
  /**
   * 캐시 초기화
   */
  clearCache() {
    removeFromStorage(STORAGE_KEYS.CACHED_PRODUCTS);
    removeFromStorage(STORAGE_KEYS.CACHE_EXPIRY);
    debugLog('캐시 초기화 완료');
  }
  
  /**
   * 캐시 강제 새로고침
   * @returns {Promise<Object>} products.json 데이터
   */
  async refreshCache() {
    this.clearCache();
    return await this.fetchProducts();
  }
  
  // ============================================
  // Private Methods
  // ============================================
  
  /**
   * 네트워크에서 데이터 가져오기
   * @private
   * @returns {Promise<Object>} products.json 데이터
   * @throws {Error} 네트워크 오류 또는 타임아웃
   */
  async _fetchFromNetwork() {
    debugLog('네트워크에서 데이터 로드 중...', { url: this.apiUrl });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      debugLog('네트워크 로드 완료', {
        size: JSON.stringify(data).length + ' bytes'
      });
      
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('요청 시간 초과 (타임아웃)');
      }
      
      throw error;
    }
  }
  
  /**
   * 캐시된 데이터 가져오기
   * @private
   * @returns {Object|null} 캐시된 데이터 또는 null
   */
  _getCachedData() {
    try {
      const cachedData = getFromStorage(STORAGE_KEYS.CACHED_PRODUCTS);
      const expiryTime = getFromStorage(STORAGE_KEYS.CACHE_EXPIRY);
      
      if (!cachedData || !expiryTime) {
        debugLog('캐시 없음');
        return null;
      }
      
      // 캐시 만료 확인
      if (Date.now() > expiryTime) {
        debugLog('캐시 만료됨');
        this.clearCache();
        return null;
      }
      
      debugLog('캐시 유효', {
        expiresIn: Math.round((expiryTime - Date.now()) / 1000 / 60) + '분'
      });
      
      return cachedData;
      
    } catch (error) {
      errorLog('캐시 로드 실패:', error);
      return null;
    }
  }
  
  /**
   * 데이터 캐싱
   * @private
   * @param {Object} data - 캐싱할 데이터
   */
  _cacheData(data) {
    try {
      const expiryTime = Date.now() + this.cacheExpiryTime;
      
      saveToStorage(STORAGE_KEYS.CACHED_PRODUCTS, data);
      saveToStorage(STORAGE_KEYS.CACHE_EXPIRY, expiryTime);
      
      debugLog('데이터 캐싱 완료', {
        expiresIn: Math.round(this.cacheExpiryTime / 1000 / 60) + '분'
      });
      
    } catch (error) {
      warnLog('캐싱 실패 (계속 진행):', error);
    }
  }
  
  /**
   * 데이터 검증
   * @private
   * @param {Object} data - 검증할 데이터
   * @throws {Error} 데이터가 유효하지 않을 때
   */
  _validateData(data) {
    // 필수 필드 확인
    const requiredFields = ['metadata', 'devices', 'plans', 'subsidies', 'settings'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`필수 필드 누락: ${field}`);
      }
    }
    
    // 배열 타입 확인
    if (!Array.isArray(data.devices) || data.devices.length === 0) {
      throw new Error('devices 배열이 비어있습니다');
    }
    
    if (!Array.isArray(data.plans) || data.plans.length === 0) {
      throw new Error('plans 배열이 비어있습니다');
    }
    
    // subsidies 객체 확인
    const subsidyTypes = ['change', 'port', 'new'];
    for (const type of subsidyTypes) {
      if (!data.subsidies[type] || !Array.isArray(data.subsidies[type])) {
        throw new Error(`subsidies.${type} 배열이 없습니다`);
      }
    }
    
    debugLog('데이터 검증 통과', {
      devices: data.devices.length,
      plans: data.plans.length,
      version: data.metadata.version
    });
  }
}

// ============================================
// 싱글톤 인스턴스 (선택 사항)
// ============================================

/**
 * DataAPI 싱글톤 인스턴스
 * @type {DataAPI|null}
 */
let apiInstance = null;

/**
 * DataAPI 싱글톤 인스턴스 가져오기
 * @returns {DataAPI} DataAPI 인스턴스
 */
function getAPIInstance() {
  if (!apiInstance) {
    apiInstance = new DataAPI();
  }
  return apiInstance;
}

// ============================================
// 전역 Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataAPI,
    getAPIInstance
  };
}

// ============================================
// 초기화 로그
// ============================================

debugLog('API 모듈 로드 완료 (개선 버전)');