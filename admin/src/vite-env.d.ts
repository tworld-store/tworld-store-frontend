/**
 * Vite 환경 타입 정의
 * 
 * 이 파일은 Vite 관련 타입과 전역 타입을 선언합니다.
 * - import.meta.env 타입
 * - CSS 모듈 타입
 * - 이미지 import 타입
 * 
 * @packageDocumentation
 */

/// <reference types="vite/client" />

/**
 * 환경 변수 타입 정의
 * 
 * .env 파일의 모든 변수는 여기에 타입을 선언해야 합니다.
 * VITE_ 접두사가 있는 변수만 클라이언트에서 접근 가능합니다.
 */
interface ImportMetaEnv {
  // Firebase 설정
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  
  // API 설정
  readonly VITE_API_BASE_URL: string;
  
  // Cloudinary 설정
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  
  // Google Sheets
  readonly VITE_GOOGLE_SHEET_ID?: string;
  
  // 애플리케이션 설정
  readonly VITE_APP_ENV?: 'development' | 'production' | 'staging';
  readonly VITE_APP_VERSION?: string;
  readonly VITE_DEBUG?: string;
  
  // 사이트 URL
  readonly VITE_SITE_URL?: string;
  readonly VITE_ADMIN_URL?: string;
}

/**
 * ImportMeta 인터페이스 확장
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: any;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: readonly string[], cb: (mods: any[]) => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}

/**
 * CSS 모듈 타입 선언
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/**
 * 이미지 파일 타입 선언
 */
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

/**
 * JSON 파일 타입 선언
 */
declare module '*.json' {
  const value: any;
  export default value;
}
