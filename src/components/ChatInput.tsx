/**
 * `ChatInput` — shared textarea + send button used in both compact
 * (hero) and expanded (chat) modes. Maps to Figma nodes `ds:152:121`
 * ("Textarea") and `ds:152:129` / `ds:152:131` / `ds:152:133` (Send
 * button Active / Hover / Pressed variants of set `ds:152:128`).
 *
 * Variants:
 * - `compact`: translucent white background, no shadow (overlaid on
 *   the hero image).
 * - `expanded`: solid white background with drop shadow (sits on the
 *   white chat surface).
 *
 * The send button's three Figma variants are expressed as CSS
 * `:hover` and `:active` pseudo-classes with the same gradient tokens
 * used in Figma.
 *
 * Used inside: `CompactView`, `ExpandedView`.
 */

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import styles from '../styles/chatInput.module.css'

interface ChatInputProps {
  variant: 'compact' | 'expanded'
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  onSend: (message: string) => void
}

const DEFAULT_PLACEHOLDER =
  'Kysy minulta mitä vaan Siilistä sijoituskohteena tai taloustiedoistamme.'

export function ChatInput({
  variant,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  autoFocus = false,
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sendButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus()
    }
  }, [autoFocus])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const handleShellMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Node | null
    if (!target) return
    if (sendButtonRef.current?.contains(target)) return
    if (target === textareaRef.current) return
    event.preventDefault()
    textareaRef.current?.focus()
  }

  const shellClassName = [
    styles.shell,
    variant === 'compact' ? styles.shellCompact : styles.shellExpanded,
  ].join(' ')

  return (
    <div className={shellClassName} onMouseDown={handleShellMouseDown}>
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          rows={1}
          onInput={(event) => {
            const el = event.currentTarget
            setValue(el.value)
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 240)}px`
          }}
          onKeyDown={handleKeyDown}
          aria-label="Siili investor chatbot message"
        />
      </div>
      <div className={styles.sendRow}>
        <button
          ref={sendButtonRef}
          type="button"
          className={styles.sendButton}
          onClick={submit}
          disabled={disabled || value.trim().length === 0}
          aria-label="Send message"
        >
          <svg
            className={styles.sendIcon}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 13V3M8 3L3 8M8 3L13 8"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
