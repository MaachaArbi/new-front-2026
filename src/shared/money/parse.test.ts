import { describe, it, expect } from 'vitest'
import { parseMoney } from './parse'

function amountOf(result: ReturnType<typeof parseMoney>): bigint {
  if (!result.ok) throw new Error(`parse échoué : ${result.reason}`)
  return result.money.amount
}

describe('parseMoney — saisie localisée sans perte', () => {
  it('« 1 240,500 » en fr et « 1,240.500 » en en → même valeur (TND)', () => {
    const fr = parseMoney('1 240,500', 'TND', 'fr')
    const en = parseMoney('1,240.500', 'TND', 'en')
    expect(amountOf(fr)).toBe(1240500n)
    expect(amountOf(en)).toBe(1240500n)
    expect(amountOf(fr)).toBe(amountOf(en))
  })

  it('accepte le nombre exact de décimales de la devise', () => {
    expect(amountOf(parseMoney('1240,50', 'EUR', 'fr'))).toBe(124050n)
    expect(amountOf(parseMoney('0,001', 'TND', 'fr'))).toBe(1n)
  })

  it('rejette trop de décimales pour la devise', () => {
    const eur = parseMoney('1.234', 'EUR', 'en') // 3 déc. > 2
    expect(eur.ok).toBe(false)
    if (!eur.ok) expect(eur.reason).toBe('too-many-decimals')

    const tnd = parseMoney('1,2345', 'TND', 'fr') // 4 déc. > 3
    expect(tnd.ok).toBe(false)
    if (!tnd.ok) expect(tnd.reason).toBe('too-many-decimals')
  })

  it('montant négatif', () => {
    expect(amountOf(parseMoney('-5,00', 'EUR', 'fr'))).toBe(-500n)
  })

  it('sans partie décimale', () => {
    expect(amountOf(parseMoney('42', 'EUR', 'en'))).toBe(4200n)
    expect(amountOf(parseMoney('42', 'TND', 'fr'))).toBe(42000n)
  })

  it('partie décimale seule', () => {
    expect(amountOf(parseMoney('0,5', 'EUR', 'fr'))).toBe(50n)
    expect(amountOf(parseMoney(',5', 'EUR', 'fr'))).toBe(50n)
  })

  it('chaîne vide → échec « empty »', () => {
    const r = parseMoney('   ', 'EUR', 'fr')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('empty')
  })

  it('caractères parasites → échec « invalid »', () => {
    const r = parseMoney('12abc', 'EUR', 'en')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid')
  })

  it('exact au-delà de Number.MAX_SAFE_INTEGER', () => {
    // 12345678901234567,89 EUR
    const r = parseMoney('12345678901234567.89', 'EUR', 'en')
    expect(amountOf(r)).toBe(1234567890123456789n)
  })
})
