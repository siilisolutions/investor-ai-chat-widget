/**
 * `ExpandedView` — the full chat rendering shown after the first
 * message is sent. Maps to Figma nodes `ds:152:97` ("Investor agent"
 * main component) and `site:143:601` ("AI-agentti" screen frame).
 *
 * Layout: header ("Siili AI-avustaja"), a vertical stack of Q+A
 * pairs, and a sticky textarea at the bottom for follow-up questions.
 *
 * Auto-scrolls to the newest message whenever `messages` grows.
 *
 * Used inside: `App`.
 */

import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageData } from '../types/index.ts'
import { ChatInput } from './ChatInput.tsx'
import { ChatMessage } from './ChatMessage.tsx'
import styles from '../styles/expandedView.module.css'

interface ExpandedViewProps {
  messages: ChatMessageData[]
  loading: boolean
  onSend: (message: string) => void
}

export function ExpandedView({ messages, loading, onSend }: ExpandedViewProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className={styles.expanded}>
      <h2 className={styles.title}>Siili AI-avustaja</h2>
      <div className={styles.messages}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={endRef} />
      </div>
      <div className={styles.inputWrapper}>
        <ChatInput variant="expanded" disabled={loading} onSend={onSend} />
      </div>
    </div>
  )
}
