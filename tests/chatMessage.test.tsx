/**
 * Tests for `ChatMessage` + `SourceBadge`, covering ACs in §3.3 (expanded
 * mode) and §3.4 (error handling). Each test name quotes the AC intent
 * per GOV-13 — never the implementation.
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/preact'
import { ChatMessage } from '../src/components/ChatMessage'
import type { ChatMessage as ChatMessageData } from '../src/types/index'

function makeMessage(overrides: Partial<ChatMessageData> = {}): ChatMessageData {
  return {
    id: 'test-id',
    question: 'Mikä on yhtiön osinkopolitiikka?',
    answer: '',
    ...overrides,
  }
}

describe('ChatMessage', () => {
  it('AC-22: question bubble renders the user question verbatim', () => {
    render(<ChatMessage message={makeMessage({ answer: 'ok' })} />)
    expect(
      screen.getByText('Mikä on yhtiön osinkopolitiikka?'),
    ).toBeInTheDocument()
  })

  it('AC-23 + AC-81c: loading state exposes role="status", aria-live="polite", and "Haetaan tietoa..." copy', () => {
    render(<ChatMessage message={makeMessage({ loading: true })} />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(within(status).getByText('Haetaan tietoa...')).toBeInTheDocument()
  })

  it('AC-23: loading state hides the answer and sources', () => {
    render(
      <ChatMessage
        message={makeMessage({
          loading: true,
          answer: 'should-not-appear',
          sources: [{ label: 'hidden.pdf' }],
        })}
      />,
    )
    expect(screen.queryByText('should-not-appear')).not.toBeInTheDocument()
    expect(screen.queryByText('Lähteet:')).not.toBeInTheDocument()
  })

  it('AC-24: resolved answer renders as plain text in a paragraph', () => {
    render(
      <ChatMessage message={makeMessage({ answer: 'Siili on konsulttiyhtiö.' })} />,
    )
    expect(screen.getByText('Siili on konsulttiyhtiö.')).toBeInTheDocument()
  })

  it('AC-25 + AC-25b: linked source badge opens in a new tab with rel="noopener noreferrer"', () => {
    render(
      <ChatMessage
        message={makeMessage({
          answer: 'vastaus',
          sources: [{ label: 'Vuosikertomus 2025', href: 'https://siili.com/ar-2025.pdf' }],
        })}
      />,
    )
    expect(screen.getByText('Lähteet:')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Vuosikertomus 2025' })
    expect(link).toHaveAttribute('href', 'https://siili.com/ar-2025.pdf')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('AC-25c: unlinked source badge renders as static non-interactive text', () => {
    render(
      <ChatMessage
        message={makeMessage({
          answer: 'vastaus',
          sources: [{ label: 'Sisäinen lähde' }],
        })}
      />,
    )
    const badge = screen.getByText('Sisäinen lähde')
    expect(badge.tagName).toBe('SPAN')
    expect(screen.queryByRole('link', { name: 'Sisäinen lähde' })).toBeNull()
  })

  it('AC-26: zero-source answer does not render the "Lähteet:" section', () => {
    render(<ChatMessage message={makeMessage({ answer: 'ok', sources: [] })} />)
    expect(screen.queryByText('Lähteet:')).not.toBeInTheDocument()
  })

  it('AC-26: answer with undefined sources does not render the "Lähteet:" section', () => {
    render(<ChatMessage message={makeMessage({ answer: 'ok' })} />)
    expect(screen.queryByText('Lähteet:')).not.toBeInTheDocument()
  })

  it('AC-40 + AC-81d: error state renders role="alert" with the error message, no loading blob, no sources', () => {
    render(
      <ChatMessage
        message={makeMessage({
          error: 'Pahoittelut, jokin meni pieleen.',
          sources: [{ label: 'should-not-appear' }],
        })}
      />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Pahoittelut, jokin meni pieleen.')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByText('Lähteet:')).not.toBeInTheDocument()
    expect(screen.queryByText('should-not-appear')).not.toBeInTheDocument()
  })

  it('AC-N1: HTML / Markdown in the answer is rendered as escaped text, never as DOM', () => {
    const payload = '<img src=x onerror="alert(1)"> **bold**'
    const { container } = render(
      <ChatMessage message={makeMessage({ answer: payload })} />,
    )
    expect(screen.getByText(payload)).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('strong')).toBeNull()
    expect(container.innerHTML).not.toContain('<img')
  })

  it('AC-N1: HTML in a source label is rendered as escaped text', () => {
    const payload = '<script>alert(1)</script>'
    const { container } = render(
      <ChatMessage
        message={makeMessage({
          answer: 'ok',
          sources: [{ label: payload }],
        })}
      />,
    )
    expect(screen.getByText(payload)).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
  })

  it('AC-N1: HTML in an error message is rendered as escaped text', () => {
    const payload = '<img src=x onerror="alert(1)">'
    const { container } = render(
      <ChatMessage message={makeMessage({ error: payload })} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(payload)
    expect(container.querySelector('img')).toBeNull()
  })
})
