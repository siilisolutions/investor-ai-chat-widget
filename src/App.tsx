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
 *   Previous conversations remain in the store and surface as
 *   additional rows in the AC-33 sidebar (which is always
 *   rendered in expanded mode, amended 2026-05).
 * - Confirming a per-row delete (AC-33e) removes the row from the
 *   PD-08 store. Removing the only remaining row mints a fresh
 *   empty conversation as the new active and stays in expanded
 *   mode — the always-visible sidebar requires at least one row.
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
 *
 * Käyttöehdot terms gate (AC-66 / AC-66b / AC-66c): on the very
 * first compact-mode send (textarea or chip) for a browser profile
 * that has not yet accepted, `handleSend` intercepts the call, holds
 * the queued question, and opens `TermsDialog`. *Hyväksyn
 * käyttöehdot* persists acceptance via `termsStore.setAcceptance`
 * and replays the queued send through `dispatchSend`. *Peruuta*
 * (button / `Esc` / backdrop click) closes the dialog without
 * sending — the textarea draft is preserved verbatim because the
 * intercept happens before `dispatchSend` clears it. Once accepted,
 * subsequent sends bypass the gate. Storage failures degrade
 * fail-closed: `setAcceptance` returns `false` and the gate stays
 * up rather than letting the user through.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CompactView } from './components/CompactView.tsx'
import { ConfirmDialog } from './components/ConfirmDialog.tsx'
import { ExpandedView } from './components/ExpandedView.tsx'
import { TermsDialog } from './components/TermsDialog.tsx'
import { buildHistory } from './chatHistory.ts'
import { SAFE_ERROR } from './errorCopy.ts'
import {
  clearConversation,
  createConversation,
  listConversations,
  saveConversation,
} from './services/conversationStore.ts'
import {
  getAcceptance as getTermsAcceptance,
  setAcceptance as setTermsAcceptance,
} from './services/termsStore.ts'
import type { ChatService, Conversation } from './types/index.ts'
import styles from './styles/app.module.css'

const SUGGESTIONS = [
  'Mikä on Siilin strategia ja kuinka sen toteuttaminen on edennyt?',
  'Mikä on yhtiön nykyinen osinkopolitiikka?',
  'Mistä löydän lisätietoa yhtiön liikevaihdosta ja tuloksesta?',
]

type Mode = 'compact' | 'expanded'

let messageCounter = 0
const nextMessageId = () => `msg-${++messageCounter}`

interface AppProps {
  chatService: ChatService
  interceptBackNavigation?: boolean
  privacyPolicyUrl?: string
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

interface PendingDelete {
  id: string
  label: string
}

export function App({
  chatService,
  interceptBackNavigation = true,
  privacyPolicyUrl,
}: AppProps) {
  const [mode, setMode] = useState<Mode>('compact')
  const [{ conversations, activeId }, setStore] =
    useState<ConversationState>(initializeStore)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  // AC-66 / AC-66c — terms gate state. `termsAccepted` is hydrated
  // from localStorage on first render so a returning profile bypasses
  // the gate immediately; `pendingQuestion` holds the queued send
  // while the gate is open so accepting can replay it.
  const [termsAccepted, setTermsAcceptedState] = useState<boolean>(
    getTermsAcceptance,
  )
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
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

  // Internal — the network-and-state path. Assumes the AC-66 terms
  // gate has already been satisfied (or doesn't apply for this
  // profile). `handleSend` below is the gated wrapper called by
  // `CompactView` / `ExpandedView`; `handleAcceptTerms` calls this
  // directly when replaying the queued send so it doesn't re-enter
  // the gate.
  const dispatchSend = useCallback(
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

  // AC-66 — gated wrapper. On the first compact-mode send for a
  // profile that hasn't yet accepted, hold the queued question and
  // open the terms dialog instead of dispatching. The textarea
  // draft is naturally preserved because (a) we never reach
  // `dispatchSend`'s `draft: ''` write for the expanded-mode
  // controlled path, and (b) returning `false` synchronously tells
  // `ChatInput.submit()` to skip its own clear-on-submit step for
  // the uncontrolled compact-mode textarea. Once acceptance is
  // recorded (in localStorage and `termsAccepted` state), this
  // branch is bypassed for the rest of the profile's lifetime.
  const handleSend = useCallback(
    (question: string): false | Promise<void> => {
      if (!termsAccepted) {
        setPendingQuestion(question)
        return false
      }
      return dispatchSend(question)
    },
    [dispatchSend, termsAccepted],
  )

  // AC-66 / AC-66c — accept handler. Persists the acceptance flag
  // (fail-closed: if the storage write reports failure we leave the
  // gate up rather than letting the user through), updates in-memory
  // state, and replays any queued send through `dispatchSend` so the
  // gate-free path runs even though the closure-over-`termsAccepted`
  // in `handleSend` may not have re-rendered yet.
  const handleAcceptTerms = useCallback(() => {
    const persisted = setTermsAcceptance(true)
    if (!persisted) return
    setTermsAcceptedState(true)
    const queued = pendingQuestion
    setPendingQuestion(null)
    if (queued !== null) {
      void dispatchSend(queued)
    }
  }, [dispatchSend, pendingQuestion])

  // AC-66 — cancel handler. Drops the queued question and closes the
  // dialog. The compact textarea draft is preserved automatically
  // because `dispatchSend` (which would have cleared it) was never
  // called.
  const handleCancelTerms = useCallback(() => {
    setPendingQuestion(null)
  }, [])

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

  // AC-33e — open the confirmation modal for a row's `×` activation.
  // The label is captured at click time so the modal copy doesn't
  // need to re-derive it from the conversation array.
  const handleDeleteConversation = useCallback(
    (id: string, label: string) => {
      setPendingDelete({ id, label })
    },
    [],
  )

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null)
  }, [])

  // AC-33e — confirm deletion: remove the row from PD-08 and update
  // the in-memory store. If the removed row was active, switch the
  // active conversation to the next-most-recent remaining row
  // (mirrors AC-33b activation semantics — state-only, no service
  // call). When the removed row is the *only* remaining
  // conversation, mint a fresh empty conversation as the new active
  // and stay in expanded mode — the AC-33 always-visible-sidebar
  // invariant requires at least one row at all times. The
  // replacement is constructed up-front (outside the setStore
  // updater) so the side effect doesn't double-fire under
  // StrictMode.
  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) return
    const removedId = pendingDelete.id
    const willBeEmpty =
      conversations.length === 1 && conversations[0].id === removedId
    const replacement = willBeEmpty ? createConversation() : null

    clearConversation(removedId)
    setPendingDelete(null)

    setStore((prev) => {
      const remaining = prev.conversations.filter((c) => c.id !== removedId)
      if (remaining.length === 0 && replacement) {
        return { conversations: [replacement], activeId: replacement.id }
      }
      if (remaining.length === 0) {
        return prev
      }
      return {
        conversations: remaining,
        activeId:
          prev.activeId === removedId
            ? remaining[remaining.length - 1].id
            : prev.activeId,
      }
    })
  }, [pendingDelete, conversations])

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
          onDeleteConversation={handleDeleteConversation}
        />
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Poista keskustelu"
        description={
          <>
            Haluatko varmasti poistaa keskustelun{' '}
            <strong>{pendingDelete?.label}</strong>?
          </>
        }
        cancelLabel="Peruuta"
        confirmLabel="Poista"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      <TermsDialog
        open={pendingQuestion !== null}
        onAccept={handleAcceptTerms}
        onCancel={handleCancelTerms}
        privacyPolicyUrl={privacyPolicyUrl}
      />
    </div>
  )
}
