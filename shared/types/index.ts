/**
 * 공유 타입 정의 통합 export
 * 
 * @module types
 * @version 1.0.0
 */

// products.json 기반 타입
export type {
  ProductsData,
  Device,
  DeviceColor,
  Plan as ProductPlan,  // Plan 타입과 구분
  Subsidy,
  GlobalSettings,
  JoinType,
  Brand,
} from './products';

export {
  JOIN_TYPE_CODES,
  JOIN_TYPE_NAMES,
  BRAND_NAMES,
} from './products';

// 계산 관련 타입
export type {
  ContractType,
  InstallmentMonths,
  CalculationInput,
  CalculationResult,
  CalculatorOptions,
  MonthlyDeviceFeeParams,
  MonthlyPlanFeeParams,
} from './calculation';

// 요금제 타입
export type {
  Plan,
  PlanCategoryId,
  PlanCategory,
  PlanFilterOptions,
  PlanSortOption,
} from './plan';

// 페이지 타입
export type {
  Page,
  PageType,
  MetaData,
  PageVersion,
  PageFilterOptions,
  PageSortOption,
} from './page';

// 섹션 및 블록 타입
export type {
  Section,
  SectionType,
  SectionSettings,
  SectionSchedule,
  Block,
  BlockType,
  BlockSettings,
  TextBlockSettings,
  ImageBlockSettings,
  ButtonBlockSettings,
  ProductCardSettings,
  HeroSliderSettings,
  ProductGridSettings,
  PromotionBannerSettings,
  ConsultationFormSettings,
} from './section';

// 폼, 게시판, 메뉴 타입
export type {
  Consultation,
  ConsultationFormData,
  Board,
  BoardSettings,
  BoardPost,
  Attachment,
  Menu,
  ConsultationStatus,
  BoardPostFilterOptions,
  BoardPostSortOption,
} from './form';

export {
  CONSULTATION_STATUS_NAMES,
} from './form';

// API 요청/응답 타입
export type {
  ApiResponse,
  PaginatedResponse,
  GetProductsListRequest,
  GetProductsListResponse,
  GetProductDetailResponse,
  SyncProductsResponse,
  GetPlansListRequest,
  GetPlansListResponse,
  GetPlanDetailResponse,
  GetPageResponse,
  GeneratePageRequest,
  GeneratePageResponse,
  PublishPageRequest,
  PublishPageResponse,
  UploadImageRequest,
  UploadImageResponse,
  ProcessImageRequest,
  ProcessImageResponse,
  SubmitConsultationRequest,
  SubmitConsultationResponse,
  GetBoardPostsRequest,
  GetBoardPostsResponse,
  GetBoardPostResponse,
  CreateBoardPostRequest,
  CreateBoardPostResponse,
  UpdateBoardPostRequest,
  UpdateBoardPostResponse,
  DeleteBoardPostResponse,
  SyncSheetsRequest,
  SyncSheetsResponse,
  SendTelegramRequest,
  SendTelegramResponse,
  RateLimitHeaders,
} from './api-types';

export {
  ApiErrorCode,
} from './api-types';
