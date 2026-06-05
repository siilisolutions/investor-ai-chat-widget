/**
 * Node 22+ exposes an experimental `globalThis.localStorage` when
 * `--localstorage-file` is present. On profiles where that flag is
 * set without a valid path (common on fresh machines), the stub has
 * no `setItem` / `getItem` methods and breaks every store test plus
 * the AC-66 terms pre-seed in `setup.ts`.
 *
 * happy-dom's own `Window` ships a full Storage implementation, but
 * Vitest's happy-dom environment can inherit Node's broken global
 * instead. Replace it once at setup time when the API is incomplete.
 */
import Storage from 'happy-dom/lib/storage/Storage.js'

function localStorageIsBroken(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage !== undefined &&
      window.localStorage !== null &&
      typeof window.localStorage.setItem !== 'function'
    )
  } catch {
    return true
  }
}

export function ensureWorkingLocalStorage(): void {
  if (typeof window === 'undefined') return
  if (!localStorageIsBroken()) return

  Object.defineProperty(window, 'localStorage', {
    value: new Storage(),
    configurable: true,
    writable: true,
  })
}
