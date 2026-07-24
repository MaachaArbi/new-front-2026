import { describe, it, expect } from 'vitest'
import { divideRound } from './rounding'

describe('divideRound — arrondi explicite en bigint', () => {
  it('positif, départage à 0,5', () => {
    expect(divideRound(125n, 10n, 'half-up')).toBe(13n) // 12,5 → 13
    expect(divideRound(125n, 10n, 'half-down')).toBe(12n)
    expect(divideRound(125n, 10n, 'half-even')).toBe(12n) // 12 pair
    expect(divideRound(135n, 10n, 'half-even')).toBe(14n) // 13,5 → 14 pair
  })

  it('positif, troncature / éloignement', () => {
    expect(divideRound(127n, 10n, 'down')).toBe(12n)
    expect(divideRound(127n, 10n, 'up')).toBe(13n)
    expect(divideRound(125n, 10n, 'floor')).toBe(12n)
    expect(divideRound(125n, 10n, 'ceil')).toBe(13n)
  })

  it('négatif, signe correct', () => {
    expect(divideRound(-125n, 10n, 'half-up')).toBe(-13n) // opposé de zéro
    expect(divideRound(-125n, 10n, 'floor')).toBe(-13n) // vers −∞
    expect(divideRound(-125n, 10n, 'ceil')).toBe(-12n) // vers +∞
    expect(divideRound(-127n, 10n, 'down')).toBe(-12n) // vers zéro
    expect(divideRound(-127n, 10n, 'up')).toBe(-13n) // opposé de zéro
  })

  it('division exacte, aucun arrondi', () => {
    expect(divideRound(100n, 4n, 'half-even')).toBe(25n)
  })

  it('dénominateur négatif normalisé', () => {
    expect(divideRound(125n, -10n, 'half-up')).toBe(-13n)
    expect(divideRound(-125n, -10n, 'half-up')).toBe(13n)
  })

  it('division par zéro lève', () => {
    expect(() => divideRound(1n, 0n, 'half-up')).toThrow(RangeError)
  })
})
