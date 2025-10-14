/**
 * API 데이터 로드 모듈
 * 테스트용 더미 데이터 포함
 */

const DataAPI = {
  // 데이터 캐시
  _cache: null,
  _loading: false,
  _loaded: false,
  
  // GitHub Pages URL (실제 배포 시 변경 필요)
  DATA_URL: 'https://tworld-store.github.io/tworld-store-data/data/products.json',
  
  // 테스트용 더미 데이터 사용 여부
  USE_DUMMY_DATA: true, // false로 변경하면 실제 API 사용
  
  /**
   * 데이터 로드
   */
  async load() {
    // 이미 로드된 경우
    if (this._loaded && this._cache) {
      return this._cache;
    }
    
    // 더미 데이터 사용
    if (this.USE_DUMMY_DATA) {
      console.log('📦 더미 데이터 사용 중...');
      this._cache = this.getDummyData();
      this._loaded = true;
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
   * 더미 데이터 생성
   */
  getDummyData() {
    return {
      deviceOptions: [
        {
          기기옵션ID: 'SAM_GS24_256_BLK',
          브랜드: '삼성',
          모델명: '갤럭시 S24',
          색상명: '팬텀블랙',
          색상HEX: '#1a1a1a',
          용량: 256,
          출고가: 1200000,
          이미지URL: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Galaxy+S24',
          노출여부: 'Y'
        },
        {
          기기옵션ID: 'SAM_GS24_512_GRY',
          브랜드: '삼성',
          모델명: '갤럭시 S24',
          색상명: '마블그레이',
          색상HEX: '#e5e5e5',
          용량: 512,
          출고가: 1350000,
          이미지URL: 'https://via.placeholder.com/300x300/e5e5e5/333333?text=Galaxy+S24',
          노출여부: 'Y'
        },
        {
          기기옵션ID: 'APL_IP15_256_BLK',
          브랜드: '애플',
          모델명: '아이폰 15 Pro',
          색상명: '블랙 티타늄',
          색상HEX: '#2c2c2c',
          용량: 256,
          출고가: 1550000,
          이미지URL: 'https://via.placeholder.com/300x300/2c2c2c/ffffff?text=iPhone+15',
          노출여부: 'Y'
        },
        {
          기기옵션ID: 'APL_IP15_512_WHT',
          브랜드: '애플',
          모델명: '아이폰 15 Pro',
          색상명: '화이트 티타늄',
          색상HEX: '#f5f5f5',
          용량: 512,
          출고가: 1750000,
          이미지URL: 'https://via.placeholder.com/300x300/f5f5f5/333333?text=iPhone+15',
          노출여부: 'Y'
        }
      ],
      plans: [
        {
          요금제ID: '5GX_PLAT',
          요금제명: '5GX 플래티넘',
          카테고리명: '5GX',
          카테고리아이콘: '🚀',
          기본요금: 125000,
          데이터용량: '무제한',
          주요혜택1: '데이터 무제한',
          주요혜택2: '통화 무제한',
          주요혜택3: 'OTT 3개월 무료',
          노출여부: 'Y'
        },
        {
          요금제ID: '5GX_GOLD',
          요금제명: '5GX 골드',
          카테고리명: '5GX',
          카테고리아이콘: '🚀',
          기본요금: 90000,
          데이터용량: '100GB',
          주요혜택1: '데이터 100GB',
          주요혜택2: '통화 무제한',
          주요혜택3: 'OTT 1개월 무료',
          노출여부: 'Y'
        },
        {
          요금제ID: 'YOUTH_PLUS',
          요금제명: '청년 플러스',
          카테고리명: '청년',
          카테고리아이콘: '👨',
          기본요금: 55000,
          데이터용량: '50GB',
          주요혜택1: '데이터 50GB',
          주요혜택2: '통화 무제한',
          주요혜택3: '청년 할인 적용',
          노출여부: 'Y'
        },
        {
          요금제ID: 'SENIOR_CARE',
          요금제명: '시니어 케어',
          카테고리명: '시니어',
          카테고리아이콘: '👵',
          기본요금: 45000,
          데이터용량: '30GB',
          주요혜택1: '데이터 30GB',
          주요혜택2: '통화 무제한',
          주요혜택3: '시니어 할인',
          노출여부: 'Y'
        }
      ],
      subsidies: {
        change: [
          {
            기기옵션ID: 'SAM_GS24_256_BLK',
            요금제ID: '5GX_PLAT',
            공통지원금: 350000,
            추가지원금: 150000,
            선약지원금: 200000,
            노출여부: 'Y'
          },
          {
            기기옵션ID: 'SAM_GS24_256_BLK',
            요금제ID: '5GX_GOLD',
            공통지원금: 300000,
            추가지원금: 100000,
            선약지원금: 180000,
            노출여부: 'Y'
          },
          {
            기기옵션ID: 'SAM_GS24_512_GRY',
            요금제ID: '5GX_PLAT',
            공통지원금: 350000,
            추가지원금: 150000,
            선약지원금: 200000,
            노출여부: 'Y'
          },
          {
            기기옵션ID: 'APL_IP15_256_BLK',
            요금제ID: '5GX_PLAT',
            공통지원금: 400000,
            추가지원금: 200000,
            선약지원금: 250000,
            노출여부: 'Y'
          },
          {
            기기옵션ID: 'APL_IP15_512_WHT',
            요금제ID: '5GX_PLAT',
            공통지원금: 400000,
            추가지원금: 200000,
            선약지원금: 250000,
            노출여부: 'Y'
          }
        ],
        port: [
          {
            기기옵션ID: 'SAM_GS24_256_BLK',
            요금제ID: '5GX_PLAT',
            공통지원금: 400000,
            추가지원금: 200000,
            선약지원금: 250000,
            노출여부: 'Y'
          },
          {
            기기옵션ID: 'APL_IP15_256_BLK',
            요금제ID: '5GX_PLAT',
            공통지원금: 450000,
            추가지원금: 250000,
            선약지원금: 300000,
            노출여부: 'Y'
          }
        ],
        new: [
          {
            기기옵션ID: 'SAM_GS24_256_BLK',
            요금제ID: '5GX_PLAT',
            공통지원금: 300000,
            추가지원금: 100000,
            선약지원금: 150000,
            노출여부: 'Y'
          },
          {
            기기옵션ID: 'APL_IP15_256_BLK',
            요금제ID: '5GX_PLAT',
            공통지원금: 350000,
            추가지원금: 150000,
            선약지원금: 200000,
            노출여부: 'Y'
          }
        ]
      },
      settings: {},
      updatedAt: new Date().toISOString()
    };
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
