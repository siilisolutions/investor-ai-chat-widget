/**
 * Dev entry point used by Vite's dev server (`npm run dev`). Mounts
 * the widget into `#siili-chatbot` in the root `index.html` harness
 * so we can iterate without the library build.
 *
 * Set `VITE_API_URL` in `.env.local` to point dev at the real
 * backend; leave it unset to use the bundled mock (AC-04, AC-51).
 * This file is not part of the library bundle (see `vite.config.ts`
 * → `build.lib.entry`), so the env var never leaks into production.
 */

import { init } from './widget.tsx'

const apiUrl = import.meta.env.VITE_API_URL

init({
  container: '#siili-chatbot',
  apiUrl: typeof apiUrl === 'string' && apiUrl.length > 0 ? apiUrl : undefined,
})
