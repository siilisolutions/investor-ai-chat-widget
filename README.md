# Siili Investor Chatbot Widget

An embeddable chatbot widget for the Siili Solutions investor site. Built with React + TypeScript, bundled as a single script for easy integration.

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
  SiiliChatbot.init({ container: '#siili-chatbot' });
</script>
```

## Widget Modes

**Compact (Hero)** — Text input with suggestion chips. Shown initially inside the hero section.

**Expanded (Chat)** — Full conversation view with Q&A pairs, source references, and sticky input. Activates when the user sends a message.

## Project Structure

See [AGENTS.md](AGENTS.md) for detailed file map, design tokens, Figma references, and developer onboarding.

## Tech Stack

- React 19 + TypeScript
- Vite 6 (library mode, IIFE output)
- CSS Modules with CSS custom properties
- No external UI libraries

## Environment

- Node.js >= 18
- npm >= 8

## Design Reference

Figma: https://www.figma.com/design/vxWJbloNkZ8Muf5qi14MOy/IR-site
