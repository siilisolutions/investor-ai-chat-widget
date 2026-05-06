/**
 * `PreviousDiscussionList` — sidebar listing past conversations in
 * expanded mode. Maps to Figma node `ds:191:258` (Previous discussion
 * list).
 *
 * Visibility contract (AC-33, amended 2026-05): the list is rendered
 * by `ExpandedView` whenever the widget is in expanded mode,
 * regardless of how many conversations the PD-08 store holds. The
 * earlier "single-conversation hides the sidebar" rule (AC-33c) is
 * tombstoned — the sidebar is the permanent home of the AC-35 "Luo
 * uusi keskustelu" CTA and the AC-33e per-row delete `×`, both of
 * which the user must always be able to reach in expanded mode. The
 * row list is never empty: the "expanded always has an active
 * conversation" invariant guarantees at least one row.
 *
 * Per AC-33a, each row is a `PreviousDiscussionItem` with a label
 * derived from the first user question of that conversation,
 * truncated. The active row is visually distinguished. AC-33b is
 * implemented by delegating activation to `onActivate`.
 *
 * AC-35 — the "Luo uusi keskustelu" primary CTA at the top of the
 * sidebar maps to Figma component set `ds:237:398` with `Default` /
 * `Hover` / `Pressed` variants (`237:323` / `237:399` / `237:411`).
 * Visual contract: content-sized violet→blue gradient pill with
 * `white-space: nowrap` label (matches Figma's `whitespace-nowrap`
 * intent — earlier `width: 184 px` constraint was a measurement of
 * the rendered instance, not a Figma-pinned dimension, and forced the
 * label to wrap onto two lines), 8×20 px padding, 20 px border-radius,
 * 12 px gap between the leading 11×11 plus icon (Figma `ds:237:332`)
 * and the label, white Everett 14 px / 24 px. Hover and Pressed darken
 * the gradient by overlaying 20 % / 40 % black, matching the
 * send-button family. The plus icon is inlined as SVG so AC-N2 (no
 * font/binary assets) and AC-100 (60 KB gzip budget) stay clean.
 *
 * Mobile responsive treatment (AC-33d) is the parent's
 * responsibility — `ExpandedView` decides whether to render this
 * inline (desktop) or behind a discoverable affordance (mobile).
 *
 * Used inside: `ExpandedView`.
 */

import type { Conversation } from '../types/index.ts'
import { PreviousDiscussionItem } from './PreviousDiscussionItem.tsx'
import styles from '../styles/previousDiscussionList.module.css'

interface PreviousDiscussionListProps {
  conversations: Conversation[]
  activeConversationId: string
  onActivate: (id: string) => void
  onStartNew: () => void
  onDelete: (id: string, label: string) => void
}

const NEUTRAL_LABEL = 'Uusi keskustelu'
const LABEL_MAX = 60

function deriveLabel(conversation: Conversation): string {
  const firstUser = conversation.messages.find(
    (m) => m.question.trim().length > 0,
  )
  if (!firstUser) return NEUTRAL_LABEL
  const trimmed = firstUser.question.trim()
  if (trimmed.length <= LABEL_MAX) return trimmed
  return `${trimmed.slice(0, LABEL_MAX - 1).trimEnd()}…`
}

export function PreviousDiscussionList({
  conversations,
  activeConversationId,
  onActivate,
  onStartNew,
  onDelete,
}: PreviousDiscussionListProps) {
  return (
    <aside className={styles.list} aria-label="Aiemmat keskustelut">
      <button
        type="button"
        className={styles.newButton}
        onClick={onStartNew}
      >
        <svg
          className={styles.newButtonIcon}
          width="11"
          height="11"
          viewBox="0 0 11 11"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="4.895" y="0" width="1.21" height="11" fill="currentColor" />
          <rect x="0" y="4.895" width="11" height="1.21" fill="currentColor" />
        </svg>
        Luo uusi keskustelu
      </button>
      <h3 className={styles.heading}>Aiemmat keskustelut</h3>
      <ul className={styles.items}>
        {conversations.map((c) => (
          <li key={c.id}>
            <PreviousDiscussionItem
              id={c.id}
              label={deriveLabel(c)}
              active={c.id === activeConversationId}
              onActivate={onActivate}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </aside>
  )
}
