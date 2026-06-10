/**
 * Locale string-table contract + aggregator (AC-63). The
 * `WidgetStrings` shape is the single source of truth for which
 * user-facing strings the widget owns; each supported `WidgetLocale`
 * ships a complete table in its own file (`fi.ts`, `en.ts`).
 *
 * `STRINGS` is typed `Record<WidgetLocale, WidgetStrings>`, so adding a
 * locale to `WidgetLocale` without a matching table — or omitting any
 * key from a table — is a `npm run build` (tsc) failure rather than a
 * silent fall-through to Finnish (`tests/i18n.test.tsx` adds the
 * runtime parity guard).
 *
 * Scope per AC-63 / the 2026-06 amendment: ALL text is localized in
 * both languages, including the full `Käyttöehdot` legal body. Backend
 * *answer* locale is owned by AC-63b (externally gated); only the
 * bundled mock answer is localized here for dev parity.
 */

import type { WidgetLocale } from '../types/index.ts'
import { fi } from './fi.ts'
import { en } from './en.ts'

/** A single section of the long-form terms-of-use body. */
export interface TermsSection {
  heading: string
  paragraphs: string[]
}

export interface WidgetStrings {
  // ChatInput
  inputPlaceholder: string
  inputAriaLabel: string
  sendButtonAriaLabel: string

  // CompactView (hero)
  heroTitleLine1: string
  heroTitleLine2: string
  heroSectionAriaLabel: string
  suggestions: string[]

  // ContinuePill
  continueDiscussion: string

  // HeroScrollCue
  scrollCueLabel: string

  // ExpandedView
  expandedTitle: string

  // ChatMessage
  loadingText: string
  sourcesLabel: string

  // CloseButton / MenuButton / MobileMenu
  closeAriaLabel: string
  menuOpenAriaLabel: string
  menuDialogAriaLabel: string

  // PreviousDiscussionList / PreviousDiscussionItem
  newConversationLabel: string
  recentConversationsHeading: string
  neutralConversationLabel: string
  deleteConversationAriaLabel: (label: string) => string

  // ConfirmDialog (AC-33e per-row delete)
  deleteDialogTitle: string
  deleteDialogDescriptionPrefix: string
  deleteDialogDescriptionSuffix: string
  cancelLabel: string
  deleteLabel: string

  // Error fallback (AC-44)
  safeError: string

  // TermsDialog (AC-66 / AC-66b) — chrome
  termsTitle: string
  termsReadMore: string
  termsShowLess: string
  termsAccept: string
  // TermsDialog — legal body (fully localized)
  termsShortBody: string
  termsLongFormSections: TermsSection[]
  termsPrivacySentencePrefix: string
  termsPrivacyLinkText: string

  // Mock chat service (dev-only content)
  mockAnswer: string
  mockSources: { label: string }[]
}

export const STRINGS: Record<WidgetLocale, WidgetStrings> = { fi, en }
