# Siili Investor Chatbot Widget

An embeddable chatbot widget for the Siili Solutions investor site. Written against the React component API (powered by Preact at runtime for a small bundle) + TypeScript, shipped as a single IIFE script for easy integration.

## Repository

https://github.com/siilisolutions/investor-ai-chat-widget

You do **not** need SSH keys to work with this repo. Use HTTPS (`https://github.com/...`) and authenticate when you push:

1. **GitHub CLI** (simplest): install the `gh` CLI, run `gh auth login`, then `git push` as usual.
2. **HTTPS + token**: when Git asks for credentials, use your GitHub username and a [Personal Access Token](https://github.com/settings/tokens) (fine-grained or classic with `repo` scope) instead of a password.

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
    apiUrl: 'https://.../api/chat',
  });
</script>
```

`apiUrl` is optional — if omitted the widget runs against the bundled mock so local demos work offline. In production, set it to the chatbot backend endpoint.

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

Figma: https://www.figma.com/design/vxWJbloNkZ8Muf5qi14MOy/IR-site
