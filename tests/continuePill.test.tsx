/**
 * Tests for `ContinuePill` and the `CompactView` gate that decides
 * whether to render it. Maps to Figma `site:395:5439` (Etusivu —
 * jatka edellistä keskustelua) and the AC-10a contract.
 *
 * Per GOV-13 every test name quotes the AC's intent.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/preact'
import { CompactView } from '../src/components/CompactView'
import { ContinuePill } from '../src/components/ContinuePill'

const NOOP = () => {}

describe('ContinuePill', () => {
  it('AC-10a: pill renders the Figma copy and is keyboard-activable', () => {
    const onClick = vi.fn()
    render(<ContinuePill onClick={onClick} />)
    const button = screen.getByRole('button', {
      name: 'Jatka edellistä keskustelua',
    })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('CompactView — continue-pill gate', () => {
  it('AC-10a: pill is rendered when at least one stored conversation has messages', () => {
    render(
      <CompactView
        suggestions={['chip a', 'chip b']}
        onSend={NOOP}
        hasHistory={true}
        onContinue={NOOP}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Jatka edellistä keskustelua' }),
    ).toBeInTheDocument()
  })

  it('AC-10a: pill is NOT rendered when no stored conversation has messages', () => {
    render(
      <CompactView
        suggestions={['chip a', 'chip b']}
        onSend={NOOP}
        hasHistory={false}
        onContinue={NOOP}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Jatka edellistä keskustelua' }),
    ).not.toBeInTheDocument()
  })
})
