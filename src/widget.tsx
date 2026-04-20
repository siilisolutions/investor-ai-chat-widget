/**
 * Library entry point. Exports `init()` on the global `SiiliChatbot`
 * namespace so the host page can mount the widget with a single call:
 *
 *   <div id="siili-chatbot"></div>
 *   <script src="siili-chatbot.iife.js"></script>
 *   <script>SiiliChatbot.init({ container: '#siili-chatbot' })</script>
 *
 * The CSS is emitted as a sibling `siili-chatbot.css` file and must be
 * linked separately on the host page.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { App } from './App.tsx'
import type { WidgetOptions } from './types/index.ts'
import './styles/variables.css'

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

export function init(options: WidgetOptions): void {
  const el = resolveContainer(options.container)
  const existing = roots.get(el)
  if (existing) {
    existing.unmount()
  }
  const root = createRoot(el)
  roots.set(el, root)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
