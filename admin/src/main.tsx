/**
 * Admin 애플리케이션 진입점
 * 
 * 역할:
 * - React 18 방식으로 앱 마운트
 * - StrictMode 활성화 (개발 시 경고 및 검증)
 * - 글로벌 스타일 로드
 * 
 * @packageDocumentation
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 글로벌 스타일
import './styles/index.css';

/**
 * React 18의 createRoot API를 사용하여 앱을 마운트합니다.
 * 
 * StrictMode:
 * - 개발 모드에서만 작동
 * - 컴포넌트 이중 렌더링으로 부작용 감지
 * - 레거시 API 사용 경고
 * - 안전하지 않은 생명주기 메서드 경고
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Check that index.html has <div id="root"></div>'
  );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * 핫 모듈 리플레이스먼트 (HMR) 설정
 * 
 * 개발 중 파일 변경 시 전체 페이지 새로고침 없이
 * 변경된 모듈만 교체합니다.
 */
if (import.meta.hot) {
  import.meta.hot.accept();
}
