/**
 * `ExpandedView` — the full chat rendering shown after the first
 * message is sent. Maps to Figma node `143:753` ("Investor agent").
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
