/**
 * Dev entry point used by Vite's dev server (`npm run dev`). Mounts
 * the widget into `#siili-chatbot` in the root `index.html` harness
 * so we can iterate without the library build.
 *
 * Set `VITE_API_URL` in `.env.local` to point dev at the real
 * backend; leave it unset to use the bundled mock (AC-04, AC-51).
 * Set `VITE_PRIVACY_POLICY_URL` in `.env.local` to surface a real
 * privacy-policy link inside the AC-66b *Lue lisää* long-form;
 * leave it unset to render the long form without a trailing link.
 * Set `VITE_LOCALE` to `fi` or `en` to force the widget UI locale for
 * a dev smoke; leave it unset to fall back to PD-09 resolution
 * (`<html lang>` → `'fi'`).
 * This file is not part of the library bundle (see `vite.config.ts`
 * → `build.lib.entry`), so the env var never leaks into production.
 */

import { init } from './widget.tsx'
import type { WidgetLocale } from './types/index.ts'

const apiUrl = import.meta.env.VITE_API_URL
const privacyPolicyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL
const localeEnv = import.meta.env.VITE_LOCALE
const locale: WidgetLocale | undefined =
  localeEnv === 'fi' || localeEnv === 'en' ? localeEnv : undefined

init({
  container: '#siili-chatbot',
  apiUrl: typeof apiUrl === 'string' && apiUrl.length > 0 ? apiUrl : undefined,
  privacyPolicyUrl:
    typeof privacyPolicyUrl === 'string' && privacyPolicyUrl.length > 0
      ? privacyPolicyUrl
      : undefined,
  locale,
})
