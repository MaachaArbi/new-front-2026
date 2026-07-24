/**
 * Noyau `Money` — unités mineures, immuable, indissociable de sa devise.
 *
 * Reflet du Value Object backend `App\Shared\Domain\ValueObject\Money`
 * (`int $amount`, `string $currencyCode`, `fromMinorUnits(...)`). Vérifié sur
 * les DTO réels : les montants voyagent en `amountMinor` (entier) + un champ
 * sœur `currencyCode` ; `minor_unit` n'est **jamais** exposé par l'API — le
 * front le résout via `currency-registry`.
 *
 * Choix fondateurs (voir `docs/decisions/2026-07-25-money-bigint-unites-mineures.md`) :
 * - **`bigint`, pas `number`** : les cumuls dépassent `Number.MAX_SAFE_INTEGER`,
 *   et `bigint` supprime mécaniquement toute arithmétique flottante accidentelle.
 * - **Devise indissociable** : un nombre nu n'est jamais un montant.
 * - **Immuable** : toute opération renvoie un nouveau `Money`.
 * - **Devises différentes → échec explicite**, jamais de somme silencieuse.
 *
 * Ce fichier est la **zone d'exception** de la règle ESLint `no-money-hardcoded`
 * (les opérations en unités mineures y sont légitimes et testées).
 */

import { getMinorUnit } from './currency-registry'
import { divideRound, type RoundingMode } from './rounding'
import type { Rate } from './rate'
import { RATE_SCALE } from './rate'

declare const MONEY_BRAND: unique symbol

export interface Money {
  /** Montant en unités mineures (ce que stocke la base : BIGINT). */
  readonly amount: bigint
  /** Code ISO 4217, ex. « TND ». */
  readonly currency: string
  /** Marque nominale : impose la construction par fabrique, interdit la confusion avec `Rate`. */
  readonly [MONEY_BRAND]: true
}

/** Levée quand une opération mêle deux devises différentes. */
export class CurrencyMismatchError extends Error {
  constructor(
    readonly left: string,
    readonly right: string
  ) {
    super(
      `Opération interdite entre devises différentes : ${left} ≠ ${right}. ` +
        `Aucune conversion implicite (ADR-F07).`
    )
    this.name = 'CurrencyMismatchError'
  }
}

const CURRENCY_CODE = /^[A-Z]{3}$/

function assertCurrencyCode(code: string): void {
  if (!CURRENCY_CODE.test(code)) {
    throw new RangeError(
      `Code devise invalide : « ${code} » (attendu 3 lettres majuscules ISO 4217).`
    )
  }
}

function brand(amount: bigint, currency: string): Money {
  return { amount, currency } as Money
}

/**
 * Construit un montant depuis des unités mineures — la forme brute de l'API
 * (`amountMinor`) et de la base (BIGINT).
 *
 * Accepte `bigint` (idéal), `string` (idéal : exact, sans limite) ou `number`.
 * Un `number` **non entier-sûr** est refusé : au-delà de `Number.MAX_SAFE_INTEGER`,
 * la valeur a déjà pu être corrompue par `JSON.parse` en amont. On échoue au
 * lieu de propager un montant faux (voir demande backend « montants en string »).
 */
export function fromMinorUnits(
  minor: bigint | number | string,
  currency: string
): Money {
  assertCurrencyCode(currency)
  let amount: bigint
  if (typeof minor === 'bigint') {
    amount = minor
  } else if (typeof minor === 'string') {
    if (!/^-?\d+$/.test(minor.trim())) {
      throw new RangeError(`Unités mineures invalides : « ${minor} »`)
    }
    amount = BigInt(minor.trim())
  } else {
    if (!Number.isSafeInteger(minor)) {
      throw new RangeError(
        `Unités mineures non entières-sûres : ${minor}. ` +
          `Au-delà de Number.MAX_SAFE_INTEGER, transmettre une string.`
      )
    }
    amount = BigInt(minor)
  }
  return brand(amount, currency)
}

/** Le montant zéro dans une devise. */
export function zero(currency: string): Money {
  assertCurrencyCode(currency)
  return brand(0n, currency)
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new CurrencyMismatchError(a.currency, b.currency)
  }
}

/** Addition — **même devise obligatoire**. */
export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b)
  return brand(a.amount + b.amount, a.currency)
}

/** Soustraction — **même devise obligatoire**. */
export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b)
  return brand(a.amount - b.amount, a.currency)
}

/** Opposé (utile pour les contre-passations). */
export function negate(m: Money): Money {
  return brand(-m.amount, m.currency)
}

/** Valeur absolue. */
export function absolute(m: Money): Money {
  return brand(m.amount < 0n ? -m.amount : m.amount, m.currency)
}

/**
 * Multiplication par un entier exact (quantité, nombre de nuitées…). Aucune
 * perte, donc aucun arrondi requis.
 */
export function multiplyByInteger(m: Money, factor: bigint): Money {
  return brand(m.amount * factor, m.currency)
}

/**
 * Multiplication par un `Rate` (taux/marge `pricing_*`), avec **stratégie
 * d'arrondi explicite** — jamais implicite (ADR-F07). Le résultat reste en
 * unités mineures entières.
 */
export function multiplyByRate(
  m: Money,
  rate: Rate,
  rounding: RoundingMode
): Money {
  const scaled = m.amount * rate.scaled // unités mineures × 10^RATE_SCALE
  const rounded = divideRound(scaled, 10n ** BigInt(RATE_SCALE), rounding)
  return brand(rounded, m.currency)
}

/**
 * Division d'un montant par un diviseur entier, avec **arrondi explicite**.
 * Pour un partage **sans perte**, préférer `split` / `allocate`.
 */
export function divide(
  m: Money,
  divisor: bigint,
  rounding: RoundingMode
): Money {
  return brand(divideRound(m.amount, divisor, rounding), m.currency)
}

/**
 * Répartit un montant en `n` parts **sans perte** : la somme des parts est
 * **exactement** égale à l'original, quel que soit le signe. Le reste est
 * distribué unité par unité sur les premières parts (méthode du plus grand
 * reste, cas équiparti).
 *
 * Ex. 100,000 TND (= 100000 unités mineures) en 3 → [33334, 33333, 33333].
 * Ex. 0,001 TND (= 1 unité mineure) en 2 → [1, 0] : aucun millime perdu.
 */
export function split(m: Money, n: number): Money[] {
  if (!Number.isInteger(n) || n <= 0) {
    throw new RangeError(
      `Nombre de parts invalide : ${n} (attendu entier > 0).`
    )
  }
  const parts = BigInt(n)
  const base = m.amount / parts // tronqué vers zéro
  const remainder = m.amount % parts // signe du montant, |r| < n
  const unit = remainder < 0n ? -1n : 1n
  const count = remainder < 0n ? -remainder : remainder
  const result: Money[] = []
  for (let i = 0n; i < parts; i++) {
    const extra = i < count ? unit : 0n
    result.push(brand(base + extra, m.currency))
  }
  return result
}

/**
 * Répartit un montant selon des **poids** entiers (ex. `booking_payer_split`),
 * **sans perte** : la somme des parts égale exactement l'original. Chaque part
 * reçoit `floor(montant × poids / total)`, puis le reste est distribué une
 * unité à la fois aux parts de plus fort résidu fractionnaire (méthode du plus
 * grand reste). Fonctionne pour les montants négatifs.
 */
export function allocate(m: Money, weights: readonly bigint[]): Money[] {
  if (weights.length === 0) {
    throw new RangeError('Répartition par poids : liste de poids vide.')
  }
  if (weights.some((w) => w < 0n)) {
    throw new RangeError('Répartition par poids : poids négatif interdit.')
  }
  const total = weights.reduce((acc, w) => acc + w, 0n)
  if (total === 0n) {
    throw new RangeError('Répartition par poids : somme des poids nulle.')
  }

  const negative = m.amount < 0n
  const absAmount = negative ? -m.amount : m.amount

  // Part plancher + résidu de chaque poids, en valeur absolue.
  const bases: bigint[] = []
  const remainders: { index: number; rem: bigint }[] = []
  let distributed = 0n
  weights.forEach((w, index) => {
    const numerator = absAmount * w
    const base = numerator / total
    const rem = numerator % total
    bases.push(base)
    remainders.push({ index, rem })
    distributed += base
  })

  // Unités restantes à placer : total exact − déjà distribué.
  let leftover = absAmount - distributed
  // Plus fort résidu d'abord ; index croissant pour un départage déterministe.
  remainders.sort((a, b) => {
    if (a.rem === b.rem) return a.index - b.index
    return a.rem > b.rem ? -1 : 1
  })
  for (let k = 0; k < remainders.length && leftover > 0n; k++) {
    const target = remainders[k]
    if (target === undefined) continue
    const current = bases[target.index]
    if (current === undefined) continue
    bases[target.index] = current + 1n
    leftover -= 1n
  }

  return bases.map((absPart) =>
    brand(negative ? -absPart : absPart, m.currency)
  )
}

/**
 * Compare deux montants de **même devise** : −1, 0 ou 1.
 */
export function compare(a: Money, b: Money): -1 | 0 | 1 {
  assertSameCurrency(a, b)
  if (a.amount < b.amount) return -1
  if (a.amount > b.amount) return 1
  return 0
}

/** Égalité stricte (même devise ET même montant). */
export function equals(a: Money, b: Money): boolean {
  return a.currency === b.currency && a.amount === b.amount
}

/** `true` si le montant est nul. */
export function isZero(m: Money): boolean {
  return m.amount === 0n
}

/** `true` si le montant est strictement négatif. */
export function isNegative(m: Money): boolean {
  return m.amount < 0n
}

/** `true` si le montant est strictement positif. */
export function isPositive(m: Money): boolean {
  return m.amount > 0n
}

/** Signe du montant : −1, 0 ou 1. */
export function signOf(m: Money): -1 | 0 | 1 {
  if (m.amount < 0n) return -1
  if (m.amount > 0n) return 1
  return 0
}

/**
 * Décompose un montant en partie entière (majeure) et partie fractionnaire
 * (unités mineures), toutes deux en `bigint` positives, plus le signe. Base
 * commune au formatage et aux conversions, sans jamais passer par `number`.
 */
export function splitMajorMinor(m: Money): {
  negative: boolean
  major: bigint
  minor: bigint
  minorUnit: number
} {
  const minorUnit = getMinorUnit(m.currency)
  const divisor = 10n ** BigInt(minorUnit)
  const negative = m.amount < 0n
  const abs = negative ? -m.amount : m.amount
  return {
    negative,
    major: abs / divisor,
    minor: abs % divisor,
    minorUnit,
  }
}
