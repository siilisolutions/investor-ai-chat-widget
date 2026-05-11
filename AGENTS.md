# Siili Investor Chatbot Widget — AI Agent Context

> This file is the primary onboarding document for AI coding agents (Cursor, Codex, Copilot Workspace, etc.). Read this first before making any changes.

## Project Purpose

An embeddable chatbot widget for the Siili Solutions investor site (sijoittajille.siili.com). The UI is written against the React component API but is actually powered by Preact at runtime (via `preact/compat`) to keep the IIFE bundle within AC-100's 60 KB gzip budget. The widget has two modes: a **compact hero mode** (text input + suggestion chips overlaid on the hero section) and an **expanded chat mode** (full conversation view with Q&A pairs, source references, and a sticky input). It is bundled as a single IIFE script + CSS file for embedding via `<script>` tag on the host site. The chatbot backend is developed separately — this project only covers the frontend.

## Architecture

```
Host page (siili.com)
  └─ <div id="siili-chatbot">
       └─ SiiliChatbot.init({ container, apiUrl?, interceptBackNavigation? })
            └─ App (state machine: compact | expanded; multi-conversation store per PD-08)
                 ├─ CompactView (hero input + chips)
                 │    └─ ChatInput
                 │         └─ ContinuePill (AC-10a / site:395:5439 — rendered when prior history exists)
                 └─ ExpandedView (chat messages + input + close button + sidebar)
                      │   (desktop: rendered as inset white card + blurred backdrop sibling per AC-20a, amended 2026-05 Lane J;
                      │    below the §12.1 PD-05 desktop breakpoint the white card itself fills the viewport edge-to-edge)
                      ├─ CloseButton (× top-right, AC-20d / ds:196:853)
                      ├─ PreviousDiscussionList (sidebar, AC-33 / ds:191:258 — always rendered in expanded mode, amended 2026-05; transparent shell + per-row surface treatment + vertical divider + scroll isolation per AC-33 amended 2026-05 Lane J)
                      │    └─ PreviousDiscussionItem (row, AC-33a / ds:191:268)
                      ├─ ChatMessage (question bubble + answer + sources)
                      │    └─ SourceBadge (reference pill)
                      └─ ChatInput (shared textarea + send button — bottom-pinned inside the conversation column with an opacity-fade band masking messages scrolling under it per AC-28 / AC-28c, amended 2026-05 Lane J; AC-28b reversed and tombstoned in the same edit)
```

**State transitions:**
- `compact → expanded`: user sends a message or clicks a suggestion chip (AC-31f auto-mints a fresh conversation when the active one already has Q+A pairs), or clicks the continue-pill (AC-10c — re-enters expanded with the most-recent stored conversation, no network call). A synthetic history entry is pushed when `interceptBackNavigation` is on (AC-20c). On the very first send from a browser profile that hasn't yet accepted the IR-agent terms, the AC-66 *Käyttöehdot* gate (`TermsDialog`) intercepts the transition: the queued question is held, the dialog overlays the compact hero, and the transition only proceeds after *Hyväksyn käyttöehdot*. Cancelling the gate keeps the widget in compact and preserves the textarea draft (AC-66 / AC-66b / AC-66c).
- `expanded → compact`: user clicks the close button, presses `Esc`, or triggers browser back. `messages` is preserved (AC-31).
- The widget stays in expanded mode once a conversation starts unless dismissed.

**Conversation store (PD-08, amended 2026-05):** `App` owns an array of `Conversation` objects keyed by id plus an `activeId`. The store is hydrated from `localStorage` on mount and persisted on every message append; reloads, tab close, and browser restart all preserve history (AC-31e). The store is reset only when the user clears site storage via browser tooling. Activating a sidebar row swaps `activeId` only — no network call (AC-33b). Compact-mode sends mint a fresh conversation when the active one already holds Q+A pairs (AC-31f); the continue-pill (AC-10a / AC-10c, Figma `site:395:5439`) re-enters the most-recent stored conversation. Starting a new conversation from inside expanded mode (AC-35) mints a fresh id and appends to the store. Per-row delete (AC-33e) removes the row from the store; deleting the only remaining row mints a fresh empty conversation as the new active and stays in expanded mode (the AC-33 always-visible-sidebar invariant requires at least one row).

## Figma — The Source of Truth for All Visual Work

> **IMPORTANT:** The Figma design file is the single source of truth for every visual decision — layout, spacing, colors, typography, component structure, and interactive states. When making any visual or styling change, **always consult Figma first** using the Figma MCP tools. Do not guess or rely solely on the token table below; extract the actual values from the design.

### Figma files

The design splits across two files. Know which one you need before calling any MCP tool.

| File | `fileKey` | URL | Contains |
|------|-----------|-----|----------|
| **IR-site** | `0xXdKUlBJIolF15MjJuaMC` | https://www.figma.com/design/0xXdKUlBJIolF15MjJuaMC/IR-site | Screen-level layouts — the composite frames that place the widget inside the host site (hero page, AI-agent page, loading state). Instances here point at published components from IR-DS. |
| **IR-DS** | `rlh00CEImhMWwdRNOUqW6L` | https://www.figma.com/design/rlh00CEImhMWwdRNOUqW6L/IR-DS | The design system / component library — main components (Textarea, Question+Answer, Reference tag, Send button variants, etc.), brand colors, and token palette. This is where Code Connect mappings live. |

Rule of thumb: use **IR-DS** when working on a component in isolation (matching visuals, states, props, tokens) and **IR-site** when working on whole-screen composition (spacing between sections, scroll behaviour, relation to the surrounding host page).

### Key node IDs

#### IR-site — screen frames (`fileKey = 0xXdKUlBJIolF15MjJuaMC`)

| Node ID | Description |
|---------|-------------|
| `13:527` | Etusivu — hero screen composition (compact mode in context) |
| `395:5439` | Etusivu — *jatka edellistä keskustelua* (compact mode rendered for a returning user with prior conversations — anchors AC-10a / AC-10c continue-pill) |
| `434:2424` | AI-agentti — expanded chat screen composition (renamed from `143:601` in 2026-05; the old ID now returns "node ID invalid") |
| `434:2696` | AI-agentti, haetaan tietoa — loading-state screen composition (renamed from `201:2273` in 2026-05) |
| `435:2904` | AI-agentti - Mobile — full mobile expanded layout (390×844): hamburger + title + close + Q+A pairs + sticky textarea. Candidate anchor for `AC-92c`; promotion deferred per `.cursor/rules/ac-amending.mdc`. |
| `435:2914` | AI-agentti - Menu open - Mobile — same mobile frame with the `Mobile menu` overlay (`ds:214:1214`) revealing the sidebar via a slide-in drawer. Candidate anchor for `AC-33d`; promotion deferred. |
| `550:1884` | AI-agentti, haetaan tietoa - scrollbar — third desktop expanded-view frame whose only delta from `434:2696` is that the conversation-stream `Scrollbar` instance is visible (`hidden=false`). Anchors the canonical scrollbar-visible state of AC-28c (added 2026-05-11, Lane L). |
| `555:2186` | Investor hero - käyttöehdot - suppea — short-form Käyttöehdot dialog rendered centred over a dimmed full-viewport backdrop above the compact hero. Anchors AC-66 (added 2026-05-07, Käyttöehdot mint). |
| `555:2200` | Investor hero - käyttöehdot - laaja — long-form Käyttöehdot dialog in screen context (same `Background dim` `rgba(0,0,0,0.2)` pattern as `555:2214`, scrollable body region). Anchors AC-66b in-screen context (added 2026-05-11, Lane L). English copy embedded in the body region carries an inline designer authoring artifact and is treated as draft. |
| `555:2214` | Investor agent - confirmation — AC-33e per-row delete confirmation dialog in screen context. `Background dim` rectangle at `rgba(0,0,0,0.2)` overlaying the chat surface, dialog absolutely centered with `translate(-50%, -50%)`, no `backdrop-filter: blur` at the modal layer. Anchors AC-33e's previously code-authored centered-overlay + dim-backdrop pattern (added 2026-05-11, Lane L). |
| `591:3203` | Etusivu - Mobile — 390×924 mobile compact-hero composition (host's `Header (With menu)` chrome above the existing `ds:152:75` `Investor hero` scaled to 390 wide). Renders chips as a vertical stack with multi-line chip labels. Recorded as the design alternate to `608:1855` for `AC-92` / `AC-92b`; not the canonical anchor (Lane M chose v2). |
| `608:1855` | Etusivu - Mobile - v2 — second iteration of the mobile compact-hero composition. Same overall structure as `591:3203`; renders chips as a vertical stack with single-line ellipsis truncation. **Canonical anchor for `AC-92` / `AC-92b`** per Lane M (2026-05-11). |

> **Layout update versus the original implementation (2026-04, IR-site frame rename 2026-05).** `434:2424` and `434:2696` (formerly `143:601` and `201:2273`) have been redesigned since the widget was first built and were renamed during a Figma reorganisation in early May 2026. The current Figma layout for the AI-agent screen now contains a top-bar title, a Close-discussion (`×`) button (`ds:196:853`) at the top-right, and a two-column body with a Previous-discussion-list sidebar (`ds:191:258` / `ds:191:268`) on the left, divider, and the Q+A stream + sticky textarea on the right. `src/components/ExpandedView.tsx` now renders the close button and optional sidebar; new visual work on the expanded view should consult these IR-site frames first and slot into the AC-20d cluster (close button) and AC-33 cluster (sidebar). The two new mobile frames `435:2904` / `435:2914` cover the same surface at 390×844 with a hamburger-revealed sidebar drawer (`ds:214:1214` Mobile menu, `ds:230:656` 24×24 Menu button) — they are not yet implemented in the React tree.

#### IR-DS — main components (`fileKey = rlh00CEImhMWwdRNOUqW6L`)

Implemented in the widget:

| Node ID | Description | Maps to |
|---------|-------------|---------|
| `152:75` | Investor hero (component) | `src/components/CompactView.tsx` |
| `152:97` | Investor agent (component) | `src/components/ExpandedView.tsx` |
| `181:143` | Textarea (component set, with `Property 1` variants `Default` `152:121` / `Hero` `181:144`) | `src/components/ChatInput.tsx` (one component switches via the `compact` prop — `Default` is the expanded-mode shell, `Hero` is the compact-mode shell) |
| `152:121` | Textarea — `Property 1=Default` variant | expanded-mode `src/components/ChatInput.tsx` |
| `181:144` | Textarea — `Property 1=Hero` variant | compact-mode `src/components/ChatInput.tsx` |
| `152:128` | Send button (with `Property 1` variants `Active` `152:129` / `Hover` `152:131` / `Pressed` `152:133`) | `src/components/ChatInput.tsx` (send button is part of ChatInput) |
| `152:116` | Question + Answer pair | `src/components/ChatMessage.tsx` |
| `152:111` | Question (sub-component of Q+A) | part of `ChatMessage.tsx` |
| `152:114` | Answer (sub-component of Q+A) | part of `ChatMessage.tsx` |
| `152:145` | References (sub-component of Q+A) | part of `ChatMessage.tsx` |
| `152:135` | Reference tag | `src/components/SourceBadge.tsx` |
| `152:137` | Loading spinner animation (variants `Start` `152:138` / `End` `152:140`) | part of `ChatMessage.tsx` (loading state) |
| `152:142` | Loading information | part of `ChatMessage.tsx` (loading state) |
| `152:86` | Predefined question (chip) | `src/components/SuggestionChip.tsx` |
| `1:2` | Siili Brand Colors swatches | — (reference for `src/styles/variables.css`) |

Widget-scope supporting components:

| Node ID | Description | Maps to |
|---------|-------------|---------------|
| `196:853` | Close discussion (× button at top-right of expanded view) | `src/components/CloseButton.tsx` |
| `191:258` | Previous discussion list (sidebar of past conversations in expanded view) | `src/components/PreviousDiscussionList.tsx` |
| `191:268` | Previous discussion item (single row inside `191:258`) | `src/components/PreviousDiscussionItem.tsx` |
| `237:398` | Start-new-conversation Button — primary CTA "Luo uusi keskustelu" at the top of the sidebar (component set with `Property 1` variants `Default` `237:323` / `Hover` `237:399` / `Pressed` `237:411`); content-sized violet→blue gradient pill (`white-space: nowrap` label, 8×20 padding, 12 gap) with a leading 11×11 plus icon. Anchors AC-35. Rendered as the in-sidebar button inside `src/components/PreviousDiscussionList.tsx`; Code Connect mapped per-variant. | part of `src/components/PreviousDiscussionList.tsx` |
| `237:332` | Plus icon (24×24 frame with the 11×11 stroked `+` glyph used inside `237:398`) | part of `src/components/PreviousDiscussionList.tsx` |
| `230:656` | Menu button (hamburger — 24×24 with three 16×2.4 px stripes, component set with `Default` / `Hover` / `Pressed` variants). Anchors AC-33d as the affordance that opens the mobile drawer. Rendered only at viewports below the §12.1 PD-05 mobile breakpoint. | `src/components/MenuButton.tsx` |
| `214:1214` | Mobile menu (left-anchored slide-in drawer, ~75 % viewport width / 292 px on a 390 px frame, white card with brand drop-shadow, hosting an internal `ds:196:853` × at the top-right of the card and the existing `PreviousDiscussionList`). Anchors AC-33d. The drawer's overlay backdrop (`rgba(0,0,0,0.2)` + `backdrop-filter: blur(2px)`) is part of the same component. | `src/components/MobileMenu.tsx` |
| `152:88` | Reset button — `Property 1=Default` variant of the parent component set `ds:227:239` (siblings `ds:227:240` Hover / `ds:228:244` Pressed, surfaced 2026-05-11, Lane L). | backlog (still no React component) |

**Host-page chrome — NOT widget scope.** The IR-DS file also publishes design-system pieces that belong to the surrounding sijoittajille.siili.com page, not the embedded chatbot. Do **not** add React components for these; the host site owns them. They are listed here so future agents don't try to implement them inside this repo:

| Node ID | Description |
|---------|-------------|
| `168:142` | Header (with `152:9` Default / `168:143` With menu variants) |
| `168:174` | Menu button (with `168:141` Default / `168:175` Hover variants) |
| `152:33` | Footer |
| `152:27` | Header link |
| `152:29` | Footer category title |
| `152:31` | Footer category link |
| `166:94` | Scroll-to-content button |
| `152:95` | Arrow (used inside `166:94`) |

**Deprecated, do not use:**

| Node ID | Description |
|---------|-------------|
| `152:92` | "Send button - old" — left in the file for context only |

### How to use Figma MCP tools

When you have access to the Figma MCP server (`user-figma`), use it to inspect designs:

1. **`get_design_context`** — Primary tool. Pass the appropriate `fileKey` (IR-DS for component-level work, IR-site for screen composition) and the relevant `nodeId` from the tables above. Returns code hints, a screenshot, and contextual information. For components mapped via Code Connect, the response links back to the real React source.
2. **`get_screenshot`** — Grab a visual snapshot of any node to compare against the running app.
3. **`get_metadata`** — Retrieve file-level metadata (pages, components, styles).

**Workflow for visual changes:**
1. Identify whether the change is component-level (IR-DS) or screen-level (IR-site), and pick the matching `fileKey` and node ID.
2. Call `get_design_context` (or `get_screenshot`) to see the current design.
3. Implement changes to match the Figma design exactly — spacing, border-radius, colors, font sizes, line heights, etc.
4. If the Figma design conflicts with existing CSS tokens, update the tokens in `src/styles/variables.css` to match Figma, then update component styles accordingly. The brand-colors / token source lives in IR-DS (see `1:2` Siili Brand Colors, plus the library's text/style variables).
5. Never invent visual values (colors, spacing, font sizes) that are not in the Figma file.

## Design Tokens

All tokens live in `src/styles/variables.css` as CSS custom properties. These values are derived from the Figma file — if a token here disagrees with Figma, **Figma wins**. Update the token to match.

| Token | Value | Usage |
|-------|-------|-------|
| `--white-500` | `#ffffff` | Backgrounds, text |
| `--black-500` | `#000000` | Text, backgrounds |
| `--gray-300` | `#f4f4f4` | Hamburger Hover surface (AC-33d, Figma `ds:230:656` Hover variant) |
| `--gray-400` | `#efefef` | Reference tag bg; PreviousDiscussionItem Default surface (AC-33a, Figma `ds:191:268`) |
| `--gray-500` | `#e5e5e5` | Question bubble bg; PreviousDiscussionItem Hover surface (AC-33a, Figma `ds:230:453`) |
| `--gray-600` | `#c0c0c0` | PreviousDiscussionItem Pressed / active conversation surface (AC-33a, Figma `ds:230:459`) |
| `--gray-900` | `#575757` | Placeholder text |
| `--blue-500` | `rgb(50, 50, 255)` | Send button gradient start, focus-ring colour |
| `--blue-700` | `#2323b2` | Continue-pill text link (Figma `site:395:5439`) |
| `--violet-500` | `rgb(170, 50, 255)` | Send button gradient end |
| `--red-600` | `#d20000` | Destructive action surface (AC-33e confirm-delete button, Figma `ds:242:444`) |
| `--cta-gradient` | `linear-gradient(117.63deg, var(--violet-500) 0%, var(--blue-500) 100%)` | "Luo uusi keskustelu" CTA pill (AC-35, Figma `ds:237:323`); also the *Hyväksyn käyttöehdot* primary button on the AC-66 terms gate (Figma `ds:257:1096` / `ds:242:551`). Intentionally distinct from `--send-gradient` so AC-72 send-button states stay untouched |
| `--font-family` | `'Everett', sans-serif` | All text |
| `--radius` | `20px` | All interactive elements |
| `--textarea-shadow` | `0px 4px 12px rgba(0,0,0,0.2)` | Expanded mode textarea |

## File Map

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite config with library mode (IIFE output as `siili-chatbot.js`) |
| `index.html` | Dev harness simulating the hero section |
| `src/widget.tsx` | Library entry point — exports `init()` for embedding |
| `src/main.tsx` | Dev entry point — calls `init()` for local development |
| `src/App.tsx` | Root component — manages compact/expanded mode, the multi-conversation store (per PD-08), back-navigation interceptor (AC-20c / AC-20g / AC-20i), and dismiss flow (AC-20j / AC-31) |
| `src/components/CompactView.tsx` | Hero mode: input + suggestion chips + optional continue-pill |
| `src/components/ContinuePill.tsx` | "Jatka edellistä keskustelua" affordance inside the compact textarea shell (AC-10a / AC-10c, Figma `site:395:5439`) |
| `src/components/ExpandedView.tsx` | Chat mode: messages list + input + close button + sidebar (2-column layout, sidebar always rendered per AC-33 amended 2026-05). Below the §12.1 PD-05 mobile breakpoint the sidebar collapses behind a hamburger toggle (AC-33d, Figma `ds:230:656`) that opens the `MobileMenu` drawer (`ds:214:1214`); the close button moves into the mobile top-bar row alongside the hamburger and title per `site:435:2904`. |
| `src/components/ChatInput.tsx` | Shared textarea + send button (compact/expanded variants) |
| `src/components/ChatMessage.tsx` | Single Q&A pair with optional sources and loading state |
| `src/components/SourceBadge.tsx` | Reference pill (link or static) |
| `src/components/SuggestionChip.tsx` | Predefined question chip |
| `src/components/CloseButton.tsx` | × button rendered top-right of expanded view on tablet / desktop (AC-20d, Figma `ds:196:853`); moves into the mobile top-bar row at viewports below the §12.1 PD-05 mobile breakpoint per `site:435:2904`. The same component also serves as the AC-33d drawer's internal × inside `MobileMenu`. |
| `src/components/MenuButton.tsx` | Hamburger toggle (24×24 with three 16×2.4 px stripes) that opens the AC-33d mobile drawer. Maps to Figma `ds:230:656`; rendered only at viewports below the §12.1 PD-05 mobile breakpoint via CSS. |
| `src/components/MobileMenu.tsx` | Left-anchored slide-in drawer for the AC-33d mobile collapse of the AC-33 sidebar. Maps to Figma `ds:214:1214` (in screen context per `site:435:2914`). Hosts an internal `CloseButton` and the existing `PreviousDiscussionList` over a translucent dark + blurred backdrop; auto-closes on internal × / `Esc` / backdrop tap / row activation / start-new. The AC-33e per-row delete `×` does NOT close the drawer (its confirmation modal needs to render over the drawer). |
| `src/components/PreviousDiscussionList.tsx` | Sidebar of past conversations (AC-33, Figma `ds:191:258`); always rendered in expanded mode (amended 2026-05) — permanent home of the AC-35 "Luo uusi keskustelu" CTA and the AC-33e per-row × delete. On mobile the inline copy is CSS-hidden and the same component is rendered inside the AC-33d `MobileMenu` drawer instead. |
| `src/components/PreviousDiscussionItem.tsx` | Single sidebar row (AC-33a, Figma `ds:191:268`) — flex container holding the activate button (label, AC-33b) and the per-row × delete button (AC-33e) as siblings; label derived from first user question of the conversation |
| `src/components/ConfirmDialog.tsx` | Modal confirmation surface for destructive actions (AC-33e per-row delete; Figma card `ds:242:490`, surrounding viewport overlay anchored on `site:555:2214` per Lane L 2026-05-11 — dim-only `Background dim` rectangle at `rgba(0,0,0,0.2)`, no modal-layer blur). Centered viewport overlay + dimmed backdrop; three cancel paths (cancel button / `Esc` / backdrop click); focus captured on open and restored on close |
| `src/components/TermsDialog.tsx` | Käyttöehdot terms-of-use gate (AC-66 / AC-66b; Figma cards `ds:257:1096` short / `ds:242:551` long, in screen context `site:555:2186`). Mounted at App level as a sibling of `ConfirmDialog`; opens on the *first* compact-mode send (textarea or chip) for any browser profile that hasn't yet accepted, holds the queued question, and replays it on accept (preserves the textarea draft on cancel). Reuses the AC-33e dialog shell (white card, `--radius`, `--textarea-shadow`, 32 px padding) with *Lue lisää* / *Näytä vähemmän* in-place body swap to the long form, and renders `WidgetOptions.privacyPolicyUrl` as a `target="_blank" rel="noopener noreferrer"` anchor when supplied. |
| `src/services/chatService.ts` | **MOCK** chat service — used when `WidgetOptions.apiUrl` is omitted (dev default) |
| `src/services/apiChatService.ts` | Real `ChatService` adapter — posts `{ messages }` to `WidgetOptions.apiUrl`, maps `{ response }` back into a `ChatMessage`, handles timeout + error mapping (AC-43 / AC-44 / AC-52 / AC-53) |
| `src/services/conversationStore.ts` | localStorage-backed multi-conversation persistence layer (PD-08) — `listConversations` / `loadConversation` / `saveConversation` / `createConversation` / `clearConversation` / `clearAll`. `clearConversation(id)` underpins AC-33e per-row delete (idempotent on a missing id, schema unchanged). Survives reloads, tab close, and browser restart per AC-31e (the earlier sessionStorage / tab-close-clears contract is tombstoned with AC-31c). |
| `src/services/termsStore.ts` | localStorage-backed boolean acceptance flag for the AC-66 / AC-66c Käyttöehdot terms gate. `getAcceptance()` / `setAcceptance()` / `clearAcceptance()`; schema-versioned key `siili.termsAccepted.v1` mirroring PD-08's keying convention so a future copy change can reprompt by bumping the version. Fail-closed on storage errors — the gate continues to show until acceptance can be persisted. |
| `src/types/index.ts` | TypeScript interfaces (ChatMessage, Source, ChatService, WidgetOptions, Conversation) |
| `src/styles/variables.css` | CSS custom properties (design tokens) |
| `src/styles/*.module.css` | Component-scoped CSS modules |

## Key Decisions & Constraints

> **AC-100 — Bundle budget (load-bearing invariant):** Combined gzipped size of `dist/siili-chatbot.iife.js` + `dist/siili-chatbot.css` **must be ≤ 60 KB**. Any increase must be justified in the PR description. This is the single hardest constraint on the project — it dictates the framework choice (Preact over React), the absence of UI libraries, and the CSS-Modules-not-Tailwind decision. Check `gzip:` output from `npm run build` before merging any change under `src/`, `vite.config.ts`, or dependencies. Source of truth: catalog row in [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md), AC body in [`ACCEPTANCE_CRITERIA_BODIES.md` §8 Performance](ACCEPTANCE_CRITERIA_BODIES.md#8-performance).

1. **Library mode (IIFE)**: The widget bundles its UI framework internally so the host page doesn't need anything pre-loaded. Output is a single `siili-chatbot.iife.js` + `siili-chatbot.css`.
2. **Preact with React compatibility**: The runtime framework is Preact, aliased in `vite.config.ts` and `tsconfig.app.json` so `import { useState } from 'react'` (etc.) resolves to `preact/compat`. Source code reads like React and uses React-shaped type imports (`KeyboardEvent` from `'react'`, JSX `className`, etc.); the bundle only ships Preact. The choice is driven by AC-100: React 19 + ReactDOM gzipped to ~179 KB (≈3× over budget), Preact gzips to ~10 KB.
3. **CSS Modules**: Scoped styles that won't leak into the host page. No Tailwind — keeps the bundle small and avoids config conflicts.
4. **No external UI library**: Zero runtime dependencies beyond Preact (bundled). The `react` and `react-dom` npm packages are intentionally **not** installed — adding them back would silently defeat the alias and blow AC-100.
5. **Mocked backend**: `src/services/chatService.ts` returns fake responses after a delay. The `ChatService` interface in `src/types/index.ts` is the contract to implement.
6. **Font**: Figma specifies `Everett`. The host site is expected to load this font. The widget falls back to `sans-serif`.

## Spec-driven workflow

The spec lives across two files plus a globs-scoped rule:

- [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md) — always-on entry point. AC catalog (every `AC-xx` index row), §2.5 Figma Manifest, §11 Definition of Done, §12 Non-Goals (incl. `AC-N1` / `AC-N2`), §13 Traceability.
- [`ACCEPTANCE_CRITERIA_BODIES.md`](ACCEPTANCE_CRITERIA_BODIES.md) — Given/When/Then bodies for every AC in §§1–10. Catalog rows in `ACCEPTANCE_CRITERIA.md` link directly into this file.
- [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) — amending / authoring conventions (former §10.5 + §10.6). Loaded automatically when an agent opens either spec file or `AGENT_BACKLOG.md`.

Every non-trivial change binds to at least one `AC-xx` ID. The rules and prompts that enforce this:

- [`.cursor/rules/sdd.mdc`](.cursor/rules/sdd.mdc) — always-on rule. Cite AC-IDs, respect §12 Non-Goals, stop-and-ask on ambiguity, end non-trivial turns with an AC-anchored self-review.
- [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) — how to add, edit, split, deprecate, or tombstone an `AC-xx` when the spec is silent or out of date. Do this *before* coding the new behaviour.
- [`scripts/prompts/ac-review.md`](scripts/prompts/ac-review.md) — reusable read-only reviewer prompt (scoped / full-sweep). Run in a separate turn on non-trivial PRs for an adversarial AC-coverage pass; apply accepted fixes in a third turn.
- [`scripts/prompts/figma-sync.md`](scripts/prompts/figma-sync.md) — the visual counterpart. Pair with `ac-review.md` full-sweep on release gates.

Minimal flow for a new task: identify AC-IDs → (amend if missing) → implement → self-review against the ACs → optionally run `ac-review.md` before merge.

## Common Tasks

### How to run locally
```bash
npm install
npm run dev
# Opens at http://localhost:5173 with a simulated hero section
```

### Where the widget is deployed

| Env | URL |
|-----|-----|
| Staging (HubSpot sandbox) | <https://www-siili-com.sandbox.hs-sites-eu1.com/investors-chatbot-test> |

The host page loads `siili-chatbot.iife.js` + `siili-chatbot.css` from jsDelivr via the **`@latest`** alias (see [`README.md`](README.md) § Embed on Host Site Option C) so a fresh release surfaces on staging without a host-page edit. Self-hosting from `/hubfs/investors-chatbot/` (Option B) is the fallback when the CDN is unavailable. The `apiUrl` is configured on the host page's own `<script>` tag — use this URL for embed-side smoke tests (mount, scoped styles, no global leakage beyond `SiiliChatbot`, AC-43 error path on a bad backend) — but remember that the **`apiUrl` value lives on the host page**, not here, so a "broken chat" on staging often means the host page's init call needs updating, not a widget change. Production should always pin to `@vX.Y.Z` (Option A); never use `@latest` outside staging.

After cutting a new release, run step 9 of `README.md` § Cutting a new CDN release (two `curl` calls to `purge.jsdelivr.net`) so staging reflects the new tag in ~1 minute instead of ~24h. See `README.md` § Environments for the canonical entry.

### How to build for production
```bash
npm run build
# Output: dist/siili-chatbot.iife.js + dist/siili-chatbot.css
```

### How to embed on the host site
```html
<div id="siili-chatbot"></div>
<link rel="stylesheet" href="siili-chatbot.css" />
<script src="siili-chatbot.iife.js"></script>
<script>
  SiiliChatbot.init({
    container: '#siili-chatbot',
    apiUrl: 'https://.../api/chat', // optional; omit to use the mock
  });
</script>
```

### How to point the widget at the real backend

The real `ChatService` adapter already ships with the widget (`src/services/apiChatService.ts`). You don't need to swap files — just pass `apiUrl` at `init()` time (AC-04).

- **Production**: host page calls `SiiliChatbot.init({ container, apiUrl })` with the backend URL. Function keys or query-string tokens end up in the host page's script tag, not in the widget bundle, so they can be rotated without a re-release.
- **Dev**: copy the URL into `.env.local` as `VITE_API_URL=…` (git-ignored via `*.local`) and run `npm run dev`. `src/main.tsx` reads it and forwards it to `init()`. Leave the var unset to iterate against the bundled mock.
- **CORS**: the backend must allowlist the host origin plus `http://localhost:5173` for dev. The widget never falls back to a proxy.
- **History**: per AC-52, every call posts the full successful-turn history as `{ messages: [{ role: "user" | "assistant", content: string }, …] }`. Loading placeholders and errored pairs are filtered out by `App.tsx`.
- **Perf header**: per AC-52, every request carries `X-Disable-Continuous-Eval: true` so the backend skips its continuous-evaluation pass. The header is unconditional; if a slow/evaluated mode is ever wanted as a debug aid, that's a new `WidgetOptions` toggle and a separate AC.
- **Response shape**: the adapter expects `{ response: string }` (plain text per AC-N1). Unknown fields are ignored; if the backend adds `sources: [{ label, href? }]` later, the adapter already picks them up with no code change (AC-53).
- **Error / timeout**: non-2xx responses, network failures, and requests past 30 s are mapped to a user-safe Finnish string (AC-43 / AC-44). Raw errors are logged to the console only in dev builds.

If you need a different adapter (e.g. streaming), implement the `ChatService` interface in a new file and have `src/widget.tsx::resolveService` pick it. The interface signature (`sendMessage(history: ChatTurn[])`) is the contract; changing it requires an AC amendment first (AC-50).

### How to add or update design tokens

1. Open the Figma file and inspect the relevant component/section using `get_design_context` with node `116:260` (Brand colors) or the specific component node
2. Edit `src/styles/variables.css` to match the values from Figma
3. If the font changes, update `--font-family`, `--font-family-light`, `--font-family-bold`
4. Ensure the host page loads the font (or add `@font-face` declarations to `variables.css`)

### How to add a new component

1. Find the component in the Figma file and call `get_design_context` to get its layout, spacing, colors, and states
2. Create `src/components/MyComponent.tsx` with a JSDoc block comment. Import hooks and types from `'react'` (the alias redirects to `preact/compat`); do not import from `'preact'` or `'preact/hooks'` directly.
3. Create `src/styles/myComponent.module.css` using tokens from `variables.css`, matching the Figma design exactly
4. Import and use in the appropriate parent component
5. If the new component has form inputs, use `onInput` (not `onChange`) and `event.currentTarget` (not `event.target`) — see the Conventions section for why.
6. After adding or changing anything that touches the bundle (component, asset, dep), run `npm run build` and eyeball the `gzip:` column in Vite's output — combined JS + CSS must stay ≤ 60 KB per AC-100.
7. If the component has a Figma main component in IR-DS, add a Code Connect mapping for it (see **Code Connect** section) so the designer sees the real React component in Figma's inspect panel.

## Code Connect (Figma ↔ Code Mapping)

Code Connect creates a two-way link between Figma components and their React implementations. When the designer inspects a Figma component, instead of seeing auto-generated code they see the actual React component with its props. When an AI agent calls `get_design_context`, the response includes the mapped component info so existing code is reused instead of regenerating duplicates.

### Where mappings live

All Code Connect mappings live in the **IR-DS** file (`fileKey = rlh00CEImhMWwdRNOUqW6L`), not in IR-site. Main components are published there; Code Connect only attaches to main components, not to instances in screen frames. When writing or reading mappings, always pass the IR-DS `fileKey`.

### Current state

All reusable main components and shipped expanded-view support components are mapped. Confirmed live via `get_code_connect_map`:

| Figma node | Component | `source` |
|---|---|---|
| `152:75` | Investor hero | `src/components/CompactView.tsx` |
| `152:97` | Investor agent | `src/components/ExpandedView.tsx` |
| `181:143` Textarea component set — variants `152:121` Default / `181:144` Hero | — (variants) | `src/components/ChatInput.tsx` |
| `152:116` | Question + Answer | `src/components/ChatMessage.tsx` |
| `152:135` | Reference tag | `src/components/SourceBadge.tsx` |
| `230:725` Predefined question — component set → stored per-variant on `152:86` Default / `230:726` Hover / `230:728` Pressed | — (variants) | `src/components/SuggestionChip.tsx` |
| `152:128` Send button — component set → stored per-variant on `152:129` Active / `152:131` Hover / `152:133` Pressed | — (variants) | `src/components/ChatInput.tsx` (the send button is part of `ChatInput`) |
| `152:137` Loading spinner animation — component set → stored per-variant on `152:138` Start / `152:140` End | — (variants) | `src/components/ChatMessage.tsx` (loading state) |
| `223:739` Close discussion — component set → stored per-variant on `196:853` Default / `223:740` Hover / `224:820` Pressed | — (variants) | `src/components/CloseButton.tsx` |
| `191:258` | Previous discussion list | `src/components/PreviousDiscussionList.tsx` |
| `230:452` Previous discussion item — component set → stored per-variant on `191:268` Default / `230:453` Hover / `230:459` Pressed | — (variants) | `src/components/PreviousDiscussionItem.tsx` |
| `237:398` Button (start-new-conversation) — component set → stored per-variant on `237:323` Default / `237:399` Hover / `237:411` Pressed | — (variants) | `src/components/PreviousDiscussionList.tsx` (the "Luo uusi keskustelu" CTA is rendered inline at the top of the sidebar) |
| `230:656` Menu button — component set → stored per-variant on `217:1910` Default / `230:657` Hover / `230:662` Pressed | — (variants) | `src/components/MenuButton.tsx` (AC-33d hamburger that opens the mobile drawer) |
| `214:1214` Mobile menu | MobileMenu | `src/components/MobileMenu.tsx` (AC-33d left-anchored slide-in drawer that hosts the existing `PreviousDiscussionList` over a blurred dark backdrop) |

**Textarea remap completed (2026-04).** `152:121` Textarea is now the `Property 1=Default` variant of the parent component set `181:143` Textarea, whose other variant is `181:144` Hero. Live `get_code_connect_map` checks on `181:143`, `152:121`, and `181:144` all resolve to `ChatInput.tsx`, but the response keys come back as the inner-snippet wrapper IDs `152:127` (Default) and `181:150` (Hero) rather than the variant IDs themselves — functionally equivalent for inspect-panel lookups.

**Chip / close / sidebar-item remap to parent component sets (2026-05).** `152:86` Predefined question, `196:853` Close discussion, and `191:268` Previous discussion item each became `Property 1=Default` variants of newly-introduced parent component sets — `230:725`, `223:739`, and `230:452` respectively, each with `Hover` and `Pressed` siblings — during a Figma reorganisation. Pre-existing single-node Code Connect mappings were orphaned in the move; Lane E-1 (2026-05-05, follow-up to Lane E's 2026-04-22 figma-sync) re-registered each component against all three variants of its parent set via `send_code_connect_mappings`. Read-side: `get_code_connect_map` does not yet surface these new mappings through direct main-component queries (the response is empty `{}` for every variant ID), but the write path confirms persistence — repeating the `add_code_connect_map` call returns the canonical "Component is already mapped to code" rejection that known-good mappings (e.g. `152:128` Send button) also produce. Inspect-panel lookups in Figma resolve correctly. The visual states themselves (Hover / Pressed CSS for `SuggestionChip`, `CloseButton`, `PreviousDiscussionItem`) are not yet implemented in the React tree — see § Known Gaps / TODOs.

A note on how component-set rows are stored: `152:128` and `152:137` are Figma component sets. `send_code_connect_mappings` accepts the parent node ID but Figma persists the mapping on each child variant, so a `get_code_connect_map` on `152:128` returns entries for `152:129/131/133` (not `152:128` itself). Either ID resolves correctly from an instance lookup in Figma's inspect panel.

Instance-level mappings also exist inside the two screen components — `152:83` / `152:84` / `152:85` (chip instances in Investor hero) and `152:100` / `152:101` / `152:102` / `152:103` (Q+A and Textarea instances in Investor agent). These look like they were auto-populated when `Investor hero` / `Investor agent` were first mapped; leave them alone unless you're consciously refactoring.

### What's intentionally unmapped

- **Sub-parts of `Question + Answer`** — `152:111` Question, `152:114` Answer, `152:145` References — and of the loading state (`152:142` Loading information). They're rendered inline by `ChatMessage.tsx`; mapping them would duplicate the `152:116` / `152:137` entries already in place.
- **Deprecated components** — `152:92` "Send button - old". Left in IR-DS for historical context only. (`152:104` "Textarea - old" was previously listed here too; it has been removed from the file.)
- **`152:88` Reset button** — no React component yet (see § Known Gaps / TODOs). Map it when the matching component lands.

### Optional next step — variant templates

The send-button and spinner variants are mapped as plain records (one per variant, all pointing at the same file). If we later want Figma's inspect panel to surface the `Property 1: Active | Hover | Pressed` (and `Start | End`) enum on the snippet itself, we can upgrade those to template mappings via `add_code_connect_map` with `template` + `templateDataJson`, mapping the Figma variant prop to the corresponding CSS pseudo-state (`:hover` / `:active`) in `ChatInput.tsx`. Not required for the snippet to show up — the current mappings already do that.

### Adding mappings for new components

When you add a new React component that has a corresponding main component in IR-DS, append a row to the **Current state** table above and register it via `add_code_connect_map({ fileKey: "rlh00CEImhMWwdRNOUqW6L", nodeId, source, componentName, label: "React" })`. If the component lives only in IR-site (i.e. a screen composition rather than a reusable piece), it does **not** get a Code Connect mapping.

## Conventions

- **Figma first** — before making any visual change, consult the Figma design via MCP tools. Never eyeball or assume visual values.
- **TypeScript strict mode** — no `any`, all props typed
- **CSS custom properties** — never hardcode colors or spacing; always reference `var(--token)`
- **CSS Modules** — one `.module.css` per component, class names in camelCase
- **Component files** — PascalCase, `.tsx` extension, JSDoc block at top
- **Service files** — camelCase, `.ts` extension, exports both named function and default object
- **Framework imports** — import from `'react'` / `'react-dom/client'` (the aliases will redirect to `preact/compat`). Do **not** import from `'preact'` or `'preact/hooks'` directly; that bypasses the compat layer and makes a future framework swap painful.
- **Controlled inputs** — use `onInput`, not `onChange`, for `<input>` / `<textarea>`. Preact follows the DOM spec where `onChange` fires on blur; `onInput` fires on every keystroke and works identically in React should we ever migrate back.
- **Event targets** — prefer `event.currentTarget` over `event.target` in handlers. Preact's event types are stricter about `target` being a generic `EventTarget`; `currentTarget` is correctly typed to the element.
- **React-19-only APIs are not available** — `preact/compat` covers the classic React surface (`memo`, `forwardRef`, `createPortal`, `Suspense`, `lazy`, `useId`, `useSyncExternalStore`, `useTransition`, `useDeferredValue` are all supported). What is **not** supported: `use()`, `useActionState`, `useFormStatus`, `useOptimistic`, Server Components, and React Compiler auto-memoization. If you think you need one, flag it — the fix is usually a small refactor, not a framework change.

## Known Gaps / TODOs

- [x] **Real backend integration** — `apiChatService.ts` adapter is wired. The host page picks it up by passing `apiUrl` to `init()`; the mock remains the default when `apiUrl` is omitted.
- [ ] **Source references from real backend** — current backend response is `{ response }` only. The adapter already reads `sources` forward-compatibly; the backend needs to start returning them.
- [x] **Code Connect mappings — current set complete** — reusable main components and shipped expanded-view support components are mapped in IR-DS (`Investor hero`, `Investor agent`, `Textarea`, `Question + Answer`, `Reference tag`, `Predefined question`, `Send button` with all three variants, `Loading spinner animation` with both variants, `Close discussion`, `Previous discussion list`, and `Previous discussion item`). See the **Code Connect** section for the state table and the optional variant-template follow-up.
- [x] **Code Connect — Textarea remap to `181:143` parent set** — live checks confirm the parent set plus `152:121` Default and `181:144` Hero variants resolve to `ChatInput.tsx`.
- [x] **Close discussion button (`ds:196:853`)** — `src/components/CloseButton.tsx` ships in `ExpandedView` and is connected in Figma. Visual confirmation against Figma is still pending; ACs AC-20d / AC-20j / AC-20k are now `@evolving`.
- [x] **Back-navigation interception** — browser-back dismisses expanded mode via `App.tsx` push/popstate logic. `WidgetOptions.interceptBackNavigation` (default `true`) opts in. ACs AC-20c / AC-20g / AC-20h / AC-20i are `@evolving`.
- [x] **Continue-conversation pill (compact)** — `src/components/ContinuePill.tsx` renders *"Jatka edellistä keskustelua"* inside the compact textarea shell whenever prior history exists. AC-10a / AC-10c are `@evolving` (graduated from `@aspirational` in the 2026-05 multi-discussion flow rework). AC-31b (compact re-entry surfaces continue-pill and hides asked chips) is still `@aspirational` — its rendering half is now satisfied; the chip-de-duplication half (AC-10b) is not yet implemented.
- [x] **Previous discussion sidebar (`ds:191:258` / `ds:191:268`)** — `PreviousDiscussionList` + `PreviousDiscussionItem` ship in `ExpandedView`'s 2-column layout, are connected in Figma, and are backed by `src/services/conversationStore.ts` (PD-08 localStorage). The sidebar is now always rendered in expanded mode (AC-33 amended 2026-05 from `@aspirational` → `@evolving`; the earlier "≥ 2 conversations to render" rule, AC-33c, is tombstoned). AC-33a graduated to `@evolving` 2026-05-06 with row visual states pinned to the `ds:230:452` parent set's Default / Hover / Pressed variants and the active-conversation cue using the Pressed surface plus a bold label (new token `--gray-600: #c0c0c0` for the Pressed slot); AC-33b remains `@aspirational` until Figma confirms the activation flow; AC-33d graduated to `@evolving` 2026-05-06 with the mobile drawer landing (see "Mobile drawer" entry below); AC-35 graduated to `@stable` separately.
- [x] **Mobile drawer for the AC-33 sidebar (`ds:214:1214` / `ds:230:656` / `site:435:2914`)** — landed 2026-05-06 (Lane K). `src/components/MenuButton.tsx` is the 24×24 hamburger toggle (Code Connect `ds:230:656`) and `src/components/MobileMenu.tsx` is the left-anchored slide-in drawer (Code Connect `ds:214:1214`) that hosts the existing `PreviousDiscussionList` over a translucent dark + blurred backdrop. The chat-level `CloseButton` is rendered once and re-positioned per breakpoint (in-flow inside the mobile top-bar at <640 px, `position: absolute` against `.surface` corner ≥640 px). Drawer dismiss paths: internal × / `Esc` / backdrop tap / row activation / start-new — focus returns to the hamburger on close; the AC-33e per-row delete `×` does NOT close the drawer (its modal renders over). AC-33d graduated `@aspirational → @evolving`, anchored in §2.5 to `ds:214:1214` / `ds:230:656` / `site:435:2914`. AC-21 body extended for the mobile top-bar layout. New token `--gray-300: #f4f4f4` for the hamburger Hover state.
- [x] **Hero textarea variant (`ds:181:144`)** — the widget renders both variants via `ChatInput`'s `compact` prop and the variant resolves through the `181:143` Code Connect parent set.
- [ ] **Everett font loading** — assumes host page loads the font; may need `@font-face` fallback
- [ ] **Streaming responses** — current interface is request/response; add SSE/WebSocket support
- [x] **Reset / new conversation** — three paths exist: (1) every compact-mode send mints a fresh conversation when prior history exists (AC-31f); (2) the AC-33 sidebar's "Luo uusi keskustelu" button starts a new thread without leaving expanded mode (AC-35); (3) clearing site storage in browser tooling wipes the PD-08 store (AC-31e). The `ds:152:88` Reset button is still unmapped; if the designer wants a single-button reset surface inside expanded mode, that needs a separate AC.
- [x] **Start-new-conversation button — visual parity with `ds:237:398`** — `PreviousDiscussionList.tsx` now renders the "Luo uusi keskustelu" CTA at the top of the sidebar with the brand violet→blue gradient (`--send-gradient`), 8×20 px padding, 20 px radius, leading 11×11 inline-SVG plus icon, white Everett 14 px / 24 px label, and Hover / Pressed darken-overlays sourced from the shared `--send-overlay-*` tokens. Code Connect parent set `237:398` is mapped, persisted per-variant on `237:323` / `237:399` / `237:411`. Verified via `npm run verify` (gzip 15.41 kB / 60 kB AC-100 budget) and `npm run test` (78 pass, including the renamed AC-35 test in `tests/expandedView.test.tsx`).
- [ ] **Hover / Pressed states for chip / close** — the parent component sets `ds:230:725` (Predefined question) and `ds:223:739` (Close discussion) each ship `Default` / `Hover` / `Pressed` variants in IR-DS. The React tree currently only renders the Default state for these. Each state cluster needs an AC-amend turn before implementation per [`.cursor/rules/ac-amending.mdc`](.cursor/rules/ac-amending.mdc) (likely a new `AC-12c` for chip and an extension of `AC-20d` for the close button). The sidebar-item state cluster (`ds:230:452`) landed 2026-05-06 — see the next entry.
- [x] **Hover / Pressed states for `PreviousDiscussionItem` (`ds:230:452`)** — landed 2026-05-06. Row idle / hovered / active surfaces now step `--gray-400` → `--gray-500` → `--gray-600` per the parent set's Default `ds:191:268` / Hover `ds:230:453` / Pressed `ds:230:459` variants; the active conversation row uses the Pressed surface as its idle treatment plus the existing bold-label cue, so it reads as visibly *depressed* against inactive rows (no separate transient "while pressing" state — the click instantly switches the active conversation). Hovering an already-active row keeps the Pressed surface so the active cue is not bleached. AC-33a graduated `@aspirational → @evolving`, anchored in §2.5 to `ds:230:452` (parent set with all three variant IDs). New token `--gray-600: #c0c0c0` for the Pressed slot.
- [x] **Käyttöehdot terms-of-use gate (`ds:257:1096` short / `ds:242:551` long / `site:555:2186` in screen context)** — landed 2026-05-07. `src/components/TermsDialog.tsx` mounts at App level as a sibling of `ConfirmDialog` and intercepts the *first* compact-mode send (textarea or chip) for any browser profile that hasn't yet accepted, holding the queued question and replaying it on accept (preserves the textarea draft on cancel). Reuses the AC-33e dialog shell, *Lue lisää* / *Näytä vähemmän* swaps to the long form in-place, and renders `WidgetOptions.privacyPolicyUrl` as a `target="_blank" rel="noopener noreferrer"` anchor when supplied. Acceptance is persisted under `siili.termsAccepted.v1` via `src/services/termsStore.ts` (fail-closed on storage errors). ACs AC-66 / AC-66b / AC-66c are `@evolving`. **Code Connect mapping for `ds:257:1096` and `ds:242:551` is deferred** for the same reason as `ds:242:490` (`ConfirmDialog`) — the parent confirmation-dialog component still has not been published to the IR-DS team library; once it is, register both variants via `add_code_connect_map` against `src/components/TermsDialog.tsx` and add rows to the § Code Connect "Current state" table.
- [x] **Per-row × dismiss affordance on `PreviousDiscussionItem`** — landed 2026-05-06; surrounding viewport overlay reconciled against `site:555:2214` in Lane L 2026-05-11 (modal-side `backdrop-filter: blur(8px)` over `rgba(0,0,0,0.4)` dropped to a dim-only `rgba(0,0,0,0.2)` overlay, matching Figma's `Background dim` treatment). `PreviousDiscussionItem` now hosts the activate button and the per-row × delete button as siblings; the × opens a `ConfirmDialog` (Figma `ds:242:490` — title `ds:242:431` *"Poista keskustelu"* / body `ds:242:550` → `ds:242:433` with bolded conversation label / cancel `ds:242:438` *"Peruuta"* / destructive confirm `ds:242:444` *"Poista"* on `--red-600`) centered in the viewport over a dimmed backdrop per `site:555:2214`. Confirm calls `clearConversation(id)` in `src/services/conversationStore.ts` and switches the active conversation to the next-most-recent remaining row when the deleted row was active. Three cancel paths: button / `Esc` / backdrop click. Code Connect mapping for `ds:242:490` is **deferred** — the published-component check on `add_code_connect_map` returned "Published component not found", so the designer needs to publish the `Confirmation dialog` main component to the IR-DS team library before the mapping can register. Once published, register via `add_code_connect_map({ fileKey: "rlh00CEImhMWwdRNOUqW6L", nodeId: "242:490", source: "src/components/ConfirmDialog.tsx", componentName: "ConfirmDialog", label: "React" })` and add the row to the § Code Connect "Current state" table.
- [ ] **Shadow DOM encapsulation (Lane O candidate)** — Lane N (2026-05-11) shipped a targeted host-defensive reset in [`src/styles/variables.css`](src/styles/variables.css) suppressing `box-shadow` on `.siiliChatbot :focus` to neutralise a host `:focus { box-shadow: 0 0 4px 4px rgba(50,50,255,.5) }` rule that was producing a "double focus" ring on staging vs. local. That fix is targeted and depends on us discovering each new host bleed empirically — a cat-and-mouse pattern. The bulletproof answer is to mount the React tree inside a Shadow Root: `host.attachShadow({ mode: 'open' })`, inject the bundled CSS as a `<style>` (Vite `?inline` import), and restore focus via `shadowRoot.activeElement` instead of `document.activeElement` in `ConfirmDialog` / `TermsDialog`. This is a public embedding-contract change (the host page may not need to load `siili-chatbot.css` separately anymore) and a `change-boundary.mdc` stop-and-ask gate; route through a separate AC-amend turn that updates `AC-01` / `AC-02` (embedding) and `AC-112` (CSS isolation) bodies, the README embed instructions, and the test-library setup (queries crossing shadow boundaries). Track as Lane O / v0.8.0.
- [ ] **Accessibility** — basic ARIA labels present, needs full audit
- [ ] **Mobile responsiveness** — `AC-33d` (sidebar drawer) and `AC-21` (mobile top-bar layout) landed 2026-05-06 (Lane K) — see the "Mobile drawer for the AC-33 sidebar" entry above. `AC-92` / `AC-92b` (mobile compact chip-row) landed 2026-05-11 (Lane M) — promoted from `— (code-authored)` after `site:608:1855` *Etusivu - Mobile - v2* was chosen as the canonical anchor over v1 `site:591:3203`; CSS reconciled to vertical-stack with single-line ellipsis truncation in [`src/styles/compactView.module.css`](src/styles/compactView.module.css) and [`src/styles/suggestionChip.module.css`](src/styles/suggestionChip.module.css). `AC-92c` is still `— (code-authored)` in §2.5; anchoring it to `site:435:2904` is a small bookkeeping turn that has been deliberately deferred. Tablet- / mobile-band visual sweeps against the new `site:435:2904` / `site:435:2914` frames are still owed for the *expanded* view; AC-92 / AC-92b cover the *compact* view.
- [ ] **Error handling UX** — shows generic error text; could be improved
- [ ] **Analytics / tracking** — no events emitted yet
- [x] **Lane J — Figma re-align (2026-05-06)** — designer-driven contract amendments landed in [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md) / [`ACCEPTANCE_CRITERIA_BODIES.md`](ACCEPTANCE_CRITERIA_BODIES.md): AC-20a body rewritten (desktop = inset white card + blurred backdrop sibling), AC-28 body rewritten (input bottom-pinned in the conversation column), AC-28b tombstoned (reversed by AC-28), AC-28c body rewritten (latest reply above bottom-pinned input + opacity-fade band + scroll isolation), AC-33 body extended (transparent sidebar shell + per-row treatment + vertical divider + scroll isolation), AC-35 body extended (gradient runs diagonally violet→blue from top-left to bottom-right per `ds:237:323`, distinct from `--send-gradient`). Implementation: `ExpandedView` is now `.backdrop` (full-viewport, `backdrop-filter: blur(20px)` + `rgba(255,255,255,0.5)` wash on desktop ≥1024 px, `rgba(255,255,255,0.7)` translucent fallback) wrapping `.surface` (white card; edge-to-edge mobile, inset with `border-radius` + subtle elevation on desktop). `.contentColumn` flex-pins `.inputWrapper` at the bottom; `.messages` is its own overflow container with `scrollbar-gutter: stable` and a bottom `mask-image` fade, with auto-scroll landing the latest pair via a `.messagesEnd` sentinel + `scrollIntoView({ block: 'end' })` so the AC-83 test spy keeps passing. Sidebar shell is transparent; `gray-400` lifted onto each `PreviousDiscussionItem` row. New `--cta-gradient` token in [`src/styles/variables.css`](src/styles/variables.css) drives `.newButton`; `--send-gradient` / AC-72 untouched.
