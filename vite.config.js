import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    target: 'esnext'
  },
  define: {
    'import.meta.env.CONNECT_PORT': JSON.stringify(process.env.CONNECT_PORT)
  }
})