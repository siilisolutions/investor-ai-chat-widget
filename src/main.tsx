/**
 * Dev entry point used by Vite's dev server (`npm run dev`). Mounts
 * the widget into `#siili-chatbot` in the root `index.html` harness
 * so we can iterate without the library build.
 */

import { init } from './widget.tsx'

init({ container: '#siili-chatbot' })
