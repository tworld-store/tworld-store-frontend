/**
 * Auth Store (Zustand)
 * 
 * 역할:
 * - 관리자 인증 상태 관리
 * - 로그인/로그아웃
 * - 사용자 정보 저장
 * 
 * @packageDocumentation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 관리자 사용자 타입
 */
interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super-admin' | 'admin' | 'editor';
}

/**
 * Auth Store 상태 타입
 */
interface AuthState {
  /** 현재 로그인한 사용자 */
  user: User | null;
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 인증 확인 완료 여부 */
  isInitialized: boolean;
  
  /** 로그인 */
  login: (user: User) => void;
  
  /** 로그아웃 */
  logout: () => void;
  
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
  
  /** 초기화 완료 표시 */
  setInitialized: () => void;
  
  /** 사용자 정보 업데이트 */
  updateUser: (user: Partial<User>) => void;
}

/**
 * Auth Store
 * 
 * Firebase Authentication 상태를 관리합니다.
 * localStorage에 영속화되어 새로고침 시에도 유지됩니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isLoading: false,
      isInitialized: false,

      /**
       * 로그인
       * 
       * @param user - 로그인한 사용자 정보
       */
      login: (user) => {
        set({ user, isLoading: false });
      },

      /**
       * 로그아웃
       */
      logout: () => {
        set({ user: null, isLoading: false });
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
       * 초기화 완료 표시
       * 
       * Firebase Auth 상태 확인이 완료되었음을 표시합니다.
       */
      setInitialized: () => {
        set({ isInitialized: true });
      },

      /**
       * 사용자 정보 업데이트
       * 
       * @param userData - 업데이트할 사용자 정보
       */
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      // 로딩 상태는 저장하지 않음
      partialize: (state) => ({
        user: state.user,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

/**
 * 인증 여부 확인
 */
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.user !== null);
};

/**
 * 현재 사용자 가져오기
 */
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

/**
 * 관리자 권한 확인
 */
export const useIsAdmin = () => {
  return useAuthStore((state) => {
    if (!state.user) return false;
    return state.user.role === 'super-admin' || state.user.role === 'admin';
  });
};
