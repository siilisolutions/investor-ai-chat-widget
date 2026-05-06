/**
 * `ConfirmDialog` — modal confirmation surface for destructive
 * actions. Maps to Figma node `ds:242:490` (Confirmation dialog);
 * the inner card mirrors the children the design system publishes
 * (title `ds:242:431`, body `ds:242:550` → `ds:242:433`, cancel
 * button `ds:242:438`, destructive confirm button `ds:242:444`). The
 * surrounding overlay + blurred backdrop are code-authored — Figma
 * spec's the card in isolation, not the surrounding viewport
 * treatment, per AC-33e and §2.5 row AC-33e.
 *
 * Per AC-33e the dialog is centered in the viewport over a blurred
 * backdrop covering the rest of the widget surface (the widget
 * fills `100vw × 100vh` in expanded mode per AC-20a, so "rest of
 * the widget surface" is equivalent to "rest of the screen" on
 * every viewport that can reach this affordance — the per-row × is
 * unreachable from compact mode).
 *
 * Cancel paths (all three documented on the AC body):
 * - Cancel button click → `onCancel`.
 * - `Esc` keypress while the dialog has focus → `onCancel`.
 * - Click on the blurred backdrop outside the card → `onCancel`.
 *
 * Focus management:
 * - On open, the previously-focused element is captured and the
 *   cancel button is auto-focused so a stray `Enter` does not
 *   trigger the destructive action.
 * - `Tab` cycles between cancel and confirm only (light focus
 *   trap; the modal has only two interactive elements so this is
 *   sufficient).
 * - On close, focus is restored to the previously-focused element
 *   (typically the row's × button that opened the dialog).
 *
 * AC-N1: plain text and pre-composed `ReactNode` only — no raw
 * HTML injection escape hatches. The bolded conversation label
 * inside the description is composed by the caller as a `<strong>`
 * child.
 *
 * Used inside: `App` (mounted as a sibling of `CompactView` /
 * `ExpandedView` when a per-row delete is pending).
 */

import { useEffect, useId, useRef } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import styles from '../styles/confirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    previouslyFocusedRef.current =
      (document.activeElement as HTMLElement | null) ?? null
    cancelRef.current?.focus()
    return () => {
      previouslyFocusedRef.current?.focus?.()
      previouslyFocusedRef.current = null
    }
  }, [open])

  if (!open) return null

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onCancel()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
      return
    }
    if (event.key !== 'Tab') return
    const cancel = cancelRef.current
    const confirm = confirmRef.current
    if (!cancel || !confirm) return
    const active = document.activeElement
    if (event.shiftKey && active === cancel) {
      event.preventDefault()
      confirm.focus()
    } else if (!event.shiftKey && active === confirm) {
      event.preventDefault()
      cancel.focus()
    }
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <p id={titleId} className={styles.title}>
          {title}
        </p>
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.cancel}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={styles.confirm}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
