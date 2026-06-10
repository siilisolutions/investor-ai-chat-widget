/**
 * Resolves the widget's UI locale per §12.1 PD-09 (AC-04b):
 *
 *   1. An explicit `WidgetOptions.locale` wins.
 *   2. Otherwise `document.documentElement.lang` is matched against the
 *      supported `WidgetLocale` set by language-tag prefix (so `en-US`
 *      resolves to `en`, `fi-FI` to `fi`).
 *   3. Otherwise it falls back to `'fi'` (the host site default).
 *
 * Resolution happens once at `init()` time; runtime switching is out of
 * scope (a mid-conversation switch would mix languages, which AC-63
 * itself calls out as a bug).
 */

import type { WidgetLocale } from '../types/index.ts'

const SUPPORTED: readonly WidgetLocale[] = ['fi', 'en']

function isSupported(value: string): value is WidgetLocale {
  return (SUPPORTED as readonly string[]).includes(value)
}

function matchLangTag(lang: string | null | undefined): WidgetLocale | undefined {
  if (!lang) return undefined
  const primary = lang.trim().toLowerCase().split('-')[0]
  return isSupported(primary) ? primary : undefined
}

export function resolveLocale(option?: WidgetLocale): WidgetLocale {
  if (option && isSupported(option)) return option
  if (typeof document !== 'undefined') {
    const fromHtml = matchLangTag(document.documentElement.lang)
    if (fromHtml) return fromHtml
  }
  return 'fi'
}
