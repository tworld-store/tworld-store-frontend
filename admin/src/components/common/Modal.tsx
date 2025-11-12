/**
 * Modal 컴포넌트
 * 
 * 역할:
 * - 모달 다이얼로그 표시
 * - 오버레이 배경
 * - ESC 키로 닫기
 * - 외부 클릭으로 닫기
 * 
 * 사용 예시:
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="제목"
 * >
 *   <p>내용</p>
 * </Modal>
 * ```
 * 
 * @packageDocumentation
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal Props 인터페이스
 */
export interface ModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  
  /** 닫기 콜백 */
  onClose: () => void;
  
  /** 제목 */
  title?: string;
  
  /** 자식 컴포넌트 (내용) */
  children: ReactNode;
  
  /** 푸터 컴포넌트 */
  footer?: ReactNode;
  
  /** 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** 외부 클릭으로 닫기 */
  closeOnOverlayClick?: boolean;
  
  /** ESC 키로 닫기 */
  closeOnEsc?: boolean;
  
  /** 닫기 버튼 표시 */
  showCloseButton?: boolean;
  
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 크기별 모달 클래스
 */
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

/**
 * Modal 컴포넌트
 * 
 * React Portal을 사용하여 body에 직접 렌더링됩니다.
 * 키보드 및 마우스 이벤트를 처리하여 사용성을 높입니다.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /**
   * ESC 키 이벤트 핸들러
   */
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  /**
   * 포커스 트랩 및 접근성 처리
   */
  useEffect(() => {
    if (!isOpen) return;

    // 이전 활성 요소 저장
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 모달로 포커스 이동
    modalRef.current?.focus();

    // body 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      // body 스크롤 복원
      document.body.style.overflow = '';

      // 이전 활성 요소로 포커스 복원
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  /**
   * 오버레이 클릭 핸들러
   */
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  /**
   * 모달이 닫혀있으면 렌더링하지 않음
   */
  if (!isOpen) return null;

  /**
   * 모달 컨텐츠
   */
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* 오버레이 배경 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* 모달 컨테이너 */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-lg shadow-xl
          w-full ${sizeClasses[size]}
          max-h-[90vh] flex flex-col
          animate-slide-up
          ${className}
        `}
        tabIndex={-1}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 바디 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Portal을 사용하여 body에 렌더링
   */
  return createPortal(modalContent, document.body);
};

/**
 * 확인 모달
 * 
 * 사용 예시:
 * ```tsx
 * <Modal.Confirm
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="삭제 확인"
 *   message="정말로 삭제하시겠습니까?"
 *   confirmText="삭제"
 *   confirmVariant="danger"
 * />
 * ```
 */
Modal.Confirm = function ModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-primary hover:bg-primary-hover text-white';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-2 rounded-lg transition-colors font-medium
              disabled:opacity-50
              ${confirmButtonClass}
            `}
          >
            {isLoading ? '처리 중...' : confirmText}
          </button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

export default Modal;
