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
 */
export interface WidgetOptions {
  container: string | HTMLElement
  apiUrl?: string
}
