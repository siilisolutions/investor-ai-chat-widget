/**
 * `termsStore` — localStorage-backed boolean acceptance flag for the
 * AC-66 / AC-66c Käyttöehdot terms-of-use gate (Figma `ds:257:1096`
 * short / `ds:242:551` long, in screen context `site:555:2186`).
 *
 * Storage choice mirrors PD-08's `localStorage`-per-browser-profile
 * keying convention so accepting once survives reloads, tab close,
 * and browser restart — the user only sees the gate again if they
 * clear site storage or move to a different browser profile, which
 * is the same posture the conversation store takes for AC-31e. The
 * key is schema-versioned (`siili.termsAccepted.v1`) so a future
 * material change in legal copy can reprompt the user by bumping
 * the version constant — older keys are left dormant rather than
 * migrated, since the only stored fact is "accepted at this
 * version" and there is nothing to migrate.
 *
 * Schema:
 * ```
 *   { "version": 1, "accepted": true }
 * ```
 *
 * `version` mismatches and JSON-parse errors both reset the read to
 * "not accepted" so the gate shows. DOM exceptions (private mode,
 * quota exceeded, missing `Storage` API) on read or write also
 * resolve to "not accepted" — the gate is **fail-closed** per AC-66c
 * so a profile that cannot persist acceptance keeps seeing the
 * dialog rather than silently slipping past it.
 *
 * Public API matches the AC-66 cluster's needs:
 * - `getAcceptance()` — read the current flag (`true` only when an
 *   acceptance at the current schema version is on disk).
 * - `setAcceptance(accepted)` — persist (or revoke). Returns `true`
 *   if the write made it to disk, `false` on storage error so the
 *   caller can keep the gate up.
 * - `clearAcceptance()` — wipe the key (test convenience; no
 *   user-facing affordance in v1 — the user clears via browser
 *   tooling, same posture as PD-08).
 *
 * The store is intentionally PII-free (per AC-N1's spirit and the
 * AC-120b non-PII posture): a single boolean keyed on the schema
 * version, no timestamps, no user identifiers.
 */

const STORAGE_KEY = 'siili.termsAccepted.v1'
const SCHEMA_VERSION = 1

interface StoredShape {
  version: number
  accepted: boolean
}

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

function read(): StoredShape | null {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('accepted' in parsed)
    ) {
      return null
    }
    const shape = parsed as StoredShape
    if (shape.version !== SCHEMA_VERSION) return null
    if (typeof shape.accepted !== 'boolean') return null
    return shape
  } catch {
    return null
  }
}

export function getAcceptance(): boolean {
  return read()?.accepted === true
}

export function setAcceptance(accepted: boolean): boolean {
  const storage = safeStorage()
  if (!storage) return false
  try {
    const shape: StoredShape = { version: SCHEMA_VERSION, accepted }
    storage.setItem(STORAGE_KEY, JSON.stringify(shape))
    return true
  } catch {
    return false
  }
}

export function clearAcceptance(): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    /* degrade silently */
  }
}

const termsStore = {
  getAcceptance,
  setAcceptance,
  clearAcceptance,
}

export default termsStore
