import { describe, it, expect } from 'vitest'
import { fromMinorUnits, split, allocate } from './money'

/** Somme des montants d'une répartition (même devise supposée). */
function sum(parts: { amount: bigint }[]): bigint {
  return parts.reduce((acc, p) => acc + p.amount, 0n)
}

describe('split — répartition équiparti sans perte', () => {
  it('100,000 TND en 3 → 33,334 + 33,333 + 33,333 (cas booking_payer_split)', () => {
    // 100,000 TND = 100000 unités mineures (TND, 3 décimales).
    const total = fromMinorUnits(100000n, 'TND')
    const parts = split(total, 3)
    expect(parts.map((p) => p.amount)).toEqual([33334n, 33333n, 33333n])
    expect(sum(parts)).toBe(100000n) // exactement l'original
  })

  it('0,001 TND en 2 → aucun millime perdu', () => {
    // 0,001 TND = 1 unité mineure.
    const total = fromMinorUnits(1n, 'TND')
    const parts = split(total, 2)
    expect(parts.map((p) => p.amount)).toEqual([1n, 0n])
    expect(sum(parts)).toBe(1n)
  })

  it('montant négatif réparti sans perte', () => {
    const total = fromMinorUnits(-100000n, 'TND')
    const parts = split(total, 3)
    expect(parts.map((p) => p.amount)).toEqual([-33334n, -33333n, -33333n])
    expect(sum(parts)).toBe(-100000n)
  })

  it('répartition exacte quand ça tombe juste', () => {
    const parts = split(fromMinorUnits(900n, 'EUR'), 3)
    expect(parts.map((p) => p.amount)).toEqual([300n, 300n, 300n])
  })

  it('rejette un nombre de parts invalide', () => {
    expect(() => split(fromMinorUnits(100n, 'EUR'), 0)).toThrow(RangeError)
    expect(() => split(fromMinorUnits(100n, 'EUR'), -2)).toThrow(RangeError)
  })
})

describe('allocate — répartition pondérée sans perte', () => {
  it('poids [1,1,1] sur 100000 = équiparti, somme exacte', () => {
    const parts = allocate(fromMinorUnits(100000n, 'TND'), [1n, 1n, 1n])
    expect(sum(parts)).toBe(100000n)
    expect(parts.map((p) => p.amount)).toEqual([33334n, 33333n, 33333n])
  })

  it('poids inégaux [1,2,3] sur 1000, somme exacte', () => {
    // total poids 6 ; bases : 1000×1/6=166 (résidu 4/6), ×2/6=333 (résidu 2/6),
    // ×3/6=500 (résidu 0) ; distribué 999, reste 1 → à la part de plus fort
    // résidu, l'indice 0.
    const parts = allocate(fromMinorUnits(1000n, 'EUR'), [1n, 2n, 3n])
    expect(sum(parts)).toBe(1000n)
    expect(parts.map((p) => p.amount)).toEqual([167n, 333n, 500n])
  })

  it('montant négatif pondéré sans perte', () => {
    const parts = allocate(fromMinorUnits(-1000n, 'EUR'), [1n, 2n, 3n])
    expect(sum(parts)).toBe(-1000n)
    expect(parts.map((p) => p.amount)).toEqual([-167n, -333n, -500n])
  })

  it('rejette poids vides, négatifs ou somme nulle', () => {
    expect(() => allocate(fromMinorUnits(100n, 'EUR'), [])).toThrow(RangeError)
    expect(() => allocate(fromMinorUnits(100n, 'EUR'), [-1n, 2n])).toThrow(
      RangeError
    )
    expect(() => allocate(fromMinorUnits(100n, 'EUR'), [0n, 0n])).toThrow(
      RangeError
    )
  })
})
