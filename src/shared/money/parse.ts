/**
 * Parsing d'une **saisie utilisateur** vers un `Money`, dans la locale active.
 *
 * Principes (ADR-F07) :
 * - Accepte les séparateurs de la locale (virgule décimale en fr, point en en ;
 *   espaces/espaces fines insécables comme séparateurs de groupe).
 * - Le nombre de décimales autorisé vient de la **devise** (registre) : une
 *   saisie qui en porte trop est **rejetée**, jamais tronquée en silence.
 * - **Aucune perte de précision** : tout passe par `bigint`, jamais par
 *   `parseFloat`/`Number`.
 */

import { getMinorUnit } from './currency-registry'
import { fromMinorUnits, type Money } from './money'
import { getLocaleSeparators } from './locale-separators'

/** Résultat d'un parsing : succès typé, ou échec avec motif. */
export type ParseResult =
  | { readonly ok: true; readonly money: Money }
  | { readonly ok: false; readonly reason: ParseErrorReason }

export type ParseErrorReason =
  /** Chaîne vide après nettoyage. */
  | 'empty'
  /** Caractères non numériques inattendus. */
  | 'invalid'
  /** Plus de décimales que la devise n'en autorise. */
  | 'too-many-decimals'

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parse `input` en `Money` pour `currency`, selon `locale`. Ne lève pas : rend
 * un `ParseResult` pour laisser l'appelant (champ de saisie) gérer l'erreur en
 * `aria-invalid` sans try/catch.
 */
export function parseMoney(
  input: string,
  currency: string,
  locale: string
): ParseResult {
  const minorUnit = getMinorUnit(currency)
  const { decimal, group } = getLocaleSeparators(locale)

  let s = input.trim()
  if (s === '') return { ok: false, reason: 'empty' }

  // Signe éventuel en tête.
  let negative = false
  if (s.startsWith('-')) {
    negative = true
    s = s.slice(1)
  } else if (s.startsWith('+')) {
    s = s.slice(1)
  }

  // Retire tous les séparateurs de groupe et toutes les espaces (dont U+202F,
  // U+00A0). Le séparateur de groupe français EST une espace fine insécable.
  if (group) {
    s = s.split(group).join('')
  }
  s = s.replace(/\s/g, '')

  // Normalise le séparateur décimal de la locale vers un point ASCII.
  if (decimal && decimal !== '.') {
    const decRe = new RegExp(escapeRegExp(decimal), 'g')
    s = s.replace(decRe, '.')
  }

  if (s === '' || s === '.') return { ok: false, reason: 'empty' }

  // À ce stade, seuls des chiffres ASCII et au plus un point sont admis.
  const match = /^(\d*)(?:\.(\d*))?$/.exec(s)
  if (!match) return { ok: false, reason: 'invalid' }

  const intDigits = match[1] ?? ''
  const fracDigits = match[2] ?? ''
  if (intDigits === '' && fracDigits === '') {
    return { ok: false, reason: 'empty' }
  }
  if (fracDigits.length > minorUnit) {
    return { ok: false, reason: 'too-many-decimals' }
  }

  // Construit les unités mineures en bigint, sans flottant : on concatène la
  // partie entière et la partie fractionnaire complétée à droite jusqu'à minorUnit.
  const paddedFrac = fracDigits.padEnd(minorUnit, '0')
  const digits = (intDigits === '' ? '0' : intDigits) + paddedFrac
  const magnitude = BigInt(digits)
  const minor = negative ? -magnitude : magnitude

  return { ok: true, money: fromMinorUnits(minor, currency) }
}
