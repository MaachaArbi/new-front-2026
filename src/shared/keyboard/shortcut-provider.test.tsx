import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShortcutProvider, useShortcut } from './shortcut-provider'
import type { ShortcutDefinition } from './types'

function Harness({
  shortcut,
}: {
  shortcut: Omit<ShortcutDefinition, 'descriptionKey' | 'displayKeys'>
}) {
  useShortcut({ descriptionKey: 'x', displayKeys: [], ...shortcut })
  return <input data-testid="field" />
}

describe('ShortcutProvider + useShortcut', () => {
  it('déclenche par position physique, y compris sous caractère arabe', () => {
    const handler = vi.fn()
    render(
      <ShortcutProvider>
        <Harness
          shortcut={{ id: 't', sequence: [{ code: 'KeyR' }], handler }}
        />
      </ShortcutProvider>
    )
    // Touche physique R en disposition arabe (produit « ق ») → déclenche quand même.
    fireEvent.keyDown(document.body, { code: 'KeyR', key: 'ق' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('ne se déclenche pas quand le focus est dans un champ', () => {
    const handler = vi.fn()
    render(
      <ShortcutProvider>
        <Harness
          shortcut={{ id: 't', sequence: [{ code: 'KeyR' }], handler }}
        />
      </ShortcutProvider>
    )
    const field = screen.getByTestId('field')
    field.focus()
    fireEvent.keyDown(field, { code: 'KeyR', key: 'r' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('déclenche une séquence g puis r', () => {
    const handler = vi.fn()
    render(
      <ShortcutProvider>
        <Harness
          shortcut={{
            id: 'seq',
            sequence: [{ code: 'KeyG' }, { code: 'KeyR' }],
            handler,
          }}
        />
      </ShortcutProvider>
    )
    fireEvent.keyDown(document.body, { code: 'KeyG', key: 'g' })
    expect(handler).not.toHaveBeenCalled()
    fireEvent.keyDown(document.body, { code: 'KeyR', key: 'r' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('raccourci gardé (when faux) reste inerte, sans erreur', () => {
    const handler = vi.fn()
    render(
      <ShortcutProvider>
        <Harness
          shortcut={{
            id: 'guarded',
            sequence: [{ code: 'KeyN' }],
            when: () => false,
            handler,
          }}
        />
      </ShortcutProvider>
    )
    fireEvent.keyDown(document.body, { code: 'KeyN', key: 'n' })
    expect(handler).not.toHaveBeenCalled()
  })
})
