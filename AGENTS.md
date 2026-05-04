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
                 └─ ExpandedView (chat messages + input + close button + optional sidebar)
                      ├─ CloseButton (× top-right, AC-20d / ds:196:853)
                      ├─ PreviousDiscussionList (sidebar, AC-33 / ds:191:258 — rendered when >1 conversation)
                      │    └─ PreviousDiscussionItem (row, AC-33a / ds:191:268)
                      ├─ ChatMessage (question bubble + answer + sources)
                      │    └─ SourceBadge (reference pill)
                      └─ ChatInput (shared textarea + send button)
```

**State transitions:**
- `compact → expanded`: user sends a message or clicks a suggestion chip; a synthetic history entry is pushed when `interceptBackNavigation` is on (AC-20c).
- `expanded → compact`: user clicks the close button, presses `Esc`, or triggers browser back. `messages` is preserved (AC-31).
- The widget stays in expanded mode once a conversation starts unless dismissed.

**Conversation store (PD-08):** `App` owns an array of `Conversation` objects keyed by id plus an `activeId`. The store is hydrated from `sessionStorage` on mount (so a tab reload preserves history) and persisted on every message append. Closing the tab clears the store (AC-31c). Activating a sidebar row swaps `activeId` only — no network call (AC-33b). Starting a new conversation mints a fresh id and appends to the store (AC-35).

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
| `143:601` | AI-agentti — expanded chat screen composition |
| `201:2273` | AI-agentti, haetaan tietoa — loading-state screen composition |

> **Layout update versus the original implementation (2026-04).** `143:601` and `201:2273` have been redesigned since the widget was first built. The current Figma layout for the AI-agent screen now contains a top-bar title, a Close-discussion (`×`) button (`ds:196:853`) at the top-right, and a two-column body with a Previous-discussion-list sidebar (`ds:191:258` / `ds:191:268`) on the left, divider, and the Q+A stream + sticky textarea on the right. `src/components/ExpandedView.tsx` now renders the close button and optional sidebar; new visual work on the expanded view should consult these IR-site frames first and slot into the AC-20d cluster (close button) and AC-33 cluster (sidebar).

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
| `152:88` | Reset button | backlog (still no React component) |

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
| `--gray-400` | `#efefef` | Reference tag bg |
| `--gray-500` | `#e5e5e5` | Question bubble bg |
| `--gray-900` | `#575757` | Placeholder text |
| `--blue-500` | `rgb(50, 50, 255)` | Send button gradient start |
| `--violet-500` | `rgb(170, 50, 255)` | Send button gradient end |
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
| `src/components/CompactView.tsx` | Hero mode: input + suggestion chips |
| `src/components/ExpandedView.tsx` | Chat mode: messages list + input + close button + optional sidebar (2-column layout) |
| `src/components/ChatInput.tsx` | Shared textarea + send button (compact/expanded variants) |
| `src/components/ChatMessage.tsx` | Single Q&A pair with optional sources and loading state |
| `src/components/SourceBadge.tsx` | Reference pill (link or static) |
| `src/components/SuggestionChip.tsx` | Predefined question chip |
| `src/components/CloseButton.tsx` | × button rendered top-right of expanded view (AC-20d, Figma `ds:196:853`) |
| `src/components/PreviousDiscussionList.tsx` | Sidebar of past conversations (AC-33, Figma `ds:191:258`); only rendered when more than one conversation exists |
| `src/components/PreviousDiscussionItem.tsx` | Single sidebar row (AC-33a, Figma `ds:191:268`) — label derived from first user question of the conversation |
| `src/services/chatService.ts` | **MOCK** chat service — used when `WidgetOptions.apiUrl` is omitted (dev default) |
| `src/services/apiChatService.ts` | Real `ChatService` adapter — posts `{ messages }` to `WidgetOptions.apiUrl`, maps `{ response }` back into a `ChatMessage`, handles timeout + error mapping (AC-43 / AC-44 / AC-52 / AC-53) |
| `src/services/conversationStore.ts` | sessionStorage-backed multi-conversation persistence layer (PD-08) — `listConversations` / `loadConversation` / `saveConversation` / `createConversation` / `clearAll`. Survives reloads, cleared on tab close. |
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

The host page loads `siili-chatbot.iife.js` + `siili-chatbot.css` from `/hubfs/investors-chatbot/` and configures `apiUrl` in its own `<script>` tag. Use this URL for embed-side smoke tests (mount, scoped styles, no global leakage beyond `SiiliChatbot`, AC-43 error path on a bad backend) — but remember that the **`apiUrl` value lives on the host page**, not here, so a "broken chat" on staging often means the host page's init call needs updating, not a widget change. See `README.md` § Environments for the canonical entry.

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
| `152:86` | Predefined question | `src/components/SuggestionChip.tsx` |
| `152:128` Send button — component set → stored per-variant on `152:129` Active / `152:131` Hover / `152:133` Pressed | — (variants) | `src/components/ChatInput.tsx` (the send button is part of `ChatInput`) |
| `152:137` Loading spinner animation — component set → stored per-variant on `152:138` Start / `152:140` End | — (variants) | `src/components/ChatMessage.tsx` (loading state) |
| `196:853` | Close discussion | `src/components/CloseButton.tsx` |
| `191:258` | Previous discussion list | `src/components/PreviousDiscussionList.tsx` |
| `191:268` | Previous discussion item | `src/components/PreviousDiscussionItem.tsx` |

**Textarea remap completed (2026-04).** `152:121` Textarea is now the `Property 1=Default` variant of the parent component set `181:143` Textarea, whose other variant is `181:144` Hero. Live `get_code_connect_map` checks on `181:143`, `152:121`, and `181:144` all resolve to `ChatInput.tsx`.

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
- [ ] **Continue-conversation pill (compact)** — *"Jatka keskustelua"* affordance above chips when prior history exists. Anchored to `site:395:5439`. Aspirational ACs drafted (AC-10a / AC-10c / AC-31b kept @aspirational because it depends on this).
- [x] **Previous discussion sidebar (`ds:191:258` / `ds:191:268`)** — `PreviousDiscussionList` + `PreviousDiscussionItem` ship in `ExpandedView`'s 2-column layout, are connected in Figma, and are backed by `src/services/conversationStore.ts` (PD-08 sessionStorage). AC-33 / AC-33a / AC-33b / AC-33c / AC-33d remain `@aspirational` until Figma confirms the visual; AC-35 (start-new affordance) is also `@aspirational`.
- [x] **Hero textarea variant (`ds:181:144`)** — the widget renders both variants via `ChatInput`'s `compact` prop and the variant resolves through the `181:143` Code Connect parent set.
- [ ] **Everett font loading** — assumes host page loads the font; may need `@font-face` fallback
- [ ] **Streaming responses** — current interface is request/response; add SSE/WebSocket support
- [ ] **Reset / new conversation** — no UI to start a fresh chat from expanded mode (`ds:152:88` Reset button is still in IR-DS but has no React component yet; will become moot if the AC-33 sidebar lands and exposes a "new conversation" affordance)
- [ ] **Accessibility** — basic ARIA labels present, needs full audit
- [ ] **Mobile responsiveness** — basic flex layout, needs breakpoint testing
- [ ] **Error handling UX** — shows generic error text; could be improved
- [ ] **Analytics / tracking** — no events emitted yet
