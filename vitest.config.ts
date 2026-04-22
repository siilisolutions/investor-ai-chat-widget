import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

// Mirrors the React → preact/compat aliases from vite.config.ts so
// tests import through the same shim the production bundle uses
// (see AGENTS.md "Framework imports"). The `build.lib` block from
// vite.config.ts is intentionally NOT inherited here — tests have
// their own entry points.
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
  test: {
    environment: 'happy-dom',
    globals: false,
    setupFiles: [resolve(__dirname, 'tests/setup.ts')],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
})
