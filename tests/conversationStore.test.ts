/**
 * Tests for `src/services/conversationStore.ts` — the PD-08
 * localStorage-backed multi-conversation persistence layer that
 * underpins the AC-33 sidebar cluster, the AC-35 start-new-
 * conversation affordance, and the AC-10a / AC-10c continue-pill.
 *
 * PD-08 was amended in 2026-05 to move from `sessionStorage` to
 * `localStorage` so prior conversations survive tab close and
 * browser restart (AC-31e, replacing the tombstoned AC-31c).
 *
 * Per GOV-13 every test name quotes the AC's intent.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAll,
  createConversation,
  listConversations,
  loadConversation,
  saveConversation,
} from '../src/services/conversationStore'

describe('conversationStore — PD-08 storage', () => {
  beforeEach(() => {
    // Setup file already clears localStorage; double-call here so a
    // failing earlier test in the same file can't leak.
    clearAll()
  })

  it('AC-33c: a fresh tab session starts with zero conversations', () => {
    expect(listConversations()).toEqual([])
  })

  it('AC-35: createConversation mints a fresh entry, persists it, and does not mutate prior conversations', () => {
    const first = createConversation()
    expect(first.id).toBeTruthy()
    expect(first.messages).toEqual([])
    expect(first.draft).toBe('')

    const second = createConversation()
    expect(second.id).not.toBe(first.id)

    const all = listConversations()
    expect(all).toHaveLength(2)
    expect(all.map((c) => c.id)).toEqual([first.id, second.id])
    // First conversation's reference is preserved (no mutation).
    expect(all[0].messages).toEqual([])
  })

  it('AC-33b: saveConversation upserts by id and loadConversation returns the latest snapshot', () => {
    const conv = createConversation()
    saveConversation({
      ...conv,
      messages: [
        {
          id: 'msg-1',
          question: 'Mikä on osinkopolitiikka?',
          answer: 'Maksetaan kerran vuodessa.',
        },
      ],
      draft: 'unsent draft text',
    })
    const reloaded = loadConversation(conv.id)
    expect(reloaded?.messages).toHaveLength(1)
    expect(reloaded?.draft).toBe('unsent draft text')

    // listConversations still returns exactly one entry — no
    // duplicate row introduced by the upsert.
    expect(listConversations()).toHaveLength(1)
  })

  it('AC-33b: a draft saved on one conversation round-trips independently per id', () => {
    const a = createConversation()
    const b = createConversation()
    saveConversation({ ...a, draft: 'draft for A' })
    saveConversation({ ...b, draft: 'draft for B' })

    expect(loadConversation(a.id)?.draft).toBe('draft for A')
    expect(loadConversation(b.id)?.draft).toBe('draft for B')

    // Updating one conversation's draft does not bleed into the other.
    saveConversation({ ...a, draft: 'draft for A — edited' })
    expect(loadConversation(a.id)?.draft).toBe('draft for A — edited')
    expect(loadConversation(b.id)?.draft).toBe('draft for B')
  })

  it('AC-31e: history persists across reloads and a simulated tab close (storage key remains parseable)', () => {
    const a = createConversation()
    const b = createConversation()
    expect(listConversations().map((c) => c.id)).toEqual([a.id, b.id])

    // Simulate "page reload" inside the same tab — localStorage
    // persists, so listConversations should return the same ids.
    const afterReload = listConversations()
    expect(afterReload.map((c) => c.id)).toEqual([a.id, b.id])

    // Simulate "close tab + reopen URL in the same browser profile"
    // — under PD-08's localStorage contract this is NOT a reset
    // signal. The storage key stays present and parseable, so a
    // fresh `read()` (modelled here by a fresh listConversations
    // call after consulting the underlying storage) returns the
    // same conversations.
    const raw = window.localStorage.getItem('siili.conversationStore.v1')
    expect(raw).not.toBeNull()
    expect(() => JSON.parse(raw as string)).not.toThrow()
    expect(listConversations().map((c) => c.id)).toEqual([a.id, b.id])
  })
})
