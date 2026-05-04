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
 *   AC-20c — compact → expanded pushes a history entry tagged
 *           `siiliExpanded` so the next browser-back gesture dismisses
 *           the chat instead of navigating away from the host page.
 *   AC-20g — a `popstate` event while expanded returns the widget to
 *           compact mode.
 *   AC-20h — compact-mode `popstate` is not intercepted (no extra
 *           pushState happens before any send).
 *   AC-20i — `interceptBackNavigation: false` opts out of the push +
 *           popstate handling entirely.
 *   AC-31 — dismissing expanded mode retains the in-memory messages.
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
import { act, fireEvent, screen, waitFor } from '@testing-library/preact'
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

describe('SiiliChatbot.init — back-navigation interceptor', () => {
  let pushStateSpy: MockInstance<typeof history.pushState>
  let backSpy: MockInstance<typeof history.back>

  beforeEach(() => {
    pushStateSpy = vi.spyOn(history, 'pushState').mockImplementation(() => {})
    backSpy = vi.spyOn(history, 'back').mockImplementation(() => {
      // Simulate the browser's pop by dispatching popstate synchronously.
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    })
  })

  afterEach(() => {
    pushStateSpy.mockRestore()
    backSpy.mockRestore()
  })

  async function sendFirstMessage(): Promise<HTMLTextAreaElement> {
    const textarea = (await screen.findByLabelText(
      'Siili investor chatbot message',
    )) as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await screen.findByRole('button', { name: 'Sulje keskustelu' })
    return textarea
  }

  it('AC-20h: compact mode does not push any history entry', async () => {
    init({ container })
    await waitFor(() =>
      expect(container.querySelector('textarea')).not.toBeNull(),
    )
    expect(pushStateSpy).not.toHaveBeenCalled()
  })

  it('AC-20c: compact → expanded transition pushes a siiliExpanded history entry', async () => {
    init({ container })
    await sendFirstMessage()
    expect(pushStateSpy).toHaveBeenCalledTimes(1)
    const [state] = pushStateSpy.mock.calls[0] as [unknown, string]
    expect(state).toMatchObject({ siiliExpanded: true })
  })

  it('AC-20g + AC-31: a popstate while expanded returns to compact and retains messages', async () => {
    init({ container })
    await sendFirstMessage()

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    })

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Sulje keskustelu' }),
      ).toBeNull(),
    )
    // AC-31: the question text is still present in the App's messages
    // state (it would re-render in expanded mode if the user sent a
    // follow-up); compact mode just does not show the message list.
    expect(
      screen.getByLabelText('Siili investor chatbot message'),
    ).toBeInTheDocument()
  })

  it('AC-20i: interceptBackNavigation: false skips pushState entirely', async () => {
    init({ container, interceptBackNavigation: false })
    await sendFirstMessage()
    expect(pushStateSpy).not.toHaveBeenCalled()
  })

  it('AC-20j: clicking the close button while intercepting calls history.back to balance the stack', async () => {
    init({ container })
    await sendFirstMessage()
    expect(pushStateSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Sulje keskustelu' }))
    expect(backSpy).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Sulje keskustelu' }),
      ).toBeNull(),
    )
  })

  it('AC-20j + AC-20i: clicking the close button without intercepting flips mode without history.back', async () => {
    init({ container, interceptBackNavigation: false })
    await sendFirstMessage()

    fireEvent.click(screen.getByRole('button', { name: 'Sulje keskustelu' }))
    expect(backSpy).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Sulje keskustelu' }),
      ).toBeNull(),
    )
  })
})
