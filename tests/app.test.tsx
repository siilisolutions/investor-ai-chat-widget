/**
 * Tests for `App` and the `buildHistory` helper. Covers:
 *
 *   AC-29 — follow-ups append without mutating prior Q+A pairs.
 *   AC-30 — input and send button are disabled while a request is in flight.
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
    // hydrates with both rows in the sidebar after expanding.
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

    // We never want the service to fire during AC-33b activations, but
    // a single send is required to flip from compact to expanded mode
    // (App starts compact regardless of seeded history). The mock
    // resolves with a fixed reply so we can detect the transition.
    const service = makeService(async () => ({
      id: 'kickoff',
      question: 'q',
      answer: 'kickoff-answer',
      loading: false,
    }))
    render(<App chatService={service} />)

    const initialTextarea = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(initialTextarea, { target: { value: 'kickoff' } })
    fireEvent.keyDown(initialTextarea, { key: 'Enter' })
    await screen.findByText('kickoff-answer')

    // Now in expanded mode with the sidebar showing both rows. The
    // active conversation is conv-A (first stored).
    const textareaA = (await screen.findByLabelText(
      'Siili investor chatbot message',
    )) as HTMLTextAreaElement
    await waitFor(() => expect(textareaA).toBeEnabled())

    // Type a draft into conv-A.
    fireEvent.input(textareaA, { target: { value: 'half-typed for A' } })

    const callsAfterKickoff = (service.sendMessage as ReturnType<typeof vi.fn>).mock
      .calls.length

    // Switch to conv-B by clicking its sidebar row. conv-B's seeded
    // draft is empty, so the textarea should clear.
    fireEvent.click(screen.getByRole('button', { name: 'Question B?' }))
    await waitFor(() => {
      const ta = screen.getByLabelText(
        'Siili investor chatbot message',
      ) as HTMLTextAreaElement
      expect(ta.value).toBe('')
    })

    // Type a draft for conv-B.
    const textareaB = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(textareaB, { target: { value: 'half-typed for B' } })

    // Switch back to conv-A — its draft is restored verbatim.
    fireEvent.click(screen.getByRole('button', { name: 'Question A?' }))
    await waitFor(() => {
      const ta = screen.getByLabelText(
        'Siili investor chatbot message',
      ) as HTMLTextAreaElement
      expect(ta.value).toBe('half-typed for A')
    })

    // Switch to conv-B again — its draft survived the switch.
    fireEvent.click(screen.getByRole('button', { name: 'Question B?' }))
    await waitFor(() => {
      const ta = screen.getByLabelText(
        'Siili investor chatbot message',
      ) as HTMLTextAreaElement
      expect(ta.value).toBe('half-typed for B')
    })

    // No additional service calls fired during the activation cycle.
    expect(
      (service.sendMessage as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(callsAfterKickoff)
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
