import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/admin/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/admin/users/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/admin/vehicles/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
