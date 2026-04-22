/**
 * Tests for the library entry point `init()` in `src/widget.tsx`. Covers:
 *
 *   AC-03 — calling `SiiliChatbot.init()` twice on the same container
 *           yields a single clean mount: no duplicate UI, no orphaned
 *           listeners, no console errors.
 *   AC-03 + AC-04 — re-init with a different `apiUrl` rewires the
 *           ChatService so the next send hits the new URL (proves the
 *           previous root was actually unmounted and replaced, not
 *           layered on top).
 *
 * Per GOV-13 every test name quotes the AC intent.
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/preact'
import { init } from '../src/widget'

let container: HTMLDivElement
let errorSpy: MockInstance<typeof console.error>
let warnSpy: MockInstance<typeof console.warn>

beforeEach(() => {
  container = document.createElement('div')
  container.id = 'siili-chatbot-test'
  document.body.appendChild(container)
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  container.remove()
  vi.restoreAllMocks()
})

describe('SiiliChatbot.init', () => {
  it('AC-03: calling init twice on the same container yields a single clean mount', async () => {
    init({ container })
    await waitFor(() =>
      expect(container.querySelectorAll('.siiliChatbot')).toHaveLength(1),
    )

    init({ container })
    await waitFor(() =>
      expect(container.querySelectorAll('.siiliChatbot')).toHaveLength(1),
    )

    const textareas = container.querySelectorAll('textarea')
    expect(textareas).toHaveLength(1)
    const textarea = textareas[0] as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: 'hello' } })
    expect(textarea.value).toBe('hello')

    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('AC-03 + AC-04: re-init with a different apiUrl rewires the ChatService', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ response: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    init({ container })
    await waitFor(() =>
      expect(container.querySelector('textarea')).not.toBeNull(),
    )

    init({ container, apiUrl: 'https://example.test/api/chat' })
    await waitFor(() =>
      expect(container.querySelectorAll('.siiliChatbot')).toHaveLength(1),
    )

    const textarea = (await screen.findByLabelText(
      'Siili investor chatbot message',
    )) as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: 'Q1' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://example.test/api/chat')

    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
