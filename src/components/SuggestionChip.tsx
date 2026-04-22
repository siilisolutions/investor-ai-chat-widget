/**
 * `SuggestionChip` — a predefined-question chip rendered below the
 * textarea in compact (hero) mode. Maps to Figma node `ds:152:86`
 * ("Predefined question" main component; instances `ds:152:83`,
 * `ds:152:84`, `ds:152:85` sit inside `ds:152:75` "Investor hero").
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
