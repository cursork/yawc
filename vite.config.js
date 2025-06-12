import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: {
      overlay: false // Reduces visual disruption during hot reloads
    }
  },
  build: {
    target: 'esnext'
  }
})