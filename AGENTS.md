# Siili Investor Chatbot Widget — AI Agent Context

> This file is the primary onboarding document for AI coding agents (Cursor, Codex, Copilot Workspace, etc.). Read this first before making any changes.

## Project Purpose

An embeddable React chatbot widget for the Siili Solutions investor site (sijoittajille.siili.com). The widget has two modes: a **compact hero mode** (text input + suggestion chips overlaid on the hero section) and an **expanded chat mode** (full conversation view with Q&A pairs, source references, and a sticky input). It is bundled as a single IIFE script + CSS file for embedding via `<script>` tag on the host site. The chatbot backend is developed separately — this project only covers the frontend.

## Architecture

```
Host page (siili.com)
  └─ <div id="siili-chatbot">
       └─ SiiliChatbot.init({ container: '#siili-chatbot' })
            └─ App (state machine: compact | expanded)
                 ├─ CompactView (hero input + chips)
                 └─ ExpandedView (chat messages + input)
                      ├─ ChatMessage (question bubble + answer + sources)
                      │    └─ SourceBadge (reference pill)
                      └─ ChatInput (shared textarea + send button)
```

**State transitions:**
- `compact → expanded`: user sends a message or clicks a suggestion chip
- The widget stays in expanded mode once a conversation starts

## Figma — The Source of Truth for All Visual Work

> **IMPORTANT:** The Figma design file is the single source of truth for every visual decision — layout, spacing, colors, typography, component structure, and interactive states. When making any visual or styling change, **always consult Figma first** using the Figma MCP tools. Do not guess or rely solely on the token table below; extract the actual values from the design.

### Figma file

https://www.figma.com/design/vxWJbloNkZ8Muf5qi14MOy/IR-site

### Key node IDs

| Node ID | Description |
|---------|-------------|
| `113:203` | Investor Hero (compact mode) |
| `143:753` | Investor Agent (expanded mode) |
| `201:2273` | Loading state |
| `116:260` | Brand colors section |
| `149:1410` | Send button — Active |
| `149:1441` | Send button — Hover |
| `150:396` | Send button — Pressed |
| `146:1015` | Textarea component |
| `147:1129` | Question + Answer pair |
| `178:441` | Reference tag |
| `178:482` | Loading spinner |

### How to use Figma MCP tools

When you have access to the Figma MCP server (`user-figma`), use it to inspect designs:

1. **`get_design_context`** — Primary tool. Pass the `fileKey` (`vxWJbloNkZ8Muf5qi14MOy`) and the relevant `nodeId` from the table above. Returns code hints, a screenshot, and contextual information.
2. **`get_screenshot`** — Grab a visual snapshot of any node to compare against the running app.
3. **`get_metadata`** — Retrieve file-level metadata (pages, components, styles).

**Workflow for visual changes:**
1. Identify the relevant Figma node(s) for the area you are changing.
2. Call `get_design_context` (or `get_screenshot`) to see the current design.
3. Implement changes to match the Figma design exactly — spacing, border-radius, colors, font sizes, line heights, etc.
4. If the Figma design conflicts with existing CSS tokens, update the tokens in `src/styles/variables.css` to match Figma, then update component styles accordingly.
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
| `src/App.tsx` | Root component — manages compact/expanded state, chat messages, loading |
| `src/components/CompactView.tsx` | Hero mode: input + suggestion chips |
| `src/components/ExpandedView.tsx` | Chat mode: messages list + input |
| `src/components/ChatInput.tsx` | Shared textarea + send button (compact/expanded variants) |
| `src/components/ChatMessage.tsx` | Single Q&A pair with optional sources and loading state |
| `src/components/SourceBadge.tsx` | Reference pill (link or static) |
| `src/components/SuggestionChip.tsx` | Predefined question chip |
| `src/services/chatService.ts` | **MOCK** chat service — replace with real API |
| `src/types/index.ts` | TypeScript interfaces (ChatMessage, Source, ChatService, WidgetOptions) |
| `src/styles/variables.css` | CSS custom properties (design tokens) |
| `src/styles/*.module.css` | Component-scoped CSS modules |

## Key Decisions & Constraints

1. **Library mode (IIFE)**: The widget bundles React internally so the host page doesn't need React. Output is a single `siili-chatbot.iife.js` + `siili-chatbot.css`.
2. **CSS Modules**: Scoped styles that won't leak into the host page. No Tailwind — keeps the bundle small and avoids config conflicts.
3. **No external UI library**: Zero runtime dependencies beyond React/ReactDOM (bundled).
4. **Mocked backend**: `src/services/chatService.ts` returns fake responses after a delay. The `ChatService` interface in `src/types/index.ts` is the contract to implement.
5. **Font**: Figma specifies `Everett`. The host site is expected to load this font. The widget falls back to `sans-serif`.

## Common Tasks

### How to run locally
```bash
npm install
npm run dev
# Opens at http://localhost:5173 with a simulated hero section
```

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
<script>SiiliChatbot.init({ container: '#siili-chatbot' });</script>
```

### How to swap the mock for a real API

1. Create `src/services/apiChatService.ts`
2. Implement the `ChatService` interface from `src/types/index.ts`
3. Your `sendMessage(message: string)` must return a `Promise<ChatMessage>`
4. Update the import in `src/App.tsx`:
   ```typescript
   import { sendMessage } from './services/apiChatService.ts'
   ```
5. For streaming responses, extend `ChatService` with a streaming method and update `ExpandedView` to handle partial content

### How to add or update design tokens

1. Open the Figma file and inspect the relevant component/section using `get_design_context` with node `116:260` (Brand colors) or the specific component node
2. Edit `src/styles/variables.css` to match the values from Figma
3. If the font changes, update `--font-family`, `--font-family-light`, `--font-family-bold`
4. Ensure the host page loads the font (or add `@font-face` declarations to `variables.css`)

### How to add a new component

1. Find the component in the Figma file and call `get_design_context` to get its layout, spacing, colors, and states
2. Create `src/components/MyComponent.tsx` with a JSDoc block comment
3. Create `src/styles/myComponent.module.css` using tokens from `variables.css`, matching the Figma design exactly
4. Import and use in the appropriate parent component
5. If the Figma team is on an Organization/Enterprise plan with a Dev seat, add a Code Connect mapping (see **Code Connect** section below) so the designer sees the real component in Figma's inspect panel

## Code Connect (Figma ↔ Code Mapping)

Code Connect creates a two-way link between Figma components and their React implementations. When the designer inspects a Figma component, instead of seeing auto-generated code they see the actual React component with its props. When an AI agent calls `get_design_context`, the response includes the mapped component info so existing code is reused instead of regenerating duplicates.

### Prerequisite (currently blocking)

Code Connect **requires**:
- The Figma file's team must be on an **Organization** or **Enterprise** plan
- The user running the MCP tools must have a **Developer** seat on that plan

The `Siili Design` team is currently on **Pro** with a **Full** seat, which blocks both reads (`get_code_connect_suggestions`, `get_code_connect_map`) and writes (`add_code_connect_map`, `send_code_connect_mappings`). All return: *"You need a Developer seat in an Organization or Enterprise plan to access Code Connect."*

Once the plan/seat is upgraded, the runbook below is ready to execute.

### Runbook: initial mapping set

Run these against `fileKey = vxWJbloNkZ8Muf5qi14MOy` with `label: "React"`. Prefer `send_code_connect_mappings` for a single bulk save; the individual `add_code_connect_map` form is shown per-row for clarity.

| Figma node | Description | `source` | `componentName` |
|---|---|---|---|
| `146:1015` | Textarea | `src/components/ChatInput.tsx` | `ChatInput` |
| `149:1410` / `149:1441` / `150:396` | Send button variants (Active / Hover / Pressed) | `src/components/ChatInput.tsx` | `ChatInput` (send button is part of ChatInput) |
| `147:1129` | Question + Answer pair | `src/components/ChatMessage.tsx` | `ChatMessage` |
| `178:441` | Reference tag | `src/components/SourceBadge.tsx` | `SourceBadge` |
| `178:482` / `201:2273` | Loading spinner / loading state | `src/components/ChatMessage.tsx` | `ChatMessage` (with `loading` prop) |
| `116:374` / `116:392` / `116:398` | Predefined question chips | `src/components/SuggestionChip.tsx` | `SuggestionChip` |

Whole-frame nodes `113:203` (Investor Hero) and `143:753` (Investor Agent) are page layouts and are **not** mapped — the reusable pieces inside them are.

### Workflow

1. Get AI-suggested mappings for both main frames:
   - `get_code_connect_suggestions({ fileKey, nodeId: "113:203" })`
   - `get_code_connect_suggestions({ fileKey, nodeId: "143:753" })`
2. Review the suggestions against the table above; reconcile any drift.
3. Bulk-save with `send_code_connect_mappings({ fileKey, nodeId: "143:753", mappings: [...] })` where `mappings` is an array of `{ nodeId, source, componentName, label: "React" }` objects from the table.
4. For the send-button state variants, optionally create a single template mapping (`template` + `templateDataJson` on `add_code_connect_map`) that maps Figma's `property1: "Active" | "Hover" | "Pressed"` to the corresponding `:hover` / `:active` CSS states in `ChatInput.tsx`.
5. Verify each mapping persisted:
   - `get_code_connect_map({ fileKey, nodeId })` for each entry.
6. Ask the designer to open the Figma file and confirm the Code Connect panel shows the React snippets on inspect.

### Adding mappings for new components

When you add a new component (see **How to add a new component** above), extend the table in this section and append a row via `add_code_connect_map({ fileKey, nodeId, source, componentName, label: "React" })`.

## Conventions

- **Figma first** — before making any visual change, consult the Figma design via MCP tools. Never eyeball or assume visual values.
- **TypeScript strict mode** — no `any`, all props typed
- **CSS custom properties** — never hardcode colors or spacing; always reference `var(--token)`
- **CSS Modules** — one `.module.css` per component, class names in camelCase
- **Component files** — PascalCase, `.tsx` extension, JSDoc block at top
- **Service files** — camelCase, `.ts` extension, exports both named function and default object

## Known Gaps / TODOs

- [ ] **Real backend integration** — `chatService.ts` is a mock; needs real API implementation
- [ ] **Code Connect mappings** — runbook is ready (see **Code Connect** section), blocked on Figma plan upgrade (Pro → Organization/Enterprise) and a Dev seat
- [ ] **Everett font loading** — assumes host page loads the font; may need `@font-face` fallback
- [ ] **Streaming responses** — current interface is request/response; add SSE/WebSocket support
- [ ] **Reset / new conversation** — no UI to start a fresh chat from expanded mode
- [ ] **Accessibility** — basic ARIA labels present, needs full audit
- [ ] **Mobile responsiveness** — basic flex layout, needs breakpoint testing
- [ ] **Error handling UX** — shows generic error text; could be improved
- [ ] **Analytics / tracking** — no events emitted yet
