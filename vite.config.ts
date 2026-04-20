import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/client': 'preact/compat/client',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
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
