import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'generateSW', // ✅ change here
      registerType: 'autoUpdate',

      devOptions: {
        enabled: false,
      },

      manifest: {
        name: 'AuraLendr',
        short_name: 'AuraLendr',
        description: 'Gold Loan Management System',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/assets/nsh/auralendr.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/nsh/auralendr.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
