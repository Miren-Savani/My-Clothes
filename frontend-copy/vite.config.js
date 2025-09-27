// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname), // Ensure the root is your frontend folder
  plugins: [react()],
  optimizeDeps: {
    // Exclude backend-specific packages from dependency pre-bundling
    exclude: [
      '@mapbox/node-pre-gyp',
      'nock',
      '@mswjs/interceptors'
    ]
  },
  build: {
    rollupOptions: {
      // Mark these packages as external so they are not bundled
      external: [
        '@mapbox/node-pre-gyp',
        'nock',
        '@mswjs/interceptors'
      ]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  server: {
    fs: {
      // Allow serving files only from the frontend directory (strict mode)
      strict: true,
      // Optionally, restrict access explicitly to the frontend folder:
      allow: [resolve(__dirname)]
    }
  }
})
