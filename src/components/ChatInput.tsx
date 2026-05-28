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
 * Value mode:
 * - When `value` and `onValueChange` are both supplied, the input is
 *   controlled by the parent — used in expanded mode so `App` can
 *   persist + restore the active conversation's draft (AC-33b).
 * - When omitted, the input falls back to local state (compact mode
 *   path; CompactView does not need draft persistence because its
 *   value is always empty on first render and cleared on send).
 *
 * Used inside: `CompactView`, `ExpandedView`.
 */

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import styles from '../styles/chatInput.module.css'

interface ChatInputProps {
  variant: 'compact' | 'expanded'
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  /**
   * When this counter increments, focus moves to the textarea (AC-35
   * start-new-conversation hands off to the primary input).
   */
  focusSignal?: number
  value?: string
  onValueChange?: (next: string) => void
  /**
   * Submit handler. Most callers ignore the return value and let
   * `submit()` clear the textarea on the happy path. A caller that
   * intercepts the send (e.g. App's AC-66 terms gate, which queues
   * the message instead of dispatching it) can return `false` to
   * signal "deferred" — `submit()` will then leave the textarea
   * value untouched so the user can continue editing or re-submit
   * after the gate closes. Any other return value (`void`, a
   * `Promise`, a truthy primitive) keeps the existing
   * clear-on-submit behaviour.
   */
  onSend: (message: string) => unknown
  /**
   * Optional trailing slot rendered inside the shell, after the send
   * button. Used in compact mode for the AC-10a continue-pill (Figma
   * `site:395:5439` Continue discussion button container).
   */
  continueAffordance?: ReactNode
}

const DEFAULT_PLACEHOLDER = 'Kysy minulta Siilistä sijoituskohteena.'

export function ChatInput({
  variant,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  autoFocus = false,
  focusSignal,
  value: controlledValue,
  onValueChange,
  onSend,
  continueAffordance,
}: ChatInputProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState('')
  const value = isControlled ? controlledValue : internalValue
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sendButtonRef = useRef<HTMLButtonElement>(null)

  const setValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next)
    }
    onValueChange?.(next)
  }

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    if (focusSignal === undefined || focusSignal < 1) return
    textareaRef.current?.focus()
  }, [focusSignal])

  // Keep textarea height synced when the controlled value changes
  // out-of-band (e.g. activeId switch restores another conversation's
  // draft). On mount this is a no-op for the empty-string default.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    if (value.length > 0) {
      el.style.height = `${Math.min(el.scrollHeight, 240)}px`
    }
  }, [value])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    // AC-66: an explicit `false` return means the caller deferred the
    // send (e.g. App's terms gate intercepted) and the input should
    // be preserved verbatim so the user can keep editing or
    // re-submit after the gate closes. Any other return value
    // (`void`, a Promise, etc.) keeps the existing clear-on-submit
    // behaviour for every other caller.
    if (onSend(trimmed) === false) return
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
              d="M8 1.5V14.5 M2 7.5L8 1.5L14 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
      {continueAffordance}
    </div>
  )
}
