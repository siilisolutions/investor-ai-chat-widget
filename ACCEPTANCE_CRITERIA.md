# Acceptance Criteria — Siili Investor Chatbot Widget

> Source of truth for "is this feature done?" decisions. Read alongside
> [`AGENTS.md`](AGENTS.md) (architecture, tokens, Figma nodes) and the
> two Figma files — [IR-site](https://www.figma.com/design/0xXdKUlBJIolF15MjJuaMC/IR-site)
> (screen layouts) and [IR-DS](https://www.figma.com/design/rlh00CEImhMWwdRNOUqW6L/IR-DS)
> (component library) — as the visual ground truth. When criteria here
> conflict with Figma on visual details, Figma wins and this document
> must be updated.

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
  contract changes — amend per §10.5.
- `@evolving` — actively being refined; spec and code may drift by
  design. Use when the AC is partially implemented, being iterated on,
  or awaiting a measurement / audit step before it can be called
  stable. Prefer this over `@stable` when unsure. **Specificity
  licence:** describe *intent* only — avoid exact tokens, exact copy
  (use `e.g. "…"`), exact pixel values, exact counts. Promote to
  `@stable` when the design locks. See §10.6 AC Authoring.
- `@aspirational` — target state, not yet implemented or verified.
  Typical for ACs that depend on a system we do not yet have (real
  backend, localisation, analytics pipeline) or for features that are
  planned but unbuilt. **Specificity licence:** describe the
  user-visible goal and acceptance path only. Do not pin interactive
  details, aria-labels, hit-target pixels, or copy strings the design
  has not yet produced. See §10.6 AC Authoring.

Stability is orthogonal to Status: an `active` AC can be
`@aspirational` (we mean to ship it but haven't), and a `deprecated`
AC keeps whatever marker it carried when it was retired.

Verification values (added GOV-07) name the cheapest credible path to
confirm the AC:

- `Automated: …` — a command or grep the CI / a human can run and get a
  pass/fail out of (e.g. `npm run build`, `npm run lint`, `rg` over
  `src/`).
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
| AC-01 | Host-site embedding | [§3.1](#31-embedding--initialisation) | active | @stable | Manual: `npm run dev` — widget mounts, no console errors, only `SiiliChatbot` on `window` |
| AC-02 | Zero host dependencies | [§3.1](#31-embedding--initialisation) | active | @stable | Manual: `npm run dev` on a page that loads only the widget assets — widget works end-to-end |
| AC-03 | Idempotent init | [§3.1](#31-embedding--initialisation) | active | @evolving | Manual: call `SiiliChatbot.init()` twice on the same container — single clean mount, no console errors |
| AC-04 | `apiUrl` option selects backend | [§3.1](#31-embedding--initialisation) | active | @evolving | Manual: init without `apiUrl` — mock responds per §12.1 PD-02; init with `apiUrl` — DevTools Network shows a POST to that URL and no other |
| AC-10 | Initial state | [§3.2](#32-compact-hero-mode) | active | @stable | Visual: see §2.5 row AC-10 vs rendered compact view (one textarea + chips per §12.1 PD-01) |
| AC-10a | Continue-conversation pill — rendering | [§3.2](#32-compact-hero-mode) | active | @aspirational | Manual: dev harness with seeded history — pill renders above chips (aspirational) |
| AC-10b | Suggestion-chip de-duplication | [§3.2](#32-compact-hero-mode) | active | @aspirational | Manual: ask a chip, re-enter compact — that chip is hidden, order preserved (aspirational) |
| AC-10c | Continue-conversation pill — activation | [§3.2](#32-compact-hero-mode) | active | @aspirational | Manual: activate pill — returns to expanded with history, no network call (aspirational) |
| AC-11 | Placeholder copy | [§3.2](#32-compact-hero-mode) | active | @stable | Manual: `npm run dev` — textarea shows the AC placeholder copy in `--gray-900` |
| AC-12 | Suggestion chip content | [§3.2](#32-compact-hero-mode) | active | @stable | Visual: see §2.5 row AC-12 — chip wording matches `src/App.tsx::SUGGESTIONS` |
| AC-12b | Suggestion chip labels do not wrap | [§3.2](#32-compact-hero-mode) | active | @stable | Manual: shrink chip container — labels stay on one line (`white-space: nowrap`) |
| AC-13 | Sending from the textarea | [§3.2](#32-compact-hero-mode) | active | @stable | Manual: type text + Enter (and send click) — transitions to expanded, textarea cleared |
| AC-14 | Sending from a chip | [§3.2](#32-compact-hero-mode) | active | @stable | Manual: click a chip — widget transitions to expanded with the chip's label sent |
| AC-15 | Empty-submit guard | [§3.2](#32-compact-hero-mode) | active | @stable | Manual: Enter / send click with empty or whitespace-only textarea — no transition |
| AC-16 | Send-button enablement | [§3.2](#32-compact-hero-mode) | active | @stable | Visual: see §2.5 row AC-16 — disabled when empty, Active gradient when non-empty |
| AC-17 | Input shell — click-to-focus target with text cursor | [§3.2](#32-compact-hero-mode) | active | @aspirational | Manual: hover the input shell padding (both variants) — cursor is text caret; click the padding — textarea receives focus (aspirational) |
| AC-20 | Transition — no flicker | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: compact → expanded transition — no unstyled flash or empty intermediate frame |
| AC-20a | Fill the viewport | [§3.3](#33-expanded-chat-mode) | active | @evolving | Manual: enter expanded — surface fills `100vw × 100vh` with solid `--white-500` |
| AC-20b | Hero image hidden | [§3.3](#33-expanded-chat-mode) | active | @evolving | Manual: enter expanded — host hero image not visible behind widget |
| AC-20c | Back navigation — history entry pushed on expand | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: DevTools History — single entry pushed on compact → expanded (aspirational) |
| AC-20d | Close button — rendering | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Visual: expanded view has `×` button top-right, 44×44px hit target, `aria-label="Sulje keskustelu"` (aspirational) |
| AC-20e | Transition — first Q+A pair visible immediately | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: first expanded frame already shows question + loading blob (no deferred mount) |
| AC-20f | Transition — no host-page scroll or reflow | [§3.3](#33-expanded-chat-mode) | active | @evolving | Manual: scroll host page mid-height, enter expanded — host scroll / layout preserved |
| AC-20g | Back navigation — popstate returns to compact | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: expanded → browser back — returns to compact with messages retained (aspirational) |
| AC-20h | Back navigation — compact-mode back is not intercepted | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: compact → browser back — host navigation fires normally (aspirational) |
| AC-20i | Back navigation — opt-out via `interceptBackNavigation: false` | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: init with `interceptBackNavigation: false` — no `pushState`/`popstate` handling (aspirational) |
| AC-20j | Close button — activation dismisses expanded mode | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: `×` or `Esc` dismisses expanded — messages retained, `history.back()` called when intercepting (aspirational) |
| AC-20k | Close button — reduced motion | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: DevTools emulate reduce-motion — dismiss transition is instant (aspirational) |
| AC-21 | Header | [§3.3](#33-expanded-chat-mode) | active | @stable | Visual: see §2.5 row AC-21 — header reads "Siili AI-avustaja" in Everett |
| AC-22 | Question bubble | [§3.3](#33-expanded-chat-mode) | active | @stable | Visual: see §2.5 row AC-22 — right-aligned `--gray-500` bubble with `--radius` corners |
| AC-23 | Loading indicator — semantics and copy | [§3.3](#33-expanded-chat-mode) | active | @evolving | Manual: inspect in-flight pair — blob + "Haetaan tietoa..." with `role="status"` and `aria-live="polite"` |
| AC-23b | Loading indicator — blob visual style | [§3.3](#33-expanded-chat-mode) | active | @evolving | Visual: see §2.5 row AC-23b — soft rounded gray blob, scale/opacity pulse |
| AC-24 | Answer rendering | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: resolved answer replaces blob, paragraph breaks preserved |
| AC-25 | Source references — section rendered | [§3.3](#33-expanded-chat-mode) | active | @stable | Visual: see §2.5 row AC-25 — "Lähteet:" section with one `SourceBadge` per source |
| AC-25b | Source references — linked badge opens in new tab | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: click linked badge — opens new tab (`target="_blank"`, `rel="noopener noreferrer"`) |
| AC-25c | Source references — unlinked badge is static | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: unlinked badge — no hover, no underline, non-interactive |
| AC-26 | No-sources case | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: zero-source answer (edit mock) — "Lähteet:" section not rendered at all |
| AC-27 | Auto-scroll to newest | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: append several Q+A pairs — newest smoothly scrolls into view |
| AC-28 | Input positioned below the latest reply | [§3.3](#33-expanded-chat-mode) | active | @evolving | Visual: see §2.5 row AC-28 — input in document flow below latest reply with `--textarea-shadow` |
| AC-28b | Input placement — short conversations are not bottom-pinned | [§3.3](#33-expanded-chat-mode) | active | @evolving | Manual: short convo — input sits directly below latest reply, no empty space above |
| AC-28c | Input placement — long conversations keep latest reply and input visible | [§3.3](#33-expanded-chat-mode) | active | @evolving | Manual: long convo — latest reply + input both visible after auto-scroll |
| AC-29 | Follow-up questions | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: send follow-up — new Q+A appended, prior pairs unchanged, input cleared |
| AC-30 | Input disabled during load | [§3.3](#33-expanded-chat-mode) | active | @stable | Manual: during in-flight answer — textarea + send button visibly greyed and non-interactive |
| AC-31 | Dismissal retains messages | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: dismiss expanded via `×` / `Esc` / back — compact re-renders, `messages` retained (aspirational) |
| AC-31b | Compact re-entry surfaces continue-pill and hides asked chips | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: compact re-entry with history — continue pill visible, asked chips hidden (aspirational) |
| AC-31c | Reload or navigation clears history | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: reload page mid-convo — `messages` cleared, compact shows no pill (aspirational) |
| AC-31d | New message from compact with history appends | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: send new message from compact with history — expanded appends, does not reset (aspirational) |
| AC-32 | Input focus — retained after send in expanded mode | [§3.3](#33-expanded-chat-mode) | active | @aspirational | Manual: send via Enter and via send-button click in expanded — focus is on the textarea after the pair renders and once the input re-enables (aspirational) |
| AC-40 | Service rejection | [§3.4](#34-error-handling) | active | @stable | Manual: force mock rejection — error pair renders with `role="alert"`, no blob, no sources |
| AC-41 | No crash on error | [§3.4](#34-error-handling) | active | @stable | Manual: after forced error — user can still type + send new messages; error scoped to one pair |
| AC-42 | No developer leakage | [§3.4](#34-error-handling) | active | @evolving | Manual: throw inside mock with a stack trace — UI shows only safe copy; inspect DOM + console of prod build |
| AC-43 | Network timeout | [§3.4](#34-error-handling) | active | @evolving | Manual: point `apiUrl` at an endpoint that never responds — failed pair renders within the §12.1 PD-04 timeout with safe copy, widget stays interactive |
| AC-44 | Safe error mapping for real backend | [§3.4](#34-error-handling) | active | @evolving | Manual: force the real backend to return 500 / 404 / network error — UI shows the Finnish fallback string; no status codes, URLs, or payload bodies leak into the DOM |
| AC-50 | Interface stability — components are transport-agnostic | [§3.5](#35-chat-service-contract) | active | @stable | Automated: `npm run build` — TypeScript enforces the `ChatService` surface; only `App.tsx` imports it, `ExpandedView.tsx` / `ChatMessage` / `CompactView` do not |
| AC-51 | Mock fidelity | [§3.5](#35-chat-service-contract) | active | @stable | Manual: `npm run dev` without `VITE_API_URL` — mock resolves per §12.1 PD-02 with a Finnish answer and source count per §12.1 PD-03 |
| AC-52 | Threaded conversation — full history posted per request | [§3.5](#35-chat-service-contract) | active | @evolving | Manual: send two turns against the real backend — second request's JSON body is `{ messages: [{role:"user",…},{role:"assistant",…},{role:"user",…}] }` in chronological order |
| AC-53 | Real-backend adapter — response mapping and forward-compatible schema | [§3.5](#35-chat-service-contract) | active | @evolving | Manual: backend returns `{ response: "…" }` — widget renders the answer; adapter ignores unknown fields and surfaces `sources` if/when the backend adds them |
| AC-60 | Every factual claim is sourced | [§4](#4-content-legal--trust-investor-critical) | active | @aspirational | none (aspirational — backend-scoped, not frontend-verifiable) |
| AC-61 | No forward-looking statements or advice | [§4](#4-content-legal--trust-investor-critical) | active | @aspirational | none (aspirational — backend-scoped, not frontend-verifiable) |
| AC-62 | No insider or unpublished information | [§4](#4-content-legal--trust-investor-critical) | active | @aspirational | none (aspirational — backend-scoped, not frontend-verifiable) |
| AC-63 | Language parity | [§4](#4-content-legal--trust-investor-critical) | active | @aspirational | none (aspirational — localisation / `FI ↔ EN` toggle not yet built) |
| AC-64 | Timestamp / freshness cue (recommended) | [§4](#4-content-legal--trust-investor-critical) | active | @aspirational | none (aspirational — backend-scoped, depends on dated source metadata) |
| AC-65 | Clear AI labelling | [§4](#4-content-legal--trust-investor-critical) | active | @stable | Manual: expanded view shows "Siili AI-avustaja" header and any legally required disclaimer |
| AC-70 | Figma parity | [§5](#5-visual-design--brand-award-critical) | active | @evolving | Visual: `get_design_context` on each §2.5 Figma Manifest row and compare rendered output |
| AC-71 | (deprecated) Token-only styling — moved to rule files (GOV-04) | [§5](#5-visual-design--brand-award-critical) | deprecated | @stable | n/a (deprecated — see AC body; see AC-70 + `.cursor/rules/` for live coverage) |
| AC-72 | Send-button states | [§5](#5-visual-design--brand-award-critical) | active | @stable | Visual: see §2.5 row AC-72 — Active / Hover / Pressed |
| AC-73 | Typography — Everett via font tokens | [§5](#5-visual-design--brand-award-critical) | active | @stable | Manual: DevTools computed-style check — widget text uses `--font-family*` tokens (Everett when loaded) |
| AC-73b | Typography — graceful fallback | [§5](#5-visual-design--brand-award-critical) | active | @stable | Manual: block Everett in DevTools Network — widget falls back to `sans-serif` with ≤1 line-height shift |
| AC-74 | Motion polish | [§5](#5-visual-design--brand-award-critical) | active | @evolving | Manual: interact with chip / send / focus / transition — durations within §12.1 PD-07, easing matches IR site |
| AC-75 | No generic AI aesthetic | [§5](#5-visual-design--brand-award-critical) | active | @evolving | Visual: review against Figma — no default spinners, Material FAB, plain-tail bubbles, or stock AI motifs |
| AC-76 | Dark hero compatibility | [§5](#5-visual-design--brand-award-critical) | active | @evolving | Manual: overlay on the real hero asset + axe / contrast tool over the busiest hero region |
| AC-80 | Keyboard-only operation | [§6](#6-accessibility) | active | @evolving | Manual: Tab through widget — focus order textarea → send → chips / badges, visible focus ring |
| AC-81 | Screen-reader labelling — textarea | [§6](#6-accessibility) | active | @evolving | Manual: DevTools Accessibility panel — textarea announces configured `aria-label` |
| AC-81b | Screen-reader labelling — send button | [§6](#6-accessibility) | active | @evolving | Manual: DevTools Accessibility panel — send button announces "Send message" (or localised equivalent) |
| AC-81c | Screen-reader labelling — loading state | [§6](#6-accessibility) | active | @evolving | Manual: inspect loading node — `role="status"` + `aria-live="polite"`, content "Haetaan tietoa..." |
| AC-81d | Screen-reader labelling — errors | [§6](#6-accessibility) | active | @evolving | Manual: trigger error path — error text announced via `role="alert"` |
| AC-82 | WCAG 2.1 AA contrast | [§6](#6-accessibility) | active | @evolving | Manual: axe DevTools contrast scan over token pairs — ≥4.5:1 body, ≥3:1 large / non-text |
| AC-83 | Reduced motion | [§6](#6-accessibility) | active | @aspirational | Manual: DevTools emulate reduce-motion — transitions, auto-scroll, blob pulse reduced or static (aspirational) |
| AC-84 | Zoom and reflow | [§6](#6-accessibility) | active | @evolving | Manual: browser zoom to 200% — no widget content clipped, no horizontal scroll inside container |
| AC-90 | Desktop (≥1024px) | [§7](#7-responsiveness) | active | @stable | Manual: viewport at or above the §12.1 PD-05 desktop threshold — matches §2.5 row AC-90 padding and layout |
| AC-91 | Tablet (640–1023px) | [§7](#7-responsiveness) | active | @evolving | Manual: viewport in the §12.1 PD-05 tablet band — chips wrap, textarea full width, send button inside input shell |
| AC-92 | Mobile (<640px) — compact stacks input above chips | [§7](#7-responsiveness) | active | @evolving | Manual: viewport below the §12.1 PD-05 mobile breakpoint — compact stacks input above chips (not side-by-side) |
| AC-92b | Mobile (<640px) — chips scroll or wrap without overflow | [§7](#7-responsiveness) | active | @evolving | Manual: viewport below the §12.1 PD-05 mobile breakpoint — chips wrap or scroll horizontally without overflowing viewport width |
| AC-92c | Mobile (<640px) — expanded view full width with Figma padding | [§7](#7-responsiveness) | active | @evolving | Manual: viewport below the §12.1 PD-05 mobile breakpoint in expanded — 100% container width with Figma-consistent padding |
| AC-93 | Textarea auto-grow | [§7](#7-responsiveness) | active | @stable | Manual: paste multi-line content — textarea grows to the §12.1 PD-06 cap then scrolls internally; send button stays visible |
| AC-100 | Bundle budget | [§8](#8-performance) | active | @stable | Automated: `npm run build` — combined gzip `siili-chatbot.iife.js` + `siili-chatbot.css` ≤ 60 KB |
| AC-101 | Cold-start render | [§8](#8-performance) | active | @evolving | Manual: DevTools 4× CPU throttle — compact interactive ≤150ms after script load completes |
| AC-102 | No host-page regression | [§8](#8-performance) | active | @aspirational | none (aspirational — Lighthouse on embedded host page not yet measured) |
| AC-103 | No layout thrash | [§8](#8-performance) | active | @evolving | Manual: DevTools Performance panel — widget-attributed CLS ≤0.05 across a full session |
| AC-110 | Browser matrix | [§9](#9-cross-browser--environment) | active | @evolving | Manual: happy-path across Chrome, Edge, Firefox, Safari (latest two each, desktop + iOS Safari / Android Chrome) |
| AC-111 | No console errors | [§9](#9-cross-browser--environment) | active | @stable | Manual: prod build happy path (load → compact → send → expanded → follow-up → success) — zero errors / warnings |
| AC-112 | Graceful CSS isolation | [§9](#9-cross-browser--environment) | active | @stable | Manual: embed widget under aggressive host CSS (global tag styles, `!important`) — widget layout unaffected |
| AC-120 | Event emission — named events for key actions | [§10](#10-observability-light-touch-frontend-only) | active | @aspirational | none (aspirational — event emission not yet implemented) |
| AC-120b | Event emission — no PII in payloads | [§10](#10-observability-light-touch-frontend-only) | active | @aspirational | none (aspirational — event emission not yet implemented) |
| AC-120c | Event emission — `chat_closed` payload | [§10](#10-observability-light-touch-frontend-only) | active | @aspirational | none (aspirational — event emission not yet implemented) |
| AC-121 | No uncontrolled network calls | [§10](#10-observability-light-touch-frontend-only) | active | @stable | Manual: DevTools Network — no calls beyond the configured `ChatService` endpoint and host-declared fonts/CSS |
| AC-N1 | MUST NOT render backend-provided HTML or Markdown | [§12](#12-non-goals--explicit-non-requirements) | active | @stable | Automated: `rg "dangerouslySetInnerHTML" src/` returns no matches; Manual: send HTML-bearing mock response — chars render as text |
| AC-N2 | MUST NOT bundle font files with the widget | [§12](#12-non-goals--explicit-non-requirements) | active | @stable | Automated: `npm run build` then inspect `dist/` for `.woff` / `.woff2` / `.ttf` / `.otf` / `.eot` and `@font-face` in CSS |

---

## 1. Personas & Primary Jobs-to-Be-Done

### P1 — The Investor (primary end user)
An existing or prospective Siili Solutions shareholder landing on
<https://sijoittajille.siili.com/>. They are time-boxed, analytical, and
legally protected by MAR/ESMA/Finnish securities regulation.

**Job-to-be-done:** *"Help me quickly find the legally-disclosed
information I need — financials, strategy, governance, news, share data —
so I can decide whether to buy, hold, or sell Siili stock with
confidence."*

Implications for the widget:
- Answers must be grounded in published, non-inside information.
- Every factual claim must be traceable to a source the investor can
  open and verify themselves.
- The widget must never feel like it is giving investment advice,
  forecasts, or selective disclosure.
- Finnish is the default language (host site default); English must be
  supported because the host site offers `FI / EN`.

### P2 — Siili Solutions (business stakeholder)
Siili positions itself as *the* Finnish partner for AI-assisted software
and AI transformation. The IR site is a high-visibility billboard for
that positioning, and this widget is the headline demonstration.

**Job-to-be-done:** *"Prove — on our own investor site — that we build
production-grade, tastefully-designed AI products. Make it award-worthy
so we can enter it into marketing and design competitions."*

Implications for the widget:
- Visual execution must match Figma pixel-for-pixel; no generic
  "AI chatbot" aesthetic.
- Interactions must feel crafted (typography, motion, micro-states).
- The experience must read as *Siili* — brand typography (Everett),
  Siili gradient (blue → violet), restrained palette.
- The widget must be demonstrably robust (no visible bugs, no jank)
  when a juror tries it live.

---

## 2. Scope

**In scope (this repo):**
- The embeddable chatbot widget rendered inside `#siili-chatbot` on the
  host page.
- Compact (hero) and expanded (chat) modes and the transition between
  them.
- The `ChatService` interface and a mock implementation.
- Design token system mirroring Figma.
- Build output: `dist/siili-chatbot.iife.js` + `dist/siili-chatbot.css`.

**Out of scope (tracked elsewhere):**
- The actual LLM backend, retrieval over IR documents, guardrails, and
  content moderation.
- The host-site layout, hero image, and navigation around the widget.
- Analytics pipeline wiring (events are emitted; ingestion is separate).

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

> **2026-04-22 — Figma file migration.** All node IDs in the table
> below were refreshed against the two live Figma files after the IR
> design moved organisations: `site:` rows point at **IR-site**
> (`fileKey = 0xXdKUlBJIolF15MjJuaMC`, screen layouts); `ds:` rows
> point at **IR-DS** (`fileKey = rlh00CEImhMWwdRNOUqW6L`, the
> published component library where Code Connect mappings live). The
> refresh is ID-only — visual parity with the prior sweep has **not**
> been re-confirmed against the new files, so `Last checked` /
> `Checked by` still show the `2026-04-20` seed-sweep dates. A
> `figma-sync.md` full-sweep against the two `fileKey`s is owed
> before the next release gate to bump those columns.

| AC ID   | Figma node(s)                                 | Component / scope                                | Last checked | Checked by |
| ------- | --------------------------------------------- | ------------------------------------------------ | ------------ | ---------- |
| AC-10   | `site:13:527`                                 | Compact view layout (hero overlay)               | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-11   | `ds:152:121`                                  | Textarea placeholder copy & colour               | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-12   | `ds:152:86`                                   | Suggestion chip wording & wrap                   | 2026-04-20   | seed sweep (AC updated to Figma `nowrap`); IDs refreshed 2026-04-22 |
| AC-12b  | `ds:152:86`                                   | Suggestion chip labels — single-line (nowrap)    | 2026-04-20   | inherits AC-12 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-16   | `ds:152:129`                                  | Send button — Active (gradient)                  | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-20   | `site:143:601`                                | Expanded view mount / first-frame layout         | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-20a  | `site:143:601`                                | Expanded surface fills viewport                  | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-20d  | `site:143:601`                                | Close (×) button styling & placement             | 2026-04-20   | seed sweep (no Figma node — AC extension); IDs refreshed 2026-04-22 |
| AC-20e  | `site:143:601`, `ds:152:116`                  | First Q+A pair visible on first expanded frame   | 2026-04-20   | inherits AC-20 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-21   | `ds:152:97`                                   | Expanded header ("Siili AI-avustaja")            | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-22   | `ds:152:116`                                  | Question bubble (Q+A pair)                       | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-23   | `ds:152:137`, `site:201:2273`                 | Loading blob / loading state                     | 2026-04-20   | seed sweep (spinner → blob applied); IDs refreshed 2026-04-22 |
| AC-23b  | `ds:152:137`, `site:201:2273`                 | Loading blob — rounded gray shape, pulse tempo   | 2026-04-20   | inherits AC-23 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-25   | `ds:152:135`                                  | Source reference badge                           | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-25b  | `ds:152:135`                                  | Source reference — linked (opens in new tab)     | 2026-04-20   | inherits AC-25 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-25c  | `ds:152:135`                                  | Source reference — static unlinked badge         | 2026-04-20   | inherits AC-25 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-28   | `site:143:601`, `ds:152:121`                  | ChatInput placement + textarea shadow            | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-28b  | `site:143:601`, `ds:152:121`                  | ChatInput — short conversation, not bottom-pinned| 2026-04-20   | inherits AC-28 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-28c  | `site:143:601`, `ds:152:121`                  | ChatInput — long conversation, reply+input visible| 2026-04-20  | inherits AC-28 sweep (GOV-05 split); IDs refreshed 2026-04-22 |
| AC-72   | `ds:152:129`, `ds:152:131`, `ds:152:133`      | Send button Active / Hover / Pressed             | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-73   | — (code-authored)                             | Typography — Everett weights (via `--font-family*` tokens) | 2026-04-20   | seed sweep (watching for typography node) |
| AC-73b  | — (code-authored)                             | Typography — sans-serif fallback, no large CLS   | 2026-04-20   | inherits AC-73 sweep (GOV-05 split) |
| AC-90   | `site:13:527`, `site:143:601`                 | Desktop (≥1024px) layout                         | 2026-04-20   | seed sweep; IDs refreshed 2026-04-22 |
| AC-91   | — (code-authored)                             | Tablet (640–1023px) layout                       | 2026-04-20   | seed sweep (watching for tablet frame) |
| AC-92   | — (code-authored)                             | Mobile (<640px) layout — compact stacks input    | 2026-04-20   | seed sweep (watching for mobile frame) |
| AC-92b  | — (code-authored)                             | Mobile (<640px) — chips scroll or wrap           | 2026-04-20   | inherits AC-92 sweep (GOV-05 split) |
| AC-92c  | — (code-authored)                             | Mobile (<640px) — expanded view full width       | 2026-04-20   | inherits AC-92 sweep (GOV-05 split) |

The §13 Traceability roll-up (persona × section) is derived from this
manifest — edit rows here, then re-derive §13 if persona mapping
changes.

---

## 3. Functional Acceptance Criteria

Format: `Given / When / Then`. Each criterion has a stable ID (`AC-xx`)
that tests and PR descriptions can reference.

### 3.1 Embedding & Initialisation

- **AC-01** — *Host-site embedding* · **@stable**
  - **Given** the host page includes `<div id="siili-chatbot"></div>`,
    `siili-chatbot.css`, and `siili-chatbot.iife.js`,
  - **When** the host calls `SiiliChatbot.init({ container: '#siili-chatbot' })`,
  - **Then** the widget mounts into that container without throwing,
    without polluting `window` beyond the `SiiliChatbot` global, and
    without leaking CSS into the host page.

- **AC-02** — *Zero host dependencies* · **@stable**
  - **Given** a host page that loads only `siili-chatbot.css` and
    `siili-chatbot.iife.js` and exposes `<div id="siili-chatbot"></div>`
    (no other scripts, no shared runtime, no global libraries),
  - **When** `SiiliChatbot.init()` runs,
  - **Then** the widget renders and functions end-to-end. The widget
    must not reach for any global beyond the `SiiliChatbot` namespace
    it exports itself.

- **AC-03** — *Idempotent init* · **@evolving**
  - **Given** `SiiliChatbot.init()` has already run,
  - **When** it is called a second time on the same container,
  - **Then** the widget is remounted cleanly (no duplicate UI, no
    orphaned event listeners, no console errors).

- **AC-04** — *`apiUrl` option selects backend* · **@evolving**
  - **Given** `WidgetOptions` defined in `src/types/index.ts`,
  - **Then** it carries an optional `apiUrl: string` field.
  - **When** the host calls `SiiliChatbot.init({ container, apiUrl })`
    with a non-empty `apiUrl`,
  - **Then** the widget wires the real `ChatService` adapter against
    that URL and issues no other cross-origin calls (per AC-121).
  - **When** `apiUrl` is omitted (or empty),
  - **Then** the widget falls back to the bundled mock
    (`src/services/chatService.ts`) so local dev and the dev harness
    work offline; no error is thrown and no warning is rendered in
    production UI.
  - The URL is **not** baked into the production bundle; it is
    supplied by the host page at `init()` time.

### 3.2 Compact (Hero) Mode

Maps to the Investor hero composition and its main component; see
§2.5 Figma Manifest for the bound nodes.

- **AC-10** — *Initial state* · **@stable**
  - **Given** the page has just loaded and `messages.length === 0`,
  - **When** the widget renders for the first time,
  - **Then** it shows the compact mode: one textarea plus the
    predefined suggestion chips (count per §12.1 PD-01), overlaid on
    the hero section in the layout defined in Figma.

- **AC-10a** — *Continue-conversation pill — rendering* · **@aspirational**
  - **Given** the user has previously been in expanded mode within the
    current page session and `messages.length > 0`, and the widget is
    now rendering compact mode,
  - **Then** a single pill is rendered above the suggestion chips
    reading *"Jatka keskustelua"* (styled per Siili tokens: Everett,
    `--radius`, gradient or gray surface per Figma once designed).
  - **Given** `messages.length === 0`,
  - **Then** the pill is not rendered.

- **AC-10c** — *Continue-conversation pill — activation* · **@aspirational**
  - **Given** the continue-conversation pill is rendered (per AC-10a),
  - **When** the user clicks or keyboard-activates the pill,
  - **Then** the widget transitions to expanded mode with the full
    message history intact, scrolled to the latest reply, and fires
    no network call.

- **AC-10b** — *Suggestion-chip de-duplication* · **@aspirational**
  - **Given** the user has previously asked one of the three predefined
    questions,
  - **When** compact mode is rendered again in the same session,
  - **Then** the chip matching that question is hidden; any remaining
    chips render in their original order.
  - **Given** all three predefined questions have been asked,
  - **Then** no chips are rendered (only the textarea and, per AC-10a,
    the continue pill).

- **AC-11** — *Placeholder copy* · **@stable**
  - **Given** compact mode is shown,
  - **Then** the textarea displays the placeholder
    *"Kysy minulta mitä vaan Siilistä sijoituskohteena tai
    taloustiedoistamme."* styled per the textarea component
    (see §2.5 row AC-11).

- **AC-12** — *Suggestion chip content* · **@stable**
  - **Given** compact mode is shown,
  - **Then** the suggestion chips display the predefined investor
    questions in Finnish (segments, dividend policy, revenue growth)
    with the exact wording from the predefined-question component
    (see §2.5 row AC-12) and `src/App.tsx::SUGGESTIONS`. Chip count
    per §12.1 PD-01.

- **AC-12b** — *Suggestion chip labels do not wrap* · **@stable**
  - **Given** compact mode is shown,
  - **Then** each chip's label renders on a single line
    (`white-space: nowrap`) matching the predefined-question
    component (see §2.5 row AC-12b); overflow of the chip row
    is handled at the breakpoints defined in AC-91 / AC-92 (row
    wrap on tablet, horizontal scroll or wrap on mobile), not by
    breaking chip labels.

- **AC-13** — *Sending from the textarea* · **@stable**
  - **Given** the user has typed a non-empty, non-whitespace question,
  - **When** they press `Enter` (without `Shift`) or click the send button,
  - **Then** the widget transitions to expanded mode, the question is
    sent to the chat service, and the textarea is cleared.

- **AC-14** — *Sending from a chip* · **@stable**
  - **Given** a suggestion chip is rendered,
  - **When** the user clicks (or keyboard-activates) it,
  - **Then** the chip's label is sent as the question and the widget
    transitions to expanded mode.

- **AC-15** — *Empty-submit guard* · **@stable**
  - **Given** the textarea is empty or whitespace-only,
  - **When** the user presses `Enter` or clicks send,
  - **Then** nothing happens and the widget stays in compact mode.

- **AC-16** — *Send-button enablement* · **@stable**
  - **Given** the textarea is empty,
  - **Then** the send button is visibly and functionally disabled.
  - **When** at least one non-whitespace character is entered,
  - **Then** the send button becomes enabled with the Active-variant
    gradient (see §2.5 row AC-16).

- **AC-17** — *Input shell — click-to-focus target with text cursor* · **@aspirational**
  - **Given** the input shell is rendered in either variant (compact
    or expanded; see the textarea component referenced in §2.5 row
    AC-11 / AC-28),
  - **When** the user hovers anywhere inside the shell that is not
    the send button (the padding around the textarea, the visible
    whitespace alongside a short single-line value),
  - **Then** the cursor is rendered as a text caret (`cursor: text`),
    signalling that the whole shell is a typing target.
  - **When** the user clicks anywhere inside the shell that is not
    the send button,
  - **Then** the underlying `<textarea>` receives focus so typing
    starts immediately without a second click.
  - The send button keeps its own `cursor: pointer` and does not
    forward clicks to the textarea.

### 3.3 Expanded (Chat) Mode

Maps to the Investor agent composition and its main component; see
§2.5 Figma Manifest for the bound nodes.

- **AC-20** — *Transition — no flicker* · **@stable**
  - **Given** the widget is in compact mode and a valid message is
    submitted,
  - **When** the transition occurs,
  - **Then** expanded mode mounts without a flicker (no unstyled
    flash, no intermediate empty frame between compact and expanded).

- **AC-20e** — *Transition — first Q+A pair visible immediately* · **@stable**
  - **Given** compact mode has just transitioned to expanded per
    AC-20,
  - **Then** on the first rendered frame of expanded mode the first
    Q+A pair is already visible with the user's question filled in
    and the assistant answer in loading state (no blank list, no
    deferred mount).

- **AC-20a** — *Fill the viewport* · **@evolving**
  - **Given** the widget has entered expanded mode,
  - **Then** the chat surface fills the entire browser viewport
    (100vw × 100vh from the widget's root container), with an
    opaque background matching the expanded-view composition
    (see §2.5 row AC-20a).
  - **Then** no host-page content behind the widget is visible through
    it (no translucency, no gaps at the edges).

- **AC-20b** — *Hero image hidden* · **@evolving**
  - **Given** the widget is in expanded mode,
  - **Then** the hero image / hero section that was visible behind the
    compact view is no longer visible to the user — either because
    the widget's opaque surface fully covers it, or because the host
    page's hero is hidden/collapsed while the widget is expanded.

- **AC-20f** — *Transition — no host-page scroll or reflow* · **@evolving**
  - **Given** the widget is transitioning from compact to expanded
    mode,
  - **Then** the host page underneath does not scroll or reflow
    visibly as a side-effect of the transition (the host page's
    scroll position and layout are preserved for when the user
    dismisses expanded mode per AC-31).

- **AC-20c** — *Back navigation — history entry pushed on expand* · **@aspirational**
  - **Given** `SiiliChatbot.init({ interceptBackNavigation: true })`
    (default `true`) and the widget is about to enter expanded mode,
  - **When** the compact → expanded transition begins,
  - **Then** the widget pushes a single history entry
    (`history.pushState`) tagged as its own so it can recognise it on
    `popstate`.

- **AC-20g** — *Back navigation — popstate returns to compact* · **@aspirational**
  - **Given** the widget is in expanded mode with its own history
    entry on the stack (per AC-20c),
  - **When** the user triggers browser back (desktop back button,
    Android hardware back, iOS swipe-back),
  - **Then** the widget listens for `popstate` for its own entry and
    returns to compact mode with `messages` retained (see AC-31).

- **AC-20h** — *Back navigation — compact-mode back is not intercepted* · **@aspirational**
  - **Given** the user is already in compact mode,
  - **When** the user triggers browser back,
  - **Then** the event is not intercepted — the host page's normal
    navigation applies.

- **AC-20i** — *Back navigation — opt-out via `interceptBackNavigation: false`* · **@aspirational**
  - **Given** `SiiliChatbot.init({ interceptBackNavigation: false })`,
  - **Then** no history entry is pushed on compact → expanded and
    `popstate` is not intercepted at any point in the widget
    lifecycle.

- **AC-20d** — *Close button — rendering* · **@aspirational**
  - **Given** the widget is in expanded mode,
  - **Then** a close (`×`) button is rendered in the top-right of the
    expanded view, styled per Siili tokens (not a generic Material
    `×`), with a 44×44px minimum hit target and
    `aria-label="Sulje keskustelu"`.

- **AC-20j** — *Close button — activation dismisses expanded mode* · **@aspirational**
  - **Given** the widget is in expanded mode,
  - **When** the user clicks the close button or presses `Esc`
    anywhere inside the widget,
  - **Then** the widget returns to compact mode with `messages`
    retained (see AC-31) and, if `interceptBackNavigation` is on,
    calls `history.back()` to keep the history stack in sync.

- **AC-20k** — *Close button — reduced motion* · **@aspirational**
  - **Given** `prefers-reduced-motion: reduce`,
  - **When** the user dismisses expanded mode via the close button,
    `Esc`, or browser back (AC-20j / AC-20g),
  - **Then** the dismiss transition is instant (no fade / slide).

- **AC-21** — *Header* · **@stable**
  - **Given** expanded mode is shown,
  - **Then** the header reads *"Siili AI-avustaja"* styled per the
    Investor agent component (see §2.5 row AC-21).

- **AC-22** — *Question bubble* · **@stable**
  - **Given** any Q+A pair,
  - **Then** the question appears right-aligned in a bubble matching
    the Question+Answer component (see §2.5 row AC-22).

- **AC-23** — *Loading indicator — semantics and copy* · **@evolving**
  - **Given** an in-flight assistant answer,
  - **Then** a pulsating gray blob (see §2.5 row AC-23) and the text
    *"Haetaan tietoa..."* appear in place of the answer, with
    `role="status"` and `aria-live="polite"`.

- **AC-23b** — *Loading indicator — blob visual style* · **@evolving**
  - **Given** the loading indicator is visible (per AC-23),
  - **Then** the blob's shape, fill, and scale/opacity pulse tempo
    match the loading-state component (see §2.5 row AC-23b) — not a
    spinning ring, not a bar, not a stepped dot sequence.

- **AC-24** — *Answer rendering* · **@stable**
  - **Given** the chat service resolves with an answer,
  - **Then** the pulsating blob is replaced by the answer text,
    preserving paragraph breaks from the backend response.

- **AC-25** — *Source references — section rendered* · **@stable**
  - **Given** an answer includes one or more `sources`,
  - **Then** the section labelled *"Lähteet:"* is rendered below the
    answer with one `SourceBadge` per source, matching the reference
    tag component (see §2.5 row AC-25).

- **AC-25b** — *Source references — linked badge opens in new tab* · **@stable**
  - **Given** a source has an `href`,
  - **Then** the badge is a link that opens in a new tab
    (`target="_blank"`, `rel="noopener noreferrer"`).

- **AC-25c** — *Source references — unlinked badge is static* · **@stable**
  - **Given** a source has no `href`,
  - **Then** the badge is rendered as static, non-interactive text
    (no underline, no hover affordance).

- **AC-26** — *No-sources case* · **@stable**
  - **Given** an answer has zero sources,
  - **Then** the "Lähteet:" section is not rendered at all (no empty
    label, no empty container).

- **AC-27** — *Auto-scroll to newest* · **@stable**
  - **Given** expanded mode is shown and a new Q+A pair is appended,
  - **Then** the messages container smoothly scrolls the newest pair
    into view.

- **AC-28** — *Input positioned below the latest reply* · **@evolving**
  - **Given** expanded mode is shown,
  - **Then** the `ChatInput` is rendered immediately underneath the
    most recent assistant reply (or its loading blob), in document
    flow, matching the textarea placement in the Investor agent
    composition (see §2.5 row AC-28).

- **AC-28b** — *Input placement — short conversations are not bottom-pinned* · **@evolving**
  - **Given** the conversation is short enough that all Q+A pairs fit
    in the viewport,
  - **Then** the input sits directly below the latest reply — it is
    **not** pinned to the bottom of the viewport with empty space
    above it.

- **AC-28c** — *Input placement — long conversations keep latest reply and input visible* · **@evolving**
  - **Given** the conversation is long enough to scroll,
  - **Then** after the auto-scroll in AC-27, the latest reply and the
    input beneath it are both visible together, with the input at or
    near the bottom of the viewport.

- **AC-29** — *Follow-up questions* · **@stable**
  - **Given** the user is in expanded mode and sends another message,
  - **Then** a new Q+A pair is appended below the previous ones
    (existing pairs are never mutated) and the input is cleared.

- **AC-30** — *Input disabled during load* · **@stable**
  - **Given** an assistant answer is in flight,
  - **Then** the textarea and send button are disabled (visually
    greyed per Figma and functionally non-interactive) until the
    response resolves.

- **AC-31** — *Dismissal retains messages* · **@aspirational**
  - **Given** the widget is in expanded mode,
  - **When** the user dismisses it via the close button (AC-20j),
    `Esc`, or browser back (AC-20g),
  - **Then** the widget re-renders compact mode *and* retains the full
    `messages` array in memory for the remainder of the page session.

- **AC-31b** — *Compact re-entry surfaces continue-pill and hides asked chips* · **@aspirational**
  - **Given** the user has re-entered compact mode with non-empty
    history,
  - **Then** compact mode shows the continue-conversation pill
    (AC-10a) and hides already-asked chips (AC-10b); the history is
    never rendered in full inside the compact hero.

- **AC-31c** — *Reload or navigation clears history* · **@aspirational**
  - **Given** the user reloads the page or navigates away,
  - **Then** `messages` is cleared — there is no cross-session
    persistence (see §12 non-goals).

- **AC-31d** — *New message from compact with history appends* · **@aspirational**
  - **Given** the user sends a new message from compact mode while
    history exists,
  - **Then** the widget enters expanded mode and **appends** the new
    Q+A pair to the existing history (it does not start a new
    conversation).

- **AC-32** — *Input focus — retained after send in expanded mode* · **@aspirational**
  - **Given** the widget is in expanded mode and the user submits a
    message either by pressing `Enter` on the textarea or by
    clicking the send button,
  - **When** the Q+A pair is appended and the textarea is cleared
    (per AC-29),
  - **Then** keyboard focus is on the textarea so the user can keep
    typing without a separate click. For the `Enter` path this is
    the natural outcome of not moving focus; for the send-button
    click path the widget must explicitly return focus to the
    textarea after dispatch.
  - **Given** the input is temporarily disabled while the assistant
    answer is in flight (per AC-30),
  - **Then** focus is **not** forced onto the disabled textarea; it
    returns to the textarea on the same frame that AC-30 re-enables
    the input, so the follow-up flow is uninterrupted.
  - This AC applies to expanded mode only — in compact mode the
    first send triggers the transition to expanded and AC-28 / AC-29
    govern where the input lands.

### 3.4 Error Handling

- **AC-40** — *Service rejection* · **@stable**
  - **Given** `sendMessage` rejects,
  - **Then** the corresponding Q+A pair shows a human-readable error
    message (Finnish by default, e.g. *"Pahoittelut, jokin meni pieleen."*)
    with `role="alert"`, no loading blob, and no source list.

- **AC-41** — *No crash on error* · **@stable**
  - **Given** any error path is taken,
  - **Then** the widget remains fully functional: the user can still
    type and send new messages; the error state is scoped to the one
    failed pair.

- **AC-42** — *No developer leakage* · **@evolving**
  - **Given** an error occurs,
  - **Then** stack traces, internal identifiers, or raw error payloads
    are never rendered in the UI (they may be logged to the console in
    dev builds only).

- **AC-43** — *Network timeout* · **@evolving**
  - **Given** a real `ChatService` adapter configured via `apiUrl`,
  - **When** the backend does not respond within the configured
    request timeout (§12.1 PD-04),
  - **Then** the in-flight request is aborted and the corresponding
    Q+A pair enters the error state per AC-40 with a user-safe
    Finnish string (AC-44). The widget remains fully interactive per
    AC-41, and the aborted request MUST NOT continue to mutate state
    if it resolves after the timeout.

- **AC-44** — *Safe error mapping for real backend* · **@evolving**
  - **Given** the real `ChatService` adapter receives a non-2xx
    response, a network failure, a non-JSON body, or a schema it
    cannot parse,
  - **Then** it rejects with a short, user-safe Finnish string (e.g.
    *"Pahoittelut, en pysty juuri nyt hakemaan vastausta. Yritä
    hetken kuluttua uudelleen."*) that AC-40 renders via
    `role="alert"`.
  - **Then** HTTP status codes, backend URLs, response bodies,
    function keys, and stack traces MUST NOT appear in the DOM or in
    the production console (per AC-42). Dev-build console logging of
    raw errors is permitted for debugging.

### 3.5 Chat Service Contract

- **AC-50** — *Interface stability — components are transport-agnostic* · **@stable**
  - **Given** the `ChatService` interface in `src/types/index.ts`,
  - **Then** only `App.tsx` (the composition root) imports a concrete
    `ChatService` implementation. `ExpandedView.tsx`, `ChatMessage`,
    `CompactView`, and `ChatInput` MUST NOT import from
    `src/services/**` directly.
  - **Then** swapping one `ChatService` implementation for another
    requires no changes outside `src/services/**`, `src/widget.tsx`
    (composition wiring), and — if the interface itself changes —
    `src/types/index.ts` plus an AC amendment here.

- **AC-51** — *Mock fidelity* · **@stable**
  - **Given** the default mock service is used (no `apiUrl` passed
    to `init()`),
  - **Then** it resolves after the mock latency (§12.1 PD-02) with a
    canned Finnish answer and the mock source count (§12.1 PD-03) —
    enough to demo the full UI without a backend — and accepts the
    same `ChatTurn[]` history argument as the real adapter so the
    two are drop-in interchangeable.

- **AC-52** — *Threaded conversation — full history posted per request* · **@evolving**
  - **Given** the user has had N prior successful turns in the
    current tab session,
  - **When** they send turn N+1,
  - **Then** `ChatService.sendMessage` receives the chronological
    `ChatTurn[]` `[userTurn₁, assistantTurn₁, …, userTurnₙ,
    assistantTurnₙ, userTurnₙ₊₁]` and the real adapter posts it as
    `{ messages: [{ role: "user" | "assistant", content: string }, …] }`
    to `apiUrl`.
  - **Then** turns that are still loading or that errored (per
    AC-40) MUST be excluded from the posted history — only
    successfully-completed turns, plus the new user message, are
    sent.
  - **Then** history is kept in React state only; it is not
    persisted across reloads (AC-31c still holds) and is not
    exposed on `window`.

- **AC-53** — *Real-backend adapter — response mapping and forward-compatible schema* · **@evolving**
  - **Given** the backend returns `{ "response": "…answer text…" }`
    with HTTP 200,
  - **Then** the adapter maps it to a `ChatMessage` with a
    client-generated `id`, the `question` that was sent, `answer`
    taken verbatim from `response` (plain text, paragraph breaks
    via `\n`, never parsed as Markdown or HTML per AC-N1), and no
    `sources` field.
  - **Given** the backend later adds extra fields (e.g. `sources:
    [{ label, href? }]`, `timestamp`, `conversationId`),
  - **Then** the adapter MUST ignore unknown fields it does not yet
    support and MUST surface `sources` when the field is present
    and conforms to the `Source[]` shape, without requiring a new
    release cycle for the bare mapping to keep working.

---

## 4. Content, Legal & Trust (Investor-Critical)

These criteria exist because the primary user is making regulated
financial decisions. They apply primarily to the backend, but the
**widget must not undermine them** through UX.

- **AC-60** — *Every factual claim is sourced* · **@aspirational**
  - **Given** any answer that states a fact about Siili (revenue,
    dividend, governance, strategy, etc.),
  - **Then** the answer includes at least one source reference linking
    to a published disclosure (annual report, stock exchange release,
    IR PDF, articles of association, etc.).

- **AC-61** — *No forward-looking statements or advice* · **@aspirational**
  - **Given** an investor asks for a price prediction, buy/sell advice,
    or a forecast,
  - **Then** the answer politely declines and redirects to published
    guidance / financial targets (this is a backend behaviour; the
    widget must render the polite-decline response without decoration
    that makes it look like advice).

- **AC-62** — *No insider or unpublished information* · **@aspirational**
  - **Then** answers must only reference materials already publicly
    disclosed. The widget should never hide or truncate a source link
    in a way that obscures provenance.

- **AC-63** — *Language parity* · **@aspirational**
  - **Given** the host site toggles `FI ↔ EN`,
  - **Then** the widget UI strings (placeholder, header, chips,
    *"Lähteet:"*, *"Haetaan tietoa..."*, error copy) and the backend
    prompt locale are both switched. A Finnish UI answering in English
    (or vice-versa) is a bug.

- **AC-64** — *Timestamp / freshness cue (recommended)* · **@aspirational**
  - **Given** an answer cites a dated document,
  - **Then** the reference badge includes the document's date (e.g.
    "Vuosikertomus 2025") so the investor can judge freshness without
    opening the PDF.

- **AC-65** — *Clear AI labelling* · **@stable**
  - **Given** the expanded view,
  - **Then** it is unambiguous that the user is talking to an AI
    assistant (the "Siili AI-avustaja" header, plus any disclaimer
    required by legal).

---

## 5. Visual Design & Brand (Award-Critical)

These criteria exist to satisfy P2's competition-entry ambition.

- **AC-70** — *Figma parity* · **@evolving**
  - **Given** any component referenced in `AGENTS.md §Figma`,
  - **Then** its rendered output matches the Figma frame for layout,
    spacing, border-radius, typography, and colour within a ±1px
    tolerance. Deltas are tracked as defects, not as acceptable drift.

- **AC-71** — *(deprecated) Token-only styling* · **@stable**
  - **[DEPRECATED 2026-04 — GOV-04]** This criterion described a
    construction rule (component CSS must reference `var(--token)`
    from `variables.css`; no hex / `rgb(` / hard-coded `px` radii
    outside `variables.css`) rather than a user-visible behaviour.
    The rule now lives in
    [`.cursor/rules/code-governance.mdc`](.cursor/rules/code-governance.mdc)
    (design tokens in `src/styles/variables.css`, CSS Modules per
    component) and
    [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc)
    §Styling. The behavioural intent — Figma parity on colours,
    typography, radii, shadows — remains covered by AC-70 (Figma
    parity) and the §2.5 Figma Manifest. ID retained for
    traceability; no successor AC-ID.

- **AC-72** — *Send-button states* · **@stable**
  - **Given** the send button in either mode,
  - **Then** the Active, Hover, and Pressed visuals match the three
    send-button variants (see §2.5 row AC-72), with smooth CSS
    transitions between states.

- **AC-73** — *Typography — Everett via font tokens* · **@stable**
  - **Given** the widget is rendered on a page that has loaded the
    Everett font,
  - **Then** all text uses the `--font-family*` tokens in
    [`src/styles/variables.css`](src/styles/variables.css) at the
    Everett weights (Regular, Light, Bold) used across the Figma
    frames. Code-authored row in §2.5 — promote once a dedicated
    typography node exists in Figma.

- **AC-73b** — *Typography — graceful fallback* · **@stable**
  - **Given** Everett fails to load,
  - **Then** the widget falls back to `sans-serif` gracefully without
    layout shift larger than one line-height.

- **AC-74** — *Motion polish* · **@evolving**
  - **Given** any interactive element (chip, send button, textarea
    focus, compact → expanded transition),
  - **Then** transitions are tastefully animated (no abrupt flicker,
    no overshoot) with durations in the motion range (§12.1 PD-07)
    and an easing that matches the rest of the IR site.

- **AC-75** — *No generic AI aesthetic* · **@evolving**
  - **Given** a juror inspects the widget,
  - **Then** there are no generic "ChatGPT-looking" artifacts: no
    speech bubbles with default tails, no Material-style FAB, no
    default-looking spinners. Every interactive surface uses Siili's
    gradient, tokens, and `--radius`.

- **AC-76** — *Dark hero compatibility* · **@evolving**
  - **Given** the compact mode is overlaid on the hero image,
  - **Then** the translucent textarea and chips maintain WCAG AA
    contrast against the busiest region of the hero image (tested
    with the actual hero asset, not a mock).

---

## 6. Accessibility

- **AC-80** — *Keyboard-only operation* · **@evolving**
  - **Given** a keyboard-only user,
  - **When** they Tab into the widget,
  - **Then** focus order is: textarea → send button → each suggestion
    chip (compact) / each source badge (expanded), with a visible
    focus ring that contrasts against the background.

- **AC-81** — *Screen-reader labelling — textarea* · **@evolving**
  - **Given** a screen reader,
  - **Then** the textarea announces its configured aria-label.

- **AC-81b** — *Screen-reader labelling — send button* · **@evolving**
  - **Given** a screen reader,
  - **Then** the send button announces "Send message" (or its
    localised equivalent when the widget copy is localised).

- **AC-81c** — *Screen-reader labelling — loading state* · **@evolving**
  - **Given** a screen reader and an in-flight assistant answer,
  - **Then** the loading state announces *"Haetaan tietoa..."* via
    an `aria-live="polite"` region (see AC-23).

- **AC-81d** — *Screen-reader labelling — errors* · **@evolving**
  - **Given** a screen reader and an error response (per AC-40),
  - **Then** the error message announces via `role="alert"`.

- **AC-82** — *WCAG 2.1 AA contrast* · **@evolving**
  - **Given** every text/background pair defined by the tokens,
  - **Then** contrast is at least 4.5:1 for body text and 3:1 for
    large text and non-text UI.

- **AC-83** — *Reduced motion* · **@aspirational**
  - **Given** `prefers-reduced-motion: reduce`,
  - **Then** the compact → expanded transition, auto-scroll, and the
    loading blob's pulse animation are reduced or disabled (the blob
    is rendered as a static gray shape alongside the "Haetaan
    tietoa..." text, with no scale/opacity animation).

- **AC-84** — *Zoom and reflow* · **@evolving**
  - **Given** a 200% browser zoom,
  - **Then** no content is clipped or requires horizontal scrolling
    within the widget's container.

---

## 7. Responsiveness

- **AC-90** — *Desktop (≥1024px)* · **@stable**
  - The compact input and chips sit within the hero per the Investor
    hero composition; expanded view has comfortable horizontal
    padding matching the Investor agent composition (see §2.5 row
    AC-90).

- **AC-91** — *Tablet (640–1023px)* · **@evolving**
  - Chips wrap to two rows if needed; the textarea grows to full
    container width; the send button stays inside the input shell.

- **AC-92** — *Mobile (<640px) — compact stacks input above chips* · **@evolving**
  - **Given** a viewport narrower than the mobile breakpoint
    (§12.1 PD-05),
  - **Then** the compact view stacks the input above the chips (not
    side-by-side).

- **AC-92b** — *Mobile (<640px) — chips scroll or wrap without overflow* · **@evolving**
  - **Given** a viewport narrower than the mobile breakpoint
    (§12.1 PD-05),
  - **Then** the suggestion chips are horizontally scrollable or wrap
    onto additional rows without overflowing the viewport width.

- **AC-92c** — *Mobile (<640px) — expanded view full width with Figma padding* · **@evolving**
  - **Given** a viewport narrower than the mobile breakpoint
    (§12.1 PD-05) and the widget is in expanded mode,
  - **Then** the expanded view uses `100%` container width with
    padding per Figma mobile guidance (or a tasteful scale-down of
    the desktop frame if mobile frames are not yet designed).

- **AC-93** — *Textarea auto-grow* · **@stable**
  - **Given** the user types multi-line content,
  - **Then** the textarea grows up to the auto-grow cap (§12.1 PD-06)
    of content height, then scrolls internally (never pushes the
    send button out of view).

---

## 8. Performance

- **AC-100** — *Bundle budget* · **@stable**
  - **Given** the production build,
  - **Then** `dist/siili-chatbot.iife.js` + `dist/siili-chatbot.css`
    combined gzip size is ≤ 60 KB. Any increase is justified in PR
    description.

- **AC-101** — *Cold-start render* · **@evolving**
  - **Given** a cold cache on a simulated mid-range laptop
    (4× CPU throttling in Chrome DevTools),
  - **Then** the compact view is interactive within 150ms of script
    load completing.

- **AC-102** — *No host-page regression* · **@aspirational**
  - **Given** the widget is embedded on the IR site,
  - **Then** Lighthouse performance score for the host page drops by
    no more than 2 points versus the same page without the widget.

- **AC-103** — *No layout thrash* · **@evolving**
  - **Given** messages are streaming in,
  - **Then** CLS (Cumulative Layout Shift) contributed by the widget
    is ≤ 0.05 during a full conversation session.

---

## 9. Cross-Browser & Environment

- **AC-110** — *Browser matrix* · **@evolving**
  - The widget works on the latest two versions of Chrome, Edge,
    Firefox, and Safari (desktop and iOS Safari / Android Chrome).

- **AC-111** — *No console errors* · **@stable**
  - **Given** a happy-path session (load → compact → send → expanded
    → follow-up → success),
  - **Then** there are zero errors and zero warnings in the browser
    console in production builds.

- **AC-112** — *Graceful CSS isolation* · **@stable**
  - **Given** the host page has its own aggressive global styles,
  - **Then** the widget's layout is not visibly affected — all widget
    styling is scoped to the widget's own root element and does not
    leak into or absorb from the host page. (The mechanism — CSS
    Modules plus a scoping root class — is a construction rule
    in [`.cursor/rules/code-governance.mdc`](.cursor/rules/code-governance.mdc)
    and [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc).)

---

## 10. Observability (Light-Touch, Frontend Only)

- **AC-120** — *Event emission — named events for key actions* · **@aspirational**
  - **Given** these user actions — widget mounted, chip clicked,
    message sent, response received, response errored, chat closed
    (via `×` / `Esc` / back), chat reopened (via continue pill),
  - **Then** the widget emits a named event (custom event on
    `window` or calls `window.dataLayer.push` if present) so the IR
    site's existing analytics can capture them.

- **AC-120b** — *Event emission — no PII in payloads* · **@aspirational**
  - **Given** any event emitted per AC-120,
  - **Then** its payload contains no personally identifiable
    information (no user message text, no user-supplied free-form
    content, no identifiers that could be reverse-linked to an
    individual).

- **AC-120c** — *Event emission — `chat_closed` payload* · **@aspirational**
  - **Given** the `chat_closed` event is emitted,
  - **Then** its payload includes the dismiss method
    (`"close_button" | "escape_key" | "back_navigation"`) and the
    message count at dismiss time.

- **AC-121** — *No uncontrolled network calls* · **@stable**
  - **Given** the widget is mounted,
  - **Then** it makes no network requests beyond the configured
    `ChatService` endpoint and any fonts/stylesheets declared by the
    host page. No third-party trackers embedded in the widget.

---

## 10.5 Amending ACs

The criteria in this document are meant to evolve — but only through
the patterns below, so AC-IDs stay stable and traceable. Agents
working under [`.cursor/rules/sdd.mdc`](.cursor/rules/sdd.mdc) must
propose amendments here *before* coding against behaviour that is
not covered.

- **Add a new AC** when a task introduces behaviour no existing
  criterion covers. Pick the next free `AC-xx` in the relevant band
  (3.1 embedding, 3.2 compact, 3.3 expanded, 3.4 errors, 3.5
  service, 4 content/legal, 5 visual, 6 a11y, 7 responsiveness, 8
  performance, 9 browser, 10 observability) and write it as
  Given/When/Then with a short title. Do not reuse a retired ID.
- **Edit an existing AC** when the required behaviour has changed.
  Keep the ID; rewrite the Given/When/Then in the same PR as the
  code change, and note the edit in the PR description (e.g.
  `AC-23 loading copy updated to match §2.5 row AC-23`).
- **Deprecate** instead of deleting. Prefix the AC title with
  `(deprecated)`, add a one-line reason, and link to the
  replacement AC-ID if one exists. Retired IDs are never reused so
  historical PRs keep resolving to something.
- **Visual ACs** must either cite a Figma node in §2.5 Figma
  Manifest or mark the row `— (code-authored)` with a short
  justification. A new visual AC without a manifest row is
  incomplete.
- **Non-goals** (§12) are amended the same way but require
  explicit human approval per
  [`.cursor/rules/change-boundary.mdc`](.cursor/rules/change-boundary.mdc)
  — relaxing a non-goal expands scope and must not be done silently
  by an agent.
- **Traceability**: when a PR adds, edits, or deprecates an AC,
  list the affected AC-IDs in the commit / PR body the same way
  code PRs do. If the AC is visual, bump `Last checked` /
  `Checked by` in §2.5 for the bound row.
- **§13 Traceability roll-up** is derived from §2.5 — re-derive it
  only when persona mapping changes, not for every AC edit.

When in doubt, propose the amendment in chat as a diff against this
section and the affected `AC-xx`, and let the human confirm before
the implementation PR lands.

---

## 10.6 AC Authoring

The §10.5 rules tell you *how* to change an AC; these tell you how
to *write* one in the first place so it survives design iteration.
The guiding principle: each fact lives in exactly one place, and
the specificity of an AC body is calibrated to its stability marker
(see the §Stability markers legend in the AC Catalog).

### One source per fact

When an AC touches any of the facts below, that fact belongs in
the listed home only. The AC body references the home, it does not
restate the fact.

| Fact | Single source | AC body should… |
|------|---------------|-----------------|
| Behavioural intent (what the user sees / can do) | AC body | …state it, in Given/When/Then. This is the contract. |
| Figma node IDs (`ds:X:Y`, `site:X:Y`) | §2.5 Figma Manifest | …reference "see §2.5" or name the component; never inline the node ID. |
| Exact copy strings (Finnish / English text the user reads) | AC body, marked `e.g. "…"` unless the AC is `@stable` | …describe the role of the string and give a representative example. Promote to a pinned literal only when the marker is `@stable`. |
| Token slots (`--gray-500`, `--radius`) | [`src/styles/variables.css`](src/styles/variables.css) | …name the *role* ("neutral question-bubble surface", "primary action gradient"), not the slot. |
| Fixed counts / durations / breakpoints (three chips, ~800ms, 1024px) | §12.1 Product Decisions table | …reference the `PD-xx` ID; do not embed the literal. |
| Verification path (how to test the AC) | AC Catalog `Verification` column | …not restated in the AC body. The `Verification` column itself does not re-cite node IDs that §2.5 already owns (reference "see §2.5 row AC-XX"). |

Granularity smell test: if a single design iteration forces edits
to more than one AC body (excluding §2.5, §12.1, and
[`src/styles/variables.css`](src/styles/variables.css)), a fact
has leaked out of its single source. Consolidate before amending.

### Specificity tracks the stability marker

An AC's marker is a *licence* for how much detail its body may
pin. Writing below the ceiling is always fine; writing above it
guarantees churn.

- **`@stable`** — the body *may* pin specifics the AC is known to
  require: exact copy strings, exact token slots, exact pixel /
  count / duration values, exact Figma node via §2.5. Changes are
  real contract changes and require Amending ACs.
- **`@evolving`** — the body should describe *intent* and defer
  visuals to §2.5. Avoid exact token slots, exact copy (use
  `e.g. "…"`), exact pixel values, exact counts. The AC should
  survive most design iterations without an edit. Promote to
  `@stable` when the design locks.
- **`@aspirational`** — the body should describe the user-visible
  goal and the acceptance path only. Do **not** pin interactive
  details, aria-labels, pixel hit-targets, or copy strings that
  the design has not yet produced. Promote specificity when the
  design and implementation land.

Compound-AC smell: if a `@stable` AC has clauses you expect to
edit in the next design pass, split the AC so each clause has
its own marker, or demote the whole AC to `@evolving` until the
volatile clauses stabilise.

### GOV-05 splits share their Figma anchor

When one visual component is split across sibling ACs
(e.g. AC-28 / AC-28b / AC-28c all describe one input shell),
the Figma node is referenced **once** via §2.5 for the group.
Sibling AC bodies do not re-cite the node; the §2.5 row inherits
the group's sweep via the existing `inherits AC-XX sweep (GOV-05
split)` convention.

### What this rule does not govern

- **Amending an existing AC** — see §10.5. That section governs
  *when* an AC may change; §10.6 governs *how* the resulting body
  reads.
- **Running the Figma sync** — see
  [`scripts/prompts/figma-sync.md`](scripts/prompts/figma-sync.md).
  That job refreshes §2.5 `Last checked` / `Checked by`; it does
  not reshape AC bodies.
- **Deprecations** — §10.5's `(deprecated)` prefix still applies
  unchanged. A deprecated AC keeps whatever specificity its body
  had at retirement; do not reshape retired ACs.

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
  and §10.5.
- **Invariants** — things the widget **must not** do regardless of
  release. These are elevated to negative AC-IDs (`AC-Nx`) below so
  they are enforceable, traceable, and testable the same way other
  ACs are.

### 12.1 Product decisions (v1 scope)

**v1-scope exclusions** (no `PD-xx` ID — these are things we chose
not to do, not values to reference):

- The widget does **not** persist conversation history across page
  loads. A hard reload is the intentional reset mechanism; no
  dedicated "new conversation" button is provided in v1.
- The widget does **not** stream tokens (current contract is
  request/response). Streaming is a future extension of
  `ChatService`, not a v1 requirement.

**Product decision values** (`PD-xx` — quantitative constants
referenced by behavioural ACs). Per §10.6 AC Authoring, AC bodies
reference the `PD-ID` instead of restating the literal.

| ID    | Decision                          | Value                            | Referenced by                | Notes |
|-------|-----------------------------------|----------------------------------|------------------------------|-------|
| PD-01 | Predefined suggestion chip count  | 3                                | AC-10, AC-12                 | — |
| PD-02 | Mock response latency             | ~800 ms                          | AC-51                        | Demo fidelity only; not a real-backend target. |
| PD-03 | Mock source count                 | 2                                | AC-51                        | — |
| PD-04 | Network timeout for real backend  | 30 s                             | AC-43                        | — |
| PD-05 | Responsive breakpoints            | ≥1024 / 640–1023 / <640 px       | AC-90, AC-91, AC-92, AC-92b, AC-92c | AC titles carry these as identifiers; renaming a title is an Amending-ACs event (§10.5). |
| PD-06 | Textarea auto-grow cap            | 240 px                           | AC-93                        | — |
| PD-07 | Motion duration range             | 120–300 ms                       | AC-74                        | — |

Amending these values follows §10.5 Amending ACs: edit the row
here, then confirm every AC in the `Referenced by` column still
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
