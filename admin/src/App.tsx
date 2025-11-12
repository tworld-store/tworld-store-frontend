/**
 * Admin 애플리케이션 루트 컴포넌트
 * 
 * 역할:
 * - 라우팅 설정 (React Router v6)
 * - 인증 체크 및 리다이렉트
 * - 전역 에러 바운더리
 * - 레이아웃 구조
 * 
 * @packageDocumentation
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy Loading으로 페이지 컴포넌트 불러오기
// 초기 번들 크기를 줄이고 필요한 페이지만 로드합니다
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PageEditor = lazy(() => import('./pages/PageEditor'));
const ProductManager = lazy(() => import('./pages/ProductManager'));
const ImageManager = lazy(() => import('./pages/ImageManager'));
const BoardManager = lazy(() => import('./pages/BoardManager'));
const MenuManager = lazy(() => import('./pages/MenuManager'));
const Settings = lazy(() => import('./pages/Settings'));

// 레이아웃 컴포넌트
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

// 공통 컴포넌트
const ErrorBoundary = lazy(() => import('./components/common/ErrorBoundary'));
const Loading = lazy(() => import('./components/common/Loading'));

/**
 * 로딩 폴백 컴포넌트
 * Suspense의 fallback으로 사용됩니다
 */
const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
};

/**
 * 인증 보호 라우트 래퍼
 * 
 * 로그인하지 않은 사용자는 /login으로 리다이렉트합니다.
 * TODO: 실제 인증 로직은 useAuth 훅에서 구현 예정
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: 실제 인증 상태는 useAuth 훅에서 가져오기
  const isAuthenticated = true; // 임시로 true 설정
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * App 컴포넌트
 * 
 * 라우트 구조:
 * - / : 대시보드 (로그인 필요)
 * - /login : 로그인 페이지
 * - /pages : 페이지 관리
 * - /pages/edit/:id : 페이지 편집
 * - /products : 상품 관리
 * - /images : 이미지 관리
 * - /boards : 게시판 관리
 * - /menu : 메뉴 관리
 * - /settings : 설정
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 로그인 페이지 (인증 불필요) */}
            <Route path="/login" element={<Login />} />
            
            {/* 보호된 라우트 (인증 필요) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* 대시보드 */}
              <Route index element={<Dashboard />} />
              
              {/* 페이지 관리 */}
              <Route path="pages">
                <Route index element={<Navigate to="/" replace />} />
                <Route path="edit/:pageId" element={<PageEditor />} />
              </Route>
              
              {/* 상품 관리 */}
              <Route path="products" element={<ProductManager />} />
              
              {/* 이미지 관리 */}
              <Route path="images" element={<ImageManager />} />
              
              {/* 게시판 관리 */}
              <Route path="boards" element={<BoardManager />} />
              
              {/* 메뉴 관리 */}
              <Route path="menu" element={<MenuManager />} />
              
              {/* 설정 */}
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 - 모든 경로에 매치되지 않을 때 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
