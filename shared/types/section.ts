/**
 * 섹션 및 블록 관련 타입 정의
 * 
 * Admin 페이지 빌더에서 사용하는 섹션과 블록의 데이터 구조를 정의합니다.
 * 
 * @module types/section
 * @version 1.0.0
 */

/**
 * 섹션 데이터 구조
 * 
 * Page의 sections 배열에 포함되는 섹션 데이터입니다.
 * 각 섹션은 특정 타입에 따라 다른 settings를 가집니다.
 */
export interface Section {
  /** 
   * 고유 ID
   * 
   * @example "section-001"
   */
  id: string;
  
  /** 
   * 섹션 타입
   * 
   * 어떤 종류의 섹션인지 정의합니다.
   */
  type: SectionType;
  
  /** 
   * 섹션 이름 (사용자 지정)
   * 
   * @example "메인 히어로", "추천 상품 그리드"
   */
  name?: string;
  
  /** 
   * 표시 순서
   * 
   * 낮은 숫자일수록 위에 표시됩니다.
   * 
   * @example 1, 2, 3
   */
  order: number;
  
  /** 
   * 섹션 설정
   * 
   * 각 섹션 타입에 따라 다른 설정을 가집니다.
   */
  settings: Record<string, any>;
  
  /** 
   * 반응형 설정
   * 
   * 데스크톱, 태블릿, 모바일에 따라 다른 설정을 가질 수 있습니다.
   */
  responsive?: {
    desktop: SectionSettings;
    tablet?: SectionSettings;
    mobile?: SectionSettings;
  };
  
  /** 
   * 표시 여부
   * 
   * false면 숨김 처리됩니다.
   */
  visible: boolean;
  
  /** 
   * 스케줄링 설정
   * 
   * 특정 기간에만 노출하거나 특정 디바이스에만 노출할 수 있습니다.
   */
  schedule?: SectionSchedule;
}

/**
 * 섹션 타입
 * 
 * 총 20개 이상의 섹션 타입을 지원합니다.
 */
export type SectionType =
  // 레이아웃
  | 'container'
  | 'grid'
  | 'flex'
  | 'section-wrapper'
  // 콘텐츠
  | 'hero-slider'
  | 'product-grid'
  | 'promotion-banner'
  | 'numbered-card-list'
  | 'numbered-product-grid'
  | 'text-section'
  | 'image-section'
  | 'video-section'
  | 'text-image'
  | 'features'
  | 'testimonials'
  | 'pricing-table'
  | 'team'
  | 'newsletter'
  | 'app-download'
  | 'cta'
  | 'footer'
  // 기능
  | 'consultation-form'
  | 'contact-info'
  | 'board-list'
  | 'faq'
  // 커스텀
  | 'custom';

/**
 * 섹션 설정
 * 
 * 모든 섹션에 공통으로 적용되는 기본 설정입니다.
 */
export interface SectionSettings {
  /** 
   * 배경색
   * 
   * @example "#FFFFFF", "transparent"
   */
  background?: string;
  
  /** 
   * 패딩 (CSS 형식)
   * 
   * @example "20px", "2rem 4rem"
   */
  padding?: string;
  
  /** 
   * 여백 (CSS 형식)
   * 
   * @example "20px", "2rem 0"
   */
  margin?: string;
  
  /** 
   * 기타 설정 (섹션 타입별로 다름)
   */
  [key: string]: any;
}

/**
 * 섹션 스케줄링 설정
 * 
 * 특정 기간이나 디바이스에만 섹션을 노출할 수 있습니다.
 */
export interface SectionSchedule {
  /** 
   * 시작일
   * 
   * 이 날짜부터 섹션을 노출합니다.
   */
  startDate?: Date;
  
  /** 
   * 종료일
   * 
   * 이 날짜까지 섹션을 노출합니다.
   */
  endDate?: Date;
  
  /** 
   * 대상 디바이스
   * 
   * 특정 디바이스에만 섹션을 노출합니다.
   * 
   * @example ['desktop', 'mobile']
   */
  targetDevices?: ('desktop' | 'tablet' | 'mobile')[];
}

/**
 * 블록 데이터 구조
 * 
 * Section의 children으로 포함되거나 독립적으로 사용됩니다.
 */
export interface Block {
  /** 
   * 고유 ID
   * 
   * @example "block-001"
   */
  id: string;
  
  /** 
   * 블록 타입
   */
  type: BlockType;
  
  /** 
   * 블록 설정
   */
  settings: BlockSettings;
  
  /** 
   * 자식 블록 (레이아웃 블록의 경우)
   */
  children?: Block[];
}

/**
 * 블록 타입
 */
export type BlockType =
  // 기본
  | 'text'
  | 'image'
  | 'button'
  // 카드
  | 'product-card'
  | 'promo-card'
  | 'info-card'
  | 'post-card'
  // 폼
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  // 특수
  | 'price-calculator'
  | 'badge';

/**
 * 블록 설정
 * 
 * 모든 블록에 공통으로 적용되는 기본 설정입니다.
 */
export interface BlockSettings {
  /** CSS 클래스명 */
  className?: string;
  
  /** 인라인 스타일 */
  style?: React.CSSProperties;
  
  /** 블록 타입별 설정 */
  [key: string]: any;
}

/**
 * 텍스트 블록 설정
 */
export interface TextBlockSettings extends BlockSettings {
  /** 텍스트 내용 */
  content: string;
  
  /** 폰트 크기 */
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  
  /** 폰트 굵기 */
  weight: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /** 텍스트 색상 */
  color?: string;
  
  /** 정렬 */
  align: 'left' | 'center' | 'right';
}

/**
 * 이미지 블록 설정
 */
export interface ImageBlockSettings extends BlockSettings {
  /** 이미지 URL */
  src: string;
  
  /** 대체 텍스트 */
  alt: string;
  
  /** 비율 (16:9, 4:3, 1:1 등) */
  aspectRatio?: string;
  
  /** Lazy Loading 사용 */
  lazy: boolean;
  
  /** 링크 */
  link?: string;
}

/**
 * 버튼 블록 설정
 */
export interface ButtonBlockSettings extends BlockSettings {
  /** 버튼 텍스트 */
  text: string;
  
  /** 링크 */
  link: string;
  
  /** 버튼 스타일 */
  variant: 'primary' | 'secondary' | 'outline' | 'text';
  
  /** 버튼 크기 */
  size: 'sm' | 'md' | 'lg';
  
  /** 아이콘 */
  icon?: string;
}

/**
 * 상품 카드 블록 설정
 */
export interface ProductCardSettings extends BlockSettings {
  /** 상품 ID */
  productId: string;
  
  /** 카드 스타일 */
  style: 'default' | 'compact' | 'detailed';
  
  /** 뱃지 표시 */
  showBadge: boolean;
  
  /** 가격 표시 */
  showPrice: boolean;
}

/**
 * Hero 슬라이더 섹션 설정
 */
export interface HeroSliderSettings extends SectionSettings {
  /** 슬라이드 배열 */
  slides: {
    /** 이미지 URL */
    image: string;
    
    /** 제목 */
    title: string;
    
    /** 설명 */
    description: string;
    
    /** 버튼 텍스트 */
    buttonText?: string;
    
    /** 버튼 링크 */
    buttonLink?: string;
  }[];
  
  /** 자동 재생 */
  autoplay: boolean;
  
  /** 재생 간격 (ms) */
  interval: number;
  
  /** 애니메이션 효과 */
  transition: 'fade' | 'slide' | 'zoom';
}

/**
 * 상품 그리드 섹션 설정
 */
export interface ProductGridSettings extends SectionSettings {
  /** 열 개수 */
  columns: 2 | 3 | 4 | 5;
  
  /** 상품 필터 */
  filter: {
    /** 브랜드 */
    brand?: 'samsung' | 'apple' | 'etc';
    
    /** 카테고리 */
    category?: string;
    
    /** 최대 개수 */
    limit?: number;
  };
  
  /** 정렬 */
  sort: 'latest' | 'popular' | 'price-asc' | 'price-desc';
  
  /** 페이지네이션 표시 */
  showPagination: boolean;
}

/**
 * 프로모션 배너 섹션 설정
 */
export interface PromotionBannerSettings extends SectionSettings {
  /** 배너 이미지 */
  image: string;
  
  /** 제목 */
  title: string;
  
  /** 설명 */
  description: string;
  
  /** 버튼 텍스트 */
  buttonText?: string;
  
  /** 버튼 링크 */
  buttonLink?: string;
  
  /** 배경색 */
  backgroundColor: string;
  
  /** 텍스트 색상 */
  textColor: string;
}

/**
 * 상담 폼 섹션 설정
 */
export interface ConsultationFormSettings extends SectionSettings {
  /** 제목 */
  title: string;
  
  /** 설명 */
  description: string;
  
  /** 필드 설정 */
  fields: {
    /** 고객명 필드 표시 */
    showName: boolean;
    
    /** 전화번호 필드 표시 */
    showPhone: boolean;
    
    /** 메시지 필드 표시 */
    showMessage: boolean;
  };
  
  /** 제출 후 메시지 */
  successMessage: string;
}
