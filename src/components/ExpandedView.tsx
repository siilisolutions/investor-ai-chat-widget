/**
 * `ExpandedView` — the full chat rendering shown after the first
 * message is sent. Maps to Figma nodes `ds:152:97` ("Investor agent"
 * main component) and `site:434:2424` ("AI-agentti" screen frame).
 *
 * Layout: a fixed full-viewport surface (per AC-20a / AC-20b) with
 * a header ("Siili AI-avustaja"), an absolutely-positioned close
 * button (AC-20d, Figma `ds:196:853`) at the top-right, and a body
 * row that hosts an optional left sidebar (`PreviousDiscussionList`,
 * AC-33 / Figma `ds:191:258`) plus a content column containing the
 * Q+A stream and a textarea directly below the latest reply
 * (AC-28 / AC-28b). The surface itself is the scroll container so
 * the compact → expanded transition does not reflow the host page
 * (AC-20f) and auto-scroll keeps the latest reply and the input
 * visible together (AC-27 / AC-28c).
 *
 * Sidebar visibility (AC-33 / AC-33c): the sidebar is rendered only
 * when `conversations.length > 1`. With a single conversation the
 * widget falls back to the pre-AC-33 single-column layout.
 *
 * AC-20j — `Esc` pressed anywhere inside the expanded surface
 * dismisses the chat by calling `onClose`. Activation of the close
 * button does the same. Whether dismiss balances the history stack
 * is owned by `App.tsx` based on the `interceptBackNavigation`
 * option.
 *
 * AC-80: the textarea is auto-focused on mount so the first keyboard
 * action lands on the primary input, regardless of whether the
 * sidebar or linked source badges earlier in DOM order are
 * focusable.
 *
 * Used inside: `App`.
 */

import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type {
  ChatMessage as ChatMessageData,
  Conversation,
} from '../types/index.ts'
import { ChatInput } from './ChatInput.tsx'
import { ChatMessage } from './ChatMessage.tsx'
import { CloseButton } from './CloseButton.tsx'
import { PreviousDiscussionList } from './PreviousDiscussionList.tsx'
import styles from '../styles/expandedView.module.css'

interface ExpandedViewProps {
  messages: ChatMessageData[]
  loading: boolean
  draft: string
  onDraftChange: (next: string) => void
  onSend: (message: string) => void
  onClose: () => void
  conversations: Conversation[]
  activeConversationId: string
  onActivateConversation: (id: string) => void
  onStartNewConversation: () => void
  onDeleteConversation: (id: string, label: string) => void
}

export function ExpandedView({
  messages,
  loading,
  draft,
  onDraftChange,
  onSend,
  onClose,
  conversations,
  activeConversationId,
  onActivateConversation,
  onStartNewConversation,
  onDeleteConversation,
}: ExpandedViewProps) {
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

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  const showSidebar = conversations.length > 1

  return (
    <div className={styles.expanded} onKeyDown={handleKeyDown}>
      <CloseButton onClick={onClose} className={styles.closeButton} />
      <h2 className={styles.title}>Siili AI-avustaja</h2>
      <div className={styles.body}>
        {showSidebar && (
          <PreviousDiscussionList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onActivate={onActivateConversation}
            onStartNew={onStartNewConversation}
            onDelete={onDeleteConversation}
          />
        )}
        <div className={styles.contentColumn}>
          <div className={styles.messages}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <div ref={inputRef} className={styles.inputWrapper}>
            <ChatInput
              variant="expanded"
              disabled={loading}
              autoFocus
              value={draft}
              onValueChange={onDraftChange}
              onSend={onSend}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
