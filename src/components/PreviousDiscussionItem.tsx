/**
 * `PreviousDiscussionItem` — a single row inside
 * `PreviousDiscussionList`. Maps to Figma node `ds:191:268`
 * (Previous discussion item).
 *
 * Per AC-33a:
 * - Each row carries a label derived from the first user question of
 *   the conversation, truncated to fit. Empty conversations (created
 *   but never sent) fall back to a neutral default.
 * - The currently-active row is visually distinguished from inactive
 *   rows; the parent list is responsible for telling this row whether
 *   it is the active one (`active` prop).
 *
 * Per AC-33b:
 * - Click / keyboard activation of the row label calls `onActivate`
 *   with the conversation id; no network call fires on activation
 *   alone.
 *
 * Per AC-33e:
 * - The trailing × button is a separate interactive element scoped
 *   to deletion. Click / keyboard activation calls `onDelete` with
 *   the conversation id and its derived label so the parent can
 *   render the confirmation modal copy without re-deriving. The two
 *   buttons sit as siblings inside the row container so the markup
 *   stays valid HTML (no nested interactive elements) and a click
 *   on × does not bubble through the activate button.
 *
 * Visual styling reuses existing widget tokens until the IR-DS frame
 * lands a Figma-confirmed treatment.
 *
 * Used inside: `PreviousDiscussionList`.
 */

import styles from '../styles/previousDiscussionItem.module.css'

interface PreviousDiscussionItemProps {
  id: string
  label: string
  active: boolean
  onActivate: (id: string) => void
  onDelete: (id: string, label: string) => void
}

export function PreviousDiscussionItem({
  id,
  label,
  active,
  onActivate,
  onDelete,
}: PreviousDiscussionItemProps) {
  const rowClassName = active ? `${styles.row} ${styles.active}` : styles.row
  return (
    <div className={rowClassName}>
      <button
        type="button"
        className={styles.activate}
        aria-current={active ? 'true' : undefined}
        onClick={() => onActivate(id)}
      >
        {label}
      </button>
      <button
        type="button"
        className={styles.delete}
        aria-label={`Poista keskustelu — ${label}`}
        onClick={() => onDelete(id, label)}
      >
        <span aria-hidden="true" className={styles.deleteGlyph}>
          ×
        </span>
      </button>
    </div>
  )
}
