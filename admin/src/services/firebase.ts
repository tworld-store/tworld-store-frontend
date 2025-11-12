/**
 * Firebase 초기화 및 설정
 * 
 * 역할:
 * - Firebase SDK 초기화
 * - Auth, Firestore, Storage 인스턴스 제공
 * - 환경변수 관리
 * 
 * @packageDocumentation
 */

import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

/**
 * Firebase 설정
 * 
 * 환경변수에서 Firebase 설정을 가져옵니다.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Firebase 앱 인스턴스
 */
let app: FirebaseApp;

/**
 * Auth 인스턴스
 */
let auth: Auth;

/**
 * Firestore 인스턴스
 */
let db: Firestore;

/**
 * Storage 인스턴스
 */
let storage: FirebaseStorage;

/**
 * Firebase 초기화
 * 
 * 앱 시작 시 한 번만 호출되어야 합니다.
 * 
 * @throws {Error} Firebase 설정이 없으면 에러
 */
export function initializeFirebase(): void {
  try {
    // 설정 검증
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase 설정이 없습니다. .env 파일을 확인하세요.');
    }

    // Firebase 앱 초기화
    app = initializeApp(firebaseConfig);
    
    // 서비스 초기화
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('✅ Firebase 초기화 완료');
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    throw error;
  }
}

/**
 * Firebase Auth 인스턴스 가져오기
 * 
 * @returns Auth 인스턴스
 * @throws {Error} 초기화되지 않았으면 에러
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth가 초기화되지 않았습니다.');
  }
  return auth;
}

/**
 * Firestore 인스턴스 가져오기
 * 
 * @returns Firestore 인스턴스
 * @throws {Error} 초기화되지 않았으면 에러
 */
export function getFirebaseFirestore(): Firestore {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  return db;
}

/**
 * Firebase Storage 인스턴스 가져오기
 * 
 * @returns Storage 인스턴스
 * @throws {Error} 초기화되지 않았으면 에러
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error('Firebase Storage가 초기화되지 않았습니다.');
  }
  return storage;
}

/**
 * Firebase 앱 인스턴스 가져오기
 * 
 * @returns FirebaseApp 인스턴스
 * @throws {Error} 초기화되지 않았으면 에러
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase App이 초기화되지 않았습니다.');
  }
  return app;
}

/**
 * Firebase 초기화 여부 확인
 * 
 * @returns 초기화 여부
 */
export function isFirebaseInitialized(): boolean {
  return !!app && !!auth && !!db && !!storage;
}

// 기본 export
export { app, auth, db, storage };
