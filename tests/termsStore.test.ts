/**
 * Tests for `src/services/termsStore.ts` — the AC-66c persistence
 * layer for the Käyttöehdot terms-of-use gate.
 *
 * AC-66c is `@evolving`. The persistence shape is intentionally
 * minimal (a single boolean keyed on the schema version) so the
 * automated guard reduces to: round-trip works, version mismatch
 * resets, malformed JSON resets, and storage failures degrade
 * fail-closed.
 *
 * Per GOV-13 every test name quotes the AC's intent.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAcceptance,
  getAcceptance,
  setAcceptance,
} from '../src/services/termsStore'

const STORAGE_KEY = 'siili.termsAccepted.v1'

describe('termsStore — AC-66c persistence', () => {
  beforeEach(() => {
    // Setup file already pre-seeds acceptance for the rest of the
    // suite; these tests are the exception that explicitly clear
    // the flag so they can verify the unaccepted state.
    clearAcceptance()
  })

  it('AC-66c: a fresh browser profile (cleared site storage) starts unaccepted', () => {
    expect(getAcceptance()).toBe(false)
  })

  it('AC-66c: setAcceptance(true) persists across reads (simulates reload, tab close, browser restart)', () => {
    setAcceptance(true)
    expect(getAcceptance()).toBe(true)
    // A second `getAcceptance` reads the same persisted value — a
    // reload would replay this same path on App mount.
    expect(getAcceptance()).toBe(true)
  })

  it('AC-66c: setAcceptance(false) revokes acceptance and reprompts on next read', () => {
    setAcceptance(true)
    setAcceptance(false)
    expect(getAcceptance()).toBe(false)
  })

  it('AC-66c: bumping the schema version reprompts (older keys are ignored)', () => {
    // Simulate a stored entry from a future schema version. The
    // reader must reject it and the gate must show again.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 999, accepted: true }),
    )
    expect(getAcceptance()).toBe(false)
  })

  it('AC-66c: malformed JSON in the storage slot resets to unaccepted', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(getAcceptance()).toBe(false)
  })

  it('AC-66c: a persisted shape missing `accepted` resets to unaccepted', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }))
    expect(getAcceptance()).toBe(false)
  })

  it('AC-66c: setAcceptance returns true on successful write and false when storage fails (fail-closed)', () => {
    expect(setAcceptance(true)).toBe(true)

    // Force `setItem` to throw (simulates Safari private mode / quota
    // exceeded). The fail-closed contract is that the call returns
    // `false` so the caller can keep the gate up rather than
    // silently slipping past acceptance.
    const originalSetItem = window.localStorage.setItem.bind(
      window.localStorage,
    )
    const setItemSpy = vi
      .spyOn(window.localStorage, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota exceeded')
      })

    expect(setAcceptance(true)).toBe(false)

    setItemSpy.mockRestore()
    // Restore reference so subsequent tests aren't holding a stale
    // bound function on a defunct spy.
    void originalSetItem
  })

  it('AC-66c: clearAcceptance wipes the flag (test convenience, no user-facing affordance)', () => {
    setAcceptance(true)
    clearAcceptance()
    expect(getAcceptance()).toBe(false)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
