/**
 * Tests for `ExpandedView`, focused on motion behaviour under
 * `prefers-reduced-motion` (AC-83). Per GOV-13 each test name
 * quotes the AC intent.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/preact'
import { ExpandedView } from '../src/components/ExpandedView'
import type { ChatMessage as ChatMessageData } from '../src/types/index'

const MESSAGE: ChatMessageData = {
  id: 'm1',
  question: 'Mikä on yhtiön osinkopolitiikka?',
  answer: 'Siili maksaa osinkoa kerran vuodessa.',
}

function stubMatchMedia(prefersReduce: boolean) {
  const mql = {
    matches: prefersReduce,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) =>
      query.includes('prefers-reduced-motion') ? mql : { ...mql, matches: false },
    ),
  )
  // happy-dom also exposes matchMedia on window; keep both in sync.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: window.matchMedia ?? (() => mql),
  })
  window.matchMedia = ((query: string) =>
    query.includes('prefers-reduced-motion')
      ? mql
      : { ...mql, matches: false }) as typeof window.matchMedia
}

describe('ExpandedView — AC-83 reduced motion', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    scrollSpy = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    scrollSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('AC-83: auto-scroll uses instant behavior when prefers-reduced-motion is set', () => {
    stubMatchMedia(true)
    render(<ExpandedView messages={[MESSAGE]} loading={false} onSend={() => {}} />)
    expect(scrollSpy).toHaveBeenCalled()
    const call = scrollSpy.mock.calls.at(-1)?.[0] as ScrollIntoViewOptions | undefined
    expect(call?.behavior).toBe('auto')
    expect(call?.block).toBe('end')
  })

  it('AC-83: auto-scroll uses smooth behavior when reduced motion is not requested', () => {
    stubMatchMedia(false)
    render(<ExpandedView messages={[MESSAGE]} loading={false} onSend={() => {}} />)
    expect(scrollSpy).toHaveBeenCalled()
    const call = scrollSpy.mock.calls.at(-1)?.[0] as ScrollIntoViewOptions | undefined
    expect(call?.behavior).toBe('smooth')
    expect(call?.block).toBe('end')
  })
})
