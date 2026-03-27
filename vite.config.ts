import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['logo.svg', 'icon-512x512.svg'],
        manifest: {
          id: '/',
          name: 'VendorFlow',
          short_name: 'VendorFlow',
          description: 'Create, manage, and share professional invoices and receipts.',
          categories: ['finance', 'business', 'productivity'],
          dir: 'ltr',
          lang: 'en-US',
          prefer_related_applications: false,
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: '/icon-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable'
            },
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
          screenshots: [
            {
              src: 'https://picsum.photos/seed/vendorflow1/1280/720',
              sizes: '1280x720',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'VendorFlow Dashboard'
            },
            {
              src: 'https://picsum.photos/seed/vendorflow2/720/1280',
              sizes: '720x1280',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'VendorFlow Mobile'
            }
          ],
          related_applications: [
            {
              platform: 'play',
              url: 'https://play.google.com/store/apps/details?id=com.vendorflow.app',
              id: 'com.vendorflow.app'
            }
          ],
          iarc_rating_id: '12345678-1234-1234-1234-123456789012',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          handle_links: 'auto',
          launch_handler: {
            client_mode: ['navigate-new', 'focus-existing']
          },
          share_target: {
            action: '/share',
            method: 'GET',
            enctype: 'application/x-www-form-urlencoded',
            params: {
              title: 'title',
              text: 'text',
              url: 'url'
            }
          },
          protocol_handlers: [
            {
              protocol: 'web+vendorflow',
              url: '/?url=%s'
            }
          ],
          file_handlers: [
            {
              action: '/?file=%s',
              accept: {
                'application/json': ['.json', '.vflow'],
                'text/plain': ['.txt']
              }
            }
          ],
          // @ts-ignore - serviceworker is used by PWABuilder but not in standard ManifestOptions
          serviceworker: {
            src: '/sw.js',
            scope: '/',
            type: 'classic'
          },
          shortcuts: [
            {
              name: 'New Invoice',
              url: '/invoices/new',
              icons: [{ src: '/logo.svg', sizes: '512x512' }]
            },
            {
              name: 'New Receipt',
              url: '/receipts/new',
              icons: [{ src: '/logo.svg', sizes: '512x512' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
