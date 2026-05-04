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
 * - Click / keyboard activation calls `onActivate` with the
 *   conversation id; no network call fires on activation alone.
 *
 * Visual styling reuses existing widget tokens until the IR-DS frame
 * lands a Figma-confirmed treatment (the current MCP seat cannot
 * fetch design context — see AGENTS.md § Code Connect).
 *
 * Used inside: `PreviousDiscussionList`.
 */

import styles from '../styles/previousDiscussionItem.module.css'

interface PreviousDiscussionItemProps {
  id: string
  label: string
  active: boolean
  onActivate: (id: string) => void
}

export function PreviousDiscussionItem({
  id,
  label,
  active,
  onActivate,
}: PreviousDiscussionItemProps) {
  const className = active
    ? `${styles.item} ${styles.active}`
    : styles.item
  return (
    <button
      type="button"
      className={className}
      aria-current={active ? 'true' : undefined}
      onClick={() => onActivate(id)}
    >
      {label}
    </button>
  )
}
