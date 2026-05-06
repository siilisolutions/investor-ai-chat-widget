/**
 * `ExpandedView` — the full chat rendering shown after the first
 * message is sent. Maps to Figma nodes `ds:152:97` ("Investor agent"
 * main component) and `site:434:2424` ("AI-agentti" screen frame).
 *
 * Desktop layout (≥1024 px, amended 2026-05, Lane J — Figma re-align):
 * - `.backdrop` — full-viewport `position: fixed` overlay. Adds
 *   padding so the inner `.surface` reads as a margin-around card,
 *   and applies `backdrop-filter: blur(...)` over a translucent
 *   white wash so the host page is visibly defocused (AC-20a, with
 *   a solid `rgba(255, 255, 255, 0.7)` fallback for browsers that
 *   do not support `backdrop-filter`).
 * - `.surface` — the white card. Edge-to-edge below 1024 px
 *   (AC-92c), inset with `border-radius` + subtle elevation at or
 *   above 1024 px. Hosts an absolutely-positioned `CloseButton`
 *   (AC-20d, Figma `ds:196:853`) at the top-right plus a centred
 *   `.layout` wrapper that bounds the title row and body to a
 *   comfortable max-width.
 * - `.body` — flex row of `PreviousDiscussionList` (AC-33, Figma
 *   `ds:191:258`), a 1 px vertical `.divider`, and `.contentColumn`.
 * - `.contentColumn` — flex column with `.messages` (own overflow
 *   container, `scrollbar-gutter: stable`, bottom `mask-image`
 *   opacity fade per AC-28c) and `.inputWrapper` (bottom-pinned via
 *   the column's flex layout, AC-28). Auto-scroll lands the latest
 *   reply just above the input by calling `scrollIntoView` on a
 *   sentinel inside `.messages`; the nearest scrollable ancestor
 *   is `.messages` itself, so the scroll never leaks to the page.
 *
 * Mobile layout (<640 px, amended 2026-05, AC-33d Mobile drawer):
 * - The title sits in a `.topBar` row alongside the AC-33d
 *   `MenuButton` (left edge) and the AC-20d `CloseButton` (right
 *   edge), per `site:435:2904`. The desktop absolute close button
 *   is hidden via CSS at this breakpoint and the in-flow one in
 *   the top bar takes over.
 * - The inline `.body`-rendered `PreviousDiscussionList` and
 *   `.divider` are hidden via CSS; the sidebar is reachable only
 *   through the drawer.
 * - When `drawerOpen` is true, `MobileMenu` mounts as an
 *   absolutely-positioned overlay inside `.surface` (left-anchored
 *   slide-in card + blurred dark backdrop, Figma `ds:214:1214` /
 *   `site:435:2914`). Activating any AC-33b row, the AC-35
 *   "Luo uusi keskustelu" CTA, the drawer's own `×` button, the
 *   `Esc` key, or the backdrop closes the drawer; row activations
 *   and start-new still run their normal effects.
 *
 * Sidebar visibility (AC-33, amended 2026-05): the sidebar is
 * rendered whenever the widget is in expanded mode, regardless of
 * how many conversations the PD-08 store holds. The sidebar is the
 * permanent home of the AC-35 "Luo uusi keskustelu" CTA and the
 * AC-33e per-row delete `×`, both of which the user must always be
 * able to reach. The earlier "single-conversation hides the
 * sidebar" rule (AC-33c) is tombstoned. Lane J also stripped the
 * sidebar's outer background — the gray-400 surface lives on each
 * row now, and a 1 px vertical divider separates the columns.
 *
 * AC-20j — `Esc` pressed anywhere inside the expanded surface
 * dismisses the chat by calling `onClose`. Activation of the close
 * button does the same. Whether dismiss balances the history stack
 * is owned by `App.tsx` based on the `interceptBackNavigation`
 * option. The drawer captures its own `Esc` so it does not leak
 * into the chat-level dismiss while open.
 *
 * AC-20f — the `useEffect` that locks `html` / `body`
 * `overflow: hidden` stays. The internal scroll surface moved from
 * `.expanded` (Lane C) to `.messages` / `.items` (Lane J), but the
 * host-page scroll lock is independent of that and still required.
 *
 * AC-80: the textarea is auto-focused on mount so the first keyboard
 * action lands on the primary input, regardless of whether the
 * sidebar or linked source badges earlier in DOM order are
 * focusable.
 *
 * Used inside: `App`.
 */

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type {
  ChatMessage as ChatMessageData,
  Conversation,
} from '../types/index.ts'
import { ChatInput } from './ChatInput.tsx'
import { ChatMessage } from './ChatMessage.tsx'
import { CloseButton } from './CloseButton.tsx'
import { MenuButton } from './MenuButton.tsx'
import { MobileMenu } from './MobileMenu.tsx'
import { PreviousDiscussionList } from './PreviousDiscussionList.tsx'
import styles from '../styles/expandedView.module.css'

interface ExpandedViewProps {
  messages: ChatMessageData[]
  loading: boolean
  draft: string
  onDraftChange: (next: string) => void
  onSend: (message: string) => void
  onClose: () => void
  conversations: Conversation[]
  activeConversationId: string
  onActivateConversation: (id: string) => void
  onStartNewConversation: () => void
  onDeleteConversation: (id: string, label: string) => void
}

export function ExpandedView({
  messages,
  loading,
  draft,
  onDraftChange,
  onSend,
  onClose,
  conversations,
  activeConversationId,
  onActivateConversation,
  onStartNewConversation,
  onDeleteConversation,
}: ExpandedViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerId = useId()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  useEffect(() => {
    const prefersReduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReduce ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages])

  const closeDrawer = () => {
    if (!drawerOpen) return
    setDrawerOpen(false)
    queueMicrotask(() => menuButtonRef.current?.focus())
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  const handleActivateFromDrawer = (id: string) => {
    onActivateConversation(id)
    closeDrawer()
  }

  const handleStartNewFromDrawer = () => {
    onStartNewConversation()
    closeDrawer()
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.surface} onKeyDown={handleKeyDown}>
        <div className={styles.layout}>
          <div className={styles.topBar}>
            <MenuButton
              ref={menuButtonRef}
              onClick={() => setDrawerOpen(true)}
              expanded={drawerOpen}
              controlsId={drawerId}
              className={styles.menuButton}
            />
            <h2 className={styles.title}>Siili AI-avustaja</h2>
            <CloseButton onClick={onClose} className={styles.closeButton} />
          </div>
          <div className={styles.body}>
            <div className={styles.desktopSidebar}>
              <PreviousDiscussionList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onActivate={onActivateConversation}
                onStartNew={onStartNewConversation}
                onDelete={onDeleteConversation}
              />
            </div>
            <div
              className={styles.divider}
              role="presentation"
              aria-hidden="true"
            />
            <div className={styles.contentColumn}>
              <div className={styles.messages}>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div
                  ref={messagesEndRef}
                  className={styles.messagesEnd}
                  aria-hidden="true"
                />
              </div>
              <div className={styles.inputWrapper}>
                <ChatInput
                  variant="expanded"
                  disabled={loading}
                  autoFocus
                  value={draft}
                  onValueChange={onDraftChange}
                  onSend={onSend}
                />
              </div>
            </div>
          </div>
        </div>
        {drawerOpen && (
          <MobileMenu
            id={drawerId}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onActivate={handleActivateFromDrawer}
            onStartNew={handleStartNewFromDrawer}
            onDelete={onDeleteConversation}
            onClose={closeDrawer}
          />
        )}
      </div>
    </div>
  )
}
