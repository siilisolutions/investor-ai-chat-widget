/**
 * `CompactView` — the hero-mode rendering of the chatbot. Maps to
 * Figma nodes `ds:152:75` ("Investor hero" main component) and
 * `site:13:527` ("Etusivu" screen frame). When prior conversation
 * history exists, the layout shifts to Figma `site:395:5439`
 * ("Etusivu — jatka edellistä keskustelua") which adds the
 * continue-pill inside the textarea shell.
 *
 * The widget owns the full compact-hero layout per `ds:152:75`:
 * vertically centred headline, textarea + chips, and the scroll-to-
 * content cue (`ds:166:94`). The host page (or dev harness) supplies
 * only the mount node and the photographic hero background — the
 * asset is not bundled (AC-100 / AC-76).
 *
 * Sending a message (either by typing or clicking a chip) triggers
 * the transition to `ExpandedView` and, per AC-31f, mints a fresh
 * conversation when prior history exists.
 *
 * Used inside: `App`.
 */

import { ChatInput } from './ChatInput.tsx'
import { ContinuePill } from './ContinuePill.tsx'
import { HeroScrollCue } from './HeroScrollCue.tsx'
import { SuggestionChip } from './SuggestionChip.tsx'
import { useStrings } from '../i18n/LocaleContext.tsx'
import styles from '../styles/compactView.module.css'

interface CompactViewProps {
  suggestions: string[]
  /**
   * Submit handler — typed `unknown` so the AC-66 terms-gate signal
   * (an explicit `false` return from App's `handleSend` when the
   * gate intercepts) flows through to `ChatInput.submit()` without
   * being widened away by a `void` declaration in the prop chain.
   * Most callers (chip click, happy-path send) ignore the return.
   */
  onSend: (message: string) => unknown
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
  const t = useStrings()
  const showContinue = hasHistory && typeof onContinue === 'function'
  return (
    <section className={styles.hero} aria-label={t.heroSectionAriaLabel}>
      <div className={styles.heroContainer}>
        <div className={styles.heroMain}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>{t.heroTitleLine1}</span>
            <span className={styles.heroTitleLine}>{t.heroTitleLine2}</span>
          </h1>
          <div className={styles.interactive}>
            <ChatInput
              variant="compact"
              onSend={onSend}
              continueAffordance={
                showContinue ? (
                  <ContinuePill onClick={onContinue} />
                ) : undefined
              }
            />
            <div className={styles.chips}>
              {suggestions.map((label) => (
                <SuggestionChip key={label} label={label} onClick={onSend} />
              ))}
            </div>
          </div>
        </div>
        <HeroScrollCue />
      </div>
    </section>
  )
}
