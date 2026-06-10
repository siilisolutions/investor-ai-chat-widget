/**
 * `LocaleProvider` — mounted once at the `App` root with the locale
 * resolved at `init()` time (AC-04b / PD-09). Every component reads its
 * copy via `useStrings()` (from `LocaleContext.tsx`) instead of
 * hardcoding literals (AC-63).
 *
 * Kept in its own file so `LocaleContext.tsx` can export the context +
 * hooks without tripping the `react-refresh/only-export-components`
 * lint.
 */

import type { ReactNode } from 'react'
import type { WidgetLocale } from '../types/index.ts'
import { STRINGS } from './strings.ts'
import { LocaleContext } from './LocaleContext.tsx'

interface LocaleProviderProps {
  locale: WidgetLocale
  children: ReactNode
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, t: STRINGS[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}
