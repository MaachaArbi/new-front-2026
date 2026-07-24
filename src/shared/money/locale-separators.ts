/**
 * Séparateurs décimal et de groupe d'une locale, dérivés d'`Intl` — la source
 * de vérité du navigateur pour *présenter* un nombre. Sert au parsing localisé
 * (virgule décimale en français, point en anglais…) et au formatage.
 *
 * On lit les séparateurs via `formatToParts` plutôt que de les coder en dur :
 * eux aussi varient par locale (le français groupe avec une espace fine
 * insécable U+202F, l'arabe a ses propres signes).
 */

export interface LocaleSeparators {
  /** Séparateur décimal (« , » en fr, « . » en en, « ٫ » en ar). */
  readonly decimal: string
  /** Séparateur de groupe (« ␠ »/U+202F en fr, « , » en en). */
  readonly group: string
}

const cache = new Map<string, LocaleSeparators>()

export function getLocaleSeparators(locale: string): LocaleSeparators {
  const cached = cache.get(locale)
  if (cached) return cached

  const parts = new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: 1,
  }).formatToParts(12345.6)

  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.'
  const group = parts.find((p) => p.type === 'group')?.value ?? ''

  const separators: LocaleSeparators = { decimal, group }
  cache.set(locale, separators)
  return separators
}
