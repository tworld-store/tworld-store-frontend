/**
 * ErrorBoundary 컴포넌트
 * 
 * 역할:
 * - React 컴포넌트 트리에서 발생하는 에러 캐치
 * - 폴백 UI 표시
 * - 에러 로깅 및 리포팅
 * 
 * 사용 예시:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 * 
 * @packageDocumentation
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ErrorBoundary Props 인터페이스
 */
export interface ErrorBoundaryProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  
  /** 커스텀 폴백 UI */
  fallback?: ReactNode;
  
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** 리셋 가능 여부 */
  resetable?: boolean;
}

/**
 * ErrorBoundary State 인터페이스
 */
export interface ErrorBoundaryState {
  /** 에러 발생 여부 */
  hasError: boolean;
  
  /** 에러 객체 */
  error: Error | null;
  
  /** 에러 정보 */
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary 클래스 컴포넌트
 * 
 * React의 Error Boundary 기능을 사용하여
 * 자식 컴포넌트에서 발생하는 에러를 캐치합니다.
 * 
 * 주의:
 * - 이벤트 핸들러의 에러는 캐치하지 않음
 * - 비동기 코드의 에러는 캐치하지 않음
 * - 서버 사이드 렌더링의 에러는 캐치하지 않음
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 에러가 발생했을 때 호출되는 정적 메서드
   * 
   * 다음 렌더링에서 폴백 UI를 표시하도록 상태를 업데이트합니다.
   * 
   * @param error - 발생한 에러
   * @returns 업데이트할 상태 또는 null
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태를 업데이트
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 에러가 캐치된 후 호출되는 메서드
   * 
   * 에러 로깅 및 리포팅을 수행합니다.
   * 
   * @param error - 발생한 에러
   * @param errorInfo - 에러 정보 (컴포넌트 스택)
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 정보를 상태에 저장
    this.setState({
      errorInfo,
    });

    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: 에러 리포팅 서비스에 전송
    // 예: Sentry, LogRocket, etc.
    // reportErrorToService(error, errorInfo);
  }

  /**
   * 에러 상태 리셋
   * 
   * 사용자가 "다시 시도" 버튼을 클릭했을 때 호출됩니다.
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 렌더링 메서드
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, resetable = true } = this.props;

    // 에러가 발생한 경우
    if (hasError) {
      // 커스텀 폴백 UI가 제공된 경우
      if (fallback) {
        return fallback;
      }

      // 기본 폴백 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* 에러 아이콘 */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* 에러 메시지 */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  문제가 발생했습니다
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              </div>

              {/* 에러 상세 정보 (개발 모드에서만 표시) */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <details className="text-sm">
                    <summary className="font-medium text-gray-700 cursor-pointer">
                      에러 상세 정보
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="font-medium text-gray-700">에러 메시지:</p>
                        <p className="text-red-600 font-mono text-xs break-all">
                          {error.message}
                        </p>
                      </div>
                      {errorInfo && (
                        <div>
                          <p className="font-medium text-gray-700">컴포넌트 스택:</p>
                          <pre className="text-xs text-gray-600 overflow-auto max-h-32 mt-1">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="mt-6 flex gap-3">
                {resetable && (
                  <button
                    onClick={this.handleReset}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                  >
                    다시 시도
                  </button>
                )}
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  홈으로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 에러가 없으면 자식 컴포넌트 렌더링
    return children;
  }
}

export default ErrorBoundary;
