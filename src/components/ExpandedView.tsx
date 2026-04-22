/**
 * `ExpandedView` — the full chat rendering shown after the first
 * message is sent. Maps to Figma nodes `ds:152:97` ("Investor agent"
 * main component) and `site:143:601` ("AI-agentti" screen frame).
 *
 * Layout: a fixed full-viewport surface (per AC-20a / AC-20b) with a
 * header ("Siili AI-avustaja"), a vertical stack of Q+A pairs, and an
 * in-flow textarea directly below the latest reply (AC-28 / AC-28b).
 * The surface itself is the scroll container — see `.expanded` in
 * `expandedView.module.css` — so the compact → expanded transition
 * does not reflow the host page (AC-20f) and auto-scroll keeps the
 * latest reply and the input visible together (AC-27 / AC-28c).
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
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  useEffect(() => {
    const prefersReduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    inputRef.current?.scrollIntoView({
      behavior: prefersReduce ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages])

  return (
    <div className={styles.expanded}>
      <h2 className={styles.title}>Siili AI-avustaja</h2>
      <div className={styles.messages}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div ref={inputRef} className={styles.inputWrapper}>
        <ChatInput variant="expanded" disabled={loading} onSend={onSend} />
      </div>
    </div>
  )
}
