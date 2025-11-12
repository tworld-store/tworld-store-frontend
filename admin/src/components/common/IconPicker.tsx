/**
 * IconPicker 컴포넌트
 * 
 * 역할:
 * - 아이콘 선택
 * - 아이콘 검색
 * - lucide-react 아이콘 사용
 * 
 * 사용 예시:
 * ```tsx
 * <IconPicker
 *   value="Heart"
 *   onChange={(icon) => console.log(icon)}
 * />
 * ```
 * 
 * @packageDocumentation
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';

/**
 * IconPicker Props 인터페이스
 */
export interface IconPickerProps {
  /** 현재 선택된 아이콘 이름 */
  value?: string;
  
  /** 아이콘 변경 콜백 */
  onChange: (iconName: string) => void;
  
  /** 라벨 */
  label?: string;
  
  /** 커스텀 클래스명 */
  className?: string;
  
  /** 아이콘 크기 */
  size?: number;
}

/**
 * lucide-react의 모든 아이콘 이름 목록
 */
const ICON_NAMES = Object.keys(Icons).filter(
  (key) =>
    key !== 'createLucideIcon' &&
    key !== 'default' &&
    typeof Icons[key as keyof typeof Icons] === 'function'
);

/**
 * 자주 사용하는 아이콘 목록
 */
const POPULAR_ICONS = [
  'Home',
  'User',
  'Settings',
  'Search',
  'Menu',
  'X',
  'Check',
  'ChevronRight',
  'ChevronLeft',
  'ChevronDown',
  'ChevronUp',
  'Plus',
  'Minus',
  'Edit',
  'Trash',
  'Eye',
  'EyeOff',
  'Heart',
  'Star',
  'Bell',
  'Mail',
  'Phone',
  'Calendar',
  'Clock',
  'MapPin',
  'Image',
  'File',
  'Folder',
  'Download',
  'Upload',
  'Link',
  'ExternalLink',
  'Copy',
  'Share',
  'Filter',
  'Info',
  'AlertCircle',
  'CheckCircle',
  'XCircle',
];

/**
 * IconPicker 컴포넌트
 * 
 * lucide-react의 모든 아이콘을 선택할 수 있는 컴포넌트입니다.
 * 검색 기능과 인기 아이콘 탭을 제공합니다.
 */
const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  label,
  className = '',
  size = 24,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'popular' | 'all'>('popular');
  const pickerRef = useRef<HTMLDivElement>(null);

  /**
   * 외부 클릭 감지하여 닫기
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /**
   * 필터링된 아이콘 목록
   */
  const filteredIcons = useMemo(() => {
    const iconList = activeTab === 'popular' ? POPULAR_ICONS : ICON_NAMES;
    
    if (!searchQuery) return iconList;
    
    const query = searchQuery.toLowerCase();
    return iconList.filter((name) => name.toLowerCase().includes(query));
  }, [searchQuery, activeTab]);

  /**
   * 아이콘 선택 핸들러
   * 
   * @param iconName - 선택된 아이콘 이름
   */
  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery('');
  };

  /**
   * 선택된 아이콘 컴포넌트 가져오기
   */
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.FC<{ size?: number }>;
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 라벨 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 아이콘 선택 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full"
      >
        {/* 선택된 아이콘 미리보기 */}
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
          {value ? (
            getIconComponent(value)
          ) : (
            <Icons.Image size={20} className="text-gray-400" />
          )}
        </div>
        
        {/* 아이콘 이름 */}
        <span className="text-sm text-gray-700 flex-1 text-left">
          {value || '아이콘 선택'}
        </span>
        
        {/* 화살표 아이콘 */}
        <Icons.ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 아이콘 피커 팝오버 */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 animate-slide-down"
        >
          {/* 검색 입력 */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Icons.Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아이콘 검색..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`
                flex-1 px-4 py-2 text-sm font-medium transition-colors
                ${activeTab === 'popular' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              인기
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`
                flex-1 px-4 py-2 text-sm font-medium transition-colors
                ${activeTab === 'all' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              전체
            </button>
          </div>

          {/* 아이콘 그리드 */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((iconName) => {
                  const IconComponent = Icons[iconName as keyof typeof Icons] as React.FC<{
                    size?: number;
                  }>;
                  
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-lg transition-all
                        ${iconName === value 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-100 text-gray-600'
                        }
                      `}
                      title={iconName}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Icons.Search size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">검색 결과가 없습니다</p>
              </div>
            )}
          </div>

          {/* 선택된 아이콘 정보 */}
          {value && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">선택됨: {value}</span>
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  지우기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 아이콘 디스플레이 컴포넌트
 * 
 * 사용 예시:
 * ```tsx
 * <IconPicker.Display iconName="Heart" size={24} />
 * ```
 */
IconPicker.Display = function IconDisplay({
  iconName,
  size = 24,
  className = '',
}: {
  iconName?: string;
  size?: number;
  className?: string;
}) {
  if (!iconName) return null;

  const IconComponent = Icons[iconName as keyof typeof Icons] as React.FC<{
    size?: number;
    className?: string;
  }>;

  if (!IconComponent) return null;

  return <IconComponent size={size} className={className} />;
};

export default IconPicker;
