/**
 * `PreviousDiscussionItem` — a single row inside
 * `PreviousDiscussionList`. Maps to Figma node `ds:191:268`
 * (Previous discussion item).
 *
 * Per AC-33a (amended 2026-05):
 * - Each row carries a label derived from the first user question of
 *   the conversation, truncated to fit. Empty conversations (created
 *   but never sent) fall back to a neutral default.
 * - The currently-active row is visually distinguished from inactive
 *   rows by carrying the Hover variant's surface (`--gray-500`,
 *   Figma `ds:230:453`) per `site:434:2424` (`property1="Hover"`
 *   for the active conversation in Figma's expanded-view composition).
 *   Label weight stays Everett Regular on every variant — the surface
 *   step is the cue. The parent list passes the `active` prop.
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
 * The trailing glyph is an inline SVG mirroring Figma `ds:152:88`
 * (Reset icon — two 1.21 px black bars rotated ±45° in a 24 × 24
 * frame), inlined so AC-N2 (no font binaries / image assets) and
 * AC-100 (60 KB gzip budget) stay clean.
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
        <svg
          aria-hidden="true"
          focusable="false"
          className={styles.deleteGlyph}
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
        >
          <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke="currentColor"
            strokeWidth="1.21"
          />
          <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            stroke="currentColor"
            strokeWidth="1.21"
          />
        </svg>
      </button>
    </div>
  )
}
