/**
 * `CompactView` — the hero-mode rendering of the chatbot. Maps to
 * Figma node `113:203` ("Investor hero") with a focus on the inner
 * `116:358` container (textarea + predefined-question chips).
 *
 * The surrounding hero title and background image are provided by the
 * host page, so this component only renders the interactive widget
 * content: a translucent textarea and three suggestion chips.
 *
 * Sending a message (either by typing or clicking a chip) triggers the
 * transition to `ExpandedView`.
 *
 * Used inside: `App`.
 */

import { ChatInput } from './ChatInput.tsx'
import { SuggestionChip } from './SuggestionChip.tsx'
import styles from '../styles/compactView.module.css'

interface CompactViewProps {
  suggestions: string[]
  onSend: (message: string) => void
}

export function CompactView({ suggestions, onSend }: CompactViewProps) {
  return (
    <div className={styles.compact}>
      <ChatInput variant="compact" onSend={onSend} />
      <div className={styles.chips}>
        {suggestions.map((label) => (
          <SuggestionChip key={label} label={label} onClick={onSend} />
        ))}
      </div>
    </div>
  )
}
