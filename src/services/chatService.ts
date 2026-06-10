/**
 * Mock implementation of the `ChatService` interface.
 *
 * Simulates a chatbot backend by returning a canned answer and a
 * couple of source references after an ~800ms delay. Used as the
 * default when `WidgetOptions.apiUrl` is not supplied so local dev
 * works offline (see AC-51). The real adapter lives in
 * `apiChatService.ts`.
 *
 * The canned answer + source labels are pulled from the locale string
 * table so dev parity matches the resolved UI locale (AC-63). Backend
 * answer locale itself is owned by AC-63b and not handled here.
 */

import type { ChatMessage, ChatService, ChatTurn, WidgetLocale } from '../types/index.ts'
import { STRINGS } from '../i18n/strings.ts'

const DELAY_MS = 800

let idCounter = 0
const nextId = () => `mock-${++idCounter}`

function lastUserContent(history: ChatTurn[]): string {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user') return history[i].content
  }
  return ''
}

/**
 * Builds a mock `ChatService` whose canned answer renders in the given
 * locale. `widget.tsx` constructs it with the resolved locale when no
 * `apiUrl` is supplied.
 */
export function createMockService(locale: WidgetLocale = 'fi'): ChatService {
  const { mockAnswer, mockSources } = STRINGS[locale]
  async function sendMessage(history: ChatTurn[]): Promise<ChatMessage> {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    return {
      id: nextId(),
      question: lastUserContent(history),
      answer: mockAnswer,
      sources: mockSources,
      loading: false,
    }
  }
  return { sendMessage }
}

const service: ChatService = createMockService('fi')
export default service
