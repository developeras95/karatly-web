/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development (npm run dev) the page is served by Vite on http://localhost:5174 and every call
// to the Karatly API is forwarded to KARATLY_API_URL (default: Karatly on http://localhost:8081).
// The browser only ever talks to one address, so the API needs no CORS settings.
// Ports 5174 and 8081 (not 5173 and 8080) so Karatly runs next to Duewise.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.KARATLY_API_URL || 'http://localhost:8081';
  const toApi = { target: apiUrl, changeOrigin: true };

  return {
    plugins: [react()],
    build: {
      // One chunk for now (MUI is most of it); pages will be loaded on demand once there are several.
      chunkSizeWarningLimit: 800,
    },
    server: {
      port: 5174,
      proxy: {
        '/api': toApi,
        '/actuator': toApi,
        '/v3/api-docs': toApi,
        '/swagger-ui': toApi,
      },
    },
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      environment: 'jsdom',
      environmentOptions: { jsdom: { url: 'http://localhost:3000/' } },
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      testTimeout: 15_000,
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/api/schema.d.ts', 'src/main.tsx'],
        // The build fails if coverage drops below these.
        thresholds: { lines: 75, branches: 60 },
      },
    },
  };
});
