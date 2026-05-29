/**
 * `MenuButton` — the hamburger toggle that opens the AC-33d mobile
 * drawer. Maps to Figma node `ds:230:656` (Menu button — Default /
 * Hover / Pressed variants).
 *
 * Per AC-33d (amended 2026-05): the button sits at the left edge of
 * the AC-21 mobile top-bar row and is rendered only at viewports
 * below the §12.1 PD-05 desktop threshold (lg / 1024 px; Figma
 * `ds:152:97` Code Connect). Activating it opens the
 * left-anchored drawer that hosts the AC-33 `PreviousDiscussionList`.
 *
 * The visual is three horizontal stripes (16×2.4 px each, 7.2 px
 * baseline) inside a 24×24 hit area, matching `ds:230:656`. Hover
 * tints the background with `--gray-300` (#f4f4f4) and Pressed with
 * `--gray-500`, both pulled from `variables.css`. The hit target
 * itself is enlarged to 44×44 via padding so it is comfortable to
 * activate with touch (mirrors the AC-20d `CloseButton` policy).
 *
 * `aria-expanded` reflects drawer state and `aria-controls` points
 * at the drawer container so screen readers can navigate the
 * disclosure relationship.
 *
 * Used inside: `ExpandedView` (mobile top-bar row only).
 */

import { forwardRef } from 'react'
import styles from '../styles/menuButton.module.css'

interface MenuButtonProps {
  onClick: () => void
  expanded: boolean
  controlsId: string
  className?: string
}

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton({ onClick, expanded, controlsId, className }, ref) {
    const composed = className
      ? `${styles.menuButton} ${className}`
      : styles.menuButton
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Avaa keskusteluvalikko"
        aria-expanded={expanded}
        aria-controls={controlsId}
        className={composed}
        onClick={onClick}
      >
        <span aria-hidden="true" className={styles.icon}>
          <span className={styles.stripe} />
          <span className={styles.stripe} />
          <span className={styles.stripe} />
        </span>
      </button>
    )
  },
)
