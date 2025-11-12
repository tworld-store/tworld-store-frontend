/**
 * Firebase API 서비스
 * 
 * 역할:
 * - Firestore CRUD 작업
 * - 페이지, 상품, 게시판 데이터 관리
 * - 실시간 리스너 관리
 * 
 * @packageDocumentation
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

/**
 * Firestore 컬렉션 이름
 */
export const COLLECTIONS = {
  PAGES: 'pages',
  PRODUCTS: 'products',
  BOARDS: 'boards',
  BOARD_POSTS: 'board_posts',
  CONSULTATIONS: 'consultations',
  MENUS: 'menus',
  SETTINGS: 'settings',
} as const;

/**
 * 페이지 API
 */
export const PageAPI = {
  /**
   * 모든 페이지 가져오기
   * 
   * @returns 페이지 배열
   */
  async getAll(): Promise<any[]> {
    try {
      const db = getFirebaseFirestore();
      const pagesRef = collection(db, COLLECTIONS.PAGES);
      const q = query(pagesRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('페이지 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 페이지 가져오기 (ID로)
   * 
   * @param id - 페이지 ID
   * @returns 페이지 데이터
   */
  async getById(id: string): Promise<any | null> {
    try {
      const db = getFirebaseFirestore();
      const pageRef = doc(db, COLLECTIONS.PAGES, id);
      const snapshot = await getDoc(pageRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    } catch (error) {
      console.error('페이지 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 페이지 생성
   * 
   * @param data - 페이지 데이터
   * @returns 생성된 페이지 ID
   */
  async create(data: any): Promise<string> {
    try {
      const db = getFirebaseFirestore();
      const pagesRef = collection(db, COLLECTIONS.PAGES);
      
      const docRef = await addDoc(pagesRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('페이지 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 페이지 업데이트
   * 
   * @param id - 페이지 ID
   * @param data - 업데이트할 데이터
   */
  async update(id: string, data: any): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const pageRef = doc(db, COLLECTIONS.PAGES, id);
      
      await updateDoc(pageRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('페이지 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 페이지 삭제
   * 
   * @param id - 페이지 ID
   */
  async delete(id: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const pageRef = doc(db, COLLECTIONS.PAGES, id);
      
      await deleteDoc(pageRef);
    } catch (error) {
      console.error('페이지 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 페이지 실시간 리스너
   * 
   * @param callback - 변경 시 호출될 콜백
   * @returns 리스너 해제 함수
   */
  onSnapshot(callback: (pages: any[]) => void): Unsubscribe {
    const db = getFirebaseFirestore();
    const pagesRef = collection(db, COLLECTIONS.PAGES);
    const q = query(pagesRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const pages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(pages);
    });
  },
};

/**
 * 상품 API
 */
export const ProductAPI = {
  /**
   * 모든 상품 가져오기
   * 
   * @returns 상품 배열
   */
  async getAll(): Promise<any[]> {
    try {
      const db = getFirebaseFirestore();
      const productsRef = collection(db, COLLECTIONS.PRODUCTS);
      
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 상품 가져오기 (ID로)
   * 
   * @param id - 상품 ID
   * @returns 상품 데이터
   */
  async getById(id: string): Promise<any | null> {
    try {
      const db = getFirebaseFirestore();
      const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
      const snapshot = await getDoc(productRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    } catch (error) {
      console.error('상품 조회 실패:', error);
      throw error;
    }
  },
};

/**
 * 게시판 API
 */
export const BoardAPI = {
  /**
   * 게시판 목록 가져오기
   * 
   * @returns 게시판 배열
   */
  async getBoards(): Promise<any[]> {
    try {
      const db = getFirebaseFirestore();
      const boardsRef = collection(db, COLLECTIONS.BOARDS);
      
      const snapshot = await getDocs(boardsRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('게시판 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 목록 가져오기
   * 
   * @param boardId - 게시판 ID
   * @param limitCount - 가져올 개수
   * @returns 게시글 배열
   */
  async getPosts(boardId: string, limitCount: number = 20): Promise<any[]> {
    try {
      const db = getFirebaseFirestore();
      const postsRef = collection(db, COLLECTIONS.BOARD_POSTS);
      const q = query(
        postsRef,
        where('boardId', '==', boardId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 생성
   * 
   * @param data - 게시글 데이터
   * @returns 생성된 게시글 ID
   */
  async createPost(data: any): Promise<string> {
    try {
      const db = getFirebaseFirestore();
      const postsRef = collection(db, COLLECTIONS.BOARD_POSTS);
      
      const docRef = await addDoc(postsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('게시글 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 업데이트
   * 
   * @param id - 게시글 ID
   * @param data - 업데이트할 데이터
   */
  async updatePost(id: string, data: any): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const postRef = doc(db, COLLECTIONS.BOARD_POSTS, id);
      
      await updateDoc(postRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('게시글 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 삭제
   * 
   * @param id - 게시글 ID
   */
  async deletePost(id: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const postRef = doc(db, COLLECTIONS.BOARD_POSTS, id);
      
      await deleteDoc(postRef);
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  },
};

/**
 * 메뉴 API
 */
export const MenuAPI = {
  /**
   * 메뉴 목록 가져오기
   * 
   * @param location - 위치 (header | footer)
   * @returns 메뉴 배열
   */
  async getMenus(location: 'header' | 'footer'): Promise<any[]> {
    try {
      const db = getFirebaseFirestore();
      const menusRef = collection(db, COLLECTIONS.MENUS);
      const q = query(
        menusRef,
        where('location', '==', location),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('메뉴 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 메뉴 생성
   * 
   * @param data - 메뉴 데이터
   * @returns 생성된 메뉴 ID
   */
  async create(data: any): Promise<string> {
    try {
      const db = getFirebaseFirestore();
      const menusRef = collection(db, COLLECTIONS.MENUS);
      
      const docRef = await addDoc(menusRef, data);
      return docRef.id;
    } catch (error) {
      console.error('메뉴 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 메뉴 업데이트
   * 
   * @param id - 메뉴 ID
   * @param data - 업데이트할 데이터
   */
  async update(id: string, data: any): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const menuRef = doc(db, COLLECTIONS.MENUS, id);
      
      await updateDoc(menuRef, data);
    } catch (error) {
      console.error('메뉴 업데이트 실패:', error);
      throw error;
    }
  },

  /**
   * 메뉴 삭제
   * 
   * @param id - 메뉴 ID
   */
  async delete(id: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const menuRef = doc(db, COLLECTIONS.MENUS, id);
      
      await deleteDoc(menuRef);
    } catch (error) {
      console.error('메뉴 삭제 실패:', error);
      throw error;
    }
  },
};

/**
 * 설정 API
 */
export const SettingsAPI = {
  /**
   * 설정 가져오기
   * 
   * @returns 설정 데이터
   */
  async get(): Promise<any | null> {
    try {
      const db = getFirebaseFirestore();
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
      const snapshot = await getDoc(settingsRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return snapshot.data();
    } catch (error) {
      console.error('설정 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 설정 업데이트
   * 
   * @param data - 업데이트할 설정
   */
  async update(data: any): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
      
      await updateDoc(settingsRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('설정 업데이트 실패:', error);
      throw error;
    }
  },
};
