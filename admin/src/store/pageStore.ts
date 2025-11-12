/**
 * Page Store (Zustand)
 * 
 * 역할:
 * - 페이지 목록 관리
 * - 현재 편집 중인 페이지
 * - 페이지 생성/수정/삭제
 * 
 * @packageDocumentation
 */

import { create } from 'zustand';

/**
 * Page 타입 (간소화)
 * 실제 타입은 shared/types/page.ts 참조
 */
interface Page {
  id: string;
  title: string;
  slug: string;
  type: 'main' | 'product-list' | 'product-detail' | 'board' | 'custom';
  status: 'draft' | 'published';
  sections: any[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Page Store 상태 타입
 */
interface PageState {
  /** 페이지 목록 */
  pages: Page[];
  
  /** 현재 편집 중인 페이지 */
  currentPage: Page | null;
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 저장 중 상태 */
  isSaving: boolean;
  
  /** 발행 중 상태 */
  isPublishing: boolean;
  
  /** 페이지 목록 설정 */
  setPages: (pages: Page[]) => void;
  
  /** 현재 페이지 설정 */
  setCurrentPage: (page: Page | null) => void;
  
  /** 페이지 추가 */
  addPage: (page: Page) => void;
  
  /** 페이지 업데이트 */
  updatePage: (id: string, updates: Partial<Page>) => void;
  
  /** 페이지 삭제 */
  deletePage: (id: string) => void;
  
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
  
  /** 저장 중 상태 설정 */
  setSaving: (saving: boolean) => void;
  
  /** 발행 중 상태 설정 */
  setPublishing: (publishing: boolean) => void;
  
  /** 페이지 가져오기 (ID로) */
  getPageById: (id: string) => Page | undefined;
}

/**
 * Page Store
 * 
 * 페이지 빌더에서 생성/관리하는 페이지들의 상태를 관리합니다.
 */
export const usePageStore = create<PageState>((set, get) => ({
  // 초기 상태
  pages: [],
  currentPage: null,
  isLoading: false,
  isSaving: false,
  isPublishing: false,

  /**
   * 페이지 목록 설정
   * 
   * @param pages - 페이지 배열
   */
  setPages: (pages) => {
    set({ pages });
  },

  /**
   * 현재 페이지 설정
   * 
   * @param page - 현재 편집할 페이지
   */
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  /**
   * 페이지 추가
   * 
   * @param page - 추가할 페이지
   */
  addPage: (page) => {
    set((state) => ({
      pages: [...state.pages, page],
    }));
  },

  /**
   * 페이지 업데이트
   * 
   * @param id - 페이지 ID
   * @param updates - 업데이트할 필드
   */
  updatePage: (id, updates) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === id ? { ...page, ...updates } : page
      ),
      // 현재 페이지도 업데이트
      currentPage:
        state.currentPage?.id === id
          ? { ...state.currentPage, ...updates }
          : state.currentPage,
    }));
  },

  /**
   * 페이지 삭제
   * 
   * @param id - 삭제할 페이지 ID
   */
  deletePage: (id) => {
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== id),
      // 현재 페이지가 삭제되면 null로
      currentPage: state.currentPage?.id === id ? null : state.currentPage,
    }));
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
   * 저장 중 상태 설정
   * 
   * @param saving - 저장 중 여부
   */
  setSaving: (saving) => {
    set({ isSaving: saving });
  },

  /**
   * 발행 중 상태 설정
   * 
   * @param publishing - 발행 중 여부
   */
  setPublishing: (publishing) => {
    set({ isPublishing: publishing });
  },

  /**
   * ID로 페이지 가져오기
   * 
   * @param id - 페이지 ID
   * @returns 페이지 또는 undefined
   */
  getPageById: (id) => {
    return get().pages.find((page) => page.id === id);
  },
}));

/**
 * 페이지 목록 가져오기 (훅)
 */
export const usePages = () => {
  return usePageStore((state) => state.pages);
};

/**
 * 현재 페이지 가져오기 (훅)
 */
export const useCurrentPage = () => {
  return usePageStore((state) => state.currentPage);
};

/**
 * 발행된 페이지만 가져오기 (훅)
 */
export const usePublishedPages = () => {
  return usePageStore((state) =>
    state.pages.filter((page) => page.status === 'published')
  );
};

/**
 * 초안 페이지만 가져오기 (훅)
 */
export const useDraftPages = () => {
  return usePageStore((state) =>
    state.pages.filter((page) => page.status === 'draft')
  );
};
