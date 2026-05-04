/**
 * `CloseButton` — the × button rendered in the top-right of the
 * expanded chat view. Maps to Figma node `ds:196:853` (Close
 * discussion).
 *
 * Per AC-20d:
 * - 44×44px minimum hit target (touch / pointer-friendly).
 * - `aria-label="Sulje keskustelu"` so screen readers announce a
 *   meaningful action regardless of the visual glyph.
 *
 * Activation is delegated to `onClick`; the parent (`ExpandedView`)
 * wires this to `App`'s dismiss flow per AC-20j (returns to compact
 * mode, retains `messages` per AC-31, balances the history stack
 * via `history.back()` when `interceptBackNavigation` is enabled).
 *
 * Visual styling uses the same Siili tokens as the rest of the
 * widget (gray hover overlay matching the question-bubble
 * surface, pill-radius outline on focus). No Material `×`, no
 * stock generic close glyph — see AC-75.
 *
 * Used inside: `ExpandedView`.
 */

import styles from '../styles/closeButton.module.css'

interface CloseButtonProps {
  onClick: () => void
  /**
   * Optional extra class applied to the button element, intended for
   * the parent layout to position the button (e.g. anchoring it to
   * the top-right of `ExpandedView`). The base appearance always
   * comes from `closeButton.module.css`.
   */
  className?: string
}

export function CloseButton({ onClick, className }: CloseButtonProps) {
  const composed = className
    ? `${styles.closeButton} ${className}`
    : styles.closeButton
  return (
    <button
      type="button"
      aria-label="Sulje keskustelu"
      className={composed}
      onClick={onClick}
    >
      <span aria-hidden="true" className={styles.glyph}>
        ×
      </span>
    </button>
  )
}
