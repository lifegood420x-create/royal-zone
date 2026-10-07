import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// PORT only matters for the dev/preview server; production builds (e.g. on
// Railway) run without it, so fall back instead of throwing.
const rawPort = process.env.PORT ?? '5000';

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// The app is served from the domain root everywhere except Replit's
// artifact router, which injects its own BASE_PATH.
const basePath = process.env.BASE_PATH ?? '/';

// OPTIONAL dev-only convenience: when VITE_DEV_API_ORIGIN is set (e.g. a
// local mock of the api-server), `/api` requests made by the Vite dev server
// are proxied there. It is read ONLY for `server.proxy` — production builds
// are byte-identical to before, and the deployed app keeps calling
// same-origin `/api` like it always has.
const devApiOrigin = process.env.VITE_DEV_API_ORIGIN;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    ...(devApiOrigin
      ? {
          proxy: {
            '/api': {
              target: devApiOrigin,
              changeOrigin: true,
            },
          },
        }
      : {}),
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
