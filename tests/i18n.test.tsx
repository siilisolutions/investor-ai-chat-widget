/**
 * Tests for the FI/EN localization layer.
 *
 *   AC-04b — `locale` option + PD-09 resolution: explicit option wins;
 *            otherwise `<html lang>` is matched against `WidgetLocale`;
 *            otherwise it falls back to `'fi'`. Resolution is wired
 *            through `init()` so an English-locale mount renders the
 *            English string table.
 *   AC-63  — language parity: the string table ships an entry for every
 *            key in every supported `WidgetLocale`, and no entry is an
 *            empty string. A missing key is also a `tsc` build failure
 *            (the table is typed `Record<WidgetLocale, WidgetStrings>`);
 *            this test is the AC's belt-and-suspenders runtime guard.
 *
 * Per GOV-13 every test name quotes the AC's intent.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/preact'
import { resolveLocale } from '../src/i18n/resolveLocale'
import { STRINGS } from '../src/i18n/strings'
import type { WidgetStrings } from '../src/i18n/strings'
import { init } from '../src/widget'

describe('resolveLocale — AC-04b / PD-09', () => {
  const originalLang = document.documentElement.lang
  afterEach(() => {
    document.documentElement.lang = originalLang
  })

  it('AC-04b: an explicit locale option wins over the document lang', () => {
    document.documentElement.lang = 'fi'
    expect(resolveLocale('en')).toBe('en')
  })

  it('AC-04b: with no option, document lang is matched by language-tag prefix', () => {
    document.documentElement.lang = 'en-US'
    expect(resolveLocale()).toBe('en')
    document.documentElement.lang = 'fi-FI'
    expect(resolveLocale()).toBe('fi')
  })

  it('AC-04b: with neither option nor a supported lang, it falls back to fi (PD-09)', () => {
    document.documentElement.lang = 'sv'
    expect(resolveLocale()).toBe('fi')
    document.documentElement.lang = ''
    expect(resolveLocale()).toBe('fi')
  })
})

describe('init — AC-04b widget locale plumbing', () => {
  let container: HTMLDivElement
  const originalLang = document.documentElement.lang

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    document.documentElement.lang = originalLang
  })

  it('AC-04b: init with locale "en" renders English widget-owned strings and lang="en"', async () => {
    init({ container, locale: 'en' })
    await waitFor(() =>
      expect(
        screen.getByLabelText('Siili investor chatbot message'),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('button', { name: 'Send message' }),
    ).toBeInTheDocument()
    expect(container.querySelector('.siiliChatbot')).toHaveAttribute(
      'lang',
      'en',
    )
  })

  it('AC-04b: init without locale on <html lang="en"> resolves to English', async () => {
    document.documentElement.lang = 'en'
    init({ container })
    await waitFor(() =>
      expect(
        screen.getByLabelText('Siili investor chatbot message'),
      ).toBeInTheDocument(),
    )
  })

  it('AC-04b: init with neither option nor a supported lang renders Finnish (PD-09 fallback)', async () => {
    document.documentElement.lang = ''
    render(<div />)
    init({ container })
    await waitFor(() =>
      expect(
        screen.getByLabelText('Siilin sijoittajachatbotin viesti'),
      ).toBeInTheDocument(),
    )
  })
})

describe('string table — AC-63 language parity', () => {
  const locales = Object.keys(STRINGS) as (keyof typeof STRINGS)[]

  it('AC-63: every locale exposes exactly the same set of string keys', () => {
    const reference = Object.keys(STRINGS.fi).sort()
    for (const locale of locales) {
      expect(Object.keys(STRINGS[locale]).sort()).toEqual(reference)
    }
  })

  it('AC-63: no widget-owned string is empty in any locale (no silent fall-through)', () => {
    for (const locale of locales) {
      const table = STRINGS[locale]
      for (const key of Object.keys(table) as (keyof WidgetStrings)[]) {
        assertNonEmpty(table[key], `${String(locale)}.${String(key)}`)
      }
    }
  })
})

/**
 * Recursively asserts that every leaf string in a table entry is
 * non-empty. Handles plain strings, arrays (suggestions,
 * long-form sections, mock sources), nested objects (section
 * `{ heading, paragraphs }`), and the parameterized
 * `deleteConversationAriaLabel(label)` function.
 */
function assertNonEmpty(value: unknown, path: string): void {
  if (typeof value === 'string') {
    expect(value.length, `${path} should be a non-empty string`).toBeGreaterThan(
      0,
    )
    return
  }
  if (typeof value === 'function') {
    const produced = (value as (label: string) => string)('X')
    expect(
      produced.length,
      `${path}('X') should produce a non-empty string`,
    ).toBeGreaterThan(0)
    return
  }
  if (Array.isArray(value)) {
    expect(value.length, `${path} should be a non-empty array`).toBeGreaterThan(0)
    value.forEach((item, i) => assertNonEmpty(item, `${path}[${i}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      assertNonEmpty(v, `${path}.${k}`)
    }
    return
  }
  throw new Error(`${path} is an unexpected empty value: ${String(value)}`)
}
