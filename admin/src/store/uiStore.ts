/**
 * UI Store (Zustand)
 * 
 * 역할:
 * - 전역 UI 상태 관리
 * - 사이드바, 모달, 토스트 등
 * - 테마 설정
 * 
 * @packageDocumentation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 토스트 타입
 */
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * 모달 상태
 */
interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

/**
 * UI Store 상태 타입
 */
interface UIState {
  /** 사이드바 열림 상태 */
  isSidebarOpen: boolean;
  
  /** 사이드바 접힘 상태 (모바일) */
  isSidebarCollapsed: boolean;
  
  /** 테마 */
  theme: 'light' | 'dark' | 'auto';
  
  /** 토스트 목록 */
  toasts: Toast[];
  
  /** 열린 모달 */
  modal: Modal | null;
  
  /** 로딩 오버레이 표시 */
  isGlobalLoading: boolean;
  
  /** 사이드바 토글 */
  toggleSidebar: () => void;
  
  /** 사이드바 열기/닫기 */
  setSidebarOpen: (open: boolean) => void;
  
  /** 사이드바 접기/펼치기 */
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  /** 테마 설정 */
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  
  /** 토스트 추가 */
  addToast: (toast: Omit<Toast, 'id'>) => string;
  
  /** 토스트 제거 */
  removeToast: (id: string) => void;
  
  /** 모든 토스트 제거 */
  clearToasts: () => void;
  
  /** 모달 열기 */
  openModal: (modal: Omit<Modal, 'id'>) => void;
  
  /** 모달 닫기 */
  closeModal: () => void;
  
  /** 전역 로딩 표시 */
  setGlobalLoading: (loading: boolean) => void;
}

/**
 * UI Store
 * 
 * 전역 UI 상태를 관리합니다.
 * 사이드바와 테마 설정은 localStorage에 영속화됩니다.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      theme: 'light',
      toasts: [],
      modal: null,
      isGlobalLoading: false,

      /**
       * 사이드바 토글
       */
      toggleSidebar: () => {
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
        }));
      },

      /**
       * 사이드바 열기/닫기
       * 
       * @param open - 열림 여부
       */
      setSidebarOpen: (open) => {
        set({ isSidebarOpen: open });
      },

      /**
       * 사이드바 접기/펼치기
       * 
       * @param collapsed - 접힘 여부
       */
      setSidebarCollapsed: (collapsed) => {
        set({ isSidebarCollapsed: collapsed });
      },

      /**
       * 테마 설정
       * 
       * @param theme - 테마 (light | dark | auto)
       */
      setTheme: (theme) => {
        set({ theme });
        
        // HTML 요소에 테마 클래스 적용
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // auto: 시스템 설정 따름
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      /**
       * 토스트 추가
       * 
       * @param toast - 토스트 정보
       * @returns 생성된 토스트 ID
       */
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = {
          id,
          ...toast,
          duration: toast.duration || 3000,
        };
        
        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));
        
        // 자동 제거
        if (newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
        
        return id;
      },

      /**
       * 토스트 제거
       * 
       * @param id - 토스트 ID
       */
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      /**
       * 모든 토스트 제거
       */
      clearToasts: () => {
        set({ toasts: [] });
      },

      /**
       * 모달 열기
       * 
       * @param modal - 모달 정보
       */
      openModal: (modal) => {
        set({
          modal: {
            id: `modal-${Date.now()}`,
            ...modal,
          },
        });
      },

      /**
       * 모달 닫기
       */
      closeModal: () => {
        set({ modal: null });
      },

      /**
       * 전역 로딩 표시
       * 
       * @param loading - 로딩 여부
       */
      setGlobalLoading: (loading) => {
        set({ isGlobalLoading: loading });
      },
    }),
    {
      name: 'ui-storage',
      // 토스트와 모달은 저장하지 않음
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

/**
 * 사이드바 상태 가져오기 (훅)
 */
export const useSidebarState = () => {
  return useUIStore((state) => ({
    isOpen: state.isSidebarOpen,
    isCollapsed: state.isSidebarCollapsed,
    toggle: state.toggleSidebar,
    setOpen: state.setSidebarOpen,
    setCollapsed: state.setSidebarCollapsed,
  }));
};

/**
 * 테마 가져오기 (훅)
 */
export const useTheme = () => {
  return useUIStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));
};

/**
 * 토스트 관리 (훅)
 */
export const useToast = () => {
  return useUIStore((state) => ({
    toasts: state.toasts,
    addToast: state.addToast,
    removeToast: state.removeToast,
    clearToasts: state.clearToasts,
  }));
};

/**
 * 모달 관리 (훅)
 */
export const useModal = () => {
  return useUIStore((state) => ({
    modal: state.modal,
    openModal: state.openModal,
    closeModal: state.closeModal,
  }));
};

/**
 * 토스트 헬퍼 함수
 */
export const toast = {
  success: (message: string, duration?: number) => {
    return useUIStore.getState().addToast({ type: 'success', message, duration });
  },
  error: (message: string, duration?: number) => {
    return useUIStore.getState().addToast({ type: 'error', message, duration });
  },
  warning: (message: string, duration?: number) => {
    return useUIStore.getState().addToast({ type: 'warning', message, duration });
  },
  info: (message: string, duration?: number) => {
    return useUIStore.getState().addToast({ type: 'info', message, duration });
  },
};
