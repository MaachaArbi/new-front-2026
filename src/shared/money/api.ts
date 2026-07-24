/**
 * Conversion `Money` ⇄ représentation API.
 *
 * Forme réelle vérifiée dans les DTO backend (module `Settlement`, `Booking`) :
 * un montant voyage en deux champs frères plats — `amountMinor` (entier) et
 * `currencyCode` (string ISO). Aucun objet monétaire imbriqué, aucun `minorUnit`
 * dans les réponses. Ex. `SettlementInstrumentResponse`, `PostSettlementCreditResponse`,
 * balance (`balanceMinor`), `AddBookingChargeResponse` (`achatAmountMinor`/`venteAmountMinor`).
 *
 * ⚠️ **Risque de contrat signalé** : le backend sérialise `amountMinor` en
 * **nombre JSON** (BIGINT → PHP int → json_encode). Au-delà de
 * `Number.MAX_SAFE_INTEGER` (2^53), `JSON.parse` côté navigateur perd de la
 * précision **avant** que Money n'intervienne. `fromApi` refuse donc un `number`
 * non entier-sûr (via `fromMinorUnits`) plutôt que de propager un montant faux.
 * → demande backend `docs/demandes-backend/montants-json-string.md` +
 *   backlog « montants transactionnels sérialisés en string ».
 */

import { fromMinorUnits, splitMajorMinor, type Money } from './money'

/** Forme d'un montant tel que lu depuis un DTO API. */
export interface ApiMoney {
  /** Unités mineures. `number` (forme réelle) ou `string` (forme lossless souhaitée). */
  readonly amountMinor: number | string
  readonly currencyCode: string
}

/**
 * Construit un `Money` depuis la paire `{ amountMinor, currencyCode }` d'un DTO.
 * Un `amountMinor` en `string` est exact et sans limite ; un `number` au-delà de
 * l'entier-sûr est refusé (voir avertissement de contrat ci-dessus).
 */
export function fromApi(dto: ApiMoney): Money {
  return fromMinorUnits(dto.amountMinor, dto.currencyCode)
}

/**
 * Sérialise un `Money` vers la paire attendue par l'API. `amountMinor` est émis
 * en **string** (`toMinorUnitsString`) : sans perte, quelle que soit la taille,
 * et accepté par un BIGINT côté backend. La version `number` reste disponible
 * via `toMinorUnitsNumber` pour les appelants qui l'exigent, avec garde.
 */
export function toApi(money: Money): {
  amountMinor: string
  currencyCode: string
} {
  return {
    amountMinor: toMinorUnitsString(money),
    currencyCode: money.currency,
  }
}

/** Unités mineures en `string` — exact, sans limite. */
export function toMinorUnitsString(money: Money): string {
  return money.amount.toString()
}

/**
 * Unités mineures en `number`. **Lève** si la valeur dépasse l'entier-sûr :
 * mieux vaut un échec franc qu'un montant silencieusement corrompu.
 */
export function toMinorUnitsNumber(money: Money): number {
  if (
    money.amount > BigInt(Number.MAX_SAFE_INTEGER) ||
    money.amount < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    throw new RangeError(
      `Montant ${money.amount} hors entier-sûr : utiliser toMinorUnitsString.`
    )
  }
  return Number(money.amount)
}

/**
 * Chaîne décimale « majeure » exacte (unités principales), point ASCII, sans
 * symbole ni locale — utile pour un export CSV/API technique, pas pour l'UI
 * (l'affichage passe par `format`). Ex. TND `1240500` → « 1240.500 ».
 */
export function toDecimalString(money: Money): string {
  const { negative, major, minor, minorUnit } = splitMajorMinor(money)
  const frac =
    minorUnit > 0 ? '.' + minor.toString().padStart(minorUnit, '0') : ''
  return `${negative ? '-' : ''}${major}${frac}`
}
