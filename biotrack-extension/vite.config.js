import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // Port fixe : @crxjs embarque ce port dans le service worker. Si 5173 est pris, Vite
  // basculeait sur 5174+ et le panneau « Vite Dev Mode » ne joignait plus le serveur.
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        fmtDashboard: path.resolve(__dirname, 'fmt-dashboard.html'),
      },
    },
  },
})
