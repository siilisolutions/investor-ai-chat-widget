/**
 * `ChatInput` — shared textarea + send button used in both compact
 * (hero) and expanded (chat) modes. Maps to Figma nodes `146:1015`
 * ("Textarea") and `149:1410` / `149:1441` / `150:396` (Send button
 * Active / Hover / Pressed states).
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

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import styles from '../styles/chatInput.module.css'

interface ChatInputProps {
  variant: 'compact' | 'expanded'
  placeholder?: string
  disabled?: boolean
  onSend: (message: string) => void
}

const DEFAULT_PLACEHOLDER =
  'Kysy minulta mitä vaan Siilistä sijoituskohteena tai taloustiedoistamme.'

export function ChatInput({
  variant,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const shellClassName = [
    styles.shell,
    variant === 'compact' ? styles.shellCompact : styles.shellExpanded,
  ].join(' ')

  return (
    <div className={shellClassName}>
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
