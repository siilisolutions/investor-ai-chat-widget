import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/preact'
import { setAcceptance as setTermsAcceptance } from '../src/services/termsStore'

// Clear localStorage between tests so the conversationStore starts
// from an empty state every time. Without this, conversations created
// by one test would bleed into the next via PD-08 hydration in
// `App.tsx`'s state initializer. PD-08 was amended in 2026-05 to
// move from sessionStorage to localStorage so investor sessions
// survive tab close (AC-31e).
//
// After the wipe, pre-seed the AC-66 / AC-66c terms-of-use
// acceptance flag so existing flow tests see the steady-state
// "returning, already-accepted" profile. The first-send gate has
// its own dedicated tests that clear acceptance explicitly via
// `clearAcceptance()` before rendering — without this default,
// every send-initiated test in the suite would have to opt in
// individually.
beforeEach(() => {
  try {
    window.localStorage.clear()
  } catch {
    /* happy-dom always exposes localStorage; the try/catch matches
       the conversationStore's defensive posture. */
  }
  setTermsAcceptance(true)
})

afterEach(() => {
  cleanup()
})
