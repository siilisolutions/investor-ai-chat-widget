/**
 * `SourceBadge` — a pill-shaped reference tag rendered beneath an
 * assistant answer. Maps to Figma node `178:441` ("Reference tag").
 *
 * When `href` is provided the badge renders as an anchor with hover
 * state; otherwise it's a non-interactive span.
 *
 * Used inside: `ChatMessage` (expanded mode only).
 */

import type { Source } from '../types/index.ts'
import styles from '../styles/sourceBadge.module.css'

interface SourceBadgeProps {
  source: Source
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (source.href) {
    return (
      <a
        className={`${styles.badge} ${styles.badgeLink}`}
        href={source.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {source.label}
      </a>
    )
  }

  return <span className={styles.badge}>{source.label}</span>
}
