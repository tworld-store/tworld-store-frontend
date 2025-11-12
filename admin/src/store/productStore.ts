/**
 * Product Store (Zustand)
 * 
 * 역할:
 * - 상품 목록 관리
 * - 필터링/정렬
 * - Google Sheets 동기화 상태
 * 
 * @packageDocumentation
 */

import { create } from 'zustand';

/**
 * Product 타입 (간소화)
 * 실제 타입은 shared/types/product.ts 참조
 */
interface Product {
  id: string;
  brand: 'samsung' | 'apple' | 'etc';
  model: string;
  storage: number;
  price: number;
  colors: any[];
  stock: 'in-stock' | 'out-of-stock';
  featured: boolean;
}

/**
 * 상품 필터 옵션
 */
interface ProductFilter {
  brand?: 'samsung' | 'apple' | 'etc' | 'all';
  stock?: 'in-stock' | 'out-of-stock' | 'all';
  featured?: boolean;
  search?: string;
}

/**
 * 상품 정렬 옵션
 */
type ProductSort = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'latest';

/**
 * Product Store 상태 타입
 */
interface ProductState {
  /** 상품 목록 */
  products: Product[];
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 동기화 중 상태 */
  isSyncing: boolean;
  
  /** 마지막 동기화 시간 */
  lastSyncedAt: Date | null;
  
  /** 필터 */
  filter: ProductFilter;
  
  /** 정렬 */
  sort: ProductSort;
  
  /** 상품 목록 설정 */
  setProducts: (products: Product[]) => void;
  
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
  
  /** 동기화 중 상태 설정 */
  setSyncing: (syncing: boolean) => void;
  
  /** 동기화 시간 설정 */
  setLastSyncedAt: (date: Date) => void;
  
  /** 필터 설정 */
  setFilter: (filter: Partial<ProductFilter>) => void;
  
  /** 필터 초기화 */
  resetFilter: () => void;
  
  /** 정렬 설정 */
  setSort: (sort: ProductSort) => void;
  
  /** 필터링된 상품 가져오기 */
  getFilteredProducts: () => Product[];
  
  /** 상품 가져오기 (ID로) */
  getProductById: (id: string) => Product | undefined;
}

/**
 * Product Store
 * 
 * Google Sheets와 동기화된 상품 데이터를 관리합니다.
 */
export const useProductStore = create<ProductState>((set, get) => ({
  // 초기 상태
  products: [],
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  filter: {},
  sort: 'latest',

  /**
   * 상품 목록 설정
   * 
   * @param products - 상품 배열
   */
  setProducts: (products) => {
    set({ products });
  },

  /**
   * 로딩 상태 설정
   * 
   * @param loading - 로딩 여부
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  /**
   * 동기화 중 상태 설정
   * 
   * @param syncing - 동기화 중 여부
   */
  setSyncing: (syncing) => {
    set({ isSyncing: syncing });
  },

  /**
   * 동기화 시간 설정
   * 
   * @param date - 동기화 시간
   */
  setLastSyncedAt: (date) => {
    set({ lastSyncedAt: date });
  },

  /**
   * 필터 설정
   * 
   * @param filter - 필터 옵션
   */
  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }));
  },

  /**
   * 필터 초기화
   */
  resetFilter: () => {
    set({ filter: {} });
  },

  /**
   * 정렬 설정
   * 
   * @param sort - 정렬 옵션
   */
  setSort: (sort) => {
    set({ sort });
  },

  /**
   * 필터링된 상품 가져오기
   * 
   * @returns 필터링 및 정렬된 상품 배열
   */
  getFilteredProducts: () => {
    const { products, filter, sort } = get();
    
    // 필터링
    let filtered = products;
    
    if (filter.brand && filter.brand !== 'all') {
      filtered = filtered.filter((p) => p.brand === filter.brand);
    }
    
    if (filter.stock && filter.stock !== 'all') {
      filtered = filtered.filter((p) => p.stock === filter.stock);
    }
    
    if (filter.featured !== undefined) {
      filtered = filtered.filter((p) => p.featured === filter.featured);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.model.toLowerCase().includes(searchLower)
      );
    }
    
    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.model.localeCompare(b.model);
        case 'name-desc':
          return b.model.localeCompare(a.model);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'latest':
        default:
          return 0; // ID 순서 유지
      }
    });
    
    return sorted;
  },

  /**
   * ID로 상품 가져오기
   * 
   * @param id - 상품 ID
   * @returns 상품 또는 undefined
   */
  getProductById: (id) => {
    return get().products.find((product) => product.id === id);
  },
}));

/**
 * 상품 목록 가져오기 (훅)
 */
export const useProducts = () => {
  return useProductStore((state) => state.products);
};

/**
 * 필터링된 상품 가져오기 (훅)
 */
export const useFilteredProducts = () => {
  return useProductStore((state) => state.getFilteredProducts());
};

/**
 * 추천 상품만 가져오기 (훅)
 */
export const useFeaturedProducts = () => {
  return useProductStore((state) =>
    state.products.filter((p) => p.featured)
  );
};

/**
 * 동기화 상태 가져오기 (훅)
 */
export const useSyncStatus = () => {
  return useProductStore((state) => ({
    isSyncing: state.isSyncing,
    lastSyncedAt: state.lastSyncedAt,
  }));
};
