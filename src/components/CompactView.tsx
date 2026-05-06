/**
 * `CompactView` — the hero-mode rendering of the chatbot. Maps to
 * Figma nodes `ds:152:75` ("Investor hero" main component) and
 * `site:13:527` ("Etusivu" screen frame). When prior conversation
 * history exists, the layout shifts to Figma `site:395:5439`
 * ("Etusivu — jatka edellistä keskustelua") which adds the
 * continue-pill inside the textarea shell.
 *
 * The surrounding hero title and background image are provided by the
 * host page, so this component only renders the interactive widget
 * content: a translucent textarea, optional continue-pill (AC-10a),
 * and three suggestion chips.
 *
 * Sending a message (either by typing or clicking a chip) triggers
 * the transition to `ExpandedView` and, per AC-31f, mints a fresh
 * conversation when prior history exists.
 *
 * Used inside: `App`.
 */

import { ChatInput } from './ChatInput.tsx'
import { ContinuePill } from './ContinuePill.tsx'
import { SuggestionChip } from './SuggestionChip.tsx'
import styles from '../styles/compactView.module.css'

interface CompactViewProps {
  suggestions: string[]
  onSend: (message: string) => void
  /**
   * Whether the PD-08 store contains at least one conversation with
   * messages. Gates the AC-10a continue-pill. Defaults to `false` so
   * fixtures that don't care about history can omit it.
   */
  hasHistory?: boolean
  /**
   * Activation handler for the continue-pill (AC-10c). Required when
   * `hasHistory` is `true`; ignored otherwise.
   */
  onContinue?: () => void
}

export function CompactView({
  suggestions,
  onSend,
  hasHistory = false,
  onContinue,
}: CompactViewProps) {
  const showContinue = hasHistory && typeof onContinue === 'function'
  return (
    <div className={styles.compact}>
      <ChatInput
        variant="compact"
        onSend={onSend}
        continueAffordance={
          showContinue ? <ContinuePill onClick={onContinue} /> : undefined
        }
      />
      <div className={styles.chips}>
        {suggestions.map((label) => (
          <SuggestionChip key={label} label={label} onClick={onSend} />
        ))}
      </div>
    </div>
  )
}
