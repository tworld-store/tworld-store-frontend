/** @type {import('tailwindcss').Config} */
export default {
  // 컨텐츠 경로 설정 - Tailwind가 스캔할 파일들
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // 다크 모드 설정
  darkMode: 'class', // class 기반 다크 모드
  
  theme: {
    extend: {
      // ========================================
      // 커스텀 컬러
      // ========================================
      colors: {
        // Primary 컬러 (브랜드 컬러)
        primary: {
          DEFAULT: 'hsl(220, 90%, 56%)',
          50: 'hsl(220, 90%, 96%)',
          100: 'hsl(220, 90%, 92%)',
          200: 'hsl(220, 90%, 83%)',
          300: 'hsl(220, 90%, 74%)',
          400: 'hsl(220, 90%, 65%)',
          500: 'hsl(220, 90%, 56%)',
          600: 'hsl(220, 90%, 46%)',
          700: 'hsl(220, 90%, 36%)',
          800: 'hsl(220, 90%, 26%)',
          900: 'hsl(220, 90%, 16%)',
        },
        
        // Gray 컬러 (UI용)
        gray: {
          50: 'hsl(210, 20%, 98%)',
          100: 'hsl(210, 16%, 93%)',
          200: 'hsl(210, 14%, 83%)',
          300: 'hsl(210, 13%, 70%)',
          400: 'hsl(210, 12%, 55%)',
          500: 'hsl(210, 11%, 43%)',
          600: 'hsl(210, 12%, 33%)',
          700: 'hsl(210, 14%, 23%)',
          800: 'hsl(210, 18%, 15%)',
          900: 'hsl(210, 24%, 10%)',
        },
        
        // Semantic 컬러
        success: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          light: 'hsl(142, 76%, 96%)',
          dark: 'hsl(142, 76%, 26%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          light: 'hsl(38, 92%, 96%)',
          dark: 'hsl(38, 92%, 40%)',
        },
        error: {
          DEFAULT: 'hsl(0, 84%, 60%)',
          light: 'hsl(0, 84%, 96%)',
          dark: 'hsl(0, 84%, 50%)',
        },
        info: {
          DEFAULT: 'hsl(199, 89%, 48%)',
          light: 'hsl(199, 89%, 96%)',
          dark: 'hsl(199, 89%, 38%)',
        },
      },
      
      // ========================================
      // 폰트 패밀리
      // ========================================
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      
      // ========================================
      // 폰트 크기
      // ========================================
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      
      // ========================================
      // Spacing (8px 단위)
      // ========================================
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },
      
      // ========================================
      // Border Radius
      // ========================================
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // ========================================
      // Box Shadow
      // ========================================
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      
      // ========================================
      // 트랜지션
      // ========================================
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      // ========================================
      // Z-index
      // ========================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
      },
      
      // ========================================
      // 키프레임 애니메이션
      // ========================================
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { 
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
      },
      
      // ========================================
      // 애니메이션
      // ========================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      
      // ========================================
      // 그리드 템플릿
      // ========================================
      gridTemplateColumns: {
        'admin': '240px 1fr',
        'editor': '280px 1fr 320px',
      },
      
      // ========================================
      // Max Width
      // ========================================
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  
  // ========================================
  // 플러그인
  // ========================================
  plugins: [
    // 폼 스타일링 (선택적)
    // require('@tailwindcss/forms'),
    
    // 타이포그래피 (선택적)
    // require('@tailwindcss/typography'),
    
    // 애스펙트 비율 (선택적)
    // require('@tailwindcss/aspect-ratio'),
  ],
};
