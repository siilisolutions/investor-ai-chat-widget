/**
 * Mock implementation of the `ChatService` interface.
 *
 * Simulates a chatbot backend by returning a canned Finnish answer
 * and a couple of source references after an ~800ms delay. Used as
 * the default when `WidgetOptions.apiUrl` is not supplied so local
 * dev works offline (see AC-51). The real adapter lives in
 * `apiChatService.ts`.
 */

import type { ChatMessage, ChatService, ChatTurn } from '../types/index.ts'

const MOCK_ANSWER = `Siili Solutions on suomalainen digitaalisen liiketoiminnan asiantuntijayritys. Yhtiön liiketoiminta jakautuu useisiin segmentteihin, ja sen kasvua tukevat sekä orgaaninen kehitys että strategiset yritysostot.

Tämä on mock-vastaus — kytkemällä oikea backend saat todelliset vastaukset lähdeviittauksineen.`

const MOCK_SOURCES = [
  { label: 'PDF: Vuosikertomus 2025, s.21' },
  { label: 'PDF: Vuosikertomus 2025, s.34' },
]

const DELAY_MS = 800

let idCounter = 0
const nextId = () => `mock-${++idCounter}`

function lastUserContent(history: ChatTurn[]): string {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user') return history[i].content
  }
  return ''
}

export async function sendMessage(history: ChatTurn[]): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  return {
    id: nextId(),
    question: lastUserContent(history),
    answer: MOCK_ANSWER,
    sources: MOCK_SOURCES,
    loading: false,
  }
}

const service: ChatService = { sendMessage }
export default service
