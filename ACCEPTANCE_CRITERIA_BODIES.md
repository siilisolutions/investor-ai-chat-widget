# Acceptance Criteria — Bodies (§§1–10)

> Long-form Given/When/Then prose for every `AC-xx` in §§1–10 of the
> spec. The catalog, §2.5 Figma Manifest, §11 Definition of Done, §12
> Non-Goals (incl. AC-N1 / AC-N2 bodies), and §13 Traceability live in
> [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md). Amending
> conventions (former §10.5 / §10.6) live in
> [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc).
>
> AC-IDs and Markdown anchors here match the catalog row links exactly
> — e.g. the catalog's `[§3.1](#31-embedding--initialisation)` resolves
> to the heading below in this file. When you edit an AC body, follow
> `.cursor/rules/ac-amending.mdc`.

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

- **AC-03** — *Idempotent init* · **@stable**
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

- **AC-10a** — *Continue-conversation pill — rendering* · **@evolving**
  - **Given** the PD-08 conversation store contains at least one
    conversation with `messages.length > 0`, and the widget is
    rendering compact mode,
  - **Then** a single pill is rendered above the suggestion chips
    labelled *"Jatka edellistä keskustelua"* (Figma `site:395:5439`,
    styled per Siili tokens: Everett, `--radius`, surface per the
    referenced frame).
  - **Given** the store is empty or every conversation in the store
    has zero Q+A pairs,
  - **Then** the pill is not rendered and compact mode falls back to
    the textarea-plus-chips layout (AC-10).
  (added 2026-04, Figma component drift; amended 2026-05, multi-discussion flow rework — graduated from @aspirational to @evolving with the continue-pill implementation; copy pinned to "Jatka edellistä keskustelua" per `site:395:5439`.)

- **AC-10c** — *Continue-conversation pill — activation* · **@evolving**
  - **Given** the continue-conversation pill is rendered (per AC-10a),
  - **When** the user clicks or keyboard-activates the pill,
  - **Then** the widget sets the most-recent conversation in the
    PD-08 store as active and transitions to expanded mode with that
    conversation's Q+A stream rendered and the latest reply scrolled
    into view. No network call is fired by the activation itself.
  - **Given** the user subsequently sends a new message in expanded
    mode after activating the pill,
  - **Then** the message appends to the resumed conversation under
    AC-29 — it does **not** mint a new conversation, because AC-31f
    only mints on sends that originate in compact mode.
  (added 2026-04, Figma component drift; amended 2026-05, multi-discussion flow rework — graduated from @aspirational to @evolving; clarified the post-activation send path against AC-31f.)

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
    *"Kysy minulta Siilistä sijoituskohteena."* styled per the
    textarea component (see §2.5 row AC-11). The same placeholder
    is shown by the expanded-mode textarea (`ds:152:121` Default
    variant) — Figma pins identical copy on both variants of the
    `ds:181:143` Textarea component set so the widget renders one
    string across both modes.
  (amended 2026-05, #PR — Figma copy update: placeholder shortened from "Kysy minulta mitä vaan Siilistä sijoituskohteena tai taloustiedoistamme." to "Kysy minulta Siilistä sijoituskohteena." per `ds:152:75` `I152:81;181:146` and `ds:152:121` `152:123`.)

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

- **AC-12c** — *Suggestion chip elevation* · **@evolving**
  - **Given** compact mode is shown,
  - **Then** each suggestion chip carries a subtle drop shadow on
    every visual state (idle, hovered, pressed) so the chips read
    as elevated cards against the hero image, matching the
    predefined-question component's shadow declarations (see §2.5
    row AC-12c).
  - **Given** the user hovers a chip,
  - **Then** the chip retains its shadow envelope while the surface
    shifts to the Hover variant's slightly more opaque white per
    AC-12 / §2.5 row AC-12c.
  - **Given** the user presses a chip,
  - **Then** the chip's shadow tightens (smaller blur radius) to
    convey pressed-down feedback per the Pressed variant's tighter
    envelope in Figma (see §2.5 row AC-12c).
  - **And** under `prefers-reduced-motion: reduce` the shadow does
    not animate between states — only the surface colour swaps.
  (added 2026-05, #PR — Figma sweep surfaced that all three variants of `ds:230:725` declare drop shadows; the widget was rendering chips without any elevation.)

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

- **AC-17** — *Input shell — click-to-focus target with text cursor* · **@stable**
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

- **AC-20a** — *Fill the viewport* · **@stable**
  - **Given** the widget has entered expanded mode,
  - **Then** the widget's overlay covers the entire browser viewport
    (100vw × 100vh from the widget's root container) so host-page
    content behind the widget is not interactive — at or above the
    §12.1 PD-05 desktop breakpoint the overlay is composed of an
    inset white card and a blurred backdrop sibling that together
    fill the viewport (see §2.5 row AC-20a / `site:434:2424`); below
    the desktop breakpoint the white card itself fills the viewport
    edge-to-edge.
  - **Then** wherever host-page content is visible at all (the
    desktop backdrop band), it is visibly defocused (e.g. via
    `backdrop-filter: blur(...)` or, where unsupported, a translucent
    white wash) so it cannot be mistaken for an interactive surface.
  (amended 2026-05, Lane J — Figma re-align: split full-bleed into white card + blurred backdrop on desktop per `site:434:2424`; AC-20b unchanged because the hero is still hidden from the user's perceived focus.)

- **AC-20b** — *Hero image hidden* · **@stable**
  - **Given** the widget is in expanded mode,
  - **Then** the hero image / hero section that was visible behind the
    compact view is no longer visible to the user — either because
    the widget's opaque surface fully covers it, or because the host
    page's hero is hidden/collapsed while the widget is expanded.

- **AC-20f** — *Transition — no host-page scroll or reflow* · **@stable**
  - **Given** the widget is transitioning from compact to expanded
    mode,
  - **Then** the host page underneath does not scroll or reflow
    visibly as a side-effect of the transition (the host page's
    scroll position and layout are preserved for when the user
    dismisses expanded mode per AC-31).

- **AC-20c** — *Back navigation — history entry pushed on expand* · **@stable**
  - **Given** `SiiliChatbot.init({ interceptBackNavigation: true })`
    (default `true`) and the widget is about to enter expanded mode,
  - **When** the compact → expanded transition begins,
  - **Then** the widget pushes a single history entry
    (`history.pushState({ siiliExpanded: true }, '')`) so it can
    recognise it on `popstate`.
  (amended 2026-04, Figma component drift — implementation landed; promoted to @evolving; amended 2026-05, Lane H — graduated to @stable.)

- **AC-20g** — *Back navigation — popstate returns to compact* · **@stable**
  - **Given** the widget is in expanded mode with its own history
    entry on the stack (per AC-20c),
  - **When** the user triggers browser back (desktop back button,
    Android hardware back, iOS swipe-back),
  - **Then** the widget's `popstate` listener flips mode back to
    compact with `messages` retained (see AC-31). The
    pushed-history flag is cleared so a subsequent dismiss path
    does not call `history.back()` on a non-existent entry.
  (amended 2026-04, Figma component drift — implementation landed; promoted to @evolving; amended 2026-05, Lane H — graduated to @stable.)

- **AC-20h** — *Back navigation — compact-mode back is not intercepted* · **@stable**
  - **Given** the user is already in compact mode,
  - **When** the user triggers browser back,
  - **Then** the event is not intercepted — the host page's normal
    navigation applies.
  (amended 2026-04, Figma component drift — implementation landed; promoted to @evolving pending Figma visual confirmation; amended 2026-05, Lane H — graduated to @stable. AC-20h is purely behavioural and never depended on the deferred Figma visual confirmation; the gating note carried over from a sibling AC at the time.)

- **AC-20i** — *Back navigation — opt-out via `interceptBackNavigation: false`* · **@stable**
  - **Given** `SiiliChatbot.init({ interceptBackNavigation: false })`,
  - **Then** no history entry is pushed on compact → expanded and
    `popstate` is not intercepted at any point in the widget
    lifecycle. The close button (AC-20d) and `Esc` (AC-20j) still
    dismiss the expanded mode; they just flip mode directly without
    calling `history.back()`.
  (amended 2026-04, Figma component drift — implementation landed; promoted to @evolving; amended 2026-05, Lane H — graduated to @stable.)

- **AC-20d** — *Close button — rendering* · **@stable**
  - **Given** the widget is in expanded mode,
  - **Then** a close (`×`) button is rendered in the top-right of the
    expanded view, styled per the Figma `Close discussion` component
    set (see §2.5 row AC-20d) and labelled
    `aria-label="Sulje keskustelu"`. The visible 32 × 32 circular
    surface from the parent set's Default / Hover / Pressed variants
    is also the click target (no wrapping hit-area buffer); 32 × 32
    meets the WCAG 2.5.8 (AA) minimum-target-size guideline. The
    inner glyph is a 16 × 16 inline SVG of two crossed strokes from
    `ds:197:1108`.
  (amended 2026-04, Figma component drift — implementation landed against `ds:196:853`; visual styling stayed `@evolving` until the parent component set was published; amended 2026-05, Lane P — Figma sync sweep landed against the now-published `ds:223:739` parent set (Default `ds:196:853` no fill / Hover `ds:223:740` `--gray-300` / Pressed `ds:224:820` `--gray-500`, 32 × 32 visible surface wrapped by the AC-20d 44 × 44 hit target, 16 × 16 inline SVG glyph from `ds:197:1108`); graduated `@evolving → @stable`; amended 2026-05, Lane P follow-up — relaxed the 44 × 44 minimum hit target rule to 32 × 32 to match Figma exactly per `sdd.mdc` "Figma wins on visual conflicts". Trade-off: passes WCAG 2.5.8 (AA, ≥24 × 24); no longer reaches WCAG 2.5.5 (AAA, ≥44 × 44) for this control. The visible 32 × 32 surface is now the click target directly — no inner-span wrapper.)

- **AC-20j** — *Close button — activation dismisses expanded mode* · **@stable**
  - **Given** the widget is in expanded mode,
  - **When** the user clicks the close button or presses `Esc`
    anywhere inside the widget,
  - **Then** the widget returns to compact mode with `messages`
    retained (see AC-31) and, if `interceptBackNavigation` is on,
    calls `history.back()` to keep the history stack in sync.
  (amended 2026-04, Figma component drift — implementation landed; promoted to @evolving; amended 2026-05, Lane H — graduated to @stable. AC-20d's visual rendering still defers to a future figma-sync turn; that gate is on AC-20d only and does not block AC-20j's behavioural contract.)

- **AC-20k** — *Close button — reduced motion* · **@evolving**
  - **Given** `prefers-reduced-motion: reduce`,
  - **When** the user dismisses expanded mode via the close button,
    `Esc`, or browser back (AC-20j / AC-20g),
  - **Then** the dismiss transition is instant (no fade / slide).
    `closeButton.module.css` and `expandedView.module.css` already
    drop their hover / mount transitions inside a
    `prefers-reduced-motion: reduce` media query.
  (amended 2026-04, Figma component drift — implementation landed; promoted to @evolving.)

- **AC-21** — *Header* · **@stable**
  - **Given** expanded mode is shown,
  - **Then** the header reads *"Siili AI-avustaja"* styled per the
    Investor agent component (see §2.5 row AC-21).
  - **Given** the viewport is at or above the §12.1 PD-05 desktop
    breakpoint,
  - **Then** the header sits left-aligned with the AC-33 sidebar
    column.
  - **Given** the viewport is below the §12.1 PD-05 mobile
    breakpoint,
  - **Then** the header sits inside a single top-bar row that also
    holds the AC-33d hamburger affordance (left edge) and the
    AC-20d close button (right edge), per `site:435:2904` /
    `site:435:2914`. The AC-33 sidebar collapses behind the
    hamburger on mobile per AC-33d, so the title's desktop
    "left-aligned with the sidebar column" rule does not apply at
    this breakpoint — instead the title flexes to fill the row
    between the hamburger and close button.
  (amended 2026-05, #PR — Mobile drawer landed: pin the mobile top-bar layout co-anchoring the title with the AC-33d hamburger and the AC-20d close button per `site:435:2904` / `site:435:2914`.)

- **AC-22** — *Question bubble* · **@stable**
  - **Given** any Q+A pair,
  - **Then** the question appears right-aligned in a bubble matching
    the Question+Answer component (see §2.5 row AC-22).

- **AC-23** — *Loading indicator — semantics and copy* · **@stable**
  - **Given** an in-flight assistant answer,
  - **Then** a pulsating gray blob (see §2.5 row AC-23) and the text
    *"Haetaan tietoa..."* appear in place of the answer, with
    `role="status"` and `aria-live="polite"`.

- **AC-23b** — *Loading indicator — blob visual style* · **@stable**
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

- **AC-28** — *Input positioned at the bottom of the conversation column* · **@stable**
  - **Given** expanded mode is shown,
  - **Then** the `ChatInput` is pinned to the bottom of the
    conversation column (sticky / absolutely positioned within the
    column). The Q+A stream scrolls in its own overflow container
    above and behind the input. AC-27 (auto-scroll to newest) lands
    each new pair just above the input, with at least the latest
    reply and the input both visible together (see AC-28c).
  (amended 2026-05, Lane J — Figma re-align: input is now bottom-pinned regardless of conversation length per `site:434:2424`; AC-28b reversed and tombstoned in the same edit.)

- **AC-28b** — *(deprecated) Input placement — short conversations are not bottom-pinned* · **@stable**
  - [DEPRECATED 2026-05 — reversed by AC-28 amendment, reason: designer pinned the input to the bottom of the conversation column regardless of length, per `site:434:2424`. The "short conversation = no bottom pin" rule is no longer the design contract.]

- **AC-28c** — *Input placement — latest reply visible above the bottom-pinned input, fade above input, scroll isolation* · **@stable**
  - **Given** the conversation is long enough to scroll,
  - **Then** after the AC-27 auto-scroll, the latest reply is visible
    immediately above the bottom-pinned input from AC-28; the input
    itself is fully visible at the bottom of the conversation column.
  - **Then** the band between the conversation stream and the input
    presents a vertical opacity fade (e.g. `mask-image` or a
    pseudo-element gradient) so messages scrolling under the input
    fade out rather than colliding with the input shell.
  - **Then** the conversation stream is its own overflow container —
    its scrollbar consumes column space without shifting the
    sidebar, the title, the input, or the desktop margin. The
    sidebar's row list is also its own overflow container under the
    same rule (see AC-33).
  (amended 2026-05, Lane J — Figma re-align: clarified bottom-pinned + opacity-fade band + scroll-isolation contract per `site:434:2424`.)

- **AC-29** — *Follow-up questions* · **@stable**
  - **Given** the user is in expanded mode and sends another message,
  - **Then** a new Q+A pair is appended below the previous ones
    (existing pairs are never mutated) and the input is cleared.

- **AC-30** — *Input disabled during load* · **@stable**
  - **Given** an assistant answer is in flight,
  - **Then** the textarea and send button are disabled (visually
    greyed per Figma and functionally non-interactive) until the
    response resolves.

- **AC-31** — *Dismissal retains messages* · **@stable**
  - **Given** the widget is in expanded mode,
  - **When** the user dismisses it via the close button (AC-20j),
    `Esc`, or browser back (AC-20g),
  - **Then** the widget re-renders compact mode *and* retains the full
    `messages` array in memory for the remainder of the page session.
  (amended 2026-04, Figma component drift — implementation landed via AC-20j routing through `dismissExpanded` in `App.tsx`, which never clears `messages` on mode flip; promoted to @evolving; amended 2026-05, Lane H — graduated to @stable. The `messages` array now lives inside the active `Conversation` in the PD-08 store and the dismiss path only flips `mode`; cross-session persistence is owned separately by AC-31e.)

- **AC-31b** — *Compact re-entry surfaces continue-pill and hides asked chips* · **@aspirational**
  - **Given** the user has re-entered compact mode with non-empty
    history,
  - **Then** compact mode shows the continue-conversation pill
    (AC-10a) and hides already-asked chips (AC-10b); the history is
    never rendered in full inside the compact hero.

- **AC-31c** — *(deprecated) Tab close clears history* · **@aspirational**
  - [DEPRECATED 2026-05 — superseded by AC-31e, reason: PD-08 storage moved from `sessionStorage` to `localStorage`; tab close is no longer a reset signal.]
  (amended 2026-04, Figma component drift — boundary moved from
  "reload clears" to "tab close clears" so the AC-33 sidebar can
  list past conversations within a session; PD-08 captures the
  underlying storage choice; deprecated 2026-05, multi-discussion flow rework.)

- **AC-31e** — *History persists across tab close and browser restart* · **@evolving**
  - **Given** the user has one or more conversations in the PD-08 store,
  - **When** the user closes the tab, closes the browser, or reloads
    the page within the same browser profile,
  - **Then** the conversations remain available — none of those
    boundaries are reset signals. The user re-enters the host page
    with the continue-pill (AC-10a) reachable on the hero and the
    sidebar (AC-33) populated with the persisted rows as soon as
    they re-enter expanded mode.
  - **Given** the user clears site storage via browser tooling (or
    a different browser profile loads the host page),
  - **Then** the store is empty and the widget mounts in its
    first-visit state.
  (added 2026-05, multi-discussion flow rework — replaces AC-31c after PD-08 storage move from `sessionStorage` to `localStorage`.)

- **AC-31d** — *(deprecated) New message from compact with history appends* · **@evolving**
  - [DEPRECATED 2026-05 — superseded by AC-31f, reason: compact-mode sends now mint a fresh conversation when history exists; the appending contract moved to expanded-mode sends only.]
  (amended 2026-04, Figma component drift — `App.tsx::handleSend` always appends to `messages` regardless of mode; the AC-29 follow-up test exercises the same code path; promoted to @evolving; deprecated 2026-05, multi-discussion flow rework.)

- **AC-31f** — *Compact-mode send mints a new conversation when history exists* · **@stable**
  - **Given** the widget is in compact mode and the active
    conversation already contains at least one Q+A pair,
  - **When** the user sends a new message (Enter on the textarea, a
    chip click, or the send button),
  - **Then** the widget mints a fresh conversation in the PD-08
    store, sets it as the active conversation, transitions to
    expanded mode, and the new Q+A pair is the first entry in that
    fresh conversation. Earlier conversations are preserved in the
    store and surface in the AC-33 sidebar (which is always
    rendered in expanded mode).
  - **Given** the widget is in compact mode and the active
    conversation has no Q+A pairs (typical of the first-ever send
    in a new browser profile),
  - **Then** the send appends to the empty active conversation
    rather than minting a duplicate — a fresh-on-mount conversation
    is the natural target for the first message.
  - **Given** the widget is already in expanded mode,
  - **Then** sends append to the active conversation — AC-29
    governs that path. The "mint on send" rule applies only to
    sends that originate in compact mode.
  - The user can still re-enter a prior conversation from compact
    mode via the continue-pill (AC-10a / AC-10c); that path flips
    to expanded **before** any send, so subsequent sends append to
    the resumed conversation under AC-29.
  (added 2026-05, multi-discussion flow rework — replaces AC-31d after the conversation-store contract changed from "single thread, dismiss-and-resume" to "multi-thread, hero-initiated chats start fresh"; amended 2026-05, Lane H — graduated to @stable.)

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

- **AC-33** — *Previous discussion list — visibility, transparent shell, scroll isolation* · **@evolving**
  - **Given** the widget is in expanded mode,
  - **Then** the sidebar (Figma `ds:191:258`, see §2.5 row AC-33)
    is rendered alongside the Q+A stream, regardless of how many
    conversations the PD-08 store holds. The sidebar is the
    permanent home of two affordances the user must always be able
    to reach in expanded mode: the "Luo uusi keskustelu" CTA
    (AC-35) and the per-row delete `×` (AC-33e). The active
    conversation is always one of the rows — the "expanded always
    has an active conversation" invariant guarantees the row list
    is never empty.
  - **Given** the viewport is below the §12.1 PD-05 mobile
    breakpoint,
  - **Then** the always-visible rule is satisfied by the AC-33d
    discoverable affordance (drawer / overflow toggle) — the
    sidebar's *contents* remain reachable in one tap; AC-33d owns
    the visual collapse, AC-33 only asserts reachability.
  - **Then** the sidebar's outer container has no background of its
    own — only individual rows carry surface treatment (see AC-33a)
    and a vertical divider separates the sidebar column from the
    Q+A column (see §2.5 row AC-33). This keeps the sidebar visually
    secondary to the active conversation.
  - **Then** the row list scrolls inside its own overflow container
    when long, with its scrollbar consuming sidebar space only — it
    does not push the divider, the conversation column, or the
    desktop margin (mirrors AC-28c scroll isolation on the other
    column).
  (added 2026-04, Figma component drift; amended 2026-05, #PR — sidebar now always visible in expanded mode so the user can always reach the start-new and per-row delete affordances; AC-33c tombstoned; amended 2026-05, Lane J — Figma re-align: transparent shell + per-row treatment + vertical divider + scroll isolation, per `ds:191:258` / `site:434:2424`.)

- **AC-33a** — *Previous discussion list — items render* · **@evolving**
  - **Given** the sidebar is rendered (per AC-33),
  - **Then** each prior conversation is represented by a row whose
    label identifies the conversation to the user (e.g. derived
    from the first user question in that conversation, truncated
    to fit the row), so the user can recognise which thread is
    which.
  - **Given** an inactive row is hovered,
  - **Then** the row's idle and hovered surfaces come from the
    Default and Hover variants of the parent set in Figma (see
    §2.5 row AC-33a) so the two observable inactive states read
    as a coherent neutral pair rather than two unrelated greys.
  - **Given** the active conversation is also tracked in the same
    store,
  - **Then** the active row is visually distinguished from inactive
    rows by carrying the **Hover** variant's neutral surface (see
    §2.5 row AC-33a) as its idle treatment — one step darker than
    an inactive Default row, matching the active-row treatment
    Figma applies in `site:434:2424` (`property1="Hover"` for the
    active conversation). Row label typography stays Everett
    Regular on every variant per the parent set (no separate bold
    cue is rendered — the surface step is the cue). The strong
    disambiguator for "which conversation am I looking at?" is the
    right-column Q+A stream itself; the sidebar surface step is
    a secondary confirmation that the right row corresponds to the
    visible conversation.
  - **And** hovering an inactive row briefly produces the same
    surface as the active row. This is intentional: Figma's Hover
    variant doubles as the canonical "active-looking" treatment,
    so the hover preview reads as "this is what selecting will
    look like". The Pressed variant remains a documented part of
    the parent set but is not rendered as a static row state by
    the widget — it would be reserved for a future transient
    "while pressing" surface if one is ever needed.
  (added 2026-04, Figma component drift; amended 2026-05, #PR — graduated @aspirational → @evolving; visual states pinned to the `ds:230:452` parent set's Default / Hover / Pressed variants with active row using the Pressed surface as the AC-33a active-row cue alongside the bold-label cue; specifics live in §2.5 row AC-33a; amended 2026-05, #PR — active row reconciled to the Hover variant's surface (one step darker than Default), and the bold-label cue dropped, per `site:434:2424` Figma context placing the active row at `property1="Hover"`. The Pressed variant is no longer rendered as a static row state.)

- **AC-33b** — *Previous discussion item — activation* · **@aspirational**
  - **Given** the sidebar lists prior conversations (per AC-33a),
  - **When** the user clicks or keyboard-activates a row,
  - **Then** the widget swaps the active conversation: the Q+A
    stream re-renders that conversation's history, the textarea
    clears, and no network call is made on activation alone (the
    next user message is what posts to the backend, with that
    conversation's history per AC-52).
  - **Given** the active conversation has unsent draft text in the
    textarea when the user activates a different row,
  - **Then** the draft is preserved against the previously-active
    conversation under PD-08, so re-activating that row restores
    the draft.
  (added 2026-04, Figma component drift)

- **AC-33c** — *(deprecated) Previous discussion list — empty state* · **@aspirational**
  - [DEPRECATED 2026-05 — superseded by AC-33, reason: the sidebar
    is now always visible in expanded mode so the user can always
    reach the AC-35 start-new CTA and the AC-33e per-row delete `×`;
    the "store of one hides the sidebar" clause no longer holds.]
  (added 2026-04, Figma component drift; deprecated 2026-05, #PR — sidebar made always-visible.)

- **AC-33d** — *Previous discussion list — mobile responsive treatment* · **@evolving**
  - **Given** the viewport is below the §12.1 PD-05 mobile
    breakpoint and the sidebar would otherwise be rendered (per
    AC-33),
  - **Then** the sidebar collapses behind a hamburger toggle
    (Figma component `ds:230:656` — Menu button, 24×24 with
    three horizontal stripes) anchored at the left edge of the
    AC-21 mobile top-bar row, so it does not consume primary
    chat real-estate on a small screen while still being
    reachable in one tap.
  - **When** the user activates the hamburger,
  - **Then** a drawer slides in from the left edge of the
    expanded surface (Figma `ds:214:1214` — Mobile menu;
    rendered in context inside `site:435:2914`). The drawer
    card is white with the widget's brand drop-shadow, takes
    roughly three-quarters of the viewport width
    (~292 px on the 390 px frame), and contains, top to bottom:
    a dismiss `×` button at the top-right of the card (Figma
    component `ds:196:853`, the same close-glyph reused from
    AC-20d but scoped to the drawer rather than the chat), and
    the AC-33 `PreviousDiscussionList` rendered verbatim — the
    AC-35 "Luo uusi keskustelu" CTA, the AC-33b row activation
    affordances, and the AC-33e per-row delete `×` are all
    reachable inside the drawer with no behavioural change.
  - **Then** the rest of the expanded surface (the area behind
    and beside the drawer card) is overlaid with a translucent
    dark wash and a light backdrop blur (e.g.
    `rgba(0,0,0,0.2)` + `backdrop-filter: blur(2px)` per
    `ds:214:1214`) so the active conversation reads as visibly
    *backgrounded* — the user can still see the chat behind the
    drawer to keep their place, but interactions land on the
    drawer until it is dismissed.
  - **When** the user dismisses the drawer — by activating the
    drawer's `×` button, pressing `Esc`, tapping the
    blurred backdrop outside the drawer card, activating
    "Luo uusi keskustelu" (AC-35), or activating any
    discussion row (AC-33b) —
  - **Then** the drawer closes. Activations of the AC-35 CTA
    and the AC-33b rows still take their normal effect (mint a
    new conversation / swap the active conversation); the
    drawer simply auto-dismisses afterwards so the user is
    returned to the conversation they just chose. Focus
    returns to the hamburger toggle on close so keyboard users
    can resume.
  - The AC-33e per-row delete `×` does **not** dismiss the
    drawer — its confirmation modal needs to render *over* the
    drawer so the user can confirm or cancel without losing
    sidebar context.
  - The drawer is mounted only at this breakpoint band; at or
    above the §12.1 PD-05 desktop breakpoint the AC-33 sidebar
    renders inline as a column inside the conversation card and
    the hamburger is absent.
  (added 2026-04, Figma component drift; amended 2026-05, #PR — Mobile drawer landed: graduated @aspirational → @evolving, anchored to `ds:214:1214` / `ds:230:656` / `site:435:2914` (see §2.5 row AC-33d), pinned the slide-in drawer + blurred backdrop + dismiss paths.)

- **AC-33e** — *Previous discussion item — per-row delete with confirmation* · **@evolving**
  - **Given** the AC-33 sidebar is rendered (i.e. the widget is in
    expanded mode — sidebar visibility no longer gates on the
    conversation count, see the AC-33c tombstone),
  - **Then** each `PreviousDiscussionItem` row carries a trailing
    dismiss (`×`) affordance scoped to that row's conversation
    id, including the only row when the store holds a single
    conversation. The glyph is the `ResetButton` already surfaced
    by the live `get_code_connect_map` snippet on `ds:191:258`,
    rendered at the trailing edge of the row inside `ds:191:268`.
  - **When** the user activates the `×` (click or keyboard),
  - **Then** an in-widget confirmation modal opens, centered in
    the viewport over a dimmed backdrop covering the rest of
    the widget surface so the dismiss prompt is the unambiguous
    focal point and the user cannot interact with the underlying
    chat until they choose. The modal *card itself* matches the
    Figma component referenced in §2.5 row AC-33e: a
    brand-tokenized white surface with the widget radius and
    shadow, a bold title (e.g. *"Poista keskustelu"*), a body
    that names the conversation being deleted with the row's
    derived label rendered in bold (e.g. *"Haluatko varmasti
    poistaa keskustelun **{label}**?"*) — falling back to the
    same neutral label the sidebar row uses when the conversation
    has no derived label yet — a cancel button (e.g. *"Peruuta"*)
    on a tokenized outline, and a destructive confirm button
    (e.g. *"Poista"*) on a destructive-red action surface (named
    token in [`src/styles/variables.css`](../src/styles/variables.css)).
    The widget already fills `100vw × 100vh` in expanded mode per
    AC-20a, so "rest of the widget surface" is equivalent to
    "rest of the screen" from the user's perspective on every
    viewport that can reach this affordance. The surrounding
    viewport overlay is anchored on `site:555:2214` per §2.5
    row AC-33e (Lane L, 2026-05-11) — a dim-only `Background dim`
    rectangle over the chat surface, no modal-layer blur.
  - **When** the user confirms,
  - **Then** the row is removed from the PD-08 store; if the
    removed conversation was the active one, the active
    conversation switches to the next-most-recent remaining row
    (mirrors AC-33b activation semantics — state-only, no network
    call). Removing the *only* remaining conversation mints a
    fresh empty conversation, sets it as the new active, and
    keeps the user in expanded mode (consistent with the
    "expanded always has an active conversation" invariant and
    the AC-33 always-visible-sidebar invariant — the sidebar
    re-populates with the freshly-minted row, the Q+A stream
    clears, and the textarea clears).
  - **When** the user cancels — by activating the cancel button,
    pressing `Esc`, or clicking the dimmed backdrop outside the
    modal card —
  - **Then** the modal closes and no state changes; focus returns
    to the row's `×` button so keyboard users can resume.
  - **Open product questions** (the visual surface for the modal
    card is now anchored via §2.5; the items below are the
    residual gaps): the modal's animation curves on open / close
    (Figma does not show motion). These remain open without
    blocking the AC because the marker is `@evolving`; per
    [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc)
    §AC Authoring an `@evolving` body describes intent and defers
    visuals to §2.5.
  (added 2026-05, #PR — Multi-discussion delete flow; amended 2026-05, #PR — Figma `ds:242:490` confirmation modal landed; graduated @aspirational → @evolving; amended 2026-05, #PR — backdrop click resolved as cancel + neutral-label fallback confirmed; amended 2026-05, #PR — single-leftover-row delete now mints fresh & stays expanded, aligning with AC-33 always-visible sidebar; amended 2026-05, #PR — backdrop softened "blurred" → "dimmed" after `site:555:2214` anchored the surrounding viewport overlay in Lane L)

- **AC-35** — *Start-new-conversation affordance in expanded mode* · **@stable**
  - **Given** the widget is in expanded mode (the AC-33 sidebar is
    therefore always rendered, regardless of conversation count),
  - **Then** a primary-CTA affordance sits at the top of the
    sidebar — above the "Aiemmat keskustelut" heading — labelled
    "Luo uusi keskustelu" and styled as a brand-gradient pill
    matching the send-button family (Figma component set
    `ds:237:398` with `Default` / `Hover` / `Pressed` variants
    `ds:237:323` / `ds:237:399` / `ds:237:411`; see §2.5 row AC-35
    for the manifest entry and the screen anchors in
    `site:434:2424` / `site:434:2696` / `site:435:2914`). Hover and
    Pressed darken the gradient via the shared `--send-overlay-*`
    tokens used by the send button so the brand gradient and its
    state-overlay rules live in one place.
  - **Then** the gradient runs diagonally from the top-left
    (violet) to the bottom-right (blue), distinct from the Send
    button family's gradient direction; the exact angle is
    Figma-owned (see §2.5 row AC-35 / `ds:237:323`).
  - **When** the user activates it (click or keyboard),
  - **Then** the widget creates a new entry in the PD-08
    conversation store, sets it as the active conversation,
    clears the rendered Q+A stream, and clears the textarea
    draft. The previously-active conversation is preserved in the
    store and remains a row in the same sidebar; no network call
    is made on activation alone (per the same contract as AC-33b).
  - The in-expanded affordance is reachable from any expanded
    state — including the case where the PD-08 store holds only
    the active conversation. The AC-31f compact-mode flow remains
    a valid alternative path (dismiss via close / Esc / back-nav,
    then send a new message from compact), but it is no longer
    the only path to grow the store from one entry.
  - This AC closes a gap that emerged during the Figma component
    drift (2026-04): the AC-33 sidebar cluster only describes
    *switching* between existing conversations; without AC-35 the
    user would have no in-sidebar path to grow the conversation
    store. The 2026-05 Figma update added the `ds:237:398` Button
    component set and placed it inside the IR-site sidebar
    instances, anchoring the placement and visual contract; the
    React-side parity (label, gradient, leading inline-SVG plus
    icon, Hover / Pressed) and the Code Connect mapping landed in
    the same week, graduating the AC `@aspirational` →
    `@evolving` → `@stable`.
  (added 2026-04, Figma component drift; amended 2026-05, multi-discussion flow rework; amended 2026-05, parity landed + Code Connect mapped; amended 2026-05, #PR — sidebar always visible per AC-33 means the store-of-one reachability caveat is dropped; amended 2026-05, Lane J — Figma re-align: pin diagonal direction violet→blue top-left → bottom-right; introduces a CTA-only gradient token in the implementation turn — `--send-gradient` is unchanged because AC-72 still uses it.)

- **AC-34** — *Per-conversation title in expanded view* · **@aspirational**
  - **Given** the widget is in expanded mode showing a specific
    conversation,
  - **Then** a per-conversation title is rendered at the top of
    the expanded view (distinct from the static brand label
    covered by AC-21), identifying the active conversation to
    the user — e.g. derived from the first user question of that
    conversation, truncated to fit the title slot.
  - **Given** the active conversation is empty (a freshly-created
    conversation that has no Q+A pair yet),
  - **Then** the title falls back to a neutral default that does
    not pretend to label the conversation prematurely.
  - This AC sits alongside AC-21 (the static brand header) rather
    than replacing it; once Figma confirms whether `Title` and the
    brand header are stacked, side-by-side, or mutually exclusive
    in the new layout, this AC may be promoted with that detail
    or merged into AC-21 via [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) §Tombstone format.
  (added 2026-04, Figma component drift)

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

- **AC-42** — *No developer leakage* · **@stable**
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
  - **Then** every request carries an `X-Disable-Continuous-Eval:
    true` header so the backend skips its continuous-evaluation
    pass; this is a static, unconditional header — the widget has
    no UI affordance to opt back in to slower / evaluated mode.
  - **Then** history is kept in React state for in-flight rendering
    plus the PD-08 `localStorage` store for cross-session
    persistence (AC-31e); it is not exposed on `window` and is
    not shared with any server beyond the explicit POST to
    `apiUrl`.
  (amended 2026-05, #PR — added X-Disable-Continuous-Eval perf header so the backend can skip its continuous-evaluation pass on every request)

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

- **AC-60** — *Every factual claim is sourced* · **@aspirational (externally gated)**
  - **Given** any answer that states a fact about Siili (revenue,
    dividend, governance, strategy, etc.),
  - **Then** the answer includes at least one source reference linking
    to a published disclosure (annual report, stock exchange release,
    IR PDF, articles of association, etc.).
  - **Owner:** backend / retrieval — the AC cannot be satisfied from
    inside this widget until responses carry source references; the
    widget already renders any `sources` array it receives (see
    AC-25 family + `src/services/apiChatService.ts`).

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-61** — *No forward-looking statements or advice* · **@aspirational (externally gated)**
  - **Given** an investor asks for a price prediction, buy/sell advice,
    or a forecast,
  - **Then** the answer politely declines and redirects to published
    guidance / financial targets (this is a backend behaviour; the
    widget must render the polite-decline response without decoration
    that makes it look like advice).
  - **Owner:** backend / guardrails — polite-decline is emitted
    server-side; the widget is already decoration-free (plain text
    per AC-N1), so the widget side of this contract is satisfied
    whenever the backend guardrail lands.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-62** — *No insider or unpublished information* · **@aspirational (externally gated)**
  - **Then** answers must only reference materials already publicly
    disclosed. The widget should never hide or truncate a source link
    in a way that obscures provenance.
  - **Owner:** backend / content moderation — moderation runs upstream
    of response generation; the widget already surfaces source links
    verbatim via `SourceBadge` and does not truncate `href`.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-63** — *Language parity* · **@aspirational (externally gated)**
  - **Given** the host site toggles `FI ↔ EN`,
  - **Then** the widget UI strings (placeholder, header, chips,
    *"Lähteet:"*, *"Haetaan tietoa..."*, error copy) and the backend
    prompt locale are both switched. A Finnish UI answering in English
    (or vice-versa) is a bug.
  - **Owner:** product + backend — requires a host-site `FI ↔ EN`
    toggle convention (not yet defined as a product decision) and
    a backend prompt-locale switch; the widget string table is
    Finnish-only today and a locale plumb would be a small,
    self-contained change once the contract lands.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-64** — *Timestamp / freshness cue (recommended)* · **@aspirational (externally gated)**
  - **Given** an answer cites a dated document,
  - **Then** the reference badge includes the document's date (e.g.
    "Vuosikertomus 2025") so the investor can judge freshness without
    opening the PDF.
  - **Owner:** backend — once responses carry dated-source metadata
    the widget renders it via `SourceBadge`; no widget-side work
    until the metadata schema lands. Becomes a small `@evolving`
    bucket-(b) widget slice the moment the backend contract is
    signed off.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-65** — *Clear AI labelling* · **@stable**
  - **Given** the expanded view,
  - **Then** it is unambiguous that the user is talking to an AI
    assistant (the "Siili AI-avustaja" header, plus any disclaimer
    required by legal).

- **AC-66** — *Terms-of-use gate intercepts the first send* · **@evolving**
  - **Given** a browser profile that has not yet activated *Hyväksyn
    käyttöehdot* in this widget,
  - **When** the user activates a send from compact mode (textarea
    Enter / send-button click, or suggestion-chip activation),
  - **Then** the queued message is held and the *Käyttöehdot* dialog
    renders centred over a dimmed full-viewport backdrop, mirroring
    the AC-33e confirmation-dialog shell (Figma `ds:242:490`) with
    *Käyttöehdot*-specific copy and the `--cta-gradient` primary
    button. Activating *Hyväksyn käyttöehdot* persists acceptance
    (see AC-66c), dismisses the gate, and proceeds with the queued
    message — the widget transitions to expanded mode with the
    question already on its way to the chat service. Activating
    *Peruuta* dismisses the gate without sending: the widget remains
    in compact mode and the textarea draft (if any) is preserved
    verbatim for the user to edit or re-submit. Once acceptance is
    recorded, subsequent sends in the same browser profile bypass
    the gate entirely (see AC-66c). The mounted dialog also covers
    the `Esc`-to-dismiss and backdrop-click-to-dismiss paths the
    AC-33e shell already provides; both are equivalent to *Peruuta*
    here.
  - **Owner:** widget — internally implementable end-to-end against
    the host page's `WidgetOptions.privacyPolicyUrl` (the link target
    is the only host-supplied value; gate behaviour itself ships in
    the widget).
  (added 2026-05, #PR — Käyttöehdot terms gate landed)

- **AC-66b** — *Terms-of-use gate — Lue lisää expansion* · **@evolving**
  - **Given** the AC-66 gate is showing the short form,
  - **When** the user activates the *Lue lisää* link inside the
    dialog body,
  - **Then** the body swaps in-place to the long-form *Käyttöehdot*
    copy (canonical Finnish; English parity follows AC-63) inside a
    scrollable region; the dialog card height does not grow to
    accommodate it, and the surrounding scrollbar consumes its own
    column space. The toggle becomes *Näytä vähemmän* and returns
    to the short form on activation. Section headings (e.g.
    *Tietojen luonne ja ajantasaisuus*, *Oikeudelliset rajoitukset*,
    *Tekoälyjärjestelmän rajoitukset*, *Henkilötietojen käsittely*)
    are emphasised with `<strong>`. When the host page passes
    `WidgetOptions.privacyPolicyUrl`, the long form's
    privacy-policy sentence renders that URL as an anchor with
    `target="_blank" rel="noopener noreferrer"` (mirrors AC-25b's
    link semantics); when absent, the sentence stands alone with
    no broken-looking placeholder. Per AC-N1 all body copy is plain
    text and `<strong>` only — no Markdown, no HTML injection.
  (added 2026-05, #PR — Käyttöehdot terms gate landed)

- **AC-66c** — *Terms acceptance persists across sessions* · **@evolving**
  - **Given** the user has previously activated *Hyväksyn
    käyttöehdot* in the same browser profile,
  - **When** that profile mounts the widget on any later page load
    (reload, tab close + reopen, browser restart),
  - **Then** sends bypass the gate and proceed directly to the chat
    service. Acceptance is keyed under `siili.termsAccepted.v1`,
    mirroring PD-08's keying convention; bumping the schema version
    reprompts on the next send so legal can re-collect consent if
    the copy changes materially. Storage failures (private mode,
    quota exceeded, missing `Storage` API) degrade *fail-closed* —
    the gate continues to show until acceptance can be persisted —
    rather than silently letting the user through. The store is a
    plain boolean keyed on the schema version; it never holds PII
    (per AC-N1's spirit and the AC-120b non-PII posture).
  (added 2026-05, #PR — Käyttöehdot terms gate landed)

---

## 5. Visual Design & Brand (Award-Critical)

These criteria exist to satisfy P2's competition-entry ambition.

- **AC-70** — *Figma parity* · **@stable**
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

- **AC-74** — *Motion polish* · **@stable**
  - **Given** any interactive element (chip, send button, textarea
    focus, compact → expanded transition),
  - **Then** transitions are tastefully animated (no abrupt flicker,
    no overshoot) with durations in the motion range (§12.1 PD-07)
    and an easing that matches the rest of the IR site.

- **AC-75** — *No generic AI aesthetic* · **@stable**
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

- **AC-80** — *Keyboard-only operation* · **@stable**
  - **Given** a keyboard-only user,
  - **When** compact mode is mounted and the user Tabs into the widget,
  - **Then** Tab order within the widget is: textarea → send button →
    each suggestion chip in DOM order.
  - **When** expanded mode is mounted (after the first send),
  - **Then** initial keyboard focus lands on the textarea, and Tab
    advances from the textarea to the send button.
  - **And** every interactive surface — textarea, send button,
    suggestion chips, the close button (AC-20d), and linked source
    badges — is keyboard-reachable and renders a visible
    `:focus-visible` ring that contrasts against the background. The
    relative Tab order of the close button and linked source badges
    versus the textarea is not asserted, because the autofocus-on-
    mount contract above guarantees the user's first keyboard action
    in expanded mode lands on the textarea regardless of DOM
    ordering. Shift+Tab from the textarea reaches the close button;
    `Esc` is a redundant keyboard shortcut for the same dismiss
    action (AC-20j).
  (amended 2026-04, Figma component drift — close button added to the keyboard-reachable surface enumeration, no behavioural change to the textarea / send-button contract.)

- **AC-81** — *Screen-reader labelling — textarea* · **@stable**
  - **Given** a screen reader,
  - **Then** the textarea announces its configured aria-label.

- **AC-81b** — *Screen-reader labelling — send button* · **@stable**
  - **Given** a screen reader,
  - **Then** the send button announces "Send message" (or its
    localised equivalent when the widget copy is localised).

- **AC-81c** — *Screen-reader labelling — loading state* · **@stable**
  - **Given** a screen reader and an in-flight assistant answer,
  - **Then** the loading state announces *"Haetaan tietoa..."* via
    an `aria-live="polite"` region (see AC-23).

- **AC-81d** — *Screen-reader labelling — errors* · **@stable**
  - **Given** a screen reader and an error response (per AC-40),
  - **Then** the error message announces via `role="alert"`.

- **AC-82** — *WCAG 2.1 AA contrast* · **@stable**
  - **Given** every text/background pair defined by the tokens,
  - **Then** contrast is at least 4.5:1 for body text and 3:1 for
    large text and non-text UI.

- **AC-83** — *Reduced motion* · **@stable**
  - **Given** `prefers-reduced-motion: reduce`,
  - **Then** the compact → expanded mount animation, the expanded-view
    auto-scroll, and the loading blob's pulse animation are reduced or
    disabled (the blob is rendered as a static gray shape alongside the
    "Haetaan tietoa..." text, with no scale/opacity animation; the
    auto-scroll uses `behavior: 'auto'`; the expanded surface mounts
    with no entrance animation).
  - **Then** interactive transitions on the input shell (focus-ring
    outline-color), the send button (filter + outline-color), chips
    (background + outline-color), and linked source badges (background
    + outline-color) are disabled — the end states (visible focus ring,
    hover background) still render immediately, only the animated
    handover is removed.

- **AC-84** — *Zoom and reflow* · **@stable**
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

- **AC-91** — *Tablet (640–1023px)* · **@stable**
  - Chips wrap to two rows if needed; the textarea grows to full
    container width; the send button stays inside the input shell.

- **AC-92** — *Mobile (<640px) — compact stacks input above chips* · **@stable**
  - **Given** a viewport narrower than the mobile breakpoint
    (§12.1 PD-05),
  - **Then** the compact view stacks the input above the chips (not
    side-by-side).

- **AC-92b** — *Mobile (<640px) — chips stack vertically with single-line ellipsis* · **@evolving**
  - **Given** a viewport narrower than the mobile breakpoint
    (§12.1 PD-05),
  - **Then** the suggestion chips stack vertically (column flex), each
    chip taking the full width of the chip container, and any chip
    label that exceeds that width is truncated with a single-line
    ellipsis (`…`) — AC-12b's `white-space: nowrap` constraint still
    holds, so labels never wrap to two lines.
  - **And** none of the chips overflow the viewport width
    horizontally; the previous `overflow-x: auto` horizontal-scroll
    treatment is retired because the hidden scrollbar gave users no
    affordance that further chips existed behind the right edge.
  - Visual anchor in §2.5 row AC-92b is `site:608:1855` *Etusivu -
    Mobile - v2*. The alternate iteration `site:591:3203` *Etusivu -
    Mobile* (which renders multi-line chip labels rather than
    single-line ellipsis) is recorded in the §2.5 row prose for
    history but is not the canonical anchor.
  (added 2026-04, GOV-12 split; amended 2026-04, Lane F — graduated to @stable as code-authored after designer delegated responsive judgment; amended 2026-05, #PR — promoted from `— (code-authored)` after designer published `site:608:1855` / `site:591:3203` mobile candidate frames in Lane L; recontracted from "horizontal scroll OR wrap" to "vertical stack with single-line ellipsis" per `site:608:1855` v2; demoted @stable → @evolving until the implementation lands and the designer signs off on v2 vs v1)

- **AC-92c** — *Mobile (<640px) — expanded view full width with Figma padding* · **@stable**
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

- **AC-102** — *No host-page regression* · **@aspirational (externally gated)**
  - **Given** the widget is embedded on the IR site,
  - **Then** Lighthouse performance score for the host page drops by
    no more than 2 points versus the same page without the widget.
  - **Owner:** host-page integration — the measurement requires the
    widget to be loaded on `sijoittajille.siili.com` (not the dev
    harness) with and without the IIFE, and a Lighthouse run on the
    real page. Gated on a staging embed; cannot be verified from
    inside this repo.

  (amended 2026-04, GOV-16 Cluster 10)

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

- **AC-120** — *Event emission — named events for key actions* · **@aspirational (externally gated)**
  - **Given** these user actions — widget mounted, chip clicked,
    message sent, response received, response errored, chat closed
    (via `×` / `Esc` / back), chat reopened (via continue pill),
  - **Then** the widget emits a named event (custom event on
    `window` or calls `window.dataLayer.push` if present) so the IR
    site's existing analytics can capture them.
  - **Owner:** product — event-name vocabulary + `dataLayer` schema
    need to be signed off by the IR site's analytics owner before
    the widget can emit anything. Widget-side plumbing is a small
    slice once the schema is agreed.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-120b** — *Event emission — no PII in payloads* · **@aspirational (externally gated)**
  - **Given** any event emitted per AC-120,
  - **Then** its payload contains no personally identifiable
    information (no user message text, no user-supplied free-form
    content, no identifiers that could be reverse-linked to an
    individual).
  - **Owner:** product — same sign-off as AC-120 (the PII policy is
    part of the schema). Widget-side enforcement becomes trivial
    once payload shapes are defined.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-120c** — *Event emission — `chat_closed` payload* · **@aspirational (externally gated)**
  - **Given** the `chat_closed` event is emitted,
  - **Then** its payload includes the dismiss method
    (`"close_button" | "escape_key" | "back_navigation"`) and the
    message count at dismiss time.
  - **Owner:** product (analytics schema) + Lane H (close button +
    `Esc` + back-nav dismiss must land before a `chat_closed` event
    has anything to fire on). Double-gated: external schema
    sign-off and an internal Lane H dependency.

  (amended 2026-04, GOV-16 Cluster 10)

- **AC-121** — *No uncontrolled network calls* · **@stable**
  - **Given** the widget is mounted,
  - **Then** it makes no network requests beyond the configured
    `ChatService` endpoint and any fonts/stylesheets declared by the
    host page. No third-party trackers embedded in the widget.
