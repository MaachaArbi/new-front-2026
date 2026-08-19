/**
 * Noyau `Money` (ADR-F07) — point d'entrée unique.
 *
 * Tout montant affiché ou saisi dans l'application passe par ici. Interdits
 * (garantis par la règle ESLint `no-money-hardcoded`, sauf dans ce dossier) :
 * `toFixed`, arithmétique flottante sur l'argent, division sans arrondi
 * explicite, `Number(montant) / 100`.
 */

// Type + opérations
export type { Money } from './money'
export {
  CurrencyMismatchError,
  fromMinorUnits,
  zero,
  add,
  subtract,
  negate,
  absolute,
  multiplyByInteger,
  multiplyByRate,
  divide,
  split,
  allocate,
  compare,
  equals,
  isZero,
  isNegative,
  isPositive,
  signOf,
  splitMajorMinor,
} from './money'

// Arrondi explicite
export type { RoundingMode } from './rounding'
export { divideRound } from './rounding'

// Taux / marges (pricing_*), type distinct
export type { Rate } from './rate'
export {
  RATE_SCALE,
  rateFromScaled,
  rateFromDecimalString,
  rateToDecimalString,
} from './rate'

// Registre de devises (source provisoire de minor_unit)
export type { CurrencyDefinition } from './currency-registry'
export {
  getCurrency,
  getMinorUnit,
  isRegisteredCurrency,
  loadCurrencyRegistry,
  registeredCurrencyCodes,
} from './currency-registry'

// Formatage / parsing
export { format, toEditableString } from './format'
export { parseMoney } from './parse'
export type { ParseResult, ParseErrorReason } from './parse'
export { getLocaleSeparators } from './locale-separators'
export type { LocaleSeparators } from './locale-separators'

// Conversion API
export {
  fromApi,
  toApi,
  toMinorUnitsString,
  toMinorUnitsNumber,
  toDecimalString,
} from './api'
export type { ApiMoney } from './api'

// Composant de saisie
