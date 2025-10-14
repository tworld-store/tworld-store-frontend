/**
 * 데이터 API 클라이언트
 */
class DataAPI {
  constructor() {
    this.dataUrl = 'https://tworld-store.github.io/tworld-store-data/data/products.json';
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 60 * 60 * 1000; // 1시간
  }
  
  /**
   * 데이터 로드 (캐싱 포함)
   */
  async load() {
    // 캐시 확인
    if (this.cache && Date.now() - this.cacheTime < this.cacheDuration) {
      console.log('📦 캐시에서 데이터 로드');
      return this.cache;
    }
    
    try {
      console.log('🌐 서버에서 데이터 로드 중...');
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 캐시 저장
      this.cache = data;
      this.cacheTime = Date.now();
      
      console.log('✅ 데이터 로드 완료', {
        devices: data.devices?.length,
        plans: data.plans?.length
      });
      
      return data;
      
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error);
      throw error;
    }
  }
  
  /**
   * 기기 목록 가져오기
   */
  async getDevices() {
    const data = await this.load();
    return data.devices || [];
  }
  
  /**
   * 요금제 목록 가져오기
   */
  async getPlans() {
    const data = await this.load();
    return data.plans || [];
  }
  
  /**
   * 지원금 가져오기
   */
  async getSubsidies(joinType) {
    const data = await this.load();
    const subsidies = data.subsidies || {};
    
    switch(joinType) {
      case '기기변경':
        return subsidies.change || [];
      case '번호이동':
        return subsidies.port || [];
      case '신규가입':
        return subsidies.new || [];
      default:
        return [];
    }
  }
  
  /**
   * 설정값 가져오기
   */
  async getSettings() {
    const data = await this.load();
    return data.settings || {};
  }
  
  /**
   * 특정 지원금 찾기
   */
  async findSubsidy(deviceId, planId, joinType) {
    const subsidies = await this.getSubsidies(joinType);
    return subsidies.find(s => 
      s.deviceId === deviceId && s.planId === planId
    );
  }
}

// 전역 인스턴스
const api = new DataAPI();
