/**
 * `ChatMessage` — a single Q+A pair rendered in the expanded chat
 * view. Maps to Figma nodes `147:1129` ("Question + Answer") and
 * `201:2280` (loading state with "Haetaan tietoa...").
 *
 * Renders:
 * - The user's question as a right-aligned gray bubble
 * - Either the assistant's answer, the loading indicator, or an
 *   error message
 * - An optional list of source badges under the "Lähteet:" label
 *
 * Used inside: `ExpandedView`.
 */

import type { ChatMessage as ChatMessageData } from '../types/index.ts'
import { SourceBadge } from './SourceBadge.tsx'
import styles from '../styles/chatMessage.module.css'

interface ChatMessageProps {
  message: ChatMessageData
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
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.loadingText}>Haetaan tietoa...</p>
          </div>
        ) : error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : (
          <p className={styles.answer}>{answer}</p>
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
