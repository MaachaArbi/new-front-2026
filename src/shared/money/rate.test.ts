import { describe, it, expect } from 'vitest'
import {
  RATE_SCALE,
  rateFromScaled,
  rateFromDecimalString,
  rateToDecimalString,
} from './rate'
import { fromMinorUnits, multiplyByRate } from './money'

describe('Rate — taux et marges (NUMERIC(12,4))', () => {
  it('échelle à 4 décimales', () => {
    expect(RATE_SCALE).toBe(4)
  })

  it('parse une string décimale', () => {
    expect(rateFromDecimalString('0.15').scaled).toBe(1500n)
    expect(rateFromDecimalString('1.2345').scaled).toBe(12345n)
    expect(rateFromDecimalString('-0.05').scaled).toBe(-500n)
    expect(rateFromDecimalString('3').scaled).toBe(30000n)
  })

  it('rejette plus de 4 décimales', () => {
    expect(() => rateFromDecimalString('0.12345')).toThrow(RangeError)
  })

  it('rateFromScaled et rateToDecimalString', () => {
    expect(rateFromScaled(1500n).scaled).toBe(1500n)
    expect(rateToDecimalString(rateFromScaled(1500n))).toBe('0.1500')
    expect(rateToDecimalString(rateFromScaled(-12345n))).toBe('-1.2345')
  })

  it('applique un taux à un montant (commission 15 %)', () => {
    // 100,00 EUR × 0,15 = 15,00 EUR
    const commission = multiplyByRate(
      fromMinorUnits(10000n, 'EUR'),
      rateFromDecimalString('0.15'),
      'half-up'
    )
    expect(commission.amount).toBe(1500n)
    expect(commission.currency).toBe('EUR')
  })
})
