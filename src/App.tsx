/**
 * `App` — root component and state machine for the Siili investor
 * chatbot. Owns:
 * - `mode`: 'compact' | 'expanded' (flips to expanded on first send)
 * - `messages`: chronological list of Q+A pairs
 *
 * Delegates network I/O to the `ChatService` (mock by default, see
 * `src/services/chatService.ts`).
 */

import { useCallback, useState } from 'react'
import { CompactView } from './components/CompactView.tsx'
import { ExpandedView } from './components/ExpandedView.tsx'
import { sendMessage } from './services/chatService.ts'
import type { ChatMessage } from './types/index.ts'
import styles from './styles/app.module.css'

const SUGGESTIONS = [
  'Missä liiketoimintasegmenteissä yhtiö toimii, ja mihin kukin segmentti keskittyy?',
  'Mikä on yhtiön nykyinen osinkopolitiikka?',
  'Miten liikevaihdon kasvu kehittyy, ja mitkä tekijät vaikuttavat vuosi vuodelta tapahtuneisiin muutoksiin?',
]

type Mode = 'compact' | 'expanded'

let messageCounter = 0
const nextId = () => `msg-${++messageCounter}`

export function App() {
  const [mode, setMode] = useState<Mode>('compact')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = useCallback(async (question: string) => {
    const id = nextId()
    setMode('expanded')
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      { id, question, answer: '', loading: true },
    ])

    try {
      const response = await sendMessage(question)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, answer: response.answer, sources: response.sources, loading: false }
            : m
        )
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Pahoittelut, jokin meni pieleen.'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, loading: false, error: errorMessage } : m
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className={`siiliChatbot ${styles.root}`}>
      {mode === 'compact' ? (
        <CompactView suggestions={SUGGESTIONS} onSend={handleSend} />
      ) : (
        <ExpandedView messages={messages} loading={loading} onSend={handleSend} />
      )}
    </div>
  )
}
