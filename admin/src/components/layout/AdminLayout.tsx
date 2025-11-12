/**
 * AdminLayout 컴포넌트
 * 
 * 역할:
 * - Admin 전체 레이아웃 구조
 * - Sidebar + Header + Main 영역
 * - 반응형 레이아웃
 * 
 * 사용 예시:
 * ```tsx
 * <AdminLayout>
 *   <Dashboard />
 * </AdminLayout>
 * ```
 * 
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AdminLayout Props 인터페이스
 */
export interface AdminLayoutProps {
  /** 자식 컴포넌트 (선택적, Outlet 사용 시 불필요) */
  children?: React.ReactNode;
}

/**
 * AdminLayout 컴포넌트
 * 
 * Admin 페이지의 전체 레이아웃을 담당합니다.
 * Grid 레이아웃을 사용하여 Sidebar, Header, Main 영역을 배치합니다.
 * 
 * 레이아웃 구조:
 * ```
 * +------------------+------------------+
 * |    Sidebar       |      Header      |
 * |   (240px)        |                  |
 * +------------------+------------------+
 * |    Sidebar       |      Main        |
 * |                  |                  |
 * +------------------+------------------+
 * ```
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  /**
   * 모바일 사이드바 열림/닫힘 상태
   */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /**
   * 모바일 사이드바 토글
   */
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  /**
   * 모바일 사이드바 닫기
   */
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* 사이드바 */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={closeMobileSidebar}
      />

      {/* 모바일 사이드바 오버레이 */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* 헤더 */}
      <Header onMenuClick={toggleMobileSidebar} />

      {/* 메인 컨텐츠 영역 */}
      <main className="admin-main">
        {/* React Router의 중첩 라우트 렌더링 */}
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
