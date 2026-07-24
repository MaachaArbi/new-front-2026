/**
 * `Rate` — un taux ou une marge (tables `pricing_*`, `NUMERIC(12,4)` en base).
 *
 * ADR-F07 §3.2 : un taux **n'est pas un montant**. Le stockage backend diffère
 * (`NUMERIC(12,4)` contre BIGINT unités mineures) et la confusion des deux doit
 * être **impossible à la compilation**. `Rate` porte donc une marque
 * (`brand`) et une forme distincte de `Money` : aucun `Rate` ne peut être passé
 * là où un `Money` est attendu, et réciproquement.
 *
 * Représentation interne : `bigint` mis à l'échelle par 10^4 (les 4 décimales
 * de `NUMERIC(12,4)`), pour rester exact sans flottant. 0,1500 (15 %) →
 * `scaled = 1500n`.
 */

declare const RATE_BRAND: unique symbol

export interface Rate {
  /** Valeur × 10^RATE_SCALE (ex. 0,1500 → 1500n). */
  readonly scaled: bigint
  /** Marque nominale : rend `Rate` inassignable à `Money` et vice-versa. */
  readonly [RATE_BRAND]: true
}

/** Décimales de `NUMERIC(12,4)`. */
export const RATE_SCALE = 4
const RATE_FACTOR = 10n ** BigInt(RATE_SCALE)

function brandRate(scaled: bigint): Rate {
  return { scaled } as Rate
}

/**
 * Construit un `Rate` depuis sa représentation mise à l'échelle (× 10^4),
 * c.-à-d. la forme brute d'une colonne `NUMERIC(12,4)` lue en unités entières.
 */
export function rateFromScaled(scaled: bigint): Rate {
  return brandRate(scaled)
}

/**
 * Construit un `Rate` depuis une chaîne décimale (ex. « 0.15 », « 1.2345 »,
 * « -0.05 »). Point décimal ASCII — c'est une valeur de contrat/données, pas
 * une saisie utilisateur localisée (voir `parseMoney` pour la saisie). Rejette
 * plus de 4 décimales (la précision de `NUMERIC(12,4)`).
 */
export function rateFromDecimalString(input: string): Rate {
  const trimmed = input.trim()
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(trimmed)
  if (!match) {
    throw new RangeError(`Taux invalide : « ${input} »`)
  }
  const [, sign, intPart, fracPart = ''] = match
  if (fracPart.length > RATE_SCALE) {
    throw new RangeError(
      `Taux « ${input} » : plus de ${RATE_SCALE} décimales (NUMERIC(12,4)).`
    )
  }
  const scaledDigits = intPart + fracPart.padEnd(RATE_SCALE, '0')
  const scaled = BigInt(scaledDigits)
  return brandRate(sign === '-' ? -scaled : scaled)
}

/** Représentation décimale du taux (point ASCII), utile pour le débogage/API. */
export function rateToDecimalString(rate: Rate): string {
  const negative = rate.scaled < 0n
  const abs = negative ? -rate.scaled : rate.scaled
  const intPart = abs / RATE_FACTOR
  const fracPart = abs % RATE_FACTOR
  const frac = fracPart.toString().padStart(RATE_SCALE, '0')
  return `${negative ? '-' : ''}${intPart}.${frac}`
}
