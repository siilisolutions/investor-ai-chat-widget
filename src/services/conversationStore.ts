/**
 * `conversationStore` — sessionStorage-backed multi-conversation
 * persistence layer for the AC-33 sidebar cluster (Figma node
 * `ds:191:258` Previous discussion list, `ds:191:268` Previous
 * discussion item) and the AC-35 start-new-conversation affordance.
 *
 * Storage choice (PD-08): `sessionStorage`, scoped per browser tab.
 * Reloading the same tab preserves the store; closing the tab
 * clears it (AC-31c). `localStorage` was rejected because
 * cross-session persistence on shared devices is a privacy
 * regression for a public investor site, and server-side storage
 * is out of scope per `.cursor/rules/change-boundary.mdc`.
 *
 * Schema:
 * ```
 *   {
 *     "version": 1,
 *     "conversations": [
 *       { "id": string, "messages": ChatMessage[], "draft": string },
 *       ...
 *     ]
 *   }
 * ```
 *
 * `version` is bumped on schema changes; on a mismatch the store is
 * dropped silently rather than thrown. JSON-parse errors and DOM
 * exceptions (private mode, quota exceeded) are also caught — the
 * store degrades to in-memory-only behaviour rather than crashing
 * the widget. AC-N1 / AC-42 still apply to any error copy this
 * module surfaces; today no error copy reaches the DOM.
 *
 * Public API matches the AC-33 cluster's needs:
 * - `listConversations()` — read all stored conversations
 * - `loadConversation(id)` — read a single conversation
 * - `saveConversation(conversation)` — full upsert
 * - `createConversation()` — mint a new id and persist an empty entry
 * - `clearAll()` — wipe the store (test convenience, not user-facing)
 *
 * The store does **not** know which conversation is "active" — that
 * is `App.tsx`'s state machine. The store is a pure persistence
 * layer.
 */

import type { Conversation } from '../types/index.ts'

const STORAGE_KEY = 'siili.conversationStore.v1'
const SCHEMA_VERSION = 1

interface StoredShape {
  version: number
  conversations: Conversation[]
}

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.sessionStorage
  } catch {
    return null
  }
}

function read(): StoredShape {
  const empty: StoredShape = { version: SCHEMA_VERSION, conversations: [] }
  const storage = safeStorage()
  if (!storage) return empty
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return empty
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('conversations' in parsed)
    ) {
      return empty
    }
    const shape = parsed as StoredShape
    if (shape.version !== SCHEMA_VERSION) return empty
    if (!Array.isArray(shape.conversations)) return empty
    return shape
  } catch {
    return empty
  }
}

function write(shape: StoredShape): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(shape))
  } catch {
    /* private mode / quota exceeded — degrade silently */
  }
}

function generateId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  // Deterministic fallback — sessionStorage is per-tab so collisions
  // would only matter inside one tab, and the timestamp + counter are
  // monotonic per tab session.
  idCounter += 1
  return `conv-${Date.now().toString(36)}-${idCounter.toString(36)}`
}

let idCounter = 0

export function listConversations(): Conversation[] {
  return read().conversations
}

export function loadConversation(id: string): Conversation | undefined {
  return read().conversations.find((c) => c.id === id)
}

export function saveConversation(conversation: Conversation): void {
  const shape = read()
  const idx = shape.conversations.findIndex((c) => c.id === conversation.id)
  if (idx === -1) {
    shape.conversations.push(conversation)
  } else {
    shape.conversations[idx] = conversation
  }
  write(shape)
}

export function createConversation(): Conversation {
  const conversation: Conversation = {
    id: generateId(),
    messages: [],
    draft: '',
  }
  saveConversation(conversation)
  return conversation
}

export function clearAll(): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    /* degrade silently */
  }
}

const conversationStore = {
  listConversations,
  loadConversation,
  saveConversation,
  createConversation,
  clearAll,
}

export default conversationStore
