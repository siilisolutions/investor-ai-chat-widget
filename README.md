# Siili Investor Chatbot Widget

An embeddable chatbot widget for the Siili Solutions investor site. Written against the React component API (powered by Preact at runtime for a small bundle) + TypeScript, shipped as a single IIFE script for easy integration.

## Repository

https://github.com/siilisolutions/investor-ai-chat-widget

You do **not** need SSH keys to work with this repo. Use HTTPS (`https://github.com/...`) and authenticate when you push:

1. **GitHub CLI** (simplest): install the `gh` CLI, run `gh auth login`, then `git push` as usual.
2. **HTTPS + token**: when Git asks for credentials, use your GitHub username and a [Personal Access Token](https://github.com/settings/tokens) (fine-grained or classic with `repo` scope) instead of a password.

## Public repository — no secrets, ever

This repo is **public**. Anything you commit becomes world-readable and cannot be un-published by a later deletion (forks and mirrors preserve history). Before `git add`, skim your staged content for credentials.

- **Backend URL + Azure Function key** (`?code=…`): lives in the **host page's `<script>` tag** that calls `SiiliChatbot.init({ apiUrl })`, never in this repo.
- **`VITE_API_URL`** for local dev: lives in **`.env.local`** (matched by `*.local` in `.gitignore`). Keep example URLs in code and docs as `https://YOUR-BACKEND/api/chat` placeholders.
- **Everything else** (PATs, service principals, SAS URLs, private CORS origins, customer data): belongs in the host / CI secret store, not here.
- **If a secret is committed by accident**, treat it as compromised: **rotate it first**, then scrub history. Do not rely on `git rm` or force-push to "hide" it — assume it's already been scraped.
- **Reporting a leak or a security issue**: see [`SECURITY.md`](SECURITY.md) (`it@siili.com`).

GitHub's [secret scanning and push protection](https://docs.github.com/en/code-security/secret-scanning/about-push-protection) are enabled on this repo and will block a push mid-flight if a recognised credential format is detected. That's a safety net, not the policy — the policy is: don't commit secrets.

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` with a simulated hero section.

## Build

```bash
npm run build
```

Produces `dist/siili-chatbot.iife.js` and `dist/siili-chatbot.css`.

## Embed on Host Site

```html
<div id="siili-chatbot"></div>
<link rel="stylesheet" href="path/to/siili-chatbot.css" />
<script src="path/to/siili-chatbot.iife.js"></script>
<script>
  SiiliChatbot.init({
    container: '#siili-chatbot',
    apiUrl: 'https://YOUR-BACKEND/api/chat', // placeholder — replace with the real endpoint on the host page only, never commit here
  });
</script>
```

`apiUrl` is optional — if omitted the widget runs against the bundled mock so local demos work offline. In production, set it to the chatbot backend endpoint **in the host page's script tag**, not in this repo.

For local development against the real backend, copy the endpoint into `.env.local` as `VITE_API_URL=…` (the file is git-ignored) and run `npm run dev`.

## Widget Modes

**Compact (Hero)** — Text input with suggestion chips. Shown initially inside the hero section.

**Expanded (Chat)** — Full conversation view with Q&A pairs, source references, and sticky input. Activates when the user sends a message.

## Project Structure

See [AGENTS.md](AGENTS.md) for detailed file map, design tokens, Figma references, and developer onboarding.

## Tech Stack

- Preact 10 via `preact/compat` (code uses React-shaped imports from `'react'`; the alias lives in `vite.config.ts` and `tsconfig.app.json`)
- TypeScript 6
- Vite 6 (library mode, IIFE output)
- CSS Modules with CSS custom properties
- No external UI libraries

## Environment

- Node.js >= 18
- npm >= 8

## Design Reference

- Screens: [IR-site](https://www.figma.com/design/0xXdKUlBJIolF15MjJuaMC/IR-site) — composite frames for hero page, AI-agent page, and loading state.
- Design system: [IR-DS](https://www.figma.com/design/rlh00CEImhMWwdRNOUqW6L/IR-DS) — main components, brand colors, and token palette. Code Connect mappings live here.
