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

The host page can either self-host the bundle (download `siili-chatbot.iife.js` + `siili-chatbot.css` from a tagged GitHub release and serve them itself) or load them straight from the **jsDelivr CDN** — the latter is the easiest path. There are three flavours below: **Option A** pins to a specific tag (recommended for production), **Option B** self-hosts the bundle, and **Option C** tracks `@latest` so the host page picks up every new release automatically (recommended for staging).

### Option A — jsDelivr CDN (recommended for production)

Pin to an exact tag so a future release can't break the live page without an explicit version bump:

```html
<div id="siili-chatbot"></div>
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@v0.1.0/dist/siili-chatbot.css" />
<script src="https://cdn.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@v0.1.0/dist/siili-chatbot.iife.js"></script>
<script>
  SiiliChatbot.init({
    container: '#siili-chatbot',
    apiUrl: 'https://YOUR-BACKEND/api/chat', // placeholder — replace with the real endpoint on the host page only, never commit here
  });
</script>
```

- jsDelivr serves any file from any tag of this public repo automatically — there's nothing to publish, just `git push --tags`.
- The bundle is tiny (gzip ~13 KB combined) so caching is nearly free.
- To roll forward, bump the `@v0.1.0` segment in both URLs to the new tag. To roll back, point it at the previous tag — no rebuild required on the host.
- **Production should always pin** to an exact tag (the snippet above) — that's the whole point of Option A: a new release can't change the live site without a deliberate version bump in the host page. `@latest` is intentional on **staging** (Option C below) and fine for throwaway demos, but never on production.

### Option B — Self-hosted

If the host has its own asset pipeline (e.g. HubSpot `/hubfs/`), download the two files from the [v0.1.0 release](https://github.com/siilisolutions/investor-ai-chat-widget/releases/tag/v0.1.0) (or build locally with `npm run build`) and serve them yourself:

```html
<div id="siili-chatbot"></div>
<link rel="stylesheet" href="path/to/siili-chatbot.css" />
<script src="path/to/siili-chatbot.iife.js"></script>
<script>
  SiiliChatbot.init({ container: '#siili-chatbot', apiUrl: 'https://YOUR-BACKEND/api/chat' });
</script>
```

`apiUrl` is optional — if omitted the widget runs against the bundled mock so local demos work offline. In production, set it to the chatbot backend endpoint **in the host page's script tag**, not in this repo.

`interceptBackNavigation` is also optional and defaults to `true`. With it on, the compact → expanded transition pushes a synthetic history entry so the browser back button (or Android hardware back) dismisses the chat instead of navigating away from the host page; the close button (`×`) and `Esc` use the same dismiss path. Set `interceptBackNavigation: false` if the host page already manages its own history stack and would prefer the widget not touch it — the close button and `Esc` continue to dismiss, they just won't call `history.back()` to balance the stack.

`privacyPolicyUrl` is also optional. The widget shows a *Käyttöehdot* (terms-of-use) gate on a profile's **first send** (AC-66) and the gate's *Lue lisää* long form ends with a sentence that links to the host site's privacy policy when this URL is supplied (rendered as a `target="_blank" rel="noopener noreferrer"` anchor, AC-66b). Omit it and the long form renders the same sentence without a link. Acceptance is persisted in `localStorage` so the gate only appears once per browser profile (AC-66c).

For local development against the real backend, copy the endpoint into `.env.local` as `VITE_API_URL=…` (the file is git-ignored) and run `npm run dev`. To surface a real privacy-policy link in the dev harness's terms gate, also add `VITE_PRIVACY_POLICY_URL=…` to the same file.

### Option C — Staging: auto-track latest release

Staging deliberately follows whatever was tagged most recently, so a new release surfaces there without a host-page edit. Use jsDelivr's `@latest` alias:

```html
<div id="siili-chatbot"></div>
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@latest/dist/siili-chatbot.css" />
<script src="https://cdn.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@latest/dist/siili-chatbot.iife.js"></script>
<script>
  SiiliChatbot.init({
    container: '#siili-chatbot',
    apiUrl: 'https://YOUR-BACKEND/api/chat',
  });
</script>
```

- jsDelivr resolves `@latest` to the **highest semver tag**, not the most recently pushed one. A hotfix tagged below the current `@latest` (e.g. `v0.1.4` after `v0.2.0` already exists) will **not** be picked up — pin staging to the hotfix tag explicitly via Option A when back-porting.
- `@latest` resolution is cached at jsDelivr for up to ~24h. Step 9 of § Cutting a new CDN release runs a one-line `curl` to purge that cache; without it, staging may take up to a day to reflect a fresh release. Browser-side caching is independent — a hard refresh on the host page may still be needed.
- This form is **not** for production. Production should always pin (Option A) so a new release can't silently change the live site.

### Cutting a new CDN release

1. From `main`: `npm run build` (sanity check; the release commit will rebuild too).
2. `git checkout --detach main`
3. `git add -f dist/siili-chatbot.iife.js dist/siili-chatbot.css`
4. `git commit -m "release(vX.Y.Z): bundle dist/ for jsDelivr CDN"`
5. `git tag -a vX.Y.Z -m "vX.Y.Z — release notes"`
6. `git checkout main` (release commit is now reachable only via the tag — `main` stays free of build artifacts)
7. `git push origin vX.Y.Z`
8. The jsDelivr URL `https://cdn.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@vX.Y.Z/dist/siili-chatbot.iife.js` becomes live within a minute.
9. Bust jsDelivr's `@latest` alias cache so staging picks up the new release in ~1 minute instead of waiting up to ~24h:

   ```bash
   curl -s "https://purge.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@latest/dist/siili-chatbot.iife.js"
   curl -s "https://purge.jsdelivr.net/gh/siilisolutions/investor-ai-chat-widget@latest/dist/siili-chatbot.css"
   ```

   Step 9 only matters for hosts using `@latest` (i.e. staging — see § Embed on Host Site Option C). Production hosts pinned to `@vX.Y.Z` are unaffected and require no purge. Skip step 9 entirely when back-porting a hotfix tag below the current `@latest` — the alias still resolves to the higher semver tag, so there's nothing to invalidate.

## Environments

| Env | URL | Host page |
|-----|-----|-----------|
| Staging | <https://www-siili-com.sandbox.hs-sites-eu1.com/investors-chatbot-test> | HubSpot sandbox preview. Widget assets served from jsDelivr via the `@latest` alias (see § Embed on Host Site Option C) so the page auto-tracks every new release. Self-hosting from `/hubfs/investors-chatbot/` is also supported (Option B) when the CDN is unavailable. |

The `apiUrl` is configured on the host page's `SiiliChatbot.init({ … })` call, not in this repo — so pointing staging at a different backend is a host-page change, not a widget release.

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
