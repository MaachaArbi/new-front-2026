import { describe, it, expect } from 'vitest'
import { fromMinorUnits } from './money'
import { format } from './format'

/** Référence Intl pour une valeur entière-sûre (major.minor), même config que `format`. */
function intlRef(
  major: number,
  currency: string,
  minorUnit: number,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(major)
}

/** Nombre de chiffres après la virgule française (le seul « , » est décimal en fr). */
function frFractionDigits(s: string): number {
  const m = /,(\d+)/.exec(s)
  return m && m[1] ? m[1].length : 0
}

describe('format — décimales pilotées par la devise', () => {
  it('TND 1240500 → 3 décimales (« 1 240,500 » en fr)', () => {
    const s = format(fromMinorUnits(1240500n, 'TND'), 'fr')
    expect(s).toBe(intlRef(1240.5, 'TND', 3, 'fr'))
    expect(frFractionDigits(s)).toBe(3)
    expect(s).toContain('240')
    expect(s).toContain(',500')
  })

  it('EUR 124050 → 2 décimales (« 1 240,50 » en fr)', () => {
    const s = format(fromMinorUnits(124050n, 'EUR'), 'fr')
    expect(s).toBe(intlRef(1240.5, 'EUR', 2, 'fr'))
    expect(frFractionDigits(s)).toBe(2)
    expect(s).not.toContain(',500')
  })

  it('même valeur bigint, devises différentes → résultats différents', () => {
    const asTnd = format(fromMinorUnits(1240500n, 'TND'), 'fr') // 1 240,500
    const asEur = format(fromMinorUnits(1240500n, 'EUR'), 'fr') // 12 405,00
    expect(asTnd).not.toBe(asEur)
    expect(frFractionDigits(asTnd)).toBe(3)
    expect(frFractionDigits(asEur)).toBe(2)
  })

  it('formatage dans les trois locales (en, fr, ar)', () => {
    const eur = fromMinorUnits(124050n, 'EUR')
    for (const locale of ['en', 'fr', 'ar']) {
      expect(format(eur, locale)).toBe(intlRef(1240.5, 'EUR', 2, locale))
    }
  })

  it('montant négatif', () => {
    const s = format(fromMinorUnits(-124050n, 'EUR'), 'fr')
    expect(s).toBe(intlRef(-1240.5, 'EUR', 2, 'fr'))
    expect(s).not.toBe(format(fromMinorUnits(124050n, 'EUR'), 'fr'))
  })

  it('montant zéro', () => {
    expect(format(fromMinorUnits(0n, 'TND'), 'fr')).toBe(
      intlRef(0, 'TND', 3, 'fr')
    )
  })

  it('exact au-delà de Number.MAX_SAFE_INTEGER', () => {
    // 123456789012345678901 unités mineures EUR → major 1234567890123456789, minor 01
    const s = format(fromMinorUnits('123456789012345678901', 'EUR'), 'fr')
    const majorRef = new Intl.NumberFormat('fr', { useGrouping: true }).format(
      1234567890123456789n
    )
    expect(s).toContain(majorRef) // groupement entier exact (bigint, pas de dérive)
    expect(s).toContain(',01') // 2 décimales, zéro de tête conservé
  })
})
