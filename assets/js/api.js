/**
 * ============================================
 * Data API
 * ============================================
 * products.json & images.json 로드
 */

class API {
  static cache = {
    products: null,
    images: null
  };
  
  /**
   * products.json 로드
   */
  static async getProducts() {
    if (this.cache.products) {
      return this.cache.products;
    }
    
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      this.cache.products = await response.json();
      console.log('✅ products.json 로드 완료');
      return this.cache.products;
    } catch (error) {
      console.error('❌ products.json 로드 실패:', error);
      throw error;
    }
  }
  
  /**
   * 특정 기기 조회
   */
  static async getDevice(deviceId) {
    const data = await this.getProducts();
    return data.devices.find(d => d.id === deviceId);
  }
  
  /**
   * 요금제 목록 조회
   */
  static async getPlans() {
    const data = await this.getProducts();
    return data.plans || [];
  }
  
  /**
   * 지원금 조회
   */
  static async getSubsidy(deviceId, planId, subscriptionType) {
    const data = await this.getProducts();
    
    let subsidyList;
    switch (subscriptionType) {
      case '기기변경':
      case 'change':
        subsidyList = data.subsidies.change;
        break;
      case '번호이동':
      case 'port':
        subsidyList = data.subsidies.port;
        break;
      case '신규가입':
      case 'new':
        subsidyList = data.subsidies.new;
        break;
      default:
        console.error('알 수 없는 가입유형:', subscriptionType);
        return null;
    }
    
    if (!subsidyList) return null;
    
    return subsidyList.find(s => 
      s.deviceId === deviceId && s.planId === planId
    );
  }
  
  /**
   * images.json 로드
   */
  static async getImages(page) {
    // page: 'index', 'devices', 'detail'
    try {
      let url;
      if (page === 'index') {
        url = 'images/images-index.json';
      } else if (page === 'devices') {
        url = 'images/images-devices.json';
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('⚠️ images.json 로드 실패:', error);
      return null;
    }
  }
  
  /**
   * 모델별 이미지 조회
   */
  static async getModelImages(modelName) {
    try {
      const response = await fetch(`images/images-detail/${modelName}.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('⚠️ 모델 이미지 로드 실패:', error);
      return null;
    }
  }
}

// Cloudinary URL 헬퍼
function getCloudinaryUrl(path, options = {}) {
  const cloudName = 'your-cloud-name'; // TODO: 실제 Cloud Name으로 변경
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const transforms = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  transforms.push(`q_${options.quality || 'auto'}`);
  transforms.push('f_webp');
  
  return `${base}/${transforms.join(',')}/${path}`;
}
