import { describe, it, expect, afterEach } from 'vitest'
import {
  getCurrency,
  getMinorUnit,
  isRegisteredCurrency,
  loadCurrencyRegistry,
  registeredCurrencyCodes,
} from './currency-registry'

describe('registre de devises (source provisoire de minor_unit)', () => {
  it('devises à 3 décimales', () => {
    for (const code of ['TND', 'LYD', 'JOD', 'KWD', 'BHD', 'OMR']) {
      expect(getMinorUnit(code)).toBe(3)
    }
  })

  it('devises à 2 décimales', () => {
    for (const code of ['EUR', 'USD', 'MAD', 'DZD', 'SAR', 'AED']) {
      expect(getMinorUnit(code)).toBe(2)
    }
  })

  it('couvre le minimum ADR-F07 (au moins 9 devises, dont ≥ 3 à 3 décimales)', () => {
    const codes = registeredCurrencyCodes()
    expect(codes.length).toBeGreaterThanOrEqual(9)
    const threeDecimals = codes.filter((c) => getMinorUnit(c) === 3)
    expect(threeDecimals.length).toBeGreaterThanOrEqual(3)
  })

  it('devise inconnue lève (jamais de facteur 10 silencieux)', () => {
    expect(() => getCurrency('XXX')).toThrow(RangeError)
    expect(isRegisteredCurrency('XXX')).toBe(false)
    expect(isRegisteredCurrency('TND')).toBe(true)
  })

  it('remplaçable par le référentiel API sans changer les appelants', () => {
    loadCurrencyRegistry([
      { code: 'TND', minorUnit: 3 },
      { code: 'EUR', minorUnit: 2 },
      { code: 'XAF', minorUnit: 0 },
    ])
    expect(getMinorUnit('XAF')).toBe(0)
    expect(getMinorUnit('TND')).toBe(3)
    expect(isRegisteredCurrency('USD')).toBe(false) // plus dans la nouvelle source
  })

  // Restaure le registre par défaut pour ne pas polluer les autres fichiers de
  // test (l'état est un module singleton).
  afterEach(() => {
    loadCurrencyRegistry([
      { code: 'TND', minorUnit: 3 },
      { code: 'LYD', minorUnit: 3 },
      { code: 'JOD', minorUnit: 3 },
      { code: 'KWD', minorUnit: 3 },
      { code: 'BHD', minorUnit: 3 },
      { code: 'OMR', minorUnit: 3 },
      { code: 'EUR', minorUnit: 2 },
      { code: 'USD', minorUnit: 2 },
      { code: 'MAD', minorUnit: 2 },
      { code: 'DZD', minorUnit: 2 },
      { code: 'SAR', minorUnit: 2 },
      { code: 'AED', minorUnit: 2 },
    ])
  })
})
