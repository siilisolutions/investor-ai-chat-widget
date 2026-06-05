/**
 * `ChatMessage` — a single Q+A pair rendered in the expanded chat
 * view. Maps to Figma nodes `ds:152:116` ("Question + Answer"),
 * `ds:152:137` (loading blob animation) and `site:434:2696` (loading
 * state with "Haetaan tietoa...").
 *
 * Renders:
 * - The user's question as a right-aligned gray bubble
 * - Either the assistant's answer, the loading indicator (a
 *   pulsating gray blob per AC-23 — not a spinner ring), or an
 *   error message
 * - An optional list of source badges under the "Lähteet:" label
 *
 * The answer body is plain text per AC-N1, with two narrow exceptions
 * per AC-24b: (1) `[title](http/https URL)` tokens become `<a
 * target="_blank">` React children; (2) `[title](mailto:…)` tokens
 * whose mailbox is a single recipient on `@siili.com` or `@siili.fi`
 * become same-context `<a>` children. All other schemes, off-domain
 * mailto, and every other Markdown/HTML construct stay escaped plain
 * text. Elements are always built as JSX — never via raw HTML injection.
 *
 * Used inside: `ExpandedView`.
 */

import type { ReactNode } from 'react'
import type { ChatMessage as ChatMessageData } from '../types/index.ts'
import { SourceBadge } from './SourceBadge.tsx'
import styles from '../styles/chatMessage.module.css'

interface ChatMessageProps {
  message: ChatMessageData
}

const INLINE_LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g

/** Allowed Siili mail domains for mailto: linkification (AC-24b). */
const SIILI_MAILBOX = /^[^@\s,]+@(siili\.com|siili\.fi)$/i

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/**
 * Returns true when the mailto: URL contains a single recipient whose
 * domain is exactly `siili.com` or `siili.fi` (AC-24b).
 * Subdomains (e.g. `sub.siili.com`) and suffix tricks
 * (`siili.com.evil.com`) are rejected by the anchored regex.
 */
function isSiiliMailto(url: string): boolean {
  if (!/^mailto:/i.test(url)) return false
  const mailbox = url.slice(7).split(/[?#&]/)[0]
  if (mailbox.includes(',')) return false
  return SIILI_MAILBOX.test(mailbox)
}

/**
 * Splits an answer string into plain-text segments and `<a>` elements
 * for inline `[title](URL)` tokens (AC-24b).
 *
 * Allowed URL types:
 *  - `http`/`https` — new tab (`target="_blank"`, `rel="noopener noreferrer"`)
 *  - `mailto:` on `@siili.com` / `@siili.fi` — same context (no target/rel)
 *
 * Everything else — unsafe schemes, off-domain mailto, `**bold**`, raw
 * HTML, etc. — is left as escaped plain text (AC-N1). Text segments
 * keep their newlines, rendered as paragraph breaks via `pre-wrap` (AC-24).
 */
function renderAnswer(answer: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  INLINE_LINK.lastIndex = 0
  for (
    let match = INLINE_LINK.exec(answer);
    match !== null;
    match = INLINE_LINK.exec(answer)
  ) {
    const [full, label, url] = match
    const isHttp = isHttpUrl(url)
    const isMailto = !isHttp && isSiiliMailto(url)
    if (!isHttp && !isMailto) continue
    if (match.index > lastIndex) {
      nodes.push(answer.slice(lastIndex, match.index))
    }
    nodes.push(
      isHttp ? (
        <a
          key={`link-${key++}`}
          className={styles.link}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ) : (
        <a key={`link-${key++}`} className={styles.link} href={url}>
          {label}
        </a>
      ),
    )
    lastIndex = match.index + full.length
  }
  if (lastIndex < answer.length) {
    nodes.push(answer.slice(lastIndex))
  }
  return nodes
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { question, answer, sources, loading, error } = message

  return (
    <div className={styles.pair}>
      <div className={styles.questionRow}>
        <div className={styles.questionBubble}>{question}</div>
      </div>
      <div className={styles.answerContainer}>
        {loading ? (
          <div className={styles.loading} role="status" aria-live="polite">
            <div className={styles.loadingBlob} aria-hidden="true" />
            <p className={styles.loadingText}>Haetaan tietoa...</p>
          </div>
        ) : error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : (
          <p className={styles.answer}>{renderAnswer(answer)}</p>
        )}

        {!loading && !error && sources && sources.length > 0 && (
          <div className={styles.references}>
            <p className={styles.referencesLabel}>Lähteet:</p>
            <div className={styles.referenceList}>
              {sources.map((source, index) => (
                <SourceBadge key={`${message.id}-source-${index}`} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
