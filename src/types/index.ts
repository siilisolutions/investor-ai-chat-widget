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
 * Contract for the chat backend. Swap the mock implementation in
 * `services/chatService.ts` with a real API client that implements
 * this interface.
 */
export interface ChatService {
  sendMessage(message: string): Promise<ChatMessage>
}

/**
 * Options passed to `SiiliChatbot.init()` when the widget is embedded
 * on the host page.
 */
export interface WidgetOptions {
  container: string | HTMLElement
}
