/**
 * Tests for `App` and the `buildHistory` helper. Covers:
 *
 *   AC-10c — clicking the continue-pill flips to expanded with the
 *           most-recent conversation as active and fires no network call.
 *   AC-29 — follow-ups append without mutating prior Q+A pairs.
 *   AC-30 — input and send button are disabled while a request is in flight.
 *   AC-31f — compact-mode send with prior messages mints a fresh conversation;
 *           compact-mode send into an empty active conversation appends.
 *   AC-33b — switching between conversations restores each one's draft
 *           and does not fire a service call.
 *   AC-42 — raw `err.message` from a ChatService throw is never forwarded
 *           to the DOM; the rendered error row shows the fixed SAFE_ERROR
 *           copy instead.
 *   AC-52 — `buildHistory` filters out loading / errored / empty-answer
 *           turns and always ends with the new user message.
 *
 * Per GOV-13 every test name quotes the AC intent.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { App } from '../src/App'
import { buildHistory } from '../src/chatHistory'
import { SAFE_ERROR } from '../src/errorCopy'
import { saveConversation } from '../src/services/conversationStore'
import type {
  ChatMessage,
  ChatService,
  ChatTurn,
} from '../src/types/index'

function makeService(
  impl: (history: ChatTurn[]) => Promise<ChatMessage>,
): ChatService {
  return { sendMessage: vi.fn(impl) }
}

describe('buildHistory (AC-52)', () => {
  it('AC-52: drops loading turns, errored turns, and empty-answer turns', () => {
    const messages: ChatMessage[] = [
      { id: '1', question: 'q1', answer: 'a1' },
      { id: '2', question: 'q2', answer: '', loading: true },
      { id: '3', question: 'q3', answer: '', error: 'boom' },
      { id: '4', question: 'q4', answer: 'a4' },
      { id: '5', question: 'q5', answer: '' },
    ]
    expect(buildHistory(messages, 'new')).toEqual([
      { role: 'user', content: 'q1' },
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'q4' },
      { role: 'assistant', content: 'a4' },
      { role: 'user', content: 'new' },
    ])
  })

  it('AC-52: new user message is always the last entry in chronological order', () => {
    const messages: ChatMessage[] = [
      { id: '1', question: 'q1', answer: 'a1' },
      { id: '2', question: 'q2', answer: 'a2' },
    ]
    const history = buildHistory(messages, 'latest')
    expect(history[history.length - 1]).toEqual({
      role: 'user',
      content: 'latest',
    })
    expect(history).toHaveLength(5)
  })

  it('AC-52: with no prior messages, history contains only the new user turn', () => {
    expect(buildHistory([], 'first')).toEqual([{ role: 'user', content: 'first' }])
  })
})

describe('App', () => {
  it('AC-30: textarea and send button are disabled while a request is in flight', async () => {
    let resolve!: (message: ChatMessage) => void
    const service = makeService(
      () => new Promise<ChatMessage>((r) => (resolve = r)),
    )
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mikä on yhtiön nykyinen osinkopolitiikka?',
      }),
    )

    const textarea = await screen.findByLabelText('Siili investor chatbot message')
    expect(textarea).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()

    resolve({ id: 'ack', question: 'q', answer: 'a', loading: false })
    await waitFor(() => expect(textarea).toBeEnabled())
  })

  it('AC-29: a second send appends a new Q+A pair without mutating the previous one', async () => {
    const answers = ['first answer', 'second answer']
    let call = 0
    const service = makeService(async (history) => {
      const question = history[history.length - 1].content
      return {
        id: `msg-${++call}`,
        question,
        answer: answers[call - 1],
        loading: false,
      }
    })

    render(<App chatService={service} />)

    const textarea = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: 'Q1' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await screen.findByText('first answer')
    expect(screen.getByText('Q1')).toBeInTheDocument()

    const expandedTextarea = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    await waitFor(() => expect(expandedTextarea).toBeEnabled())

    fireEvent.input(expandedTextarea, { target: { value: 'Q2' } })
    fireEvent.keyDown(expandedTextarea, { key: 'Enter' })
    await screen.findByText('second answer')

    // Prior pair still rendered, unchanged
    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('first answer')).toBeInTheDocument()
    expect(screen.getByText('Q2')).toBeInTheDocument()
  })

  it('AC-33b: switching between conversations restores each one\u2019s draft and does not call the service', async () => {
    // Seed two conversations directly into PD-08 storage so the App
    // hydrates with both rows in the sidebar after entering expanded.
    saveConversation({
      id: 'conv-A',
      messages: [{ id: 'mA', question: 'Question A?', answer: 'answer A' }],
      draft: '',
    })
    saveConversation({
      id: 'conv-B',
      messages: [{ id: 'mB', question: 'Question B?', answer: 'answer B' }],
      draft: '',
    })

    // The continue-pill (AC-10c) flips to expanded without a service
    // call and lands on the most-recent stored conversation
    // (conv-B). Using it instead of a kickoff-send avoids triggering
    // AC-31f's auto-mint, so the sidebar shows exactly the two
    // seeded rows.
    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )

    // Active conversation is conv-B (most recent). Type a draft.
    const textareaB = (await screen.findByLabelText(
      'Siili investor chatbot message',
    )) as HTMLTextAreaElement
    fireEvent.input(textareaB, { target: { value: 'half-typed for B' } })

    // Switch to conv-A by clicking its sidebar row. conv-A's seeded
    // draft is empty, so the textarea should clear.
    fireEvent.click(screen.getByRole('button', { name: 'Question A?' }))
    await waitFor(() => {
      const ta = screen.getByLabelText(
        'Siili investor chatbot message',
      ) as HTMLTextAreaElement
      expect(ta.value).toBe('')
    })

    // Type a draft for conv-A.
    const textareaA = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(textareaA, { target: { value: 'half-typed for A' } })

    // Switch back to conv-B — its draft is restored verbatim.
    fireEvent.click(screen.getByRole('button', { name: 'Question B?' }))
    await waitFor(() => {
      const ta = screen.getByLabelText(
        'Siili investor chatbot message',
      ) as HTMLTextAreaElement
      expect(ta.value).toBe('half-typed for B')
    })

    // Switch to conv-A again — its draft survived the switch.
    fireEvent.click(screen.getByRole('button', { name: 'Question A?' }))
    await waitFor(() => {
      const ta = screen.getByLabelText(
        'Siili investor chatbot message',
      ) as HTMLTextAreaElement
      expect(ta.value).toBe('half-typed for A')
    })

    // No service calls fired across the entire pill-activation +
    // sidebar-switching cycle.
    expect(
      (service.sendMessage as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(0)
  })

  it('AC-10c: clicking the continue-pill enters expanded with the most-recent conversation and fires no network call', async () => {
    saveConversation({
      id: 'older',
      messages: [{ id: 'm-old', question: 'older question?', answer: 'older' }],
      draft: '',
    })
    saveConversation({
      id: 'newer',
      messages: [{ id: 'm-new', question: 'newer question?', answer: 'newer' }],
      draft: '',
    })

    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )

    // Expanded view renders the newer conversation's answer (the
    // question text shows up twice — once in the Q+A bubble and
    // once as the sidebar row label — so the answer is the cleaner
    // signal that the right conversation is active).
    expect(await screen.findByText('newer')).toBeInTheDocument()
    // The older conversation's answer is NOT in the active stream.
    expect(screen.queryByText('older')).not.toBeInTheDocument()
    // Both conversations surface in the sidebar (≥ 2 conversations
    // → AC-33 visibility threshold met).
    expect(
      screen.getByRole('button', { name: 'older question?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'newer question?' }),
    ).toBeInTheDocument()

    // No service call was triggered by the pill activation itself.
    expect(
      (service.sendMessage as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(0)
  })

  it('AC-31f: compact-mode send with prior messages mints a fresh conversation rather than appending', async () => {
    saveConversation({
      id: 'prior',
      messages: [
        {
          id: 'm-prior',
          question: 'prior question?',
          answer: 'prior answer',
        },
      ],
      draft: '',
    })

    const service = makeService(async (history) => ({
      id: 'fresh',
      question: history[history.length - 1].content,
      answer: 'fresh answer',
      loading: false,
    }))
    render(<App chatService={service} />)

    const textarea = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: 'a brand-new question' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    await screen.findByText('fresh answer')

    // The fresh conversation contains only the new Q+A — the prior
    // conversation's answer is NOT in the active stream (we use the
    // answer text as the disambiguator because the question text
    // shows up twice — once in the Q+A bubble and once as the
    // sidebar row label).
    expect(screen.queryByText('prior answer')).not.toBeInTheDocument()

    // The prior conversation surfaces in the sidebar (sidebar appears
    // as soon as a second conversation exists).
    expect(
      screen.getByRole('button', { name: 'prior question?' }),
    ).toBeInTheDocument()

    // The history posted to the service contains only the new turn —
    // the prior conversation's history is not replayed (each
    // conversation is its own thread per AC-52).
    const sendCalls = (
      service.sendMessage as ReturnType<typeof vi.fn>
    ).mock.calls
    expect(sendCalls).toHaveLength(1)
    expect(sendCalls[0][0]).toEqual([
      { role: 'user', content: 'a brand-new question' },
    ])
  })

  it('AC-31f: compact-mode send into an empty active conversation appends instead of minting a duplicate', async () => {
    // No seeded conversations — App.initializeStore creates one
    // empty fresh conversation on mount. The first send should
    // append into it, not mint a second one.
    const service = makeService(async (history) => ({
      id: 'first',
      question: history[history.length - 1].content,
      answer: 'first answer',
      loading: false,
    }))
    render(<App chatService={service} />)

    const textarea = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: 'first question' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    await screen.findByText('first answer')

    // Sidebar's visibility threshold is conversations.length > 1.
    // If the send had spuriously minted a second conversation, the
    // sidebar would render and the new conversation's empty label
    // would surface. Confirm it does not.
    expect(
      screen.queryByRole('complementary', { name: 'Aiemmat keskustelut' }),
    ).not.toBeInTheDocument()
  })

  it('AC-33e: × on a row opens the confirmation dialog showing the row\u2019s label and a cancel does nothing', async () => {
    saveConversation({
      id: 'conv-A',
      messages: [{ id: 'mA', question: 'Question A?', answer: 'answer A' }],
      draft: '',
    })
    saveConversation({
      id: 'conv-B',
      messages: [{ id: 'mB', question: 'Question B?', answer: 'answer B' }],
      draft: '',
    })

    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )

    // Sidebar visible (>1 conversation). Click × on the inactive
    // row — conv-A.
    fireEvent.click(
      screen.getByRole('button', { name: 'Poista keskustelu — Question A?' }),
    )

    // Dialog renders with the AC-33e copy and the bolded row label.
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Poista keskustelu')
    expect(dialog).toHaveTextContent('Haluatko varmasti poistaa keskustelun')
    expect(dialog).toHaveTextContent('Question A?')

    // Cancel — dialog closes, both rows still in the sidebar.
    fireEvent.click(screen.getByRole('button', { name: 'Peruuta' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      screen.getByRole('button', { name: 'Question A?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Question B?' }),
    ).toBeInTheDocument()
    // No service call fired — cancel is state-only.
    expect(
      (service.sendMessage as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(0)
  })

  it('AC-33e: confirming the dialog removes the row from the sidebar and the PD-08 store', async () => {
    saveConversation({
      id: 'conv-A',
      messages: [{ id: 'mA', question: 'Question A?', answer: 'answer A' }],
      draft: '',
    })
    saveConversation({
      id: 'conv-B',
      messages: [{ id: 'mB', question: 'Question B?', answer: 'answer B' }],
      draft: '',
    })

    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Poista keskustelu — Question A?' }),
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Poista' }))

    // Dialog closes, the row is gone from the in-memory tree.
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', { name: 'Question A?' }),
    ).not.toBeInTheDocument()

    // The PD-08 store reflects the removal too — only conv-B left
    // under the canonical storage key.
    const raw = window.localStorage.getItem('siili.conversationStore.v1')
    const parsed = JSON.parse(raw as string) as {
      conversations: { id: string }[]
    }
    expect(parsed.conversations.map((c) => c.id)).toEqual(['conv-B'])

    // With only one conversation left the sidebar disappears
    // (AC-33c invariant survives the removal).
    expect(
      screen.queryByRole('complementary', { name: 'Aiemmat keskustelut' }),
    ).not.toBeInTheDocument()
  })

  it('AC-33e: removing the active conversation switches the active stream to the next-most-recent remaining row', async () => {
    saveConversation({
      id: 'conv-older',
      messages: [
        { id: 'mO', question: 'older question?', answer: 'older answer' },
      ],
      draft: '',
    })
    saveConversation({
      id: 'conv-active',
      messages: [
        {
          id: 'mA',
          question: 'active question?',
          answer: 'active answer',
        },
      ],
      draft: '',
    })
    saveConversation({
      id: 'conv-newer',
      messages: [
        { id: 'mN', question: 'newer question?', answer: 'newer answer' },
      ],
      draft: '',
    })

    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )
    // Most-recent stored conversation becomes active. Switch to
    // conv-active so we can prove the active-removed switch lands
    // on the next-most-recent remaining row (conv-older after we
    // delete conv-active — conv-newer was created after but the
    // append-order rule picks the highest-index remaining row).
    fireEvent.click(
      screen.getByRole('button', { name: 'active question?' }),
    )
    await screen.findByText('active answer')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Poista keskustelu — active question?',
      }),
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Poista' }))

    // After the active row is removed, the most-recent remaining
    // row (conv-newer — last in append order) becomes active and
    // its answer renders in the stream.
    await waitFor(() =>
      expect(screen.getByText('newer answer')).toBeInTheDocument(),
    )
    expect(screen.queryByText('active answer')).not.toBeInTheDocument()
    // older still present in the sidebar
    expect(
      screen.getByRole('button', { name: 'older question?' }),
    ).toBeInTheDocument()
    // No service call across the entire delete + active-switch path
    expect(
      (service.sendMessage as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(0)
  })

  it('AC-33e: Escape inside the dialog cancels without removing the row', async () => {
    saveConversation({
      id: 'conv-A',
      messages: [{ id: 'mA', question: 'Question A?', answer: 'answer A' }],
      draft: '',
    })
    saveConversation({
      id: 'conv-B',
      messages: [{ id: 'mB', question: 'Question B?', answer: 'answer B' }],
      draft: '',
    })

    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Poista keskustelu — Question A?' }),
    )

    const dialog = await screen.findByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      screen.getByRole('button', { name: 'Question A?' }),
    ).toBeInTheDocument()
  })

  it('AC-33e: clicking the blurred backdrop outside the modal card cancels without removing the row', async () => {
    saveConversation({
      id: 'conv-A',
      messages: [{ id: 'mA', question: 'Question A?', answer: 'answer A' }],
      draft: '',
    })
    saveConversation({
      id: 'conv-B',
      messages: [{ id: 'mB', question: 'Question B?', answer: 'answer B' }],
      draft: '',
    })

    const service = makeService(async () => ({
      id: 'never',
      question: 'q',
      answer: 'never',
      loading: false,
    }))
    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Poista keskustelu — Question A?' }),
    )

    const dialog = await screen.findByRole('dialog')
    // The backdrop is the dialog's parent (`role="presentation"`,
    // not in the a11y tree). Synthesize the click with the
    // backdrop as both target and currentTarget — that's the
    // discriminator the component uses to distinguish "click on
    // the backdrop itself" from "click bubbled from the card".
    const backdrop = dialog.parentElement as HTMLElement
    fireEvent.click(backdrop)

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      screen.getByRole('button', { name: 'Question A?' }),
    ).toBeInTheDocument()
  })

  it('AC-42: raw service errors never reach the rendered error row', async () => {
    const leakyMessage = 'boom from /internal/v1/whoami 500'
    const service = makeService(() => Promise.reject(new Error(leakyMessage)))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<App chatService={service} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mikä on yhtiön nykyinen osinkopolitiikka?',
      }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(SAFE_ERROR)
    expect(alert.textContent ?? '').not.toContain('boom')
    expect(alert.textContent ?? '').not.toContain('whoami')
    expect(document.body.textContent ?? '').not.toContain(leakyMessage)

    errorSpy.mockRestore()
  })
})
