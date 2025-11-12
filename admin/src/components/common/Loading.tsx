/**
 * Loading 컴포넌트
 * 
 * 역할:
 * - 데이터 로딩 중 표시
 * - 페이지 전환 시 표시
 * - API 요청 중 표시
 * 
 * 사용 예시:
 * ```tsx
 * <Loading />
 * <Loading size="sm" text="불러오는 중..." />
 * <Loading fullScreen />
 * ```
 * 
 * @packageDocumentation
 */

import React from 'react';

/**
 * Loading 컴포넌트 Props 인터페이스
 */
export interface LoadingProps {
  /** 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** 로딩 텍스트 */
  text?: string;
  
  /** 전체 화면 표시 여부 */
  fullScreen?: boolean;
  
  /** 오버레이 표시 여부 */
  overlay?: boolean;
  
  /** 커스텀 클래스명 */
  className?: string;
  
  /** 스피너 색상 */
  color?: 'primary' | 'white' | 'gray';
}

/**
 * 크기별 스피너 클래스
 */
const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

/**
 * 색상별 스피너 클래스
 */
const colorClasses = {
  primary: 'border-primary border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
};

/**
 * 크기별 텍스트 클래스
 */
const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

/**
 * Loading 컴포넌트
 * 
 * 로딩 상태를 표시하는 컴포넌트입니다.
 * 스피너와 텍스트를 함께 표시할 수 있습니다.
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  overlay = false,
  className = '',
  color = 'primary',
}) => {
  /**
   * 스피너 요소
   */
  const spinner = (
    <div
      className={`
        inline-block animate-spin rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
      role="status"
      aria-label="로딩 중"
    />
  );

  /**
   * 텍스트 요소
   */
  const textElement = text ? (
    <p
      className={`
        mt-3 text-gray-600 font-medium
        ${textSizeClasses[size]}
      `}
    >
      {text}
    </p>
  ) : null;

  /**
   * 컨텐츠 래퍼
   */
  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {spinner}
      {textElement}
    </div>
  );

  /**
   * 전체 화면 모드
   */
  if (fullScreen) {
    return (
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center
          ${overlay ? 'bg-black bg-opacity-50' : 'bg-gray-50'}
        `}
      >
        {content}
      </div>
    );
  }

  /**
   * 일반 모드
   */
  return content;
};

/**
 * 버튼 내부용 인라인 로딩
 * 
 * 사용 예시:
 * ```tsx
 * <button disabled>
 *   <Loading.Inline /> 저장 중...
 * </button>
 * ```
 */
Loading.Inline = function LoadingInline({
  size = 'sm',
  className = '',
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2';

  return (
    <div
      className={`
        inline-block animate-spin rounded-full mr-2
        border-white border-t-transparent
        ${sizeClass}
        ${className}
      `}
      role="status"
      aria-label="로딩 중"
    />
  );
};

/**
 * 스켈레톤 로딩
 * 
 * 사용 예시:
 * ```tsx
 * <Loading.Skeleton />
 * <Loading.Skeleton width="w-full" height="h-32" />
 * ```
 */
Loading.Skeleton = function LoadingSkeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'rounded',
}: {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${width} ${height} ${rounded}
        ${className}
      `}
      role="status"
      aria-label="콘텐츠 로딩 중"
    />
  );
};

/**
 * 점 애니메이션 로딩
 * 
 * 사용 예시:
 * ```tsx
 * <Loading.Dots />
 * ```
 */
Loading.Dots = function LoadingDots({
  color = 'bg-primary',
  className = '',
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="로딩 중">
      <div className={`h-2 w-2 ${color} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`h-2 w-2 ${color} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`h-2 w-2 ${color} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default Loading;
