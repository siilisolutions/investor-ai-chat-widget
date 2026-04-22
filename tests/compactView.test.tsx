/**
 * Tests for `CompactView` + `ChatInput` + `SuggestionChip`, covering
 * §3.2 ACs (AC-11, AC-12, AC-13, AC-14, AC-15, AC-16). Per GOV-13 each
 * test name quotes the AC intent rather than the implementation.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/preact'
import { CompactView } from '../src/components/CompactView'

const CHIPS = ['Kysymys 1', 'Kysymys 2', 'Kysymys 3']

describe('CompactView', () => {
  it('AC-11: textarea placeholder is the exact Finnish copy required by the AC', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    expect(textarea).toHaveAttribute(
      'placeholder',
      'Kysy minulta mitä vaan Siilistä sijoituskohteena tai taloustiedoistamme.',
    )
  })

  it('AC-12: renders exactly three suggestion chips with the provided labels', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    for (const label of CHIPS) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('button')).toHaveLength(CHIPS.length + 1)
  })

  it('AC-13: pressing Enter on a non-empty textarea fires onSend with the trimmed value and clears the field', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    const textarea = screen.getByLabelText(
      'Siili investor chatbot message',
    ) as HTMLTextAreaElement
    fireEvent.input(textarea, { target: { value: '  what is the dividend?  ' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledExactlyOnceWith('what is the dividend?')
    expect(textarea.value).toBe('')
  })

  it('AC-13: pressing Shift+Enter does NOT submit (multi-line input continues)', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.input(textarea, { target: { value: 'line 1' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('AC-13: clicking the send button fires onSend with the trimmed value', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.input(textarea, { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(onSend).toHaveBeenCalledExactlyOnceWith('hello')
  })

  it('AC-14: clicking a suggestion chip fires onSend with the chip label verbatim', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kysymys 2' }))
    expect(onSend).toHaveBeenCalledExactlyOnceWith('Kysymys 2')
  })

  it('AC-15: Enter on an empty textarea is a no-op', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('AC-15: Enter on whitespace-only textarea is a no-op', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.input(textarea, { target: { value: '   \n  \t ' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('AC-15: send-button click with empty textarea is a no-op (button is disabled)', () => {
    const onSend = vi.fn()
    render(<CompactView suggestions={CHIPS} onSend={onSend} />)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(onSend).not.toHaveBeenCalled()
  })

  it('AC-16: send button is disabled when the textarea is empty', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('AC-16: send button is enabled as soon as a non-whitespace character is entered', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.input(textarea, { target: { value: 'x' } })
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
  })

  it('AC-16: send button stays disabled when the textarea contains only whitespace', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    fireEvent.input(textarea, { target: { value: '    ' } })
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('AC-17: mousedown on the input shell padding focuses the textarea', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    const shell = textarea.parentElement?.parentElement as HTMLElement
    expect(shell).toBeTruthy()
    expect(document.activeElement).not.toBe(textarea)
    fireEvent.mouseDown(shell)
    expect(document.activeElement).toBe(textarea)
  })

  it('AC-17: mousedown on the send button does not forward focus to the textarea', () => {
    render(<CompactView suggestions={CHIPS} onSend={() => {}} />)
    const textarea = screen.getByLabelText('Siili investor chatbot message')
    const sendButton = screen.getByRole('button', { name: 'Send message' })
    expect(document.activeElement).not.toBe(textarea)
    fireEvent.mouseDown(sendButton)
    expect(document.activeElement).not.toBe(textarea)
  })
})
