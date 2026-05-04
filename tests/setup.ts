import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/preact'

// Clear sessionStorage between tests so the conversationStore starts
// from an empty state every time. Without this, conversations created
// by one test would bleed into the next via PD-08 hydration in
// `App.tsx`'s state initializer.
beforeEach(() => {
  try {
    window.sessionStorage.clear()
  } catch {
    /* happy-dom always exposes sessionStorage; the try/catch matches
       the conversationStore's defensive posture. */
  }
})

afterEach(() => {
  cleanup()
})
