/**
 * PostCSS 설정
 * 
 * PostCSS는 CSS를 변환하는 도구입니다.
 * Tailwind CSS와 Autoprefixer를 사용합니다.
 * 
 * @type {import('postcss').ProcessOptions}
 */
export default {
  plugins: {
    /**
     * Tailwind CSS
     * 
     * 유틸리티 클래스 기반 CSS 프레임워크
     * - @tailwind 디렉티브 처리
     * - JIT(Just-In-Time) 컴파일
     * - 사용하지 않는 스타일 제거 (PurgeCSS)
     */
    tailwindcss: {},
    
    /**
     * Autoprefixer
     * 
     * 브라우저 호환성을 위한 벤더 프리픽스 자동 추가
     * 
     * 예시:
     * display: flex;
     * →
     * display: -webkit-box;
     * display: -ms-flexbox;
     * display: flex;
     * 
     * 지원 브라우저는 package.json의 browserslist 또는
     * .browserslistrc 파일에서 설정 가능
     * 
     * 기본값: 최근 2개 버전의 주요 브라우저
     */
    autoprefixer: {},
  },
};
