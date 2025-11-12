/**
 * Header 컴포넌트
 * 
 * 역할:
 * - 상단 헤더 바
 * - 사용자 정보 표시
 * - 알림 표시
 * - 프로필 드롭다운
 * 
 * @packageDocumentation
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

/**
 * Header Props 인터페이스
 */
export interface HeaderProps {
  /** 모바일 메뉴 클릭 콜백 */
  onMenuClick?: () => void;
}

/**
 * 페이지 타이틀 매핑
 * 
 * 라우트 경로에 따라 표시할 타이틀을 정의합니다.
 */
const PAGE_TITLES: Record<string, string> = {
  '/': '대시보드',
  '/pages': '페이지 관리',
  '/products': '상품 관리',
  '/images': '이미지 관리',
  '/boards': '게시판 관리',
  '/menu': '메뉴 관리',
  '/settings': '설정',
};

/**
 * Header 컴포넌트
 * 
 * Admin의 상단 헤더 바입니다.
 * 페이지 타이틀, 알림, 사용자 프로필을 표시합니다.
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  /**
   * 현재 페이지 타이틀 가져오기
   */
  const getPageTitle = (): string => {
    // 정확한 경로 매칭
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname];
    }

    // 동적 라우트 처리 (예: /pages/edit/:id)
    if (location.pathname.startsWith('/pages/edit/')) {
      return '페이지 편집';
    }

    return '티월드스토어 Admin';
  };

  /**
   * 외부 클릭 감지하여 드롭다운 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = () => {
    // TODO: 실제 로그아웃 로직 구현
    // - Firebase Auth 로그아웃
    // - 로컬 상태 초기화
    // - 로그인 페이지로 리다이렉트
    console.log('로그아웃');
    navigate('/login');
  };

  /**
   * 설정 페이지로 이동
   */
  const handleSettings = () => {
    setIsProfileOpen(false);
    navigate('/settings');
  };

  /**
   * 프로필 페이지로 이동
   */
  const handleProfile = () => {
    setIsProfileOpen(false);
    // TODO: 프로필 페이지 구현 후 연결
    console.log('프로필 페이지로 이동');
  };

  return (
    <header className="admin-header">
      {/* 좌측 영역 */}
      <div className="flex items-center gap-4">
        {/* 모바일 햄버거 메뉴 */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>

        {/* 페이지 타이틀 */}
        <h1 className="text-lg font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* 우측 영역 */}
      <div className="flex items-center gap-2">
        {/* 알림 */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="알림"
          >
            <Bell size={20} />
            
            {/* 알림 뱃지 */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* 알림 드롭다운 */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 animate-slide-down z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">알림</h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {/* 알림 목록 */}
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                  <p className="text-sm text-gray-900 font-medium">새 상품이 등록되었습니다</p>
                  <p className="text-xs text-gray-500 mt-1">5분 전</p>
                </div>
                
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                  <p className="text-sm text-gray-900 font-medium">페이지가 발행되었습니다</p>
                  <p className="text-xs text-gray-500 mt-1">1시간 전</p>
                </div>
                
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm text-gray-900 font-medium">이미지 업로드 완료</p>
                  <p className="text-xs text-gray-500 mt-1">2시간 전</p>
                </div>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 text-center">
                <button className="text-sm text-primary hover:text-primary-hover font-medium">
                  모두 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-300" />

        {/* 사용자 프로필 */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* 프로필 이미지 */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            
            {/* 사용자 이름 (데스크톱만) */}
            <span className="hidden md:block text-sm font-medium text-gray-700">
              관리자
            </span>
            
            {/* 화살표 */}
            <ChevronDown
              size={16}
              className={`hidden md:block text-gray-400 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* 프로필 드롭다운 */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 animate-slide-down z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">관리자</p>
                <p className="text-xs text-gray-500">admin@tworld.com</p>
              </div>
              
              <div className="py-2">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} />
                  <span>프로필</span>
                </button>
                
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  <span>설정</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
