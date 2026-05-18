/**
 * `CloseButton` — the × button rendered in the top-right of the
 * expanded chat view. Maps to Figma component set `ds:223:739`
 * (Close discussion) with variants Default `ds:196:853` /
 * Hover `ds:223:740` / Pressed `ds:224:820`.
 *
 * Per AC-20d (amended 2026-05, Lane P follow-up):
 * - 32 × 32 circular button, matching Figma `ds:196:853` exactly
 *   — the visible affordance is the click target, no wrapping
 *   hit-area buffer. Still meets WCAG 2.5.8 (AA, ≥24 × 24); no
 *   longer reaches WCAG 2.5.5 (AAA, ≥44 × 44).
 * - `aria-label="Sulje keskustelu"` so screen readers announce a
 *   meaningful action regardless of the visual glyph.
 *
 * The DOM mirrors Figma's `Close discussion` (32 × 32 surface)
 * containing `Close icon` (16 × 16 SVG of two crossed lines): a
 * single rounded `<button>` carries the Hover (`--gray-300`) /
 * Pressed (`--gray-500`) background per `ds:223:740` / `ds:224:820`,
 * with the SVG glyph centred inside. The X glyph is inlined (per
 * AC-N2 / AC-100) — two strokes corner-to-corner of a 16 × 16
 * viewBox at 1.8 px stroke width, matching `ds:197:1108`.
 *
 * Activation is delegated to `onClick`; the parent (`ExpandedView`)
 * wires this to `App`'s dismiss flow per AC-20j (returns to compact
 * mode, retains `messages` per AC-31, balances the history stack
 * via `history.back()` when `interceptBackNavigation` is enabled).
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
      <svg
        aria-hidden="true"
        focusable="false"
        className={styles.glyph}
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="none"
      >
        <path
          d="M1 1L15 15M15 1L1 15"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </button>
  )
}
