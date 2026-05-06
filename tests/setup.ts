import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/preact'

// Clear localStorage between tests so the conversationStore starts
// from an empty state every time. Without this, conversations created
// by one test would bleed into the next via PD-08 hydration in
// `App.tsx`'s state initializer. PD-08 was amended in 2026-05 to
// move from sessionStorage to localStorage so investor sessions
// survive tab close (AC-31e).
beforeEach(() => {
  try {
    window.localStorage.clear()
  } catch {
    /* happy-dom always exposes localStorage; the try/catch matches
       the conversationStore's defensive posture. */
  }
})

afterEach(() => {
  cleanup()
})
