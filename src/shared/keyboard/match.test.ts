import { describe, it, expect } from 'vitest'
import {
  eventMatchesChord,
  resolveKey,
  isEditableTarget,
  type KeyEventLike,
} from './match'
import type { ShortcutDefinition } from './types'

function ev(partial: Partial<KeyEventLike> & { code: string }): KeyEventLike {
  return {
    key: '',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...partial,
  }
}

function shortcut(
  over: Partial<ShortcutDefinition> &
    Pick<ShortcutDefinition, 'id' | 'sequence'>
): ShortcutDefinition {
  return {
    descriptionKey: 'x',
    displayKeys: [],
    handler: () => {},
    ...over,
  }
}

describe('eventMatchesChord — position physique (event.code), pas le caractère', () => {
  it('correspond par code même si le caractère produit diffère (clavier arabe)', () => {
    // Touche physique R, mais en disposition arabe elle produit « ق ».
    const arabic = ev({ code: 'KeyR', key: 'ق' })
    expect(eventMatchesChord(arabic, { code: 'KeyR' })).toBe(true)
  })

  it('ne correspond PAS si la position diffère, même caractère « r »', () => {
    // Une autre touche physique qui produirait « r » : la position ne colle pas.
    const elsewhere = ev({ code: 'KeyB', key: 'r' })
    expect(eventMatchesChord(elsewhere, { code: 'KeyR' })).toBe(false)
  })

  it('exige les modificateurs exacts (code)', () => {
    expect(
      eventMatchesChord(ev({ code: 'KeyK', ctrlKey: true }), {
        code: 'KeyK',
        ctrl: true,
      })
    ).toBe(true)
    expect(
      eventMatchesChord(ev({ code: 'KeyK', ctrlKey: false }), {
        code: 'KeyK',
        ctrl: true,
      })
    ).toBe(false)
  })

  it('accord glyphe (key) : compare le caractère, ignore Maj', () => {
    expect(
      eventMatchesChord(ev({ code: 'Slash', key: '?', shiftKey: true }), {
        key: '?',
      })
    ).toBe(true)
  })
})

describe('resolveKey — déclenchement, séquences, éligibilité', () => {
  const always = () => true

  it('raccourci à un seul accord', () => {
    const s = shortcut({ id: 'a', sequence: [{ code: 'KeyN' }] })
    const r = resolveKey(ev({ code: 'KeyN' }), [s], null, always)
    expect(r.fired?.id).toBe('a')
    expect(r.pending).toBeNull()
  })

  it('séquence à deux touches : g puis r', () => {
    const s = shortcut({
      id: 'seq',
      sequence: [{ code: 'KeyG' }, { code: 'KeyR' }],
    })
    const first = resolveKey(ev({ code: 'KeyG' }), [s], null, always)
    expect(first.fired).toBeNull()
    expect(first.pending).not.toBeNull()

    const second = resolveKey(ev({ code: 'KeyR' }), [s], first.pending, always)
    expect(second.fired?.id).toBe('seq')
    expect(second.pending).toBeNull()
  })

  it('séquence : mauvais second accord → rien, séquence abandonnée', () => {
    const s = shortcut({
      id: 'seq',
      sequence: [{ code: 'KeyG' }, { code: 'KeyR' }],
    })
    const first = resolveKey(ev({ code: 'KeyG' }), [s], null, always)
    const bad = resolveKey(ev({ code: 'KeyX' }), [s], first.pending, always)
    expect(bad.fired).toBeNull()
    expect(bad.pending).toBeNull()
  })

  it('raccourci inéligible (when faux) : inerte, jamais déclenché', () => {
    const s = shortcut({
      id: 'guarded',
      sequence: [{ code: 'KeyN' }],
      when: () => false,
    })
    const eligible = (sc: ShortcutDefinition) => (sc.when ? sc.when() : true)
    const r = resolveKey(ev({ code: 'KeyN' }), [s], null, eligible)
    expect(r.fired).toBeNull()
  })
})

describe('isEditableTarget', () => {
  it('détecte input/textarea/select', () => {
    const input = document.createElement('input')
    const div = document.createElement('div')
    expect(isEditableTarget(input)).toBe(true)
    expect(isEditableTarget(div)).toBe(false)
    expect(isEditableTarget(null)).toBe(false)
  })
})
