import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from 'vite-plugin-svgr';

const target = process.env.VITE_EDEGAL_PROXY_URL || 'https://conikuvat.fi';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [reactRefresh(), svgr()],
  server: {
    proxy: {
      '/api': {
        target,
        changeOrigin: true,
      },
      '/media': {
        target,
        changeOrigin: true,
      },
    },
  },
});
