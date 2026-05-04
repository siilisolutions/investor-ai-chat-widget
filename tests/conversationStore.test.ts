/**
 * Tests for `src/services/conversationStore.ts` — the PD-08
 * sessionStorage-backed multi-conversation persistence layer that
 * underpins the AC-33 sidebar cluster and AC-35 start-new-
 * conversation affordance.
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
    // Setup file already clears sessionStorage; double-call here so a
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

  it('AC-31c: state survives across listConversations calls within a tab session', () => {
    const a = createConversation()
    const b = createConversation()
    expect(listConversations().map((c) => c.id)).toEqual([a.id, b.id])

    // Simulate "page reload" inside the same tab — sessionStorage
    // persists, so listConversations should return the same ids.
    const afterReload = listConversations()
    expect(afterReload.map((c) => c.id)).toEqual([a.id, b.id])
  })
})
