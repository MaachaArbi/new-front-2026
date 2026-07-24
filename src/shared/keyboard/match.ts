/**
 * Cœur **pur** de résolution des raccourcis — sans React, sans temps, testable
 * à l'unité. Le provider s'appuie dessus ; c'est ici qu'on prouve que le
 * matching se fait par `event.code` (position) et non `event.key` (caractère).
 */

import type { KeyChord, ShortcutDefinition } from './types'

/** Vue minimale d'un événement clavier — ce dont le matching a besoin. */
export interface KeyEventLike {
  code: string
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
}

/** Construit un accord positionnel à partir d'un événement. */
export function chordFromEvent(event: KeyEventLike): KeyChord {
  return {
    code: event.code,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    shift: event.shiftKey,
    alt: event.altKey,
  }
}

/**
 * Un événement satisfait-il un accord de raccourci ?
 *
 * - Si l'accord porte un `code` : comparaison par **position physique**
 *   (`event.code`) — insensible à la disposition/au caractère. Les modificateurs
 *   ctrl/meta/shift/alt doivent correspondre exactement.
 * - Si l'accord porte un `key` (exception glyphe, ex. « ? ») : comparaison par
 *   caractère, ctrl/meta/alt exacts, **shift ignoré** (le glyphe encapsule déjà
 *   la touche Maj).
 */
export function eventMatchesChord(
  event: KeyEventLike,
  chord: KeyChord
): boolean {
  if (chord.code !== undefined) {
    if (event.code !== chord.code) return false
    if (event.ctrlKey !== !!chord.ctrl) return false
    if (event.metaKey !== !!chord.meta) return false
    if (event.shiftKey !== !!chord.shift) return false
    if (event.altKey !== !!chord.alt) return false
    return true
  }
  if (chord.key !== undefined) {
    if (event.key !== chord.key) return false
    if (event.ctrlKey !== !!chord.ctrl) return false
    if (event.metaKey !== !!chord.meta) return false
    if (event.altKey !== !!chord.alt) return false
    return true // shift ignoré pour les affordances glyphe
  }
  return false
}

export interface ResolveResult {
  /** Raccourci déclenché, ou `null`. */
  fired: ShortcutDefinition | null
  /**
   * Premier accord d'une séquence en attente du second, ou `null`. Le provider
   * mémorise cet état (avec un délai d'expiration) entre deux touches.
   */
  pending: KeyChord | null
}

/**
 * Résout une frappe. `pending` est le premier accord d'une séquence déjà
 * amorcée (ou `null`). `isEligible` filtre les raccourcis actifs (portée + `when`
 * + champ de saisie) — un raccourci inéligible est **ignoré**, jamais déclenché.
 */
export function resolveKey(
  event: KeyEventLike,
  shortcuts: readonly ShortcutDefinition[],
  pending: KeyChord | null,
  isEligible: (shortcut: ShortcutDefinition) => boolean
): ResolveResult {
  const eligible = shortcuts.filter(isEligible)

  // 1. Une séquence est amorcée : tenter de la compléter.
  if (pending) {
    const completed = eligible.find(
      (s) =>
        s.sequence.length === 2 &&
        s.sequence[0] !== undefined &&
        s.sequence[1] !== undefined &&
        chordsEqual(s.sequence[0], pending) &&
        eventMatchesChord(event, s.sequence[1])
    )
    if (completed) {
      return { fired: completed, pending: null }
    }
    // Échec : on abandonne la séquence et on retente cette frappe à neuf.
  }

  // 2. Raccourci à un seul accord.
  const single = eligible.find(
    (s) =>
      s.sequence.length === 1 &&
      s.sequence[0] !== undefined &&
      eventMatchesChord(event, s.sequence[0])
  )
  if (single) {
    return { fired: single, pending: null }
  }

  // 3. Premier accord d'une séquence à deux touches : mise en attente.
  const startsSequence = eligible.some(
    (s) =>
      s.sequence.length === 2 &&
      s.sequence[0] !== undefined &&
      eventMatchesChord(event, s.sequence[0])
  )
  if (startsSequence) {
    return { fired: null, pending: chordFromEvent(event) }
  }

  return { fired: null, pending: null }
}

/** Égalité structurelle de deux accords (pour comparer un pending mémorisé). */
function chordsEqual(a: KeyChord, b: KeyChord): boolean {
  return (
    a.code === b.code &&
    a.key === b.key &&
    !!a.ctrl === !!b.ctrl &&
    !!a.meta === !!b.meta &&
    !!a.shift === !!b.shift &&
    !!a.alt === !!b.alt
  )
}

/** Cible d'événement éditable (champ de saisie) : on n'y déclenche pas de raccourci. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}
