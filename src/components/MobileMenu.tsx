/**
 * `MobileMenu` — left-anchored slide-in drawer that hosts the AC-33
 * `PreviousDiscussionList` at viewports below the §12.1 PD-05 desktop
 * threshold (lg / 1024 px; Figma `ds:152:97` Code Connect). Maps to
 * Figma component `ds:214:1214` (Mobile menu) and
 * appears in screen context inside `site:435:2914` (AI-agentti -
 * Menu open - Mobile).
 *
 * Per AC-33d (amended 2026-05):
 * - The drawer card occupies ~75 % of the viewport width and slides
 *   in from the left edge of the expanded surface. It is white,
 *   carries the brand drop-shadow, and has 16 px padding.
 * - The card's first row holds an internal `CloseButton` (Figma
 *   reuses `ds:196:853` here — same close glyph as the AC-20d
 *   chat-dismiss button, scoped to the drawer not the chat) at the
 *   top-right of the card.
 * - The drawer body is the existing `PreviousDiscussionList`
 *   rendered verbatim; the AC-35 CTA, AC-33b row activation, and
 *   AC-33e per-row delete `×` are all reachable inside.
 * - The area outside the card (the rest of the expanded surface)
 *   is overlaid with `rgba(0,0,0,0.2)` and a light backdrop blur
 *   so the active conversation reads as visibly *backgrounded*.
 *
 * Dismiss paths (all wired by the parent via `onClose` plus the
 * row callbacks the parent already passes through):
 * - drawer's own `×` button → `onClose`
 * - `Esc` key → `onClose` (event captured locally so it does not
 *   bubble to the surface-level handler that would dismiss the
 *   whole chat per AC-20j)
 * - tap on the blurred backdrop area outside the card → `onClose`
 * - row activation → parent passes a wrapped `onActivate` that
 *   triggers `onClose` after the activation
 * - "Luo uusi keskustelu" activation → parent passes a wrapped
 *   `onStartNew` that triggers `onClose` after start-new
 *
 * Focus is captured into the drawer's close button on open and
 * returned to the hamburger toggle on close (the parent restores
 * focus by calling `focus()` on the trigger after `onClose`).
 *
 * The AC-33e per-row delete `×` does NOT close the drawer — its
 * confirmation modal needs to render over the drawer so the user
 * can confirm or cancel without losing sidebar context.
 *
 * Used inside: `ExpandedView` (mobile only).
 */

import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { Conversation } from '../types/index.ts'
import { CloseButton } from './CloseButton.tsx'
import { PreviousDiscussionList } from './PreviousDiscussionList.tsx'
import styles from '../styles/mobileMenu.module.css'

interface MobileMenuProps {
  id: string
  conversations: Conversation[]
  activeConversationId: string
  onActivate: (id: string) => void
  onStartNew: () => void
  onDelete: (id: string, label: string) => void
  onClose: () => void
}

export function MobileMenu({
  id,
  conversations,
  activeConversationId,
  onActivate,
  onStartNew,
  onDelete,
  onClose,
}: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const focusable = closeButtonRef.current?.querySelector<HTMLButtonElement>('button')
    focusable?.focus()
  }, [])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={handleBackdropMouseDown}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        id={id}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label="Keskusteluvalikko"
      >
        <div ref={closeButtonRef} className={styles.closeRow}>
          <CloseButton onClick={onClose} />
        </div>
        <PreviousDiscussionList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onActivate={onActivate}
          onStartNew={onStartNew}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
