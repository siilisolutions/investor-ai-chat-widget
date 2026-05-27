/**
 * Scroll-to-content affordance at the bottom of the compact hero.
 * Maps to Figma `ds:166:94` (Scroll to content button) inside
 * `ds:152:75` Investor hero. Decorative on pages where the host
 * does not wire a target; pressing scrolls the viewport down one
 * screen so the user can reach content below the hero band.
 */

import styles from '../styles/heroScrollCue.module.css'

const SCROLL_LABEL =
  'Haluatko tarkastella perinteisempiä Siilin sijoittajasivuja?'

export function HeroScrollCue() {
  return (
    <button
      type="button"
      className={styles.cue}
      onClick={() => {
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth',
        })
      }}
    >
      <span className={styles.label}>{SCROLL_LABEL}</span>
      <svg
        aria-hidden="true"
        focusable="false"
        className={styles.icon}
        viewBox="0 0 38 14"
        width="38"
        height="14"
        fill="none"
      >
        <path
          d="M4 4L19 12L34 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
