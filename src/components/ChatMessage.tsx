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
 * The answer body is plain text per AC-N1, with the single narrow
 * exception of inline `[title](URL)` autolinks (AC-24b): tokens whose
 * URL is `http`/`https` become real `<a>` React children (built as
 * JSX, never by injecting raw HTML). Any other scheme, and every
 * other Markdown/HTML construct, stays escaped plain text.
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

function isSafeHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/**
 * Splits an answer string into plain-text segments and `<a>` elements
 * for inline `[title](URL)` tokens (AC-24b). Only `http`/`https` URLs
 * are linkified; every other token — unsafe schemes, `**bold**`, raw
 * HTML, etc. — is left untouched as escaped plain text (AC-N1). Text
 * segments keep their newlines, which the `pre-wrap` answer style
 * renders as paragraph breaks (AC-24).
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
    if (!isSafeHttpUrl(url)) continue
    if (match.index > lastIndex) {
      nodes.push(answer.slice(lastIndex, match.index))
    }
    nodes.push(
      <a
        key={`link-${key++}`}
        className={styles.link}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>,
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
