/**
 * 폼, 게시판, 메뉴 관련 타입 정의
 * 
 * 상담 신청 폼, 게시판, 메뉴 등의 데이터 구조를 정의합니다.
 * Firestore 컬렉션에 저장됩니다.
 * 
 * @module types/form
 * @version 1.0.0
 */

/**
 * 상담 신청 데이터 구조
 * 
 * Firestore 'consultations' 컬렉션에 저장됩니다.
 */
export interface Consultation {
  /** 
   * 상담 ID
   * 
   * @example "CON-20251106-001"
   */
  id: string;
  
  /** 
   * 고객명
   * 
   * @example "홍길동"
   */
  customerName: string;
  
  /** 
   * 전화번호
   * 
   * @example "010-1234-5678"
   */
  phone: string;
  
  /** 
   * 상품 ID
   * 
   * @example "갤럭시S24_256GB"
   */
  deviceId: string;
  
  /** 
   * 요금제 ID
   * 
   * @example "0청년109"
   */
  planId: string;
  
  /** 
   * 가입 유형
   */
  joinType: '기기변경' | '번호이동' | '신규가입';
  
  /** 
   * 추가 메시지
   * 
   * @example "오후 2시 이후 연락 부탁드립니다"
   */
  message?: string;
  
  /** 
   * 상담 상태
   */
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  
  /** 
   * 알림 전송 여부
   */
  notificationSent: {
    /** Telegram 알림 전송 여부 */
    telegram: boolean;
    
    /** SMS 알림 전송 여부 (추후 구현) */
    sms?: boolean;
    
    /** 카카오톡 알림 전송 여부 (추후 구현) */
    kakao?: boolean;
  };
  
  /** 
   * 생성일
   */
  createdAt: Date;
  
  /** 
   * 처리일
   */
  processedAt?: Date;
}

/**
 * 상담 신청 폼 데이터
 * 
 * 사용자가 상담 신청 폼에 입력하는 데이터입니다.
 * API로 전송되어 Consultation 객체로 변환됩니다.
 */
export interface ConsultationFormData {
  /** 
   * 고객명
   * 
   * @example "홍길동"
   */
  customerName: string;
  
  /** 
   * 전화번호
   * 
   * @example "010-1234-5678"
   */
  phone: string;
  
  /** 
   * 상품 ID
   * 
   * @example "갤럭시S24_256GB"
   */
  deviceId: string;
  
  /** 
   * 요금제 ID
   * 
   * @example "0청년109"
   */
  planId: string;
  
  /** 
   * 가입 유형
   */
  joinType: '기기변경' | '번호이동' | '신규가입';
  
  /** 
   * 할부 개월
   */
  installmentMonths: 0 | 12 | 24 | 36;
  
  /** 
   * 약정 유형
   */
  contractType: '공시지원' | '선택약정';
  
  /** 
   * 추가 메시지
   * 
   * @example "오후 2시 이후 연락 부탁드립니다"
   */
  message?: string;
  
  /** 
   * 개인정보 수집 및 이용 동의 (필수)
   */
  agreeToPrivacy: boolean;
}

/**
 * 게시판 데이터 구조
 * 
 * Firestore 'boards' 컬렉션에 저장됩니다.
 */
export interface Board {
  /** 
   * 게시판 ID
   * 
   * @example "notice", "event", "faq"
   */
  id: string;
  
  /** 
   * 게시판명
   * 
   * @example "공지사항", "이벤트", "자주 묻는 질문"
   */
  name: string;
  
  /** 
   * URL 슬러그
   * 
   * @example "notice", "event", "faq"
   */
  slug: string;
  
  /** 
   * 노출 여부
   */
  visible: boolean;
  
  /** 
   * 표시 순서
   */
  order: number;
  
  /** 
   * 게시판 설정
   */
  settings: BoardSettings;
  
  /** 
   * 생성일
   */
  createdAt: Date;
  
  /** 
   * 수정일
   */
  updatedAt: Date;
}

/**
 * 게시판 설정
 */
export interface BoardSettings {
  /** 
   * 댓글 허용
   */
  allowComments: boolean;
  
  /** 
   * 첨부파일 허용
   */
  allowAttachments: boolean;
  
  /** 
   * 최대 첨부파일 크기 (MB)
   * 
   * @example 5, 10
   */
  maxAttachmentSize: number;
  
  /** 
   * 페이지당 게시글 수
   * 
   * @example 10, 20, 30
   */
  postsPerPage: number;
}

/**
 * 게시글 데이터 구조
 * 
 * Firestore 'board_posts' 컬렉션에 저장됩니다.
 */
export interface BoardPost {
  /** 
   * 게시글 ID
   * 
   * @example "post-001"
   */
  id: string;
  
  /** 
   * 게시판 ID
   * 
   * @example "notice"
   */
  boardId: string;
  
  /** 
   * 제목
   * 
   * @example "갤럭시 S24 신규 입고 안내"
   */
  title: string;
  
  /** 
   * 내용 (HTML)
   * 
   * TinyMCE 등의 에디터로 작성된 HTML 내용입니다.
   */
  content: string;
  
  /** 
   * 작성자
   * 
   * @example "admin"
   */
  author: string;
  
  /** 
   * 첨부파일
   */
  attachments: Attachment[];
  
  /** 
   * 조회수
   */
  views: number;
  
  /** 
   * 고정글 여부
   * 
   * true면 목록 상단에 고정됩니다.
   */
  pinned: boolean;
  
  /** 
   * 생성일
   */
  createdAt: Date;
  
  /** 
   * 수정일
   */
  updatedAt: Date;
}

/**
 * 첨부파일
 */
export interface Attachment {
  /** 
   * 파일 타입
   */
  type: 'image' | 'pdf' | 'doc' | 'etc';
  
  /** 
   * 파일명
   * 
   * @example "galaxy-s24-spec.pdf"
   */
  name: string;
  
  /** 
   * URL
   * 
   * @example "https://storage.googleapis.com/.../galaxy-s24-spec.pdf"
   */
  url: string;
  
  /** 
   * 파일 크기 (bytes)
   * 
   * @example 1024000 (1MB)
   */
  size: number;
}

/**
 * 메뉴 데이터 구조
 * 
 * Firestore 'menus' 컬렉션에 저장됩니다.
 */
export interface Menu {
  /** 
   * 메뉴 ID
   * 
   * @example "menu-001"
   */
  id: string;
  
  /** 
   * 메뉴명
   * 
   * @example "휴대폰", "요금제", "이벤트"
   */
  name: string;
  
  /** 
   * 링크
   * 
   * @example "/products", "/plans", "/events"
   */
  link: string;
  
  /** 
   * 링크 타입
   */
  linkType: 'internal' | 'external';
  
  /** 
   * 부모 메뉴 ID (2단계 메뉴)
   * 
   * @example "menu-001"
   */
  parentId?: string;
  
  /** 
   * 표시 순서
   */
  order: number;
  
  /** 
   * 노출 여부
   */
  visible: boolean;
  
  /** 
   * 새 창 열기
   */
  openNewTab: boolean;
}

/**
 * 상담 상태
 */
export type ConsultationStatus = 'new' | 'processing' | 'completed' | 'cancelled';

/**
 * 상담 상태 한글명
 */
export const CONSULTATION_STATUS_NAMES: Record<ConsultationStatus, string> = {
  new: '신규',
  processing: '처리중',
  completed: '완료',
  cancelled: '취소',
};

/**
 * 게시글 필터 옵션
 */
export interface BoardPostFilterOptions {
  /** 게시판 ID */
  boardId?: string;
  
  /** 검색어 (제목, 내용) */
  search?: string;
  
  /** 고정글만 */
  pinnedOnly?: boolean;
}

/**
 * 게시글 정렬 옵션
 */
export type BoardPostSortOption = 
  | 'created-desc'   // 생성일 최신순
  | 'created-asc'    // 생성일 오래된순
  | 'views-desc'     // 조회수 높은순
  | 'views-asc';     // 조회수 낮은순
