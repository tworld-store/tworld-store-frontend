/**
 * API 요청/응답 타입 정의
 * 
 * Firebase Functions의 모든 API 엔드포인트에 대한
 * 요청(Request)과 응답(Response) 타입을 정의합니다.
 * 
 * @module types/api
 * @version 1.0.0
 */

import type { Device } from './products';
import type { Plan } from './plan';
import type { Page } from './page';
import type { ConsultationFormData, BoardPost } from './form';

/**
 * 표준 API 응답 구조
 * 
 * 모든 API는 이 형식으로 응답합니다.
 */
export interface ApiResponse<T = any> {
  /** 
   * 성공 여부
   */
  success: boolean;
  
  /** 
   * 데이터
   * 
   * 요청이 성공했을 때만 존재합니다.
   */
  data?: T;
  
  /** 
   * 에러 메시지
   * 
   * 요청이 실패했을 때만 존재합니다.
   * 
   * @example "상품을 찾을 수 없습니다"
   */
  error?: string;
  
  /** 
   * 에러 코드
   * 
   * 요청이 실패했을 때만 존재합니다.
   * 
   * @example "PRODUCT_NOT_FOUND"
   */
  code?: string;
  
  /** 
   * 타임스탬프 (ISO 8601)
   * 
   * @example "2025-11-06T10:00:00Z"
   */
  timestamp: string;
}

/**
 * 페이지네이션 응답
 * 
 * 목록 조회 API에서 사용됩니다.
 */
export interface PaginatedResponse<T> {
  /** 
   * 데이터 배열
   */
  items: T[];
  
  /** 
   * 전체 개수
   * 
   * @example 100
   */
  total: number;
  
  /** 
   * 현재 페이지
   * 
   * @example 1, 2, 3
   */
  page: number;
  
  /** 
   * 페이지당 개수
   * 
   * @example 20
   */
  perPage: number;
  
  /** 
   * 총 페이지 수
   * 
   * @example 5
   */
  totalPages: number;
  
  /** 
   * 다음 페이지 존재 여부
   */
  hasNext: boolean;
  
  /** 
   * 이전 페이지 존재 여부
   */
  hasPrev: boolean;
}

// ========================================
// Products API
// ========================================

/**
 * GET /api/products/list
 * 
 * 상품 목록 조회
 */
export interface GetProductsListRequest {
  /** 브랜드 필터 */
  brand?: 'samsung' | 'apple' | 'etc';
  
  /** 최소 가격 */
  minPrice?: number;
  
  /** 최대 가격 */
  maxPrice?: number;
  
  /** 용량 필터 (GB) */
  storage?: number[];
  
  /** 정렬 */
  sort?: 'price-asc' | 'price-desc' | 'latest' | 'popular';
  
  /** 페이지 번호 */
  page?: number;
  
  /** 페이지당 개수 */
  perPage?: number;
}

export type GetProductsListResponse = ApiResponse<PaginatedResponse<Device>>;

/**
 * GET /api/products/:id
 * 
 * 상품 상세 조회
 */
export type GetProductDetailResponse = ApiResponse<Device>;

/**
 * POST /api/products/sync
 * 
 * Google Sheets에서 상품 데이터 수동 동기화
 */
export interface SyncProductsResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 동기화된 상품 개수 */
  syncedCount: number;
  
  /** 동기화 시간 */
  timestamp: string;
}

// ========================================
// Plans API
// ========================================

/**
 * GET /api/plans/list
 * 
 * 요금제 목록 조회
 */
export interface GetPlansListRequest {
  /** 카테고리 ID 필터 */
  categoryId?: string;
  
  /** 최소 가격 */
  minPrice?: number;
  
  /** 최대 가격 */
  maxPrice?: number;
  
  /** 데이터 무제한만 */
  unlimitedDataOnly?: boolean;
  
  /** 정렬 */
  sort?: 'price-asc' | 'price-desc' | 'popular';
  
  /** 페이지 번호 */
  page?: number;
  
  /** 페이지당 개수 */
  perPage?: number;
}

export type GetPlansListResponse = ApiResponse<PaginatedResponse<Plan>>;

/**
 * GET /api/plans/:id
 * 
 * 요금제 상세 조회
 */
export type GetPlanDetailResponse = ApiResponse<Plan>;

// ========================================
// Pages API
// ========================================

/**
 * GET /api/pages/:pageId
 * 
 * 페이지 데이터 조회
 */
export type GetPageResponse = ApiResponse<Page>;

/**
 * POST /api/pages/generate
 * 
 * HTML 생성
 */
export interface GeneratePageRequest {
  /** 페이지 ID */
  pageId: string;
}

export interface GeneratePageResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 생성된 HTML 파일 URL */
  htmlUrl: string;
  
  /** 배포된 URL (자동 배포 시) */
  deployUrl?: string;
}

/**
 * POST /api/pages/publish
 * 
 * 페이지 배포
 */
export interface PublishPageRequest {
  /** 페이지 ID */
  pageId: string;
  
  /** 배포 환경 */
  environment: 'dev' | 'production';
}

export interface PublishPageResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** Vercel 배포 ID */
  deploymentId: string;
  
  /** 배포 URL */
  url: string;
  
  /** 배포 상태 */
  status: 'ready' | 'building' | 'error';
}

// ========================================
// Images API
// ========================================

/**
 * POST /api/images/upload
 * 
 * 이미지 업로드
 */
export interface UploadImageRequest {
  /** 이미지 파일 */
  file: File | Blob;
  
  /** Cloudinary 폴더 */
  folder?: string;
}

export interface UploadImageResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 이미지 URL (WebP) */
  url: string;
  
  /** Cloudinary Public ID */
  publicId: string;
  
  /** 이미지 너비 */
  width: number;
  
  /** 이미지 높이 */
  height: number;
  
  /** 포맷 */
  format: string;
}

/**
 * POST /api/images/process
 * 
 * 이미지 처리 (크롭, 리사이즈, 배경 제거)
 */
export interface ProcessImageRequest {
  /** Cloudinary Public ID */
  publicId: string;
  
  /** 처리 작업 */
  operations: {
    /** 크롭 */
    crop?: {
      width: number;
      height: number;
      x: number;
      y: number;
    };
    
    /** 리사이즈 */
    resize?: {
      width: number;
      height: number;
    };
    
    /** 배경 제거 */
    removeBackground?: boolean;
  };
}

export interface ProcessImageResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 처리된 이미지 URL */
  url: string;
  
  /** 새 Public ID */
  publicId: string;
}

// ========================================
// Forms API
// ========================================

/**
 * POST /api/forms/consultation
 * 
 * 상담 신청
 */
export type SubmitConsultationRequest = ConsultationFormData;

export interface SubmitConsultationResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 상담 ID */
  consultationId: string;
  
  /** 안내 메시지 */
  message: string;
}

// ========================================
// Boards API
// ========================================

/**
 * GET /api/boards/:boardId/posts
 * 
 * 게시글 목록 조회
 */
export interface GetBoardPostsRequest {
  /** 페이지 번호 */
  page?: number;
  
  /** 페이지당 개수 */
  perPage?: number;
  
  /** 정렬 */
  sort?: 'created-desc' | 'created-asc' | 'views-desc';
  
  /** 검색어 */
  search?: string;
}

export type GetBoardPostsResponse = ApiResponse<PaginatedResponse<BoardPost>>;

/**
 * GET /api/boards/posts/:postId
 * 
 * 게시글 상세 조회
 */
export type GetBoardPostResponse = ApiResponse<BoardPost>;

/**
 * POST /api/boards/posts
 * 
 * 게시글 작성
 */
export interface CreateBoardPostRequest {
  /** 게시판 ID */
  boardId: string;
  
  /** 제목 */
  title: string;
  
  /** 내용 (HTML) */
  content: string;
  
  /** 첨부파일 */
  attachments?: Array<{
    type: 'image' | 'pdf' | 'doc' | 'etc';
    name: string;
    url: string;
    size: number;
  }>;
  
  /** 고정글 여부 */
  pinned?: boolean;
}

export interface CreateBoardPostResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 생성된 게시글 ID */
  postId: string;
}

/**
 * PUT /api/boards/posts/:postId
 * 
 * 게시글 수정
 */
export interface UpdateBoardPostRequest {
  /** 제목 */
  title?: string;
  
  /** 내용 */
  content?: string;
  
  /** 첨부파일 */
  attachments?: Array<{
    type: 'image' | 'pdf' | 'doc' | 'etc';
    name: string;
    url: string;
    size: number;
  }>;
  
  /** 고정글 여부 */
  pinned?: boolean;
}

export interface UpdateBoardPostResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 게시글 ID */
  postId: string;
}

/**
 * DELETE /api/boards/posts/:postId
 * 
 * 게시글 삭제
 */
export interface DeleteBoardPostResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 삭제된 게시글 ID */
  postId: string;
}

// ========================================
// Sync API
// ========================================

/**
 * POST /api/sync/sheets
 * 
 * Google Sheets 동기화
 */
export interface SyncSheetsRequest {
  /** 동기화 대상 */
  target: 'products' | 'plans' | 'all';
}

export interface SyncSheetsResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 동기화된 항목 수 */
  synced: {
    products?: number;
    plans?: number;
  };
  
  /** 동기화 시간 */
  timestamp: string;
}

/**
 * POST /api/sync/telegram
 * 
 * Telegram 알림 전송 (테스트용)
 */
export interface SendTelegramRequest {
  /** 메시지 내용 */
  message: string;
  
  /** Chat ID (선택, 기본값: 환경변수) */
  chatId?: string;
}

export interface SendTelegramResponse {
  /** 성공 여부 */
  success: boolean;
  
  /** 메시지 ID */
  messageId: number;
}

// ========================================
// 에러 코드
// ========================================

/**
 * API 에러 코드
 */
export enum ApiErrorCode {
  // 일반 에러
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Products API 에러
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  
  // Plans API 에러
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  
  // Pages API 에러
  PAGE_NOT_FOUND = 'PAGE_NOT_FOUND',
  GENERATION_FAILED = 'GENERATION_FAILED',
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',
  
  // Images API 에러
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // Forms API 에러
  INVALID_PHONE = 'INVALID_PHONE',
  PRIVACY_NOT_AGREED = 'PRIVACY_NOT_AGREED',
  DUPLICATE_SUBMISSION = 'DUPLICATE_SUBMISSION',
  
  // Boards API 에러
  BOARD_NOT_FOUND = 'BOARD_NOT_FOUND',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  CONTENT_TOO_LONG = 'CONTENT_TOO_LONG',
}

/**
 * Rate Limit 헤더
 */
export interface RateLimitHeaders {
  /** 요청 한도 */
  'X-RateLimit-Limit': number;
  
  /** 남은 요청 수 */
  'X-RateLimit-Remaining': number;
  
  /** 리셋 시간 (Unix timestamp) */
  'X-RateLimit-Reset': number;
}
