/**
 * Mock implementation of the `ChatService` interface.
 *
 * Simulates a chatbot backend by returning a canned answer and a
 * couple of source references after an ~800ms delay. Replace this
 * file with a real API client (see AGENTS.md > "How to swap the mock
 * for a real API") and update the import in `App.tsx`.
 */

import type { ChatMessage, ChatService } from '../types/index.ts'

const MOCK_ANSWER = `Siili Solutions on suomalainen digitaalisen liiketoiminnan asiantuntijayritys. Yhtiön liiketoiminta jakautuu useisiin segmentteihin, ja sen kasvua tukevat sekä orgaaninen kehitys että strategiset yritysostot.

Tämä on mock-vastaus — kytkemällä oikea backend saat todelliset vastaukset lähdeviittauksineen.`

const MOCK_SOURCES = [
  { label: 'PDF: Vuosikertomus 2025, s.21' },
  { label: 'PDF: Vuosikertomus 2025, s.34' },
]

const DELAY_MS = 800

let idCounter = 0
const nextId = () => `mock-${++idCounter}`

export async function sendMessage(message: string): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  return {
    id: nextId(),
    question: message,
    answer: MOCK_ANSWER,
    sources: MOCK_SOURCES,
    loading: false,
  }
}

const service: ChatService = { sendMessage }
export default service
