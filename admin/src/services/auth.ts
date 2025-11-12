/**
 * Auth 서비스
 * 
 * 역할:
 * - 로그인/로그아웃
 * - 사용자 상태 모니터링
 * - 비밀번호 재설정
 * 
 * @packageDocumentation
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
  UserCredential,
  Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import { useAuthStore } from '../store/authStore';

/**
 * 로그인 정보
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 사용자 정보
 */
interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super-admin' | 'admin' | 'editor';
}

/**
 * Auth 서비스
 */
export const AuthService = {
  /**
   * 이메일/비밀번호 로그인
   * 
   * @param credentials - 로그인 정보
   * @returns 사용자 정보
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const firebaseUser = userCredential.user;
      
      // TODO: Firestore에서 사용자 역할 가져오기
      // 현재는 모든 로그인 사용자를 admin으로 처리
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        role: 'admin', // TODO: Firestore에서 실제 역할 가져오기
      };
      
      // Store 업데이트
      useAuthStore.getState().login(user);
      
      return user;
    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      // Firebase 에러 코드에 따른 에러 메시지
      let errorMessage = '로그인에 실패했습니다.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = '이메일 형식이 올바르지 않습니다.';
          break;
        case 'auth/user-disabled':
          errorMessage = '비활성화된 계정입니다.';
          break;
        case 'auth/user-not-found':
          errorMessage = '존재하지 않는 사용자입니다.';
          break;
        case 'auth/wrong-password':
          errorMessage = '비밀번호가 일치하지 않습니다.';
          break;
        case 'auth/too-many-requests':
          errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      
      // Store 업데이트
      useAuthStore.getState().logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  },

  /**
   * 비밀번호 재설정 이메일 전송
   * 
   * @param email - 이메일 주소
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('비밀번호 재설정 이메일 전송 실패:', error);
      
      let errorMessage = '비밀번호 재설정 이메일 전송에 실패했습니다.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = '이메일 형식이 올바르지 않습니다.';
          break;
        case 'auth/user-not-found':
          errorMessage = '존재하지 않는 사용자입니다.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * 비밀번호 변경
   * 
   * @param newPassword - 새 비밀번호
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      
      let errorMessage = '비밀번호 변경에 실패했습니다.';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = '비밀번호가 너무 약합니다. (최소 6자 이상)';
          break;
        case 'auth/requires-recent-login':
          errorMessage = '보안을 위해 다시 로그인해주세요.';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * 현재 사용자 가져오기
   * 
   * @returns 현재 로그인한 사용자 또는 null
   */
  getCurrentUser(): FirebaseUser | null {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  },

  /**
   * 인증 상태 모니터링
   * 
   * 앱 시작 시 한 번 호출하여 사용자 인증 상태를 모니터링합니다.
   * 
   * @returns 리스너 해제 함수
   */
  onAuthStateChanged(): Unsubscribe {
    const auth = getFirebaseAuth();
    
    return onAuthStateChanged(auth, async (firebaseUser) => {
      const authStore = useAuthStore.getState();
      
      if (firebaseUser) {
        // 로그인 상태
        // TODO: Firestore에서 사용자 역할 가져오기
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          role: 'admin', // TODO: 실제 역할 가져오기
        };
        
        authStore.login(user);
      } else {
        // 로그아웃 상태
        authStore.logout();
      }
      
      // 초기화 완료 표시
      authStore.setInitialized();
    });
  },

  /**
   * 로그인 여부 확인
   * 
   * @returns 로그인 여부
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  },
};

/**
 * 인증 초기화
 * 
 * 앱 시작 시 호출하여 인증 상태를 모니터링합니다.
 * 
 * @returns 리스너 해제 함수
 */
export function initializeAuth(): Unsubscribe {
  return AuthService.onAuthStateChanged();
}

/**
 * 관리자 권한 확인
 * 
 * @returns 관리자 권한 여부
 */
export function checkAdminPermission(): boolean {
  const user = useAuthStore.getState().user;
  
  if (!user) {
    return false;
  }
  
  return user.role === 'super-admin' || user.role === 'admin';
}

/**
 * 에디터 권한 이상 확인
 * 
 * @returns 에디터 이상 권한 여부
 */
export function checkEditorPermission(): boolean {
  const user = useAuthStore.getState().user;
  
  if (!user) {
    return false;
  }
  
  return user.role === 'super-admin' || user.role === 'admin' || user.role === 'editor';
}
