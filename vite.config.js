import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'public/build',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/main.js',
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
