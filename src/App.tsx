/**
 * `App` — root component and state machine for the Siili investor
 * chatbot. Owns:
 * - `mode`: 'compact' | 'expanded' (flips to expanded on first send
 *   or on continue-pill activation)
 * - `conversations`: every Q+A thread the user has had in this
 *   browser profile (persisted to `localStorage` per PD-08)
 * - `activeId`: id of the conversation currently being shown
 *
 * Delegates network I/O to the `ChatService` passed in by `widget.tsx`
 * (the composition root picks mock vs. real based on
 * `WidgetOptions.apiUrl`). The full history of successfully-completed
 * turns of the *active* conversation is replayed on every send so the
 * backend LLM can reason over prior turns (AC-52).
 *
 * Multi-conversation contract (AC-33 cluster + AC-31f):
 * - The store is hydrated from `localStorage` on mount; if empty,
 *   one fresh conversation is created so the user always has a
 *   container to send into. The most-recent stored conversation is
 *   chosen as the initial `activeId` so the AC-10c continue-pill
 *   activation and the AC-31f auto-mint precondition both target
 *   the right thread.
 * - Compact-mode sends mint a fresh conversation when the active
 *   conversation already has Q+A pairs (AC-31f). Sending into an
 *   empty active conversation appends to it rather than minting a
 *   duplicate (typical for the first-ever send in a new browser
 *   profile).
 * - The hero continue-pill (AC-10a / AC-10c, Figma `site:395:5439`)
 *   re-enters expanded mode pointing at the most-recent stored
 *   conversation; subsequent sends append under AC-29.
 * - Activating a row in the sidebar (AC-33b) flips `activeId` only —
 *   no network call is made until the next send. Each conversation
 *   carries its own `draft` (the textarea value at the moment the
 *   user last switched away), and the controlled `ChatInput` reads
 *   the active conversation's draft on every render so re-activation
 *   restores it.
 * - Starting a new conversation from inside expanded mode (AC-35)
 *   mints an id, saves an empty entry, and sets it as active.
 *   Previous conversations remain in the store and surface in the
 *   sidebar from the moment a second conversation exists.
 *
 * Back-navigation contract (AC-20c / AC-20g / AC-20h / AC-20i):
 * when `interceptBackNavigation` is on (default), the compact →
 * expanded transition pushes a synthetic history entry tagged
 * `siiliExpanded`. A `popstate` listener watches for that entry being
 * popped and dismisses expanded mode. The dismiss flow (AC-20j —
 * close button, `Esc`) routes through `dismissExpanded`, which calls
 * `history.back()` so the synthetic entry is balanced rather than
 * leaked. Compact-mode back is never intercepted (AC-20h).
 *
 * Conversation contents are intentionally never cleared on dismissal
 * (AC-31). Persistence across tab close and browser restart is
 * satisfied by the `localStorage` choice in PD-08 (AC-31e); the
 * earlier "tab close clears" contract (AC-31c) is tombstoned.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CompactView } from './components/CompactView.tsx'
import { ExpandedView } from './components/ExpandedView.tsx'
import { buildHistory } from './chatHistory.ts'
import { SAFE_ERROR } from './errorCopy.ts'
import {
  createConversation,
  listConversations,
  saveConversation,
} from './services/conversationStore.ts'
import type { ChatService, Conversation } from './types/index.ts'
import styles from './styles/app.module.css'

const SUGGESTIONS = [
  'Missä liiketoimintasegmenteissä yhtiö toimii, ja mihin kukin segmentti keskittyy?',
  'Mikä on yhtiön nykyinen osinkopolitiikka?',
  'Miten liikevaihdon kasvu kehittyy, ja mitkä tekijät vaikuttavat vuosi vuodelta tapahtuneisiin muutoksiin?',
]

type Mode = 'compact' | 'expanded'

let messageCounter = 0
const nextMessageId = () => `msg-${++messageCounter}`

interface AppProps {
  chatService: ChatService
  interceptBackNavigation?: boolean
}

const HISTORY_MARKER = 'siiliExpanded'

interface ConversationState {
  conversations: Conversation[]
  activeId: string
}

function initializeStore(): ConversationState {
  const stored = listConversations()
  if (stored.length > 0) {
    // AC-31f / AC-10c — land on the most-recent conversation so the
    // continue-pill re-enters the right thread and auto-mint sees the
    // expected `messages.length > 0` state on the next compact send.
    return {
      conversations: stored,
      activeId: stored[stored.length - 1].id,
    }
  }
  const initial = createConversation()
  return { conversations: [initial], activeId: initial.id }
}

export function App({ chatService, interceptBackNavigation = true }: AppProps) {
  const [mode, setMode] = useState<Mode>('compact')
  const [{ conversations, activeId }, setStore] =
    useState<ConversationState>(initializeStore)
  const pushedRef = useRef(false)

  // Memoized so each derived reference is stable when neither the
  // conversations array nor the active id changed; this keeps
  // `handleSend`'s useCallback dependency on `messages` stable
  // (avoids re-creating the handler on every render and silences the
  // react-hooks/exhaustive-deps lint).
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId],
  )
  const messages = useMemo(
    () => activeConversation?.messages ?? [],
    [activeConversation],
  )
  const draft = activeConversation?.draft ?? ''
  const loading = messages.some((m) => m.loading)

  // AC-20c — push a synthetic history entry on compact → expanded so
  // the next browser-back gesture dismisses the chat instead of
  // navigating away from the host page.
  useEffect(() => {
    if (!interceptBackNavigation) return
    if (mode !== 'expanded') return
    if (pushedRef.current) return
    if (typeof history === 'undefined') return
    history.pushState({ [HISTORY_MARKER]: true }, '')
    pushedRef.current = true
  }, [mode, interceptBackNavigation])

  // AC-20g — popstate dismisses expanded mode.
  useEffect(() => {
    if (!interceptBackNavigation) return
    function onPopState() {
      pushedRef.current = false
      setMode((m) => (m === 'expanded' ? 'compact' : m))
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [interceptBackNavigation])

  // AC-20j — close button / Esc dismiss path.
  const dismissExpanded = useCallback(() => {
    if (interceptBackNavigation && pushedRef.current) {
      history.back()
      return
    }
    setMode('compact')
  }, [interceptBackNavigation])

  // Internal helper: update one conversation (immutably) and persist
  // it. Used by handleSend's three branches (append loading
  // placeholder, replace with answer, replace with error) and by the
  // draft persistence path (AC-33b).
  const updateConversation = useCallback(
    (id: string, updater: (conversation: Conversation) => Conversation) => {
      setStore((prev) => {
        let saved: Conversation | null = null
        const next = prev.conversations.map((c) => {
          if (c.id !== id) return c
          const updated = updater(c)
          saved = updated
          return updated
        })
        if (saved) saveConversation(saved)
        return { ...prev, conversations: next }
      })
    },
    [],
  )

  // AC-33b — persist the textarea draft on the active conversation so
  // switching away and back restores it. The store write happens
  // synchronously on every keystroke via `saveConversation`.
  const handleDraftChange = useCallback(
    (next: string) => {
      updateConversation(activeId, (c) => ({ ...c, draft: next }))
    },
    [activeId, updateConversation],
  )

  const handleSend = useCallback(
    async (question: string) => {
      const turnId = nextMessageId()
      // AC-31f — compact-mode send mints a fresh conversation when
      // the active one already holds Q+A pairs, so each hero-initiated
      // chat starts a new thread. Sending into an empty active
      // conversation (typical of the very first send in a new browser
      // profile) appends rather than minting a duplicate.
      let targetId = activeId
      let baseMessages = messages
      if (mode === 'compact' && messages.length > 0) {
        const fresh = createConversation()
        setStore((prev) => ({
          conversations: [...prev.conversations, fresh],
          activeId: fresh.id,
        }))
        targetId = fresh.id
        baseMessages = []
      }
      const turnHistory = buildHistory(baseMessages, question)
      setMode('expanded')
      // Append the loading placeholder and clear the draft for this
      // conversation (the user just submitted the value the textarea
      // held). One write covers both so persisted state stays
      // consistent.
      updateConversation(targetId, (c) => ({
        ...c,
        draft: '',
        messages: [
          ...c.messages,
          { id: turnId, question, answer: '', loading: true },
        ],
      }))

      try {
        const response = await chatService.sendMessage(turnHistory)
        updateConversation(targetId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === turnId
              ? {
                  ...m,
                  answer: response.answer,
                  sources: response.sources,
                  loading: false,
                }
              : m,
          ),
        }))
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[SiiliChatbot]', err)
        }
        updateConversation(targetId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === turnId ? { ...m, loading: false, error: SAFE_ERROR } : m,
          ),
        }))
      }
    },
    [activeId, chatService, messages, mode, updateConversation],
  )

  // AC-10c — activate the continue-pill: re-enter expanded mode
  // pointing at the most-recent conversation that has Q+A pairs. No
  // network call; subsequent sends append under AC-29 because mode
  // is now 'expanded' before the AC-31f auto-mint precondition is
  // checked.
  const handleContinue = useCallback(() => {
    setStore((prev) => {
      for (let i = prev.conversations.length - 1; i >= 0; i -= 1) {
        if (prev.conversations[i].messages.length > 0) {
          return { ...prev, activeId: prev.conversations[i].id }
        }
      }
      return prev
    })
    setMode('expanded')
  }, [])

  const hasHistory = useMemo(
    () => conversations.some((c) => c.messages.length > 0),
    [conversations],
  )

  // AC-33b — activate a previous conversation. State only; no
  // network call.
  const handleActivateConversation = useCallback((id: string) => {
    setStore((prev) =>
      prev.conversations.some((c) => c.id === id)
        ? { ...prev, activeId: id }
        : prev,
    )
  }, [])

  // AC-35 — start a fresh conversation. Mints an id via the store,
  // appends to the array, and flips the active id.
  const handleStartNewConversation = useCallback(() => {
    const fresh = createConversation()
    setStore((prev) => ({
      conversations: [...prev.conversations, fresh],
      activeId: fresh.id,
    }))
  }, [])

  return (
    <div className={`siiliChatbot ${styles.root}`}>
      {mode === 'compact' ? (
        <CompactView
          suggestions={SUGGESTIONS}
          onSend={handleSend}
          hasHistory={hasHistory}
          onContinue={handleContinue}
        />
      ) : (
        <ExpandedView
          messages={messages}
          loading={loading}
          draft={draft}
          onDraftChange={handleDraftChange}
          onSend={handleSend}
          onClose={dismissExpanded}
          conversations={conversations}
          activeConversationId={activeId}
          onActivateConversation={handleActivateConversation}
          onStartNewConversation={handleStartNewConversation}
        />
      )}
    </div>
  )
}
