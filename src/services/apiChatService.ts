/**
 * Real `ChatService` adapter for the Siili investor chatbot backend
 * (Azure Function). Posts the full conversation history as
 * `{ messages: ChatTurn[] }` and maps the response `{ response: string,
 * sources?: Source[] }` back into a `ChatMessage` (AC-52, AC-53).
 *
 * Aborts in-flight requests after a fixed timeout (AC-43) and maps
 * all failure modes — non-2xx, network errors, malformed JSON — to a
 * single user-safe Finnish string (AC-44). Raw errors are logged to
 * the console only in dev builds (AC-42).
 */

import type {
  ChatMessage,
  ChatService,
  ChatTurn,
  Source,
} from '../types/index.ts'

const TIMEOUT_MS = 30_000

const SAFE_ERROR =
  'Pahoittelut, en pysty juuri nyt hakemaan vastausta. Yritä hetken kuluttua uudelleen.'

function generateId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function lastUserContent(history: ChatTurn[]): string {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user') return history[i].content
  }
  return ''
}

function logDev(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.error('[SiiliChatbot]', ...args)
  }
}

function coerceSources(value: unknown): Source[] | undefined {
  if (!Array.isArray(value)) return undefined
  const out: Source[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    if (typeof rec.label !== 'string') continue
    const src: Source = { label: rec.label }
    if (typeof rec.href === 'string') src.href = rec.href
    out.push(src)
  }
  return out.length > 0 ? out : undefined
}

export function createApiChatService(apiUrl: string): ChatService {
  const endpoint = apiUrl

  async function sendMessage(history: ChatTurn[]): Promise<ChatMessage> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })
    } catch (err) {
      logDev('network or timeout error', err)
      throw new Error(SAFE_ERROR)
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      logDev('non-2xx response', response.status, response.statusText)
      throw new Error(SAFE_ERROR)
    }

    let body: unknown
    try {
      body = await response.json()
    } catch (err) {
      logDev('response body was not valid JSON', err)
      throw new Error(SAFE_ERROR)
    }

    if (!body || typeof body !== 'object') {
      logDev('response body was not an object', body)
      throw new Error(SAFE_ERROR)
    }
    const rec = body as Record<string, unknown>
    const answer = rec.response
    if (typeof answer !== 'string') {
      logDev('response.response was not a string', rec)
      throw new Error(SAFE_ERROR)
    }

    const sources = coerceSources(rec.sources)

    const message: ChatMessage = {
      id: generateId(),
      question: lastUserContent(history),
      answer,
      loading: false,
    }
    if (sources) message.sources = sources
    return message
  }

  return { sendMessage }
}
