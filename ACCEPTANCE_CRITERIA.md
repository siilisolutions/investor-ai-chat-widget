# Acceptance Criteria — Siili Investor Chatbot Widget

> Source of truth for "is this feature done?" decisions. Read alongside
> [`AGENTS.md`](AGENTS.md) (architecture, tokens, Figma nodes) and the
> two Figma files — [IR-site](https://www.figma.com/design/0xXdKUlBJIolF15MjJuaMC/IR-site)
> (screen layouts) and [IR-DS](https://www.figma.com/design/rlh00CEImhMWwdRNOUqW6L/IR-DS)
> (component library) — as the visual ground truth. When criteria here
> conflict with Figma on visual details, Figma wins and this document
> must be updated.

> **Where the rest of the spec lives.** This file is the always-on entry
> point: the AC Catalog (every `AC-xx` index row), §2.5 Figma Manifest,
> §11 Definition of Done, §12 Non-Goals (incl. AC-N1 / AC-N2 bodies),
> and §13 Traceability. The Given/When/Then bodies for §§1–10 live in
> [`ACCEPTANCE_CRITERIA_BODIES.md`](ACCEPTANCE_CRITERIA_BODIES.md) — the
> Section column in the catalog below links into that file. Conventions
> for adding, editing, splitting, deprecating, or tombstoning ACs (the
> former §10.5 + §10.6) live in
> [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc), a
> globs-scoped rule that loads only when an agent is editing the spec
> or the backlog.

## AC Catalog

Flat index of every `AC-xx` in this document. Use it to locate an AC by
ID without scrolling the full spec. The AC body remains the source of
truth — this table only summarises and links. Keep one row per ID; when
a new AC is minted or an existing one is renamed, update the row here
in the same PR.

Status values:

- `active` — AC is in force.
- `deprecated` — AC has been retired in place (tombstoned); see the AC
  body for the replacement ID.
- `superseded` — AC has been replaced by a newer ID that subsumes its
  behaviour; see the AC body for the successor.

### Stability markers

Every AC also carries exactly one stability marker, both inline on the
AC heading (e.g. trailing `· **@stable**`) and in the `Stability`
column of the catalog below. Stability tells reviewers (human or AI)
how hard to push back on a change that touches the AC:

- `@stable` — behaviour is shipped and known to work; regressions are
  bugs. Default tag for ACs whose implementation is observable today
  and has not been flagged as churning. **Specificity licence:** the
  AC body may pin exact copy, token slots, pixel / count / duration
  values, and specific Figma nodes (via §2.5). Changes are real
  contract changes — amend per [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) §Amending ACs.
- `@evolving` — actively being refined; spec and code may drift by
  design. Use when the AC is partially implemented, being iterated on,
  or awaiting a measurement / audit step before it can be called
  stable. Prefer this over `@stable` when unsure. **Specificity
  licence:** describe *intent* only — avoid exact tokens, exact copy
  (use `e.g. "…"`), exact pixel values, exact counts. Promote to
  `@stable` when the design locks. See [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) §AC Authoring.
- `@aspirational` — target state, not yet implemented or verified.
  Typical for ACs that depend on a system we do not yet have (real
  backend, localisation, analytics pipeline) or for features that are
  planned but unbuilt. **Specificity licence:** describe the
  user-visible goal and acceptance path only. Do not pin interactive
  details, aria-labels, hit-target pixels, or copy strings the design
  has not yet produced. See [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) §AC Authoring.
  - **Sub-marker — `(externally gated)`:** an `@aspirational` AC may
    additionally carry `(externally gated)` when its unshipped
    behaviour depends on a system this repository does not own
    (backend retrieval / guardrails / moderation, localisation
    toggle, host-page Lighthouse, analytics event contract, etc.).
    The full inline tag reads `**@aspirational (externally gated)**`
    on the AC heading and `@aspirational (externally gated)` in the
    catalog Stability column. Externally-gated ACs do **not** count
    against the internal stabilisation budget reported in
    completion-log entries — they cannot graduate from inside this
    repo until the external contract lands — but each body must name
    the external owner (backend team, product, host-page integration,
    …) on an `**Owner:**` line so the dependency is explicit rather
    than implicit. Once the external contract ships, the AC is
    promoted by dropping the sub-marker (typically graduating to
    `@evolving` first, then `@stable` once the widget-side slice
    lands and verifies).

Stability is orthogonal to Status: an `active` AC can be
`@aspirational` (we mean to ship it but haven't), and a `deprecated`
AC keeps whatever marker it carried when it was retired.

Completion-log entries that report catalog stability break out the
externally-gated bucket separately, e.g. `57 @stable / 14 @evolving /
15 @aspirational / 9 @aspirational (externally gated)`, so the
internally-actionable backlog is visible at a glance.

Verification values (added GOV-07) name the cheapest credible path to
confirm the AC:

- `Automated: …` — a command or grep the CI / a human can run and get a
  pass/fail out of (e.g. `npm run build`, `npm run lint`, `rg` over
  `src/`). Per-test references use the shorthand
  `Automated: tests/<file>.test.tsx — <intent>`; run via
  `npm run test -- tests/<file>.test.tsx` per
  [`.cursor/rules/verification.mdc`](.cursor/rules/verification.mdc).
- `Manual: …` — a concrete dev-harness step in `npm run dev` or the
  browser DevTools. The AC is verified by a human performing that step
  and observing the documented outcome.
- `Visual: Figma <node>` — compare the implementation against the named
  Figma node via `get_design_context` per §2.5 Figma Manifest and the
  Figma-first workflow in [`AGENTS.md`](AGENTS.md).
- `none` — no credible verification path today. Reserved for
  `@aspirational` ACs whose behaviour depends on a system we have not
  built yet (backend content moderation, localisation, event pipeline,
  embedded-page Lighthouse). Per GOV-07, any row marked `none` **must**
  carry the `@aspirational` stability tag. The 15% cap protects the
  spec from silently drifting into un-testability — crossing it is a
  signal to either refine the AC or drop it.

Aspirational ACs whose behaviour is frontend-testable once implemented
carry a `Manual: …` path with an `(aspirational)` suffix — the
verification path is described today so future work can execute it
directly.

| ID | One-line summary | Section | Status | Stability | Verification |
|----|------------------|---------|--------|-----------|--------------|
| AC-01 | Host-site embedding | [§3.1](ACCEPTANCE_CRITERIA_BODIES.md#31-embedding--initialisation) | active | @stable | Manual: `npm run dev` — widget mounts, no console errors, only `SiiliChatbot` on `window` |
| AC-02 | Zero host dependencies | [§3.1](ACCEPTANCE_CRITERIA_BODIES.md#31-embedding--initialisation) | active | @stable | Manual: `npm run dev` on a page that loads only the widget assets — widget works end-to-end |
| AC-03 | Idempotent init | [§3.1](ACCEPTANCE_CRITERIA_BODIES.md#31-embedding--initialisation) | active | @stable | Automated: tests/widget.test.tsx — two `init()` calls yield a single clean mount, no console errors |
| AC-04 | `apiUrl` option selects backend | [§3.1](ACCEPTANCE_CRITERIA_BODIES.md#31-embedding--initialisation) | active | @evolving | Manual: init without `apiUrl` — mock responds per §12.1 PD-02; init with `apiUrl` — DevTools Network shows a POST to that URL and no other |
| AC-10 | Initial state | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Visual: see §2.5 row AC-10 vs rendered compact view (one textarea + chips per §12.1 PD-01) |
| AC-10a | Continue-conversation pill — rendering | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @evolving | Automated: tests/continuePill.test.tsx — pill renders only when at least one stored conversation has messages. Visual: see §2.5 row AC-10a — Figma `site:395:5439` |
| AC-10b | Suggestion-chip de-duplication | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @aspirational | Manual: ask a chip, re-enter compact — that chip is hidden, order preserved (aspirational) |
| AC-10c | Continue-conversation pill — activation | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @evolving | Automated: tests/app.test.tsx — clicking the continue-pill flips to expanded with the most-recent conversation as active and fires no network call |
| AC-11 | Placeholder copy | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Automated: tests/compactView.test.tsx — exact Finnish placeholder string; Visual: Figma `146:1015` for `--gray-900` treatment |
| AC-12 | Suggestion chip content | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Visual: see §2.5 row AC-12 — chip wording matches `src/App.tsx::SUGGESTIONS` |
| AC-12b | Suggestion chip labels do not wrap | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Manual: shrink chip container — labels stay on one line (`white-space: nowrap`) |
| AC-13 | Sending from the textarea | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Automated: tests/compactView.test.tsx — Enter sends trimmed value and clears, Shift+Enter does not submit, send-button click submits |
| AC-14 | Sending from a chip | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Automated: tests/compactView.test.tsx — chip click fires `onSend` with label verbatim |
| AC-15 | Empty-submit guard | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Automated: tests/compactView.test.tsx — Enter on empty / whitespace-only textarea is a no-op; disabled send button swallows clicks |
| AC-16 | Send-button enablement | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Automated: tests/compactView.test.tsx — disabled / enabled state by textarea content; Visual: see §2.5 row AC-16 for Active gradient |
| AC-17 | Input shell — click-to-focus target with text cursor | [§3.2](ACCEPTANCE_CRITERIA_BODIES.md#32-compact-hero-mode) | active | @stable | Automated: tests/compactView.test.tsx — mousedown on shell focuses textarea; mousedown on send button does not. Manual: hover the input shell padding — cursor is text caret |
| AC-20 | Transition — no flicker | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: compact → expanded transition — no unstyled flash or empty intermediate frame |
| AC-20a | Fill the viewport | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: enter expanded — surface fills `100vw × 100vh` with solid `--white-500` |
| AC-20b | Hero image hidden | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: enter expanded — host hero image not visible behind widget |
| AC-20c | Back navigation — history entry pushed on expand | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/widget.test.tsx — `history.pushState` called once on compact → expanded with `{ siiliExpanded: true }` |
| AC-20d | Close button — rendering | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @evolving | Automated: tests/expandedView.test.tsx — close button renders with `aria-label="Sulje keskustelu"`. Visual: see §2.5 row AC-20d for hit-target + Siili-token styling (Figma confirmation pending Edit-seat access) |
| AC-20e | Transition — first Q+A pair visible immediately | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: first expanded frame already shows question + loading blob (no deferred mount) |
| AC-20f | Transition — no host-page scroll or reflow | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: scroll host page mid-height, enter expanded — host scroll / layout preserved |
| AC-20g | Back navigation — popstate returns to compact | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/widget.test.tsx — `popstate` dispatched while expanded flips back to compact and clears the close button from the DOM |
| AC-20h | Back navigation — compact-mode back is not intercepted | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/widget.test.tsx — no `pushState` is called while still in compact mode |
| AC-20i | Back navigation — opt-out via `interceptBackNavigation: false` | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/widget.test.tsx — init with `interceptBackNavigation: false` and a transition produces zero `pushState` calls; close-button dismiss does not call `history.back` |
| AC-20j | Close button — activation dismisses expanded mode | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/expandedView.test.tsx — close click and `Esc` both call `onClose`; tests/widget.test.tsx — close click calls `history.back` when intercepting and flips mode without `history.back` when opted out |
| AC-20k | Close button — reduced motion | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @evolving | Manual: DevTools emulate reduce-motion — dismiss path drops the hover transition (handled by `prefers-reduced-motion: reduce` media query in `closeButton.module.css` and `expandedView.module.css`) |
| AC-21 | Header | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Visual: see §2.5 row AC-21 — header reads "Siili AI-avustaja" in Everett |
| AC-22 | Question bubble | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — question text renders verbatim; Visual: see §2.5 row AC-22 for bubble styling |
| AC-23 | Loading indicator — semantics and copy | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — `role="status"`, `aria-live="polite"`, "Haetaan tietoa..." copy, answer + sources hidden while loading |
| AC-23b | Loading indicator — blob visual style | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Visual: see §2.5 row AC-23b — soft rounded gray blob, scale/opacity pulse |
| AC-24 | Answer rendering | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — resolved answer renders as plain text in a paragraph |
| AC-25 | Source references — section rendered | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — "Lähteet:" section + one badge per source. Visual: see §2.5 row AC-25 for pill styling |
| AC-25b | Source references — linked badge opens in new tab | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — linked badge has `href`, `target="_blank"`, `rel="noopener noreferrer"` |
| AC-25c | Source references — unlinked badge is static | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — unlinked source renders as `<span>`, never as a link |
| AC-26 | No-sources case | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/chatMessage.test.tsx — empty and undefined `sources` both suppress the "Lähteet:" section |
| AC-27 | Auto-scroll to newest | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: append several Q+A pairs — newest smoothly scrolls into view |
| AC-28 | Input positioned below the latest reply | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Visual: see §2.5 row AC-28 — input in document flow below latest reply with `--textarea-shadow` |
| AC-28b | Input placement — short conversations are not bottom-pinned | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: short convo — input sits directly below latest reply, no empty space above |
| AC-28c | Input placement — long conversations keep latest reply and input visible | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Manual: long convo — latest reply + input both visible after auto-scroll |
| AC-29 | Follow-up questions | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/app.test.tsx — second send appends a new pair while the first remains intact |
| AC-30 | Input disabled during load | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/app.test.tsx — textarea + send button both `disabled` until the in-flight promise resolves |
| AC-31 | Dismissal retains messages | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/widget.test.tsx — popstate-driven dismiss returns to compact and the textarea stays mounted (proves App did not blow up; conversation contents survive the mode flip and persist independently per AC-31e) |
| AC-31b | Compact re-entry surfaces continue-pill and hides asked chips | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: compact re-entry with history — continue pill visible, asked chips hidden (aspirational; depends on AC-10a continue-pill implementation) |
| AC-31c | (deprecated) Tab close clears history — superseded by AC-31e (PD-08 storage moved to `localStorage`) | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | deprecated | @aspirational | n/a (deprecated — see AC-31e) |
| AC-31e | History persists across tab close and browser restart | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @evolving | Automated: tests/conversationStore.test.ts — store survives a fresh `read()` after a simulated tab-close (storage key still present and parseable). Manual: close + reopen tab mid-convo — continue-pill reachable on the hero; close browser + reopen — same. |
| AC-31d | (deprecated) New message from compact with history appends — superseded by AC-31f (compact-send now mints a fresh conversation) | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | deprecated | @evolving | n/a (deprecated — see AC-31f) |
| AC-31f | Compact-mode send mints a new conversation when history exists | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/app.test.tsx — compact-mode send with prior messages mints a new conversation (sidebar visibility threshold ≥ 2 hits naturally); compact-mode send into an empty active conversation appends rather than duplicating |
| AC-32 | Input focus — retained after send in expanded mode | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: send via Enter and via send-button click in expanded — focus is on the textarea after the pair renders and once the input re-enables (aspirational) |
| AC-33 | Previous discussion list — visibility | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: dev harness with two seeded conversations under PD-08 — sidebar renders alongside Q+A stream; harness with one conversation — sidebar hidden (aspirational) |
| AC-33a | Previous discussion list — items render | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: dev harness with seeded multi-conversation store — each row carries a label derived from its first user question; the active row is visually distinct (aspirational) |
| AC-33b | Previous discussion item — activation | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: type a draft in the active conversation, click an inactive row — Q+A stream swaps, no DevTools Network POST fires, draft restored on re-activation (aspirational) |
| AC-33c | Previous discussion list — empty state | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: fresh tab session — sidebar not rendered until a second conversation is created (aspirational) |
| AC-33d | Previous discussion list — mobile responsive treatment | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual: viewport below §12.1 PD-05 mobile breakpoint with two seeded conversations — sidebar collapses behind a discoverable affordance, reachable in one tap (aspirational) |
| AC-34 | Per-conversation title in expanded view | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @aspirational | Manual / Visual: see §2.5 row AC-34 — per-conversation title is rendered above the Q+A stream and updates on AC-33b activation; empty conversation falls back to a neutral default (aspirational) |
| AC-35 | Start-new-conversation affordance in expanded mode | [§3.3](ACCEPTANCE_CRITERIA_BODIES.md#33-expanded-chat-mode) | active | @stable | Automated: tests/conversationStore.test.ts — `createConversation()` mints a fresh entry without mutating priors; tests/expandedView.test.tsx — activating the "Luo uusi keskustelu" button calls `onStartNewConversation`. Visual: see §2.5 row AC-35 — Figma `ds:237:398` |
| AC-40 | Service rejection | [§3.4](ACCEPTANCE_CRITERIA_BODIES.md#34-error-handling) | active | @stable | Automated: tests/chatMessage.test.tsx — error pair renders `role="alert"` with the error text; no `role="status"` blob and no "Lähteet:" section |
| AC-41 | No crash on error | [§3.4](ACCEPTANCE_CRITERIA_BODIES.md#34-error-handling) | active | @stable | Manual: after forced error — user can still type + send new messages; error scoped to one pair |
| AC-42 | No developer leakage | [§3.4](ACCEPTANCE_CRITERIA_BODIES.md#34-error-handling) | active | @stable | Automated: tests/app.test.tsx — App renders the fixed `SAFE_ERROR` copy from `src/errorCopy.ts`; raw `err.message` is never forwarded to the DOM |
| AC-43 | Network timeout | [§3.4](ACCEPTANCE_CRITERIA_BODIES.md#34-error-handling) | active | @evolving | Automated: tests/apiChatService.test.ts — 30 s `AbortController` rejection maps to the SAFE_ERROR string |
| AC-44 | Safe error mapping for real backend | [§3.4](ACCEPTANCE_CRITERIA_BODIES.md#34-error-handling) | active | @evolving | Automated: tests/apiChatService.test.ts — non-2xx, network, non-JSON, missing `response`, non-string `response` all reject with the Finnish fallback string; no status codes or payload bodies leaked |
| AC-50 | Interface stability — components are transport-agnostic | [§3.5](ACCEPTANCE_CRITERIA_BODIES.md#35-chat-service-contract) | active | @stable | Automated: `npm run verify` — TypeScript build enforces the `ChatService` surface and the grep guard rejects any `src/components/**` import from `src/services/**` |
| AC-51 | Mock fidelity | [§3.5](ACCEPTANCE_CRITERIA_BODIES.md#35-chat-service-contract) | active | @stable | Manual: `npm run dev` without `VITE_API_URL` — mock resolves per §12.1 PD-02 with a Finnish answer and source count per §12.1 PD-03 |
| AC-52 | Threaded conversation — full history posted per request | [§3.5](ACCEPTANCE_CRITERIA_BODIES.md#35-chat-service-contract) | active | @evolving | Automated: tests/apiChatService.test.ts — POST body is `{ messages: ChatTurn[] }` in chronological order; tests/app.test.tsx — `buildHistory` drops loading / errored / empty-answer turns |
| AC-53 | Real-backend adapter — response mapping and forward-compatible schema | [§3.5](ACCEPTANCE_CRITERIA_BODIES.md#35-chat-service-contract) | active | @evolving | Automated: tests/apiChatService.test.ts — `{ response }` → `ChatMessage`, unknown fields ignored, `sources` forward-compatibly surfaced, malformed source entries dropped |
| AC-60 | Every factual claim is sourced | [§4](ACCEPTANCE_CRITERIA_BODIES.md#4-content-legal--trust-investor-critical) | active | @aspirational (externally gated) | none (externally gated — backend retrieval owns source emission) |
| AC-61 | No forward-looking statements or advice | [§4](ACCEPTANCE_CRITERIA_BODIES.md#4-content-legal--trust-investor-critical) | active | @aspirational (externally gated) | none (externally gated — backend guardrails own polite-decline) |
| AC-62 | No insider or unpublished information | [§4](ACCEPTANCE_CRITERIA_BODIES.md#4-content-legal--trust-investor-critical) | active | @aspirational (externally gated) | none (externally gated — backend content moderation) |
| AC-63 | Language parity | [§4](ACCEPTANCE_CRITERIA_BODIES.md#4-content-legal--trust-investor-critical) | active | @aspirational (externally gated) | none (externally gated — host-site `FI ↔ EN` toggle + backend prompt locale) |
| AC-64 | Timestamp / freshness cue (recommended) | [§4](ACCEPTANCE_CRITERIA_BODIES.md#4-content-legal--trust-investor-critical) | active | @aspirational (externally gated) | none (externally gated — backend dated-source metadata contract) |
| AC-65 | Clear AI labelling | [§4](ACCEPTANCE_CRITERIA_BODIES.md#4-content-legal--trust-investor-critical) | active | @stable | Manual: expanded view shows "Siili AI-avustaja" header and any legally required disclaimer |
| AC-70 | Figma parity | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @stable | Visual: `get_design_context` on each §2.5 Figma Manifest row and compare rendered output |
| AC-71 | (deprecated) Token-only styling — moved to rule files (GOV-04) | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | deprecated | @stable | n/a (deprecated — see AC body; see AC-70 + `.cursor/rules/` for live coverage) |
| AC-72 | Send-button states | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @stable | Visual: see §2.5 row AC-72 — Active / Hover / Pressed |
| AC-73 | Typography — Everett via font tokens | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @stable | Manual: DevTools computed-style check — widget text uses `--font-family*` tokens (Everett when loaded) |
| AC-73b | Typography — graceful fallback | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @stable | Manual: block Everett in DevTools Network — widget falls back to `sans-serif` with ≤1 line-height shift |
| AC-74 | Motion polish | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @stable | Manual: interact with chip / send / focus / transition — durations within §12.1 PD-07, easing matches IR site |
| AC-75 | No generic AI aesthetic | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @stable | Visual: review against Figma — no default spinners, Material FAB, plain-tail bubbles, or stock AI motifs |
| AC-76 | Dark hero compatibility | [§5](ACCEPTANCE_CRITERIA_BODIES.md#5-visual-design--brand-award-critical) | active | @evolving | Manual: overlay on the real hero asset + axe / contrast tool over the busiest hero region |
| AC-80 | Keyboard-only operation | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Automated: tests/keyboardNav.test.tsx — compact Tab order textarea → send → chips; expanded initial focus on textarea; linked badges focusable. Manual: DevTools A11y panel — focus ring visible on each interactive surface |
| AC-81 | Screen-reader labelling — textarea | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Manual: DevTools Accessibility panel — textarea announces configured `aria-label` |
| AC-81b | Screen-reader labelling — send button | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Manual: DevTools Accessibility panel — send button announces "Send message" (or localised equivalent) |
| AC-81c | Screen-reader labelling — loading state | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Automated: tests/chatMessage.test.tsx — `role="status"` + `aria-live="polite"` + "Haetaan tietoa..." copy |
| AC-81d | Screen-reader labelling — errors | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Automated: tests/chatMessage.test.tsx — error text announced via `role="alert"` |
| AC-82 | WCAG 2.1 AA contrast | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Manual: axe DevTools contrast scan over token pairs — ≥4.5:1 body, ≥3:1 large / non-text |
| AC-83 | Reduced motion | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Automated: tests/expandedView.test.tsx — auto-scroll `behavior` switches to `auto` under reduce-motion. Manual: DevTools emulate `prefers-reduced-motion: reduce` — mount animation, auto-scroll, blob pulse, and interactive transitions (chip / focus ring / send button / source badge) are all static |
| AC-84 | Zoom and reflow | [§6](ACCEPTANCE_CRITERIA_BODIES.md#6-accessibility) | active | @stable | Manual: browser zoom to 200% — no widget content clipped, no horizontal scroll inside container |
| AC-90 | Desktop (≥1024px) | [§7](ACCEPTANCE_CRITERIA_BODIES.md#7-responsiveness) | active | @stable | Manual: viewport at or above the §12.1 PD-05 desktop threshold — matches §2.5 row AC-90 padding and layout |
| AC-91 | Tablet (640–1023px) | [§7](ACCEPTANCE_CRITERIA_BODIES.md#7-responsiveness) | active | @stable | Manual: viewport in the §12.1 PD-05 tablet band — chips wrap, textarea full width, send button inside input shell |
| AC-92 | Mobile (<640px) — compact stacks input above chips | [§7](ACCEPTANCE_CRITERIA_BODIES.md#7-responsiveness) | active | @stable | Manual: viewport below the §12.1 PD-05 mobile breakpoint — compact stacks input above chips (not side-by-side) |
| AC-92b | Mobile (<640px) — chips scroll or wrap without overflow | [§7](ACCEPTANCE_CRITERIA_BODIES.md#7-responsiveness) | active | @stable | Manual: viewport below the §12.1 PD-05 mobile breakpoint — chips wrap or scroll horizontally without overflowing viewport width |
| AC-92c | Mobile (<640px) — expanded view full width with Figma padding | [§7](ACCEPTANCE_CRITERIA_BODIES.md#7-responsiveness) | active | @stable | Manual: viewport below the §12.1 PD-05 mobile breakpoint in expanded — 100% container width with Figma-consistent padding |
| AC-93 | Textarea auto-grow | [§7](ACCEPTANCE_CRITERIA_BODIES.md#7-responsiveness) | active | @stable | Manual: paste multi-line content — textarea grows to the §12.1 PD-06 cap then scrolls internally; send button stays visible |
| AC-100 | Bundle budget | [§8](ACCEPTANCE_CRITERIA_BODIES.md#8-performance) | active | @stable | Automated: `npm run verify` — parses `vite build` gzip output and fails if combined `siili-chatbot.iife.js` + `siili-chatbot.css` exceed 60 KB |
| AC-101 | Cold-start render | [§8](ACCEPTANCE_CRITERIA_BODIES.md#8-performance) | active | @evolving | Manual: DevTools 4× CPU throttle — compact interactive ≤150ms after script load completes |
| AC-102 | No host-page regression | [§8](ACCEPTANCE_CRITERIA_BODIES.md#8-performance) | active | @aspirational (externally gated) | none (externally gated — Lighthouse on real host embed, not dev harness) |
| AC-103 | No layout thrash | [§8](ACCEPTANCE_CRITERIA_BODIES.md#8-performance) | active | @evolving | Manual: DevTools Performance panel — widget-attributed CLS ≤0.05 across a full session |
| AC-110 | Browser matrix | [§9](ACCEPTANCE_CRITERIA_BODIES.md#9-cross-browser--environment) | active | @evolving | Manual: happy-path across Chrome, Edge, Firefox, Safari (latest two each, desktop + iOS Safari / Android Chrome) |
| AC-111 | No console errors | [§9](ACCEPTANCE_CRITERIA_BODIES.md#9-cross-browser--environment) | active | @stable | Manual: prod build happy path (load → compact → send → expanded → follow-up → success) — zero errors / warnings |
| AC-112 | Graceful CSS isolation | [§9](ACCEPTANCE_CRITERIA_BODIES.md#9-cross-browser--environment) | active | @stable | Manual: embed widget under aggressive host CSS (global tag styles, `!important`) — widget layout unaffected |
| AC-120 | Event emission — named events for key actions | [§10](ACCEPTANCE_CRITERIA_BODIES.md#10-observability-light-touch-frontend-only) | active | @aspirational (externally gated) | none (externally gated — product sign-off on event names + `dataLayer` schema) |
| AC-120b | Event emission — no PII in payloads | [§10](ACCEPTANCE_CRITERIA_BODIES.md#10-observability-light-touch-frontend-only) | active | @aspirational (externally gated) | none (externally gated — product sign-off on PII policy / payload shape) |
| AC-120c | Event emission — `chat_closed` payload | [§10](ACCEPTANCE_CRITERIA_BODIES.md#10-observability-light-touch-frontend-only) | active | @aspirational (externally gated) | none (externally gated — product schema + Lane H internal dep for close button / Esc / back-nav) |
| AC-121 | No uncontrolled network calls | [§10](ACCEPTANCE_CRITERIA_BODIES.md#10-observability-light-touch-frontend-only) | active | @stable | Manual: DevTools Network — no calls beyond the configured `ChatService` endpoint and host-declared fonts/CSS |
| AC-N1 | MUST NOT render backend-provided HTML or Markdown | [§12](#12-non-goals--explicit-non-requirements) | active | @stable | Automated: `npm run verify` (grep guard — `dangerouslySetInnerHTML` forbidden in `src/`); tests/chatMessage.test.tsx — HTML / Markdown in answers, source labels, and error messages all render as escaped text with no DOM injection |
| AC-N2 | MUST NOT bundle font files with the widget | [§12](#12-non-goals--explicit-non-requirements) | active | @stable | Automated: `npm run verify` — builds then scans `dist/` for `.woff` / `.woff2` / `.ttf` / `.otf` / `.eot` binaries and any `@font-face` in bundled CSS |

---

## 2.5 Figma Manifest

Single index of every `AC-xx` criterion whose *visual* expectations are
bound to a Figma node. Agents should treat this table as the entry
point: pick the row(s) relevant to the change, call `get_design_context`
on the node(s), then update `Last checked` / `Checked by` in the same
PR.

- **Node ID format**: `site:X:Y` refers to a node in IR-site
  (`fileKey = 0xXdKUlBJIolF15MjJuaMC`, screen layouts); `ds:X:Y`
  refers to a node in IR-DS (`fileKey = rlh00CEImhMWwdRNOUqW6L`, the
  published component library). Always pass the matching `fileKey`
  when calling `get_design_context` etc.; see `AGENTS.md` §Figma for
  the node tables.
- **Last checked**: ISO date (`YYYY-MM-DD`) when the node was last
  compared to the implementation via `get_design_context`.
- **Checked by**: short attribution — agent run id, PR number, or
  human initials. `—` means never checked.
- **Policy**: when Figma and the implementation disagree, Figma wins;
  update `[src/styles/variables.css](src/styles/variables.css)`,
  components, or the AC text (not the node) and bump the row.
- **Sync job**: run
  [`scripts/prompts/figma-sync.md`](scripts/prompts/figma-sync.md) in
  scoped mode per PR and in full-sweep mode weekly / pre-release to
  refresh this table.
- **Umbrella AC-70** (Figma parity) applies to every row and is not
  repeated here. Token-only styling is now a construction rule in
  [`.cursor/rules/code-governance.mdc`](.cursor/rules/code-governance.mdc)
  and [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc) —
  see deprecated AC-71 for history.
- **Code-authored rows** (`Figma node(s) = — (code-authored)`): the
  AC is currently satisfied by implementation choices (tokens in
  `[src/styles/variables.css](src/styles/variables.css)` or layout
  in `src/components/**`) with no matching Figma frame yet. The
  full-sweep sync job scans the Figma file for candidate frames that
  could adopt the row — see "Code-authored watch" in the
  [`figma-sync.md`](scripts/prompts/figma-sync.md) prompt. When a
  candidate is approved, move the row out of code-authored by
  filling in the node ID.
- **Textarea variant relationship (2026-04).** `ds:152:121` is now
  the `Property 1=Default` variant of a parent component set
  `ds:181:143` Textarea, whose other variant is
  `ds:181:144` `Property 1=Hero`. Rows below that anchor on
  `ds:152:121` (AC-11, AC-28, AC-28b, AC-28c) intentionally keep
  pointing at the Default variant — they describe the
  expanded-mode textarea specifically. The Hero variant covers the
  compact-mode textarea and is rendered by the same
  `src/components/ChatInput.tsx` via the `compact` prop, so it is
  not a separate row in this manifest. See
  [`AGENTS.md`](AGENTS.md) § Code Connect for the matching mapping
  state.

> **2026-05-05 — Lane E-1 partial-sweep (IR-site frame rename, follow-up to Lane E).** The
> IR-site frames previously cited as `site:143:601` (AI-agentti) and
> `site:201:2273` (AI-agentti, haetaan tietoa) have been renamed in
> Figma to `site:434:2424` and `site:434:2696` respectively; the old
> IDs now return "node ID invalid" via `get_metadata`. The 12 `site:`
> rows in the table below have been updated to cite the new IDs, and
> the corresponding component JSDocs in
> [`src/components/ExpandedView.tsx`](src/components/ExpandedView.tsx)
> and [`src/components/ChatMessage.tsx`](src/components/ChatMessage.tsx)
> were bumped in the same PR. No AC body changes — the visual content
> the frames present is unchanged from Lane E's 2026-04-22 sweep,
> verified structurally via `get_metadata` (top-bar title + close
> button + 2-column body with sidebar / divider / Q+A stream /
> textarea match the Lane E findings). Three IR-DS Code Connect
> mappings orphaned during the same Figma reorganisation (`ds:152:86`
> chip, `ds:196:853` close button, `ds:191:268` previous-discussion
> item — each moved under new component-set parents) were
> re-registered against the parent sets `ds:230:725` / `ds:223:739` /
> `ds:230:452` in this lane; see [`AGENTS.md`](AGENTS.md) § Code
> Connect for the updated state. Lane E-1 also surfaced candidate
> anchors for two `— (code-authored)` rows (`AC-33d`, `AC-92c`) on
> new IR-site mobile frames `site:435:2904` and `site:435:2914`;
> promotion is deferred to a separate AC-amend turn per
> [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc).
> The label "Lane E-1" mirrors the existing "Lane B-1" follow-up
> convention (see `docs/governance-history/completion-log.md`); Lane G
> proper is taken by the GOV-16 Cluster 9 graduation on 2026-04-22,
> and Lanes H / I are reserved for upcoming GOV-16 work.
>
> **2026-04-22 — Lane E full-sweep completed.** Every `ds:` / `site:`
> row below was re-validated against the two live Figma files: `site:`
> rows point at **IR-site** (`fileKey = 0xXdKUlBJIolF15MjJuaMC`);
> `ds:` rows point at **IR-DS** (`fileKey = rlh00CEImhMWwdRNOUqW6L`).
> No parity failures blocking AC-70 surfaced. Low-severity findings
> were captured during the sweep (Figma placeholder trailing-space
> artifacts on `ds:152:121` / hero instance, Figma question-bubble
> `whitespace-nowrap` dummy-text artifact on `ds:152:116`, chip layout
> direction only diverging for hypothetical short labels). Code-authored
> rows (AC-73, AC-73b, AC-91, AC-92, AC-92b, AC-92c) have no candidate
> Figma frame — typography / tablet / mobile scaffolds are absent from
> both files.
>
> **2026-04-22 — Lane F graduation addendum.** The responsive rows
> (AC-91, AC-92, AC-92b, AC-92c) are now `@stable` as code-authored
> after the designer explicitly delegated responsive judgment to
> engineering ("the app should work responsively, no indication of
> breakpoints"). They stay code-authored in §2.5 because no Figma
> frames exist at the tablet / mobile bands. The two chosen defaults
> are: horizontal-scroll chip row at `<640px`, and
> `var(--space-xl) var(--space-lg)` expanded padding at `<640px`. The
> typography rows (AC-73, AC-73b) remain `@stable` code-authored as
> before.

> **Checked-by column policy (GOV-17 compression).** Forensic findings
> live in the corresponding lane entry in
> [`docs/governance-history/completion-log.md`](docs/governance-history/completion-log.md).
> Cell format: `Lane <X> <kind>` (e.g. `Lane E full-sweep`,
> `Lane C graduation`). When a row is freshly verified, append the
> lane reference and bump `Last checked`; do not re-paste the
> findings here.

| AC ID   | Figma node(s)                                 | Component / scope                                | Last checked | Checked by |
| ------- | --------------------------------------------- | ------------------------------------------------ | ------------ | ---------- |
| AC-10   | `site:13:527`                                 | Compact view layout (hero overlay)               | 2026-04-22   | Lane E full-sweep |
| AC-10a  | `site:395:5439`                               | Continue-conversation pill — rendering on hero (Etusivu — jatka edellistä keskustelua) | 2026-05-06   | Multi-discussion flow rework |
| AC-10c  | `site:395:5439`                               | Continue-conversation pill — activation handoff to expanded | 2026-05-06   | Multi-discussion flow rework |
| AC-11   | `ds:152:121`                                  | Textarea placeholder copy & colour               | 2026-04-22   | Lane E full-sweep |
| AC-12   | `ds:152:86`                                   | Suggestion chip wording & wrap                   | 2026-04-22   | Lane E full-sweep |
| AC-12b  | `ds:152:86`                                   | Suggestion chip labels — single-line (nowrap)    | 2026-04-22   | Lane E full-sweep |
| AC-16   | `ds:152:129`                                  | Send button — Active (gradient)                  | 2026-04-22   | Lane E full-sweep |
| AC-20   | `site:434:2424`                               | Expanded view mount / first-frame layout         | 2026-05-05   | Lane E full-sweep + Lane E-1 ID rename |
| AC-20a  | `site:434:2424`                               | Expanded surface fills viewport                  | 2026-05-05   | Lane C graduation + Lane E-1 ID rename |
| AC-20d  | `site:434:2424`, `ds:196:853`                 | Close (×) button styling & placement             | 2026-05-05   | Lane E full-sweep + Lane E-1 ID rename |
| AC-20e  | `site:434:2424`, `ds:152:116`                 | First Q+A pair visible on first expanded frame   | 2026-05-05   | Lane E full-sweep + Lane E-1 ID rename |
| AC-21   | `ds:152:97`                                   | Expanded header ("Siili AI-avustaja")            | 2026-04-22   | Lane E full-sweep |
| AC-22   | `ds:152:116`                                  | Question bubble (Q+A pair)                       | 2026-04-22   | Lane E full-sweep |
| AC-23   | `ds:152:137`, `site:434:2696`                 | Loading blob / loading state                     | 2026-05-05   | Lane A graduation + Lane E-1 ID rename |
| AC-23b  | `ds:152:137`, `site:434:2696`                 | Loading blob — rounded gray shape, pulse tempo   | 2026-05-05   | Lane A graduation + Lane E-1 ID rename |
| AC-25   | `ds:152:135`                                  | Source reference badge                           | 2026-04-22   | Lane E full-sweep |
| AC-25b  | `ds:152:135`                                  | Source reference — linked (opens in new tab)     | 2026-04-22   | Lane E full-sweep |
| AC-25c  | `ds:152:135`                                  | Source reference — static unlinked badge         | 2026-04-22   | Lane E full-sweep |
| AC-28   | `site:434:2424`, `ds:152:121`                 | ChatInput placement + textarea shadow            | 2026-05-05   | Lane C graduation + Lane E-1 ID rename |
| AC-28b  | `site:434:2424`, `ds:152:121`                 | ChatInput — short conversation, not bottom-pinned| 2026-05-05   | Lane C graduation + Lane E-1 ID rename |
| AC-28c  | `site:434:2424`, `ds:152:121`                 | ChatInput — long conversation, reply+input visible| 2026-05-05  | Lane C graduation + Lane E-1 ID rename |
| AC-33   | `ds:191:258`, `site:434:2424`                 | Previous discussion list — sidebar visibility & layout | —            | — |
| AC-33a  | `ds:191:268`                                  | Previous discussion item — row content & active state | —            | — |
| AC-33d  | — (code-authored)                             | Sidebar mobile collapse / discoverable affordance (Lane E-1 surfaced candidate anchor `site:435:2914` AI-agentti - Menu open - Mobile; promotion deferred to AC-amend turn) | —            | — |
| AC-34   | `site:434:2424`, `site:434:2696`              | Per-conversation title text element above the Q+A stream | —            | — |
| AC-35   | `ds:237:398`, `site:434:2424`                 | Start-new-conversation affordance — primary CTA Button (Default `ds:237:323` / Hover `ds:237:399` / Pressed `ds:237:411`, "Luo uusi keskustelu", 184×40 violet→blue gradient with `+` icon `ds:237:332`) anchored at the top of the AC-33 sidebar in `site:434:2424`, `site:434:2696`, and the mobile drawer `site:435:2914` | 2026-05-06   | Multi-discussion flow rework |
| AC-72   | `ds:152:129`, `ds:152:131`, `ds:152:133`      | Send button Active / Hover / Pressed             | 2026-04-22   | Lane E full-sweep |
| AC-73   | — (code-authored)                             | Typography — Everett weights (via `--font-family*` tokens) | 2026-04-22   | Lane E full-sweep (code-authored watch) |
| AC-73b  | — (code-authored)                             | Typography — sans-serif fallback, no large CLS   | 2026-04-22   | Lane E full-sweep (code-authored watch) |
| AC-90   | `site:13:527`, `site:434:2424`                | Desktop (≥1024px) layout                         | 2026-05-05   | Lane E full-sweep + Lane E-1 ID rename |
| AC-91   | — (code-authored)                             | Tablet (640–1023px) layout                       | 2026-04-22   | Lane F graduation (code-authored, designer delegation) |
| AC-92   | — (code-authored)                             | Mobile (<640px) layout — compact stacks input    | 2026-04-22   | Lane F graduation (code-authored, designer delegation) |
| AC-92b  | — (code-authored)                             | Mobile (<640px) — chips scroll or wrap           | 2026-04-22   | Lane F graduation (code-authored, designer delegation) |
| AC-92c  | — (code-authored)                             | Mobile (<640px) — expanded view full width       | 2026-04-22   | Lane F graduation (code-authored, designer delegation) |

The §13 Traceability roll-up (persona × section) is derived from this
manifest — edit rows here, then re-derive §13 if persona mapping
changes.

---

## 11. Definition of Done (per feature)

A change is "done" only when all of the following are true:

1. The relevant `AC-xx` criteria above are satisfied.
2. Visuals have been checked against the corresponding Figma node via
   `get_design_context` (see `AGENTS.md §Figma`).
3. The PR description lists every Figma node ID that was consulted,
   and the `Last checked` / `Checked by` columns in §2.5 Figma
   Manifest have been bumped for those rows.
4. Code-governance rules (see [`.cursor/rules/code-governance.mdc`](.cursor/rules/code-governance.mdc)) are satisfied — e.g. strict TypeScript, `onInput` handlers, React-via-Preact-compat imports.
5. Linter and `npm run build` both pass (the build catches type errors; the rule file is the source of truth for strictness and `any` bans).
6. Happy path, error path, and loading path have been exercised
   manually in the dev harness (`npm run dev`).
7. Keyboard-only and screen-reader spot-check has been done.
8. Bundle size and Lighthouse deltas do not regress the budgets in
   §8.
9. If tokens changed, `src/styles/variables.css` is updated and the
   change is documented in the PR.

---

## 12. Non-Goals / Explicit Non-Requirements

Spelled out to prevent scope creep. Two classes of items live here:

- **Product decisions** — things we've chosen not to do in v1 but
  which could become features in a later release. These carry no
  AC-ID; relaxing them still requires explicit human approval per
  [`.cursor/rules/change-boundary.mdc`](.cursor/rules/change-boundary.mdc)
  and the §Amending ACs flow in [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc).
- **Invariants** — things the widget **must not** do regardless of
  release. These are elevated to negative AC-IDs (`AC-Nx`) below so
  they are enforceable, traceable, and testable the same way other
  ACs are.

### 12.1 Product decisions (v1 scope)

**v1-scope exclusions** (no `PD-xx` ID — these are things we chose
not to do, not values to reference):

- The widget persists conversation history per browser profile via
  `localStorage` — see PD-08 below for the storage contract. There
  is no in-widget "clear history" affordance in v1; the user clears
  history through the browser. (amended 2026-04, Figma component
  drift — IR-DS now ships `ds:191:258` Previous discussion list,
  requiring in-session multi-conversation history; the previous "no
  persistence across page loads" / "no dedicated new-conversation
  button" exclusions were tombstoned in the same edit; amended
  2026-05, multi-discussion flow rework — storage moved from
  `sessionStorage` to `localStorage` so conversations survive tab
  close and browser restart per explicit product decision.)
- The widget does **not** stream tokens (current contract is
  request/response). Streaming is a future extension of
  `ChatService`, not a v1 requirement.

**Product decision values** (`PD-xx` — quantitative constants
referenced by behavioural ACs). Per [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) §AC Authoring,
AC bodies reference the `PD-ID` instead of restating the literal.

| ID    | Decision                          | Value                            | Referenced by                | Notes |
|-------|-----------------------------------|----------------------------------|------------------------------|-------|
| PD-01 | Predefined suggestion chip count  | 3                                | AC-10, AC-12                 | — |
| PD-02 | Mock response latency             | ~800 ms                          | AC-51                        | Demo fidelity only; not a real-backend target. |
| PD-03 | Mock source count                 | 2                                | AC-51                        | — |
| PD-04 | Network timeout for real backend  | 30 s                             | AC-43                        | — |
| PD-05 | Responsive breakpoints            | ≥1024 / 640–1023 / <640 px       | AC-90, AC-91, AC-92, AC-92b, AC-92c | AC titles carry these as identifiers; renaming a title is an Amending-ACs event (see [`ac-amending.mdc`](.cursor/rules/ac-amending.mdc)). |
| PD-06 | Textarea auto-grow cap            | 240 px                           | AC-93                        | — |
| PD-07 | Motion duration range             | 120–300 ms                       | AC-74                        | — |
| PD-08 | Conversation-history storage      | `localStorage`, scoped per browser profile | AC-31, AC-31e, AC-31f, AC-33, AC-33a, AC-33b, AC-33c, AC-33d | Survives reloads, tab close, and browser restart inside the same browser profile; cleared only when the user wipes site storage via browser tooling. Explicit product decision to persist across sessions so investors can re-enter prior conversations from the hero (AC-10a / AC-10c continue-pill). Trade-off accepted: cross-session footprint on shared devices, and a likely future cookie-consent surface obligation when the host site's consent contract is finalised. Server-side storage remains out of scope per [`.cursor/rules/change-boundary.mdc`](.cursor/rules/change-boundary.mdc) (would change the backend contract). Storage-layer details (key shape, schema versioning, quota handling) live in `src/services/conversationStore.ts`. (added 2026-04, Figma component drift; amended 2026-05, multi-discussion flow rework) |

Amending these values follows [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) §Amending ACs:
edit the row here, then confirm every AC in the `Referenced by` column still
holds. Adding a new `PD-xx` row requires at least one referencing
AC body to cite it.

### 12.2 Invariants (`AC-Nx`)

Human-friendly summary:

- The widget does **not** render Markdown or HTML from the backend —
  plain text with paragraph breaks only — to minimise the surface
  for prompt-injection attacks before moderation is in place. See
  **AC-N1**.
- The widget does **not** ship its own font files; it assumes the
  host site loads Everett (see also AC-73b for fallback behaviour).
  See **AC-N2**.

The contract:

- **AC-N1** — *MUST NOT render backend-provided HTML or Markdown* · **@stable**
  - **Given** any string the widget receives from the `ChatService`
    (question echo, answer body, source label, or error text),
  - **When** that string is rendered into the DOM,
  - **Then** it MUST be rendered as plain text (React children /
    text nodes). The widget MUST NOT use `dangerouslySetInnerHTML`,
    MUST NOT parse or render Markdown, and MUST NOT interpret HTML
    tags inside the string. Paragraph separation is the only
    formatting allowed, applied by splitting on newlines and
    rendering separate text nodes — never by injecting raw HTML.

- **AC-N2** — *MUST NOT bundle font files with the widget* · **@stable**
  - **Given** a production build of the widget (`npm run build`),
  - **When** the contents of `dist/` are inspected,
  - **Then** the output MUST NOT contain font binary files
    (`.woff`, `.woff2`, `.ttf`, `.otf`, `.eot`) and the bundled
    CSS MUST NOT declare `@font-face` rules that reference
    widget-hosted font URLs. The widget relies on the host page to
    load Everett; the fallback path is covered by AC-73b.

---

## 13. Traceability

Persona × section roll-up. The Figma-node column is **derived from
§2.5 Figma Manifest** — do not edit node IDs here; edit the manifest
and re-derive this roll-up only if persona mapping changes.

| Section | Satisfies persona | Primary Figma node(s) |
|---|---|---|
| 3.2 Compact mode | P1 (fast entry), P2 (hero impact) | see §2.5 rows AC-10…AC-16 |
| 3.3 Expanded mode | P1 (answers + sources), P2 (chat polish) | see §2.5 rows AC-20…AC-28 |
| 4 Content & legal | P1 (trust, compliance) | n/a |
| 5 Visual design | P2 (awards) | see §2.5 (all rows) |
| 6 Accessibility | P1 + P2 (inclusive + award-expected) | n/a |
| 7 Responsiveness | P1 (mobile IR users), P2 | see §2.5 rows AC-90…AC-92 |
| 8 Performance | P1 (fast), P2 (Lighthouse for judges) | n/a |
| 10 Observability | P2 (campaign measurement) | n/a |
