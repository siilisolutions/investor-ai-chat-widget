/**
 * Tests for AC-80 "Keyboard-only operation" — the focus contract
 * across compact and expanded modes.
 *
 * Per AC-80 (amended 2026-04 for the close button — Figma component drift):
 *   - Compact mode Tab order within the widget is
 *     textarea → send button → chips (DOM-order).
 *   - Expanded mode auto-focuses the textarea on mount. From the
 *     textarea, the next focusable inside the input wrapper is the
 *     send button. The close button (AC-20d) is also keyboard-reachable
 *     but its relative DOM position (it currently renders before the
 *     title) is intentionally not asserted — Shift+Tab from the
 *     textarea reaches it, the focus contract just requires it be
 *     reachable.
 *   - Linked source badges are keyboard-reachable but their relative
 *     position to the textarea is intentionally not asserted (they
 *     render inline with their parent answer so screen-reader reading
 *     order stays coherent).
 *   - Every interactive surface is keyboard-reachable and renders a
 *     visible focus ring (`:focus-visible`).
 *
 * Per GOV-13 each test name quotes the AC's intent rather than the
 * current DOM layout.
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/preact'
import { CompactView } from '../src/components/CompactView'
import { ExpandedView } from '../src/components/ExpandedView'
import type {
  ChatMessage as ChatMessageData,
  Conversation,
} from '../src/types/index'

const CHIPS = ['Kysymys 1', 'Kysymys 2', 'Kysymys 3']

const NOOP = () => {}
const ACTIVE_ID = 'conv-active'
function singleConversation(messages: ChatMessageData[]): Conversation[] {
  return [{ id: ACTIVE_ID, messages, draft: '' }]
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'textarea:not(:disabled)',
  'input:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusOrder(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

function describeElement(el: HTMLElement): string {
  if (el instanceof HTMLTextAreaElement)
    return `textarea[${el.getAttribute('aria-label') ?? ''}]`
  if (el instanceof HTMLButtonElement)
    return `button[${el.getAttribute('aria-label') ?? el.textContent?.trim()}]`
  if (el instanceof HTMLAnchorElement) return `a[${el.textContent?.trim()}]`
  return el.tagName.toLowerCase()
}

describe('AC-80 — keyboard focus contract', () => {
  it('AC-80: compact mode Tab order is textarea → send button → each suggestion chip', () => {
    const { container } = render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!
    // AC-15 / AC-16: send button is disabled while textarea is empty
    // and does not take a tab stop. Type a character so the full
    // AC-80 chain is reachable by Tab.
    fireEvent.input(textarea, { target: { value: 'x' } })

    const order = focusOrder(container).map(describeElement)
    expect(order).toEqual([
      'textarea[Siili investor chatbot message]',
      'button[Send message]',
      'button[Kysymys 1]',
      'button[Kysymys 2]',
      'button[Kysymys 3]',
      'button[Haluatko tarkastella perinteisempiä Siilin sijoittajasivuja?]',
    ])
  })

  it('AC-80: expanded mode auto-focuses the textarea on mount', () => {
    const message: ChatMessageData = {
      id: 'm1',
      question: 'Mikä on yhtiön osinkopolitiikka?',
      answer: 'Siili maksaa osinkoa kerran vuodessa.',
      sources: [
        { label: 'Vuosikertomus 2025, s.21', href: 'https://example.com/ar2025#p21' },
      ],
    }
    const { container } = render(
      <ExpandedView
        messages={[message]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={singleConversation([message])}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!
    expect(document.activeElement).toBe(textarea)
  })

  it('AC-80: from the expanded-mode textarea, the send button is the next focusable element in DOM after the input wrapper', () => {
    // Tab from the textarea lands on the next focusable in DOM order.
    // Within the ChatInput subtree, that is the send button — so the
    // "textarea → send" half of AC-80's contract is a structural
    // guarantee rooted in ChatInput, independent of where linked
    // badges or the close button fall in the wider ExpandedView tree.
    const message: ChatMessageData = {
      id: 'm1',
      question: 'Mikä on yhtiön osinkopolitiikka?',
      answer: 'Siili maksaa osinkoa kerran vuodessa.',
    }
    // Seed the controlled draft directly — the send button is gated
    // on `value.trim().length > 0`, so we need a non-empty draft for
    // the button to be `:not(:disabled)` and therefore in focus order.
    const { container } = render(
      <ExpandedView
        messages={[message]}
        loading={false}
        draft="x"
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={singleConversation([message])}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')!
    const inputWrapper = textarea.closest<HTMLElement>('[class*="inputWrapper"]')
    expect(inputWrapper).toBeTruthy()
    const wrapperOrder = focusOrder(inputWrapper!).map(describeElement)
    expect(wrapperOrder).toEqual([
      'textarea[Siili investor chatbot message]',
      'button[Send message]',
    ])
  })

  it('AC-80: linked source badges are keyboard-reachable (focusable anchors with rel="noopener noreferrer")', () => {
    const message: ChatMessageData = {
      id: 'm1',
      question: 'Mikä on yhtiön osinkopolitiikka?',
      answer: 'Siili maksaa osinkoa kerran vuodessa.',
      sources: [
        { label: 'Vuosikertomus 2025, s.21', href: 'https://example.com/ar2025#p21' },
        { label: 'Vuosikertomus 2025, s.34', href: 'https://example.com/ar2025#p34' },
      ],
    }
    const { container } = render(
      <ExpandedView
        messages={[message]}
        loading={false}
        draft=""
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={singleConversation([message])}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    const badgeAnchors = container.querySelectorAll<HTMLAnchorElement>('a[href]')
    expect(badgeAnchors).toHaveLength(2)
    for (const anchor of Array.from(badgeAnchors)) {
      expect(anchor).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(anchor.tabIndex).toBeGreaterThanOrEqual(0)
    }
  })

  it('AC-80 + AC-20d: expanded-mode close button is keyboard-reachable alongside the textarea and send button', () => {
    const message: ChatMessageData = {
      id: 'm1',
      question: 'Mikä on yhtiön osinkopolitiikka?',
      answer: 'Siili maksaa osinkoa kerran vuodessa.',
      sources: [{ label: 'PDF: Vuosikertomus 2025, s.21' }],
    }
    // Seed the controlled draft directly so the send button is enabled.
    const { container } = render(
      <ExpandedView
        messages={[message]}
        loading={false}
        draft="x"
        onDraftChange={NOOP}
        onSend={NOOP}
        onClose={NOOP}
        conversations={singleConversation([message])}
        activeConversationId={ACTIVE_ID}
        onActivateConversation={NOOP}
        onStartNewConversation={NOOP}
      />,
    )
    // Non-linked badges still render as spans (no extra anchor in the tree).
    const anchors = container.querySelectorAll('a[href]')
    expect(anchors).toHaveLength(0)
    // The focus order in expanded mode is DOM-order. AC-20d /
    // AC-80's hard requirement is that the close button, textarea,
    // and send button are all keyboard-reachable; the relative
    // position of the sidebar's start-new CTA, row activate
    // buttons, and per-row × delete (AC-33 / AC-35 / AC-33e — all
    // reachable per AC-80's "every interactive surface keyboard-
    // reachable" clause) is intentionally not pinned here.
    const order = focusOrder(container).map(describeElement)
    expect(order).toContain('button[Sulje keskustelu]')
    expect(order).toContain('textarea[Siili investor chatbot message]')
    expect(order).toContain('button[Send message]')
    // The unlinked badge does NOT enter focus order (no anchor in
    // the tree). This is the assertion the original test was
    // really protecting.
    expect(order.some((s) => s.startsWith('a['))).toBe(false)
  })
})
