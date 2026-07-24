/**
 * Stratégies d'arrondi **explicites** pour le noyau Money.
 *
 * ADR-F07 interdit « la division d'un montant sans stratégie d'arrondi
 * explicite ». Toute opération qui ne tombe pas juste (multiplication par un
 * taux, division) exige donc un `RoundingMode` — jamais d'arrondi implicite.
 *
 * Tout se fait en `bigint` : aucune arithmétique flottante ne touche l'argent.
 */

export type RoundingMode =
  /** Vers zéro (troncature). */
  | 'down'
  /** À l'opposé de zéro. */
  | 'up'
  /** Vers −∞. */
  | 'floor'
  /** Vers +∞. */
  | 'ceil'
  /** Au plus proche ; départage à l'opposé de zéro (arrondi « commercial »). */
  | 'half-up'
  /** Au plus proche ; départage vers zéro. */
  | 'half-down'
  /** Au plus proche ; départage vers le pair (arrondi « du banquier »). */
  | 'half-even'

/**
 * Divise `numerator` par `denominator` en `bigint`, en arrondissant selon
 * `mode`. `denominator` doit être non nul. Le signe est géré correctement pour
 * les montants négatifs (contre-passations).
 */
export function divideRound(
  numerator: bigint,
  denominator: bigint,
  mode: RoundingMode
): bigint {
  if (denominator === 0n) {
    throw new RangeError('Division par zéro dans divideRound')
  }

  // Normalise pour raisonner sur des grandeurs positives, signe réappliqué à la fin.
  const negative = numerator < 0n !== denominator < 0n
  const absNum = numerator < 0n ? -numerator : numerator
  const absDen = denominator < 0n ? -denominator : denominator

  const q = absNum / absDen // quotient tronqué, ≥ 0
  const r = absNum % absDen // reste, ≥ 0
  if (r === 0n) {
    return negative ? -q : q
  }

  const sign = negative ? -1n : 1n
  const twiceR = r * 2n

  let roundedAbs: bigint
  switch (mode) {
    case 'down':
      roundedAbs = q
      break
    case 'up':
      roundedAbs = q + 1n
      break
    case 'floor':
      // vers −∞ : le positif tronque vers le bas, le négatif s'éloigne de zéro.
      roundedAbs = negative ? q + 1n : q
      break
    case 'ceil':
      // vers +∞ : le positif s'éloigne de zéro, le négatif tronque.
      roundedAbs = negative ? q : q + 1n
      break
    case 'half-up':
      roundedAbs = twiceR >= absDen ? q + 1n : q
      break
    case 'half-down':
      roundedAbs = twiceR > absDen ? q + 1n : q
      break
    case 'half-even':
      if (twiceR > absDen) {
        roundedAbs = q + 1n
      } else if (twiceR < absDen) {
        roundedAbs = q
      } else {
        // Départage exact : vers le quotient pair.
        roundedAbs = q % 2n === 0n ? q : q + 1n
      }
      break
  }

  return sign * roundedAbs
}
