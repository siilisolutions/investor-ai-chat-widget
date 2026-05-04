/**
 * Tests for `ExpandedView`. Per GOV-13 each test name quotes the AC
 * intent. Covered ACs:
 *
 *   AC-83 — reduced-motion auto-scroll behaviour.
 *   AC-20d — close button rendering, hit target, and aria-label.
 *   AC-20j — close button activation + Esc dismiss both call `onClose`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/preact'
import { ExpandedView } from '../src/components/ExpandedView'
import type {
  ChatMessage as ChatMessageData,
  Conversation,
} from '../src/types/index'

const MESSAGE: ChatMessageData = {
  id: 'm1',
  question: 'Mikä on yhtiön osinkopolitiikka?',
  answer: 'Siili maksaa osinkoa kerran vuodessa.',
}

const ACTIVE_ID = 'conv-active'
const SINGLE_CONVERSATIONS: Conversation[] = [
  { id: ACTIVE_ID, messages: [MESSAGE], draft: '' },
]
const NOOP = () => {}

function stubMatchMedia(prefersReduce: boolean) {
  const mql = {
    matches: prefersReduce,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) =>
      query.includes('prefers-reduced-motion') ? mql : { ...mql, matches: false },
    ),
  )
  // happy-dom also exposes matchMedia on window; keep both in sync.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: window.matchMedia ?? (() => mql),
  })
  window.matchMedia = ((query: string) =>
    query.includes('prefers-reduced-motion')
      ? mql
      : { ...mql, matches: false }) as typeof window.matchMedia
}

describe('ExpandedView — AC-83 reduced motion', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    scrollSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  function renderSingle(extras: Partial<{ onClose: () => void }> = {}) {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={extras.onClose ?? NOOP}
        conversations={SINGLE_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
  }

  it('AC-83: auto-scroll uses instant behavior when prefers-reduced-motion is set', () => {
    stubMatchMedia(true)
    renderSingle()
    expect(scrollSpy).toHaveBeenCalled()
    const call = scrollSpy.mock.calls.at(-1)?.[0] as ScrollIntoViewOptions | undefined
    expect(call?.behavior).toBe('auto')
    expect(call?.block).toBe('end')
  })

  it('AC-83: auto-scroll uses smooth behavior when reduced motion is not requested', () => {
    stubMatchMedia(false)
    renderSingle()
    expect(scrollSpy).toHaveBeenCalled()
    const call = scrollSpy.mock.calls.at(-1)?.[0] as ScrollIntoViewOptions | undefined
    expect(call?.behavior).toBe('smooth')
    expect(call?.block).toBe('end')
  })
})

describe('ExpandedView — AC-20d close button', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    scrollSpy.mockRestore()
  })

  it('AC-20d: a close button is rendered with aria-label "Sulje keskustelu"', () => {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={SINGLE_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Sulje keskustelu' }),
    ).toBeInTheDocument()
  })
})

describe('ExpandedView — AC-20j dismissal', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    scrollSpy.mockRestore()
  })

  it('AC-20j: clicking the close button calls onClose', () => {
    const onClose = vi.fn()
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={onClose}
        conversations={SINGLE_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sulje keskustelu' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('AC-20j: pressing Esc inside the expanded surface calls onClose', () => {
    const onClose = vi.fn()
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={onClose}
        conversations={SINGLE_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('ExpandedView — AC-33 sidebar visibility', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    scrollSpy.mockRestore()
  })

  it('AC-33c: with only the active conversation, the sidebar is not rendered', () => {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={SINGLE_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    expect(screen.queryByRole('complementary')).toBeNull()
    // The "Aiemmat keskustelut" heading lives only inside the sidebar,
    // so its absence proves the sidebar was not rendered.
    expect(screen.queryByText('Aiemmat keskustelut')).toBeNull()
  })

  it('AC-33: with two conversations the sidebar renders with both rows and the active row marked aria-current', () => {
    const conversations: Conversation[] = [
      { id: 'conv-1', messages: [MESSAGE], draft: '' },
      {
        id: 'conv-2',
        messages: [
          {
            id: 'm2',
            question: 'Mikä on liikevaihdon kasvu?',
            answer: '12 %',
          },
        ],
        draft: '',
      },
    ]
    render(
      <ExpandedView
        messages={conversations[1].messages}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={conversations}
        activeConversationId="conv-2"
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    const sidebar = screen.getByRole('complementary', {
      name: 'Aiemmat keskustelut',
    })
    expect(sidebar).toBeInTheDocument()
    const activeRow = screen.getByRole('button', {
      name: 'Mikä on liikevaihdon kasvu?',
    })
    expect(activeRow).toHaveAttribute('aria-current', 'true')
    const inactiveRow = screen.getByRole('button', {
      name: 'Mikä on yhtiön osinkopolitiikka?',
    })
    expect(inactiveRow).not.toHaveAttribute('aria-current')
  })

  it('AC-33b: clicking an inactive row calls onActivateConversation with that id', () => {
    const conversations: Conversation[] = [
      { id: 'conv-1', messages: [MESSAGE], draft: '' },
      {
        id: 'conv-2',
        messages: [
          {
            id: 'm2',
            question: 'Mikä on liikevaihdon kasvu?',
            answer: '12 %',
          },
        ],
        draft: '',
      },
    ]
    const onActivate = vi.fn()
    render(
      <ExpandedView
        messages={conversations[1].messages}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={conversations}
        activeConversationId="conv-2"
        onActivateConversation={onActivate}
        onStartNewConversation={NOOP}
      />,
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mikä on yhtiön osinkopolitiikka?',
      }),
    )
    expect(onActivate).toHaveBeenCalledWith('conv-1')
  })

  it('AC-35: clicking "+ Uusi keskustelu" calls onStartNewConversation', () => {
    const conversations: Conversation[] = [
      { id: 'conv-1', messages: [MESSAGE], draft: '' },
      {
        id: 'conv-2',
        messages: [
          {
            id: 'm2',
            question: 'Mikä on liikevaihdon kasvu?',
            answer: '12 %',
          },
        ],
        draft: '',
      },
    ]
    const onStartNew = vi.fn()
    render(
      <ExpandedView
        messages={conversations[1].messages}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={conversations}
        activeConversationId="conv-2"
        onActivateConversation={NOOP}
        onStartNewConversation={onStartNew}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '+ Uusi keskustelu' }))
    expect(onStartNew).toHaveBeenCalledTimes(1)
  })
})
