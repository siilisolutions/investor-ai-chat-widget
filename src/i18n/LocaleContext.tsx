/**
 * Locale context + hooks for the widget. The matching provider
 * component lives in `LocaleProvider.tsx` (kept separate so this module
 * exports only the context and hooks — satisfies the
 * `react-refresh/only-export-components` lint, which forbids mixing a
 * component export with non-component exports in one file).
 *
 * Locale is resolved once at `init()` time (AC-04b / PD-09) and never
 * switches at runtime — host pages with a FI/EN toggle re-init the
 * widget. The context therefore carries no setter.
 *
 * The default value is the Finnish table so a component rendered
 * outside a provider (e.g. an isolated unit test that mounts a single
 * component) still type-checks and renders Finnish, matching the
 * pre-i18n default.
 */

import { createContext, useContext } from 'react'
import type { WidgetLocale } from '../types/index.ts'
import { STRINGS, type WidgetStrings } from './strings.ts'

export interface LocaleContextValue {
  locale: WidgetLocale
  t: WidgetStrings
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'fi',
  t: STRINGS.fi,
})

/** Returns the active locale's string table. */
export function useStrings(): WidgetStrings {
  return useContext(LocaleContext).t
}

/** Returns the active locale code (`'fi'` | `'en'`). */
export function useLocale(): WidgetLocale {
  return useContext(LocaleContext).locale
}
