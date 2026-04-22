/**
 * Tests for `App` and the `buildHistory` helper. Covers:
 *
 *   AC-29 — follow-ups append without mutating prior Q+A pairs.
 *   AC-30 — input and send button are disabled while a request is in flight.
 *   AC-52 — `buildHistory` filters out loading / errored / empty-answer
 *           turns and always ends with the new user message.
 *
 * Per GOV-13 every test name quotes the AC intent.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { App } from '../src/App'
import { buildHistory } from '../src/chatHistory'
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
})
