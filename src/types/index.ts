/**
 * Shared type definitions for the Siili Investor Chatbot widget.
 *
 * Types defined here are reused across multiple components and the chat
 * service. Component-local prop interfaces live in their respective
 * component files.
 */

/**
 * A single source reference returned with an assistant answer.
 * Rendered as a `SourceBadge` pill in the UI.
 */
export interface Source {
  label: string
  href?: string
}

/**
 * A single chat turn: the user's question and the assistant's answer.
 * While the assistant response is in flight, `loading` is true and
 * `answer` / `sources` may be empty.
 */
export interface ChatMessage {
  id: string
  question: string
  answer: string
  sources?: Source[]
  loading?: boolean
  error?: string
}

/**
 * A single stored conversation in the PD-08 conversation store. The
 * `id` is generated when the conversation is created and never reused.
 * `messages` is the chronological list of completed and in-flight Q+A
 * pairs (the same shape App.tsx renders). `draft` is the textarea
 * value at the moment the user last switched away from this
 * conversation, so re-activating restores it (AC-33b).
 *
 * `label` is intentionally derived rather than stored — the UI
 * computes it from the first user question — so the stored shape
 * stays minimal and survives backend / copy changes without a
 * schema migration.
 */
export interface Conversation {
  id: string
  messages: ChatMessage[]
  draft: string
}

/**
 * Minimal on-the-wire turn posted to the backend. The widget replays
 * the full successful history on every request (see AC-52) so the LLM
 * can reason over prior turns.
 */
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Contract for the chat backend. Swap the mock implementation in
 * `services/chatService.ts` with a real API client that implements
 * this interface.
 *
 * `history` is the chronological list of successfully-completed turns
 * so far, ending with the newest user turn. The adapter is responsible
 * for shaping this into whatever the backend expects (the real adapter
 * posts `{ messages: ChatTurn[] }`).
 */
export interface ChatService {
  sendMessage(history: ChatTurn[]): Promise<ChatMessage>
}

/**
 * Options passed to `SiiliChatbot.init()` when the widget is embedded
 * on the host page.
 *
 * - `container` — selector or element the widget mounts into.
 * - `apiUrl` — optional backend endpoint. When set, the widget posts
 *   `{ messages: ChatTurn[] }` to this URL; when omitted it falls
 *   back to the bundled mock (see AC-04).
 * - `interceptBackNavigation` — when `true` (the default), the widget
 *   pushes a history entry on the compact → expanded transition
 *   (AC-20c) and listens for `popstate` so the browser back button
 *   dismisses expanded mode (AC-20g). Compact-mode back is never
 *   intercepted (AC-20h). Set to `false` to opt out (AC-20i) — the
 *   close button (AC-20d) and `Esc` (AC-20j) still dismiss, but the
 *   browser back button passes through to host-page navigation.
 * - `privacyPolicyUrl` — optional URL the AC-66 *Käyttöehdot* gate's
 *   long-form body links to (Figma `ds:242:551`). When supplied, the
 *   privacy-policy sentence at the end of the long form renders an
 *   anchor with `target="_blank" rel="noopener noreferrer"` (AC-66b,
 *   mirrors AC-25b's link semantics). When omitted, the sentence
 *   stands alone with no broken-looking placeholder. The URL itself
 *   lives on the host page so it can be rotated without a widget
 *   rebuild — same posture as `apiUrl`.
 */
export interface WidgetOptions {
  container: string | HTMLElement
  apiUrl?: string
  interceptBackNavigation?: boolean
  privacyPolicyUrl?: string
}
