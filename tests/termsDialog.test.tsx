/**
 * Tests for `src/components/TermsDialog.tsx` — the AC-66 / AC-66b
 * Käyttöehdot gate's component-level concerns. App-level wiring
 * (first-send interception, queued-question replay, draft
 * preservation on cancel) is covered separately in
 * `tests/app.test.tsx`.
 *
 * Per GOV-13 every test name quotes the AC's intent.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/preact'
import { TermsDialog } from '../src/components/TermsDialog'

describe('TermsDialog — AC-66 / AC-66b', () => {
  it('AC-66: open=false renders nothing in the DOM', () => {
    const { container } = render(
      <TermsDialog open={false} onAccept={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('AC-66: open dialog renders the Finnish title, primary, and cancel labels verbatim', () => {
    render(<TermsDialog open onAccept={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Käyttöehdot' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Hyväksyn käyttöehdot' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Peruuta' })).toBeInTheDocument()
  })

  it('AC-66: activating Hyväksyn käyttöehdot calls onAccept', () => {
    const onAccept = vi.fn()
    render(<TermsDialog open onAccept={onAccept} onCancel={vi.fn()} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Hyväksyn käyttöehdot' }),
    )
    expect(onAccept).toHaveBeenCalledTimes(1)
  })

  it('AC-66: activating Peruuta calls onCancel', () => {
    const onCancel = vi.fn()
    render(<TermsDialog open onAccept={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: 'Peruuta' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('AC-66: pressing Esc inside the dialog calls onCancel', () => {
    const onCancel = vi.fn()
    render(<TermsDialog open onAccept={vi.fn()} onCancel={onCancel} />)
    const dialog = screen.getByRole('dialog', { name: 'Käyttöehdot' })
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('AC-66b: short form is the default body — only Lue lisää is shown, no section headings', () => {
    render(<TermsDialog open onAccept={vi.fn()} onCancel={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Lue lisää' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Näytä vähemmän' }),
    ).not.toBeInTheDocument()
    // Section headings only appear in the long form.
    expect(
      screen.queryByText('Tietojen luonne ja ajantasaisuus'),
    ).not.toBeInTheDocument()
  })

  it('AC-66b: activating Lue lisää swaps the body in-place to the long form and the toggle becomes Näytä vähemmän', () => {
    render(<TermsDialog open onAccept={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lue lisää' }))

    expect(
      screen.getByRole('button', { name: 'Näytä vähemmän' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Lue lisää' }),
    ).not.toBeInTheDocument()
    // Long-form section headings render now (rendered inside <strong>
    // per AC-N1's plain-text-only rule).
    expect(
      screen.getByText('Tietojen luonne ja ajantasaisuus'),
    ).toBeInTheDocument()
    expect(screen.getByText('Oikeudelliset rajoitukset')).toBeInTheDocument()
    expect(
      screen.getByText('Tekoälyjärjestelmän rajoitukset'),
    ).toBeInTheDocument()
    expect(screen.getByText('Henkilötietojen käsittely')).toBeInTheDocument()
  })

  it('AC-66b: Näytä vähemmän toggles back to the short form', () => {
    render(<TermsDialog open onAccept={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lue lisää' }))
    fireEvent.click(screen.getByRole('button', { name: 'Näytä vähemmän' }))

    expect(screen.getByRole('button', { name: 'Lue lisää' })).toBeInTheDocument()
    expect(
      screen.queryByText('Tietojen luonne ja ajantasaisuus'),
    ).not.toBeInTheDocument()
  })

  it('AC-66b: long form without privacyPolicyUrl renders the privacy-policy sentence with no anchor', () => {
    render(<TermsDialog open onAccept={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Lue lisää' }))

    // The sentence is rendered as a single paragraph; no anchor with
    // a privacy-policy URL is in the DOM.
    expect(
      screen.queryByRole('link', { name: 'tietosuojaseloste' }),
    ).not.toBeInTheDocument()
  })

  it('AC-66b: long form with privacyPolicyUrl renders an anchor with target=_blank rel=noopener noreferrer (mirrors AC-25b)', () => {
    render(
      <TermsDialog
        open
        onAccept={vi.fn()}
        onCancel={vi.fn()}
        privacyPolicyUrl="https://example.com/privacy"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lue lisää' }))

    const link = screen.getByRole('link', { name: 'tietosuojaseloste' })
    expect(link).toHaveAttribute('href', 'https://example.com/privacy')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
