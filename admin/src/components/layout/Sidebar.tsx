/**
 * Sidebar 컴포넌트
 * 
 * 역할:
 * - 네비게이션 메뉴
 * - 로고 표시
 * - 활성 메뉴 표시
 * - 모바일 대응
 * 
 * @packageDocumentation
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileEdit,
  Package,
  Image,
  MessageSquare,
  Menu as MenuIcon,
  Settings,
  X,
} from 'lucide-react';

/**
 * Sidebar Props 인터페이스
 */
export interface SidebarProps {
  /** 모바일 사이드바 열림 상태 */
  isOpen?: boolean;
  
  /** 닫기 콜백 (모바일) */
  onClose?: () => void;
}

/**
 * 네비게이션 메뉴 아이템 타입
 */
interface NavItem {
  /** 메뉴 이름 */
  name: string;
  
  /** 라우트 경로 */
  path: string;
  
  /** 아이콘 컴포넌트 */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  
  /** 하위 메뉴 (선택) */
  children?: NavItem[];
}

/**
 * 네비게이션 메뉴 목록
 */
const NAV_ITEMS: NavItem[] = [
  {
    name: '대시보드',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: '페이지 관리',
    path: '/pages',
    icon: FileEdit,
  },
  {
    name: '상품 관리',
    path: '/products',
    icon: Package,
  },
  {
    name: '이미지 관리',
    path: '/images',
    icon: Image,
  },
  {
    name: '게시판 관리',
    path: '/boards',
    icon: MessageSquare,
  },
  {
    name: '메뉴 관리',
    path: '/menu',
    icon: MenuIcon,
  },
  {
    name: '설정',
    path: '/settings',
    icon: Settings,
  },
];

/**
 * Sidebar 컴포넌트
 * 
 * Admin의 좌측 네비게이션 사이드바입니다.
 * 반응형으로 동작하며, 모바일에서는 오버레이로 표시됩니다.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();

  /**
   * 현재 경로가 활성 상태인지 확인
   * 
   * @param path - 메뉴 경로
   * @returns 활성 여부
   */
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`
        admin-sidebar
        ${isOpen ? 'open' : ''}
      `}
    >
      {/* 로고 영역 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* 로고 아이콘 */}
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          
          {/* 사이트 이름 */}
          <div>
            <h1 className="text-lg font-bold text-gray-900">티월드스토어</h1>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

        {/* 모바일 닫기 버튼 */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="사이드바 닫기"
        >
          <X size={20} />
        </button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  sidebar-nav-item
                  ${active ? 'active' : ''}
                `}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* 하단 정보 */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium">버전 0.1.0</p>
          <p className="mt-1">© 2025 티월드스토어</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
