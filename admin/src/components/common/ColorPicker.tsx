/**
 * ColorPicker 컴포넌트
 * 
 * 역할:
 * - 색상 선택
 * - HEX, RGB, HSL 지원
 * - 프리셋 컬러
 * - 최근 사용 색상
 * 
 * 사용 예시:
 * ```tsx
 * <ColorPicker
 *   value="#3B82F6"
 *   onChange={(color) => console.log(color)}
 * />
 * ```
 * 
 * @packageDocumentation
 */

import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

/**
 * ColorPicker Props 인터페이스
 */
export interface ColorPickerProps {
  /** 현재 색상 (HEX 형식) */
  value: string;
  
  /** 색상 변경 콜백 */
  onChange: (color: string) => void;
  
  /** 프리셋 컬러 목록 */
  presets?: string[];
  
  /** 최근 사용 색상 저장 */
  showRecent?: boolean;
  
  /** 라벨 */
  label?: string;
  
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 기본 프리셋 컬러
 */
const DEFAULT_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#000000', // Black
  '#FFFFFF', // White
];

/**
 * 최근 사용 색상을 localStorage에서 관리하는 키
 */
const RECENT_COLORS_KEY = 'colorpicker-recent-colors';

/**
 * ColorPicker 컴포넌트
 * 
 * react-colorful 라이브러리를 사용합니다.
 * 프리셋 컬러와 최근 사용 색상 기능을 제공합니다.
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  showRecent = true,
  label,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  /**
   * 최근 사용 색상 불러오기
   */
  useEffect(() => {
    if (!showRecent) return;

    try {
      const stored = localStorage.getItem(RECENT_COLORS_KEY);
      if (stored) {
        setRecentColors(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent colors:', error);
    }
  }, [showRecent]);

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
   * 색상 변경 핸들러
   * 
   * @param color - 선택된 색상
   */
  const handleChange = (color: string) => {
    onChange(color);
    saveToRecent(color);
  };

  /**
   * 최근 사용 색상에 저장
   * 
   * @param color - 저장할 색상
   */
  const saveToRecent = (color: string) => {
    if (!showRecent) return;

    try {
      const updated = [color, ...recentColors.filter((c) => c !== color)].slice(0, 8);
      setRecentColors(updated);
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent color:', error);
    }
  };

  /**
   * HEX 값 검증
   * 
   * @param hex - 검증할 HEX 값
   * @returns 유효한 HEX 값
   */
  const normalizeHex = (hex: string): string => {
    // # 제거
    let normalized = hex.replace('#', '');
    
    // 3자리 HEX를 6자리로 변환 (예: abc → aabbcc)
    if (normalized.length === 3) {
      normalized = normalized.split('').map(c => c + c).join('');
    }
    
    // 유효하지 않으면 기본값
    if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
      return value;
    }
    
    return `#${normalized.toUpperCase()}`;
  };

  return (
    <div className={className}>
      {/* 라벨 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 색상 선택 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full"
      >
        {/* 색상 미리보기 */}
        <div
          className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        
        {/* HEX 값 */}
        <span className="text-sm font-mono text-gray-700 flex-1 text-left">
          {value}
        </span>
        
        {/* 화살표 아이콘 */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 컬러 피커 팝오버 */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 animate-slide-down"
        >
          {/* react-colorful 피커 */}
          <HexColorPicker
            color={value}
            onChange={handleChange}
            style={{ width: '200px', height: '150px' }}
          />

          {/* HEX 입력 */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              HEX
            </label>
            <HexColorInput
              color={value}
              onChange={(color) => handleChange(normalizeHex(color))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary"
              prefixed
            />
          </div>

          {/* 프리셋 컬러 */}
          {presets.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 mb-2">프리셋</p>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleChange(preset)}
                    className={`
                      w-8 h-8 rounded border-2 transition-all
                      ${preset === value ? 'border-primary scale-110' : 'border-gray-300 hover:scale-105'}
                    `}
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 최근 사용 색상 */}
          {showRecent && recentColors.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 mb-2">최근 사용</p>
              <div className="grid grid-cols-4 gap-2">
                {recentColors.map((recent, index) => (
                  <button
                    key={`${recent}-${index}`}
                    type="button"
                    onClick={() => handleChange(recent)}
                    className={`
                      w-8 h-8 rounded border-2 transition-all
                      ${recent === value ? 'border-primary scale-110' : 'border-gray-300 hover:scale-105'}
                    `}
                    style={{ backgroundColor: recent }}
                    title={recent}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 간단한 컬러 스와치 컴포넌트
 * 
 * 사용 예시:
 * ```tsx
 * <ColorPicker.Swatch
 *   colors={['#FF0000', '#00FF00', '#0000FF']}
 *   value={color}
 *   onChange={setColor}
 * />
 * ```
 */
ColorPicker.Swatch = function ColorSwatch({
  colors,
  value,
  onChange,
  className = '',
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`
            w-8 h-8 rounded-full border-2 transition-all
            ${color === value ? 'border-primary scale-110 shadow-md' : 'border-gray-300 hover:scale-105'}
          `}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
