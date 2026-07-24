import { describe, it, expect } from 'vitest'
import {
  fromMinorUnits,
  zero,
  add,
  subtract,
  negate,
  absolute,
  multiplyByInteger,
  multiplyByRate,
  divide,
  compare,
  equals,
  isZero,
  isNegative,
  isPositive,
  signOf,
  CurrencyMismatchError,
} from './money'
import { rateFromDecimalString } from './rate'

describe('construction', () => {
  it('depuis un bigint', () => {
    expect(fromMinorUnits(1240500n, 'TND').amount).toBe(1240500n)
  })

  it('depuis une string (exact, sans limite)', () => {
    expect(fromMinorUnits('1240500', 'TND').amount).toBe(1240500n)
  })

  it('depuis un number entier-sûr', () => {
    expect(fromMinorUnits(124050, 'EUR').amount).toBe(124050n)
  })

  it('refuse un number non entier-sûr (précision déjà perdue en amont)', () => {
    expect(() => fromMinorUnits(Number.MAX_SAFE_INTEGER + 1, 'EUR')).toThrow(
      RangeError
    )
  })

  it('refuse un code devise invalide', () => {
    expect(() => fromMinorUnits(1n, 'eur')).toThrow(RangeError)
    expect(() => fromMinorUnits(1n, 'EURO')).toThrow(RangeError)
  })

  it('zero', () => {
    const z = zero('TND')
    expect(z.amount).toBe(0n)
    expect(isZero(z)).toBe(true)
  })
})

describe('addition / soustraction — même devise', () => {
  it('additionne', () => {
    const r = add(fromMinorUnits(100n, 'EUR'), fromMinorUnits(250n, 'EUR'))
    expect(r.amount).toBe(350n)
    expect(r.currency).toBe('EUR')
  })

  it('soustrait', () => {
    const r = subtract(fromMinorUnits(100n, 'EUR'), fromMinorUnits(250n, 'EUR'))
    expect(r.amount).toBe(-150n)
  })

  it('additionner deux devises différentes échoue', () => {
    expect(() =>
      add(fromMinorUnits(100n, 'EUR'), fromMinorUnits(100n, 'USD'))
    ).toThrow(CurrencyMismatchError)
  })

  it('soustraire deux devises différentes échoue', () => {
    expect(() =>
      subtract(fromMinorUnits(100n, 'EUR'), fromMinorUnits(100n, 'TND'))
    ).toThrow(CurrencyMismatchError)
  })
})

describe('signe et helpers', () => {
  const neg = fromMinorUnits(-500n, 'EUR')
  const pos = fromMinorUnits(500n, 'EUR')
  const z = zero('EUR')

  it('négatif / positif / zéro', () => {
    expect(isNegative(neg)).toBe(true)
    expect(isPositive(pos)).toBe(true)
    expect(isZero(z)).toBe(true)
    expect(signOf(neg)).toBe(-1)
    expect(signOf(pos)).toBe(1)
    expect(signOf(z)).toBe(0)
  })

  it('negate et absolute', () => {
    expect(negate(neg).amount).toBe(500n)
    expect(absolute(neg).amount).toBe(500n)
    expect(absolute(pos).amount).toBe(500n)
  })
})

describe('comparaison', () => {
  it('compare même devise', () => {
    expect(
      compare(fromMinorUnits(100n, 'EUR'), fromMinorUnits(200n, 'EUR'))
    ).toBe(-1)
    expect(
      compare(fromMinorUnits(200n, 'EUR'), fromMinorUnits(100n, 'EUR'))
    ).toBe(1)
    expect(
      compare(fromMinorUnits(100n, 'EUR'), fromMinorUnits(100n, 'EUR'))
    ).toBe(0)
  })

  it('compare devises différentes échoue', () => {
    expect(() =>
      compare(fromMinorUnits(1n, 'EUR'), fromMinorUnits(1n, 'USD'))
    ).toThrow(CurrencyMismatchError)
  })

  it('equals exige devise ET montant', () => {
    expect(
      equals(fromMinorUnits(100n, 'EUR'), fromMinorUnits(100n, 'EUR'))
    ).toBe(true)
    expect(
      equals(fromMinorUnits(100n, 'EUR'), fromMinorUnits(100n, 'USD'))
    ).toBe(false)
    expect(
      equals(fromMinorUnits(100n, 'EUR'), fromMinorUnits(101n, 'EUR'))
    ).toBe(false)
  })
})

describe('multiplication', () => {
  it('par un entier exact', () => {
    expect(multiplyByInteger(fromMinorUnits(100n, 'EUR'), 3n).amount).toBe(300n)
  })

  it('par un taux, arrondi explicite (12,5 → selon mode)', () => {
    // 100 (1,00 EUR) × 0,125 = 12,5 unités mineures.
    const m = fromMinorUnits(100n, 'EUR')
    const rate = rateFromDecimalString('0.125')
    expect(multiplyByRate(m, rate, 'half-up').amount).toBe(13n)
    expect(multiplyByRate(m, rate, 'half-even').amount).toBe(12n) // 12 est pair
    expect(multiplyByRate(m, rate, 'half-down').amount).toBe(12n)
    expect(multiplyByRate(m, rate, 'floor').amount).toBe(12n)
    expect(multiplyByRate(m, rate, 'ceil').amount).toBe(13n)
  })

  it('division avec arrondi explicite', () => {
    // 100 / 3 = 33,33… → 33 (down), 34 (up)
    const m = fromMinorUnits(100n, 'EUR')
    expect(divide(m, 3n, 'down').amount).toBe(33n)
    expect(divide(m, 3n, 'up').amount).toBe(34n)
  })
})

describe('précision au-delà de Number.MAX_SAFE_INTEGER', () => {
  it('additionne exactement de très grands montants', () => {
    // 2^53 = 9007199254740992 ; on dépasse largement.
    const a = fromMinorUnits('9007199254740993', 'EUR')
    const b = fromMinorUnits('9007199254740993', 'EUR')
    expect(add(a, b).amount).toBe(18014398509481986n)
  })

  it('reste exact là où un number aurait dérivé', () => {
    const huge = fromMinorUnits('9007199254740993', 'EUR') // 2^53 + 1
    // Preuve de la dérive flottante que bigint évite :
    expect(Number('9007199254740993')).toBe(9007199254740992) // perdu !
    expect(huge.amount).toBe(9007199254740993n) // exact
  })
})
