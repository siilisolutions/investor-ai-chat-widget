/**
 * Single source of truth for the user-facing Finnish fallback string
 * shown whenever any part of the chat pipeline fails (network, timeout,
 * malformed payload, ChatService throw). Imported by `App.tsx` and by
 * `services/apiChatService.ts` so the DOM only ever renders this copy —
 * raw `err.message` values are never forwarded (AC-42).
 */

export const SAFE_ERROR =
  'Pahoittelut, en pysty juuri nyt hakemaan vastausta. Yritä hetken kuluttua uudelleen.'
