/**
 * Library entry point. Exports `init()` on the global `SiiliChatbot`
 * namespace so the host page can mount the widget with a single call:
 *
 *   <div id="siili-chatbot"></div>
 *   <script src="siili-chatbot.iife.js"></script>
 *   <script>
 *     SiiliChatbot.init({
 *       container: '#siili-chatbot',
 *       apiUrl: 'https://.../api/chat',
 *     })
 *   </script>
 *
 * When `apiUrl` is omitted the widget falls back to the bundled mock
 * service so the dev harness and offline demos still work (AC-04).
 *
 * The CSS is emitted as a sibling `siili-chatbot.css` file and must be
 * linked separately on the host page.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import mockService from './services/chatService.ts'
import { createApiChatService } from './services/apiChatService.ts'
import type { ChatService, WidgetOptions } from './types/index.ts'
import './styles/variables.css'

type Root = ReturnType<typeof createRoot>

const roots = new WeakMap<Element, Root>()

function resolveContainer(container: string | HTMLElement): HTMLElement {
  if (typeof container === 'string') {
    const el = document.querySelector(container)
    if (!(el instanceof HTMLElement)) {
      throw new Error(
        `SiiliChatbot.init: no element matches selector "${container}"`
      )
    }
    return el
  }
  return container
}

function resolveService(apiUrl: string | undefined): ChatService {
  const trimmed = typeof apiUrl === 'string' ? apiUrl.trim() : ''
  if (trimmed.length === 0) return mockService
  return createApiChatService(trimmed)
}

export function init(options: WidgetOptions): void {
  const el = resolveContainer(options.container)
  const existing = roots.get(el)
  if (existing) {
    existing.unmount()
  }
  const chatService = resolveService(options.apiUrl)
  const root = createRoot(el)
  roots.set(el, root)
  root.render(
    <StrictMode>
      <App chatService={chatService} />
    </StrictMode>
  )
}
