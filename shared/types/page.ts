/**
 * 페이지 관련 타입 정의
 * 
 * Admin 페이지 빌더에서 생성되는 페이지의 데이터 구조를 정의합니다.
 * Firestore 'pages' 컬렉션에 저장됩니다.
 * 
 * @module types/page
 * @version 1.0.0
 */

import type { Section } from './section';

/**
 * 페이지 데이터 구조
 * 
 * Admin 페이지 빌더에서 생성한 페이지의 전체 데이터입니다.
 * Firestore 'pages' 컬렉션에 저장되며, HTML 생성 시 이 데이터를 기반으로 합니다.
 */
export interface Page {
  /** 
   * 고유 ID (Firestore 문서 ID)
   * 
   * @example "main-page-001"
   */
  id: string;
  
  /** 
   * 페이지 제목
   * 
   * @example "메인 페이지", "갤럭시 S24 상품 상세"
   */
  title: string;
  
  /** 
   * URL 슬러그
   * 
   * @example "main", "about", "galaxy-s24"
   */
  slug: string;
  
  /** 
   * 페이지 타입
   */
  type: PageType;
  
  /** 
   * 섹션 배열
   * 
   * 페이지를 구성하는 섹션들의 배열입니다.
   * order 필드에 따라 정렬되어 표시됩니다.
   */
  sections: Section[];
  
  /** 
   * 메타 정보 (SEO)
   * 
   * 검색 엔진 최적화를 위한 메타 태그 정보입니다.
   */
  meta: MetaData;
  
  /** 
   * 페이지 상태
   * 
   * - draft: 작성 중 (비공개)
   * - published: 발행됨 (공개)
   */
  status: 'draft' | 'published';
  
  /** 
   * 버전 번호
   * 
   * 페이지를 수정할 때마다 증가합니다.
   * 
   * @example 1, 2, 3
   */
  version: number;
  
  /** 
   * 생성일
   */
  createdAt: Date;
  
  /** 
   * 수정일
   */
  updatedAt: Date;
  
  /** 
   * 발행일 (published 상태일 때만)
   */
  publishedAt?: Date;
}

/**
 * 페이지 타입
 */
export type PageType = 
  | 'main'           // 메인 페이지
  | 'product-list'   // 상품 목록
  | 'product-detail' // 상품 상세
  | 'board'          // 게시판
  | 'custom';        // 커스텀 페이지

/**
 * 메타 데이터 (SEO)
 * 
 * 검색 엔진 최적화를 위한 메타 태그 정보입니다.
 */
export interface MetaData {
  /** 
   * 메타 타이틀
   * 
   * @example "티월드스토어 - 휴대폰 최저가 보장"
   */
  title: string;
  
  /** 
   * 메타 설명
   * 
   * @example "통신사 공식 대리점, 갤럭시/아이폰 최저가 보장"
   */
  description: string;
  
  /** 
   * 메타 키워드
   * 
   * @example ["휴대폰", "갤럭시", "아이폰", "통신사"]
   */
  keywords: string[];
  
  /** 
   * OG 이미지 URL
   * 
   * @example "https://cdn.cloudinary.com/tworld-store/og-image.jpg"
   */
  ogImage?: string;
}

/**
 * 페이지 버전 정보
 * 
 * 페이지의 변경 이력을 추적하기 위한 정보입니다.
 */
export interface PageVersion {
  /** 버전 번호 */
  version: number;
  
  /** 변경 내용 */
  changelog: string;
  
  /** 변경일 */
  timestamp: Date;
  
  /** 변경자 (Admin 사용자 ID) */
  author: string;
}

/**
 * 페이지 필터 옵션
 */
export interface PageFilterOptions {
  /** 페이지 타입 */
  type?: PageType;
  
  /** 상태 */
  status?: 'draft' | 'published';
  
  /** 검색어 (제목, 슬러그) */
  search?: string;
}

/**
 * 페이지 정렬 옵션
 */
export type PageSortOption = 
  | 'created-desc'   // 생성일 최신순
  | 'created-asc'    // 생성일 오래된순
  | 'updated-desc'   // 수정일 최신순
  | 'updated-asc'    // 수정일 오래된순
  | 'title-asc'      // 제목 가나다순
  | 'title-desc';    // 제목 역순
