/**
 * API 데이터 로드 모듈
 * products.json에서 데이터를 불러오는 기능
 */

const DataAPI = {
  // 데이터 캐시
  _cache: null,
  _loading: false,
  _loaded: false,
  
  // GitHub Pages URL (실제 배포 시 변경 필요)
  DATA_URL: 'https://tworld-store.github.io/tworld-store-data/data/products.json',
  
  /**
   * 데이터 로드
   */
  async load() {
    // 이미 로드된 경우
    if (this._loaded && this._cache) {
      return this._cache;
    }
    
    // 로딩 중인 경우 대기
    if (this._loading) {
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (this._loaded) {
            clearInterval(checkLoaded);
            resolve(this._cache);
          }
        }, 100);
      });
    }
    
    try {
      this._loading = true;
      
      const response = await fetch(this.DATA_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 데이터 검증
      if (!data.deviceOptions || !data.plans || !data.subsidies) {
        throw new Error('Invalid data structure');
      }
      
      this._cache = data;
      this._loaded = true;
      
      return data;
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      throw error;
    } finally {
      this._loading = false;
    }
  },
  
  /**
   * 기기 목록 가져오기
   */
  async getDevices() {
    const data = await this.load();
    return data.deviceOptions.filter(d => d.노출여부 === 'Y');
  },
  
  /**
   * 특정 기기 가져오기
   */
  async getDevice(deviceOptionId) {
    const devices = await this.getDevices();
    return devices.find(d => d.기기옵션ID === deviceOptionId);
  },
  
  /**
   * 요금제 목록 가져오기
   */
  async getPlans() {
    const data = await this.load();
    return data.plans.filter(p => p.노출여부 === 'Y');
  },
  
  /**
   * 카테고리별 요금제 가져오기
   */
  async getPlansByCategory(category) {
    const plans = await this.getPlans();
    if (category === '전체') return plans;
    return plans.filter(p => p.카테고리명 === category);
  },
  
  /**
   * 특정 요금제 가져오기
   */
  async getPlan(planId) {
    const plans = await this.getPlans();
    return plans.find(p => p.요금제ID === planId);
  },
  
  /**
   * 지원금 정보 가져오기
   */
  async getSubsidy(deviceOptionId, planId, joinType) {
    const data = await this.load();
    
    // 가입유형에 따른 지원금 시트 선택
    let subsidySheet;
    switch(joinType) {
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
        throw new Error('Invalid join type');
    }
    
    // 해당 조합 찾기
    const subsidy = subsidySheet.find(s => 
      s.기기옵션ID === deviceOptionId && 
      s.요금제ID === planId &&
      s.노출여부 === 'Y'
    );
    
    return subsidy || null;
  },
  
  /**
   * 전역 설정 가져오기
   */
  async getSettings() {
    const data = await this.load();
    return data.settings || {};
  },
  
  /**
   * 카테고리 목록 가져오기
   */
  async getCategories() {
    const plans = await this.getPlans();
    const categories = [...new Set(plans.map(p => p.카테고리명))];
    return ['전체', ...categories];
  }
};

// 전역으로 노출
window.DataAPI = DataAPI;
