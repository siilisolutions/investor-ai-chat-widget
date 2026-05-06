/**
 * Tests for `MobileMenu` and the AC-33d drawer integration in
 * `ExpandedView`. Per GOV-13 each test name quotes the AC intent.
 * Covered ACs:
 *
 *   AC-33d — hamburger opens drawer; drawer dismisses on internal × /
 *            `Esc` / backdrop click / row activation / start-new;
 *            focus returns to the hamburger on close. The AC-33e
 *            per-row delete `×` does NOT dismiss the drawer.
 *   AC-21  — mobile top-bar row renders the hamburger, title, and
 *            chat-level close button together.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/preact'
import { ExpandedView } from '../src/components/ExpandedView'
import { MobileMenu } from '../src/components/MobileMenu'
import type {
  ChatMessage as ChatMessageData,
  Conversation,
} from '../src/types/index'

const MESSAGE: ChatMessageData = {
  id: 'm1',
  question: 'Mikä on yhtiön osinkopolitiikka?',
  answer: 'Siili maksaa osinkoa kerran vuodessa.',
}

const SECOND_MESSAGE: ChatMessageData = {
  id: 'm2',
  question: 'Mikä on liikevaihdon kasvu?',
  answer: '12 %',
}

const ACTIVE_ID = 'conv-active'
const SECOND_ID = 'conv-second'

const TWO_CONVERSATIONS: Conversation[] = [
  { id: ACTIVE_ID, messages: [MESSAGE], draft: '' },
  { id: SECOND_ID, messages: [SECOND_MESSAGE], draft: '' },
]

const NOOP = () => {}

let scrollSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  scrollSpy = vi
    .spyOn(Element.prototype, 'scrollIntoView')
    .mockImplementation(() => {})
})

afterEach(() => {
  scrollSpy.mockRestore()
})

describe('AC-21: mobile top-bar row', () => {
  it('AC-21: the hamburger toggle, title, and chat-level close button are all rendered in the same top-bar row', () => {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
        onDeleteConversation={NOOP}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Siili AI-avustaja' })).toBeInTheDocument()
    // A single chat-level close button is in the DOM at all
    // breakpoints — CSS re-positions it (in-flow inside `.topBar` on
    // mobile, `position: absolute` against `.surface` corner on
    // tablet / desktop) but the markup itself does not duplicate it.
    expect(
      screen.getByRole('button', { name: 'Sulje keskustelu' }),
    ).toBeInTheDocument()
  })
})

describe('AC-33d: hamburger reveals the drawer', () => {
  it('AC-33d: the drawer is not mounted on initial render', () => {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
        onDeleteConversation={NOOP}
      />,
    )
    expect(screen.queryByRole('dialog', { name: 'Keskusteluvalikko' })).toBeNull()
    expect(
      screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('AC-33d: activating the hamburger opens the drawer and flips aria-expanded', () => {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
        onDeleteConversation={NOOP}
      />,
    )
    const hamburger = screen.getByRole('button', { name: 'Avaa keskusteluvalikko' })
    fireEvent.click(hamburger)
    expect(screen.getByRole('dialog', { name: 'Keskusteluvalikko' })).toBeInTheDocument()
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('AC-33d: drawer dismiss paths', () => {
  function openDrawer() {
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
        onDeleteConversation={NOOP}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }))
  }

  it("AC-33d: the drawer's own × button closes the drawer without dismissing the chat", () => {
    openDrawer()
    const dialog = screen.getByRole('dialog', { name: 'Keskusteluvalikko' })
    // The drawer's × is *inside* the dialog; the chat-level × is outside.
    const drawerCloses = within(dialog).getAllByRole('button', { name: 'Sulje keskustelu' })
    expect(drawerCloses.length).toBe(1)
    fireEvent.click(drawerCloses[0])
    expect(screen.queryByRole('dialog', { name: 'Keskusteluvalikko' })).toBeNull()
  })

  it('AC-33d: pressing Esc inside the drawer closes the drawer (and does not bubble to the chat-level dismiss)', () => {
    const onClose = vi.fn()
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={onClose}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
        onDeleteConversation={NOOP}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }))
    const dialog = screen.getByRole('dialog', { name: 'Keskusteluvalikko' })
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Keskusteluvalikko' })).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('AC-33d: clicking the blurred backdrop outside the card closes the drawer', () => {
    const onClose = vi.fn()
    const { container } = render(
      <MobileMenu
        id="drawer"
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivate={NOOP}
        onStartNew={NOOP}
        onDelete={NOOP}
        onClose={onClose}
      />,
    )
    // The presentation backdrop wraps the dialog card. Clicking on the
    // backdrop (not the card) should resolve to dismiss.
    const backdrop = container.querySelector('[role="presentation"]')
    expect(backdrop).not.toBeNull()
    fireEvent.mouseDown(backdrop as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('AC-33d: clicking inside the drawer card does NOT close the drawer', () => {
    const onClose = vi.fn()
    render(
      <MobileMenu
        id="drawer"
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivate={NOOP}
        onStartNew={NOOP}
        onDelete={NOOP}
        onClose={onClose}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: 'Keskusteluvalikko' })
    fireEvent.mouseDown(dialog)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('AC-33d: row activation auto-closes the drawer', () => {
  it('AC-33d: activating an inactive row in the drawer fires onActivateConversation AND closes the drawer', () => {
    const onActivate = vi.fn()
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={onActivate}
        onStartNewConversation={NOOP}
        onDeleteConversation={NOOP}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }))
    const dialog = screen.getByRole('dialog', { name: 'Keskusteluvalikko' })
    // The inactive conversation's row label is its first user question.
    const inactiveRow = within(dialog).getByRole('button', {
      name: SECOND_MESSAGE.question,
    })
    fireEvent.click(inactiveRow)
    expect(onActivate).toHaveBeenCalledWith(SECOND_ID)
    expect(screen.queryByRole('dialog', { name: 'Keskusteluvalikko' })).toBeNull()
  })

  it('AC-33d: activating "Luo uusi keskustelu" in the drawer fires onStartNewConversation AND closes the drawer', () => {
    const onStartNew = vi.fn()
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={onStartNew}
        onDeleteConversation={NOOP}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }))
    const dialog = screen.getByRole('dialog', { name: 'Keskusteluvalikko' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Luo uusi keskustelu' }))
    expect(onStartNew).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog', { name: 'Keskusteluvalikko' })).toBeNull()
  })

  it('AC-33d: activating the per-row × inside the drawer fires onDeleteConversation but does NOT close the drawer', () => {
    const onDelete = vi.fn()
    render(
      <ExpandedView
        messages={[MESSAGE]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={TWO_CONVERSATIONS}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
        onDeleteConversation={onDelete}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Avaa keskusteluvalikko' }))
    const dialog = screen.getByRole('dialog', { name: 'Keskusteluvalikko' })
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: `Poista keskustelu — ${SECOND_MESSAGE.question}`,
      }),
    )
    expect(onDelete).toHaveBeenCalledWith(SECOND_ID, SECOND_MESSAGE.question)
    expect(screen.getByRole('dialog', { name: 'Keskusteluvalikko' })).toBeInTheDocument()
  })
})
