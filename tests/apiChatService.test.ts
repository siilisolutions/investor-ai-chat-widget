/**
 * Tests for `createApiChatService`, the real-backend adapter in
 * `src/services/apiChatService.ts`. Covers:
 *
 *   AC-43 — 30 s network timeout aborts the request and maps to SAFE_ERROR.
 *   AC-44 — non-2xx, network, non-JSON, and schema-violating responses
 *           all map to a single user-safe Finnish string; no leakage of
 *           status codes, URLs, or payload bodies.
 *   AC-52 — POSTs `{ messages: ChatTurn[] }` to the configured URL,
 *           preserving chronological order.
 *   AC-53 — maps `{ response }` → ChatMessage; ignores unknown fields;
 *           forward-compatibly surfaces `sources` when present and
 *           drops malformed source entries.
 *
 * Per GOV-13 every test name quotes the AC intent.
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest'
import { createApiChatService } from '../src/services/apiChatService'
import { SAFE_ERROR } from '../src/errorCopy'
import type { ChatTurn } from '../src/types/index'

const API_URL = 'https://example.test/api/chat'

let fetchMock: MockInstance<typeof fetch>

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, 'fetch') as unknown as MockInstance<typeof fetch>
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('createApiChatService', () => {
  it('AC-52: POSTs `{ messages: ChatTurn[] }` to the configured URL in chronological order', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ response: 'ok' }))
    const history: ChatTurn[] = [
      { role: 'user', content: 'q1' },
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'q2' },
    ]
    await createApiChatService(API_URL).sendMessage(history)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(API_URL)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ messages: history })
  })

  it('AC-53: maps `{ response }` to a ChatMessage using the last user turn as the question', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ response: 'Siili answer.' }))
    const result = await createApiChatService(API_URL).sendMessage([
      { role: 'user', content: 'What?' },
    ])
    expect(result.question).toBe('What?')
    expect(result.answer).toBe('Siili answer.')
    expect(result.loading).toBe(false)
    expect(typeof result.id).toBe('string')
    expect(result.id.length).toBeGreaterThan(0)
    expect(result.sources).toBeUndefined()
  })

  it('AC-53: ignores unknown fields in the response body', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        response: 'answer',
        conversationId: 'abc',
        timestamp: 123,
        future_flag: true,
      }),
    )
    const result = await createApiChatService(API_URL).sendMessage([
      { role: 'user', content: 'q' },
    ])
    expect(result.answer).toBe('answer')
    expect((result as unknown as Record<string, unknown>).conversationId).toBeUndefined()
  })

  it('AC-53: surfaces `sources` forward-compatibly when the backend starts returning them', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        response: 'answer',
        sources: [
          { label: 'Vuosikertomus 2025', href: 'https://example.test/ar.pdf' },
          { label: 'Internal source' },
        ],
      }),
    )
    const result = await createApiChatService(API_URL).sendMessage([
      { role: 'user', content: 'q' },
    ])
    expect(result.sources).toEqual([
      { label: 'Vuosikertomus 2025', href: 'https://example.test/ar.pdf' },
      { label: 'Internal source' },
    ])
  })

  it('AC-53: drops malformed source entries instead of failing the whole request', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        response: 'answer',
        sources: [
          { label: 'keep me' },
          { href: 'no-label.pdf' },
          null,
          'not-an-object',
          { label: 42 },
        ],
      }),
    )
    const result = await createApiChatService(API_URL).sendMessage([
      { role: 'user', content: 'q' },
    ])
    expect(result.sources).toEqual([{ label: 'keep me' }])
  })

  it('AC-53: returns undefined sources when the array is present but empty after coercion', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ response: 'answer', sources: [] }),
    )
    const result = await createApiChatService(API_URL).sendMessage([
      { role: 'user', content: 'q' },
    ])
    expect(result.sources).toBeUndefined()
  })

  it('AC-44: non-2xx responses reject with the SAFE_ERROR string, no status code leakage', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 }),
    )
    await expect(
      createApiChatService(API_URL).sendMessage([{ role: 'user', content: 'q' }]),
    ).rejects.toThrow(SAFE_ERROR)
  })

  it('AC-44: network failures reject with the SAFE_ERROR string', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(
      createApiChatService(API_URL).sendMessage([{ role: 'user', content: 'q' }]),
    ).rejects.toThrow(SAFE_ERROR)
  })

  it('AC-44: non-JSON body rejects with the SAFE_ERROR string', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<html>not-json</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }),
    )
    await expect(
      createApiChatService(API_URL).sendMessage([{ role: 'user', content: 'q' }]),
    ).rejects.toThrow(SAFE_ERROR)
  })

  it('AC-44: body missing `response` field rejects with the SAFE_ERROR string', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ foo: 'bar' }))
    await expect(
      createApiChatService(API_URL).sendMessage([{ role: 'user', content: 'q' }]),
    ).rejects.toThrow(SAFE_ERROR)
  })

  it('AC-44: body with non-string `response` rejects with the SAFE_ERROR string', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ response: 42 }))
    await expect(
      createApiChatService(API_URL).sendMessage([{ role: 'user', content: 'q' }]),
    ).rejects.toThrow(SAFE_ERROR)
  })

  it('AC-43: request aborted after 30s rejects with the SAFE_ERROR string', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementationOnce(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal
          if (signal) {
            signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'))
            })
          }
        }),
    )

    const promise = createApiChatService(API_URL).sendMessage([
      { role: 'user', content: 'q' },
    ])
    const asserted = expect(promise).rejects.toThrow(SAFE_ERROR)
    await vi.advanceTimersByTimeAsync(30_000)
    await asserted
  })
})
