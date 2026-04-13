// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Shop PWA',
        short_name: 'Shop',
        description: 'Internet Shop with PWA support',
        theme_color: '#4285f4',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // App Shell — Cache First
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Dynamic product data — Network First
            urlPattern: /\/api\/products/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'products-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Images — Stale While Revalidate
            urlPattern: /picsum\.photos/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'images-cache', expiration: { maxEntries: 100 } },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3001', ws: true },
    },
  },
});
