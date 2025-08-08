// DATION_APP/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Electron 환경에서 file:// 프로토콜 사용을 위해 상대 경로 설정
  server: {
    proxy: {
      '/api': {
        target: 'https://api.banya.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // 개발 환경에서 HTTPS 인증서 검증을 무시합니다. 프로덕션에서는 주의 필요.
      },
    },
  },
  // Vite 빌드 설정을 명시적으로 추가
  build: {
    outDir: 'dist', // 빌드 결과물이 생성될 디렉토리 (기본값)
    emptyOutDir: true, // 빌드 시 outDir 디렉토리 비우기 (기본값)
    sourcemap: false, // 소스맵 생성 여부
    // 기타 빌드 관련 설정들을 여기에 추가할 수 있습니다.
    // 예를 들어, minify: true, rollupOptions 등
  },
  publicDir: 'public', // 정적 자산 디렉토리를 명시적으로 'public'으로 설정
});