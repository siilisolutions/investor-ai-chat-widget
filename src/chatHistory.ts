/**
 * `buildHistory` — turns the widget's local `ChatMessage[]` into the
 * flat `ChatTurn[]` shape the real-backend adapter posts to the API
 * (AC-52).
 *
 * Only turns that completed successfully feed the backend's history —
 * loading placeholders and errored pairs are dropped so the model sees
 * a clean conversation. The new user message is always appended last.
 *
 * Extracted from `App.tsx` so it can be exported for AC-52 unit tests
 * without tripping `react-refresh/only-export-components` on the root
 * component module.
 */

import type { ChatMessage, ChatTurn } from './types/index.ts'

export function buildHistory(
  messages: ChatMessage[],
  newQuestion: string,
): ChatTurn[] {
  const turns: ChatTurn[] = []
  for (const m of messages) {
    if (m.loading || m.error || m.answer.length === 0) continue
    turns.push({ role: 'user', content: m.question })
    turns.push({ role: 'assistant', content: m.answer })
  }
  turns.push({ role: 'user', content: newQuestion })
  return turns
}
