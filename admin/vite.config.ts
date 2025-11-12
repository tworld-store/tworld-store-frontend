import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast Refresh 활성화
      fastRefresh: true,
      // Babel 옵션
      babel: {
        plugins: [],
      },
    }),
  ],

  // Path Alias 설정
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/styles': path.resolve(__dirname, './src/styles'),
    },
  },

  // 개발 서버 설정
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    // HMR 설정
    hmr: {
      overlay: true,
    },
  },

  // 빌드 설정
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 청크 크기 경고 제한 (500kb)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 수동 청크 분리
        manualChunks: {
          // React 관련
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Craft.js 관련
          'craftjs': ['@craftjs/core', '@craftjs/layers'],
          // Firebase 관련
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          // UI 라이브러리
          'ui-vendor': ['lucide-react', 'react-colorful', 'react-dropzone'],
        },
      },
    },
    // Minify 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console 제거
        drop_debugger: true,
      },
    },
  },

  // 환경 변수 접두사
  envPrefix: 'VITE_',

  // 최적화 설정
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@craftjs/core',
      '@craftjs/layers',
      'zustand',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/storage',
    ],
  },
});
