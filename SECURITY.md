# Security Policy

Thanks for taking the time to help keep this project and its users safe.

## Reporting a Vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Email **`it@siili.com`** with:

- A description of the issue and the impact you believe it has.
- Steps to reproduce (ideally a minimal example — a curl command, a code snippet, a URL, or a PoC repo).
- Affected commit SHA or release version, if you know it.
- Your name / handle if you would like to be credited in the fix.

If the issue is sensitive, you may encrypt your message with any PGP key listed on `it@siili.com`'s auto-reply, or ask us to propose another channel.

### What to expect

- **Acknowledgement** within 5 business days.
- **Initial assessment** (severity, in-scope / out-of-scope, whether a fix is required) within 10 business days of acknowledgement.
- **Fix timeline** communicated after assessment. Critical issues are prioritised; low-severity issues may be batched with routine releases.
- **Public disclosure** is coordinated with you after a fix ships, or — if no fix is possible — after we have documented the issue and any mitigation for users.

You may also use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) via the repository's **Security** tab as an alternative to email.

## Scope

This repository ships **`siili-chatbot.iife.js`** and **`siili-chatbot.css`** — an embeddable client-side widget.

**In scope:**

- Cross-site scripting (XSS) via user input, chat responses, or source-reference metadata rendered by the widget.
- Exposure of host-page data (DOM, cookies, `localStorage`) through the widget's JavaScript.
- Supply-chain concerns in the shipped bundle (e.g. a compromised dependency making it into `dist/`).
- Subresource Integrity / bundle tampering if CDN-served assets are consumed.
- Violations of the embed-safety invariants documented in [`.cursor/rules/embed-safety.mdc`](.cursor/rules/embed-safety.mdc) (e.g. the widget writing globals outside `window.SiiliChatbot`, or leaking internal errors / stack traces to the UI per AC-42).

**Out of scope:**

- The chatbot **backend API** — the widget only talks to a URL the host page supplies via `WidgetOptions.apiUrl`. Vulnerabilities in that backend, in its authentication, or in its rate-limiting belong to whoever operates the backend, not this repo.
- The **host site** (`sijoittajille.siili.com` or any page that embeds the widget) — issues in the surrounding page, its CSP, its CORS, or its font hosting are not this project's responsibility unless the widget itself is the proximate cause.
- Attacks that require the host page to already be compromised (e.g. an attacker with arbitrary script execution on the embedding page).
- Denial-of-service via extremely large inputs sent to a backend the widget does not control.
- Quality / hallucination concerns in generated answers — handled through the product feedback process, not security.

If you're unsure whether something falls in scope, email anyway and we'll route it.

## Supported Versions

Only the **current `main` branch** and the **most recently tagged release** receive security fixes. Older builds embedded on the host site should be refreshed when a security-relevant release ships; we will flag such releases explicitly in the release notes.

## Coordinated Disclosure

We ask reporters not to publicly disclose a vulnerability until a fix has been released or 90 days have elapsed from the initial report, whichever comes first. We will work with you in good faith within that window.
