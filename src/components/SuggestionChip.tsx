/**
 * `SuggestionChip` — a predefined-question chip rendered below the
 * textarea in compact (hero) mode. Maps to Figma nodes `116:374`,
 * `116:392`, `116:398` ("Predefined question").
 *
 * Clicking a chip submits its label as the user's first message,
 * which triggers the transition to expanded mode.
 *
 * Used inside: `CompactView`.
 */

import styles from '../styles/suggestionChip.module.css'

interface SuggestionChipProps {
  label: string
  onClick: (label: string) => void
}

export function SuggestionChip({ label, onClick }: SuggestionChipProps) {
  return (
    <button
      type="button"
      className={styles.chip}
      onClick={() => onClick(label)}
    >
      {label}
    </button>
  )
}
