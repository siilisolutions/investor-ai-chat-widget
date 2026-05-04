/**
 * `PreviousDiscussionList` — sidebar listing past conversations in
 * expanded mode. Maps to Figma node `ds:191:258` (Previous discussion
 * list).
 *
 * Visibility contract (AC-33 / AC-33c): the list is rendered by
 * `ExpandedView` only when *more than the active conversation*
 * exists in the PD-08 store. When only the active conversation is
 * present (typical first-ever expanded session in a new tab), the
 * sidebar is not rendered at all and the expanded view falls back to
 * the single-column layout. This component is therefore always
 * called with at least two conversations; it does not render an
 * empty state itself.
 *
 * Per AC-33a, each row is a `PreviousDiscussionItem` with a label
 * derived from the first user question of that conversation,
 * truncated. The active row is visually distinguished. AC-33b is
 * implemented by delegating activation to `onActivate`.
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
}: PreviousDiscussionListProps) {
  return (
    <aside className={styles.list} aria-label="Aiemmat keskustelut">
      <header className={styles.header}>
        <h3 className={styles.heading}>Aiemmat keskustelut</h3>
        <button
          type="button"
          className={styles.newButton}
          onClick={onStartNew}
        >
          + Uusi keskustelu
        </button>
      </header>
      <ul className={styles.items}>
        {conversations.map((c) => (
          <li key={c.id}>
            <PreviousDiscussionItem
              id={c.id}
              label={deriveLabel(c)}
              active={c.id === activeConversationId}
              onActivate={onActivate}
            />
          </li>
        ))}
      </ul>
    </aside>
  )
}
