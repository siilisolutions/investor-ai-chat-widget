import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget.tsx'),
      name: 'SiiliChatbot',
      fileName: 'siili-chatbot',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'siili-chatbot.[ext]',
      },
    },
  },
})
