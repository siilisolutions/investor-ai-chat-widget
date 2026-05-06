/**
 * `ContinuePill` — the "Jatka edellistä keskustelua" affordance
 * rendered inside the compact-mode textarea shell when prior
 * conversation history exists. Maps to Figma node `site:395:5439`
 * (Etusivu — jatka edellistä keskustelua), specifically the
 * `Continue discussion button container` slot inside `Textarea`
 * (divider + right-aligned text link in `--blue-700`).
 *
 * Per AC-10a / AC-10c the pill only renders when the PD-08 store
 * has at least one conversation with `messages.length > 0`; the
 * parent (`CompactView` via `App.hasHistory`) gates rendering.
 *
 * Activation calls `onClick` synchronously — the App-level handler
 * sets the active conversation to the most recent stored thread
 * with messages and flips to expanded mode. No network call is
 * fired by activation itself (AC-10c).
 *
 * Used inside: `ChatInput` (compact variant only, via the
 * `continueAffordance` slot).
 */

import styles from '../styles/continuePill.module.css'

interface ContinuePillProps {
  onClick: () => void
}

export function ContinuePill({ onClick }: ContinuePillProps) {
  return (
    <div className={styles.container}>
      <div className={styles.divider} aria-hidden="true" />
      <button type="button" className={styles.link} onClick={onClick}>
        Jatka edellistä keskustelua
      </button>
    </div>
  )
}
