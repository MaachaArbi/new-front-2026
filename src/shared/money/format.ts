/**
 * Formatage d'un `Money` via `Intl.NumberFormat`, dans la **locale active**.
 *
 * Principes (ADR-F06/F07) :
 * - Le **nombre de décimales vient de la devise** (registre = autorité), jamais
 *   d'un réglage local.
 * - Séparateurs et position du symbole viennent de la **locale** (`Intl`).
 * - **Exact au-delà de `Number.MAX_SAFE_INTEGER`** : on n'appelle jamais
 *   `Number(amount)`. La partie entière est formatée comme `bigint` par `Intl`
 *   (groupement exact) ; la partie fractionnaire est produite chiffre par
 *   chiffre. On récupère le symbole/le signe/les espaces via `formatToParts`
 *   sur un gabarit, puis on y injecte notre suite de chiffres exacte.
 * - **Chiffres arabo-indiens (٠١٢٣)** : reportés par ADR-F04. On reste sur le
 *   **comportement par défaut d'`Intl`** — en locale « ar », les chiffres sont
 *   arabo-indiens ; on ne tranche pas, on ne force rien. Partie entière et
 *   partie fractionnaire passant toutes deux par `Intl`, le système de chiffres
 *   reste cohérent.
 */

import type { Money } from './money'
import { splitMajorMinor } from './money'
import { getLocaleSeparators } from './locale-separators'

/**
 * Formate un montant en chaîne monétaire localisée (symbole compris).
 * Ex. TND `1240500` en fr → « 1 240,500 DT » ; EUR `124050` en fr → « 1 240,50 € ».
 */
export function format(money: Money, locale: string): string {
  const { negative, major, minor, minorUnit } = splitMajorMinor(money)

  // Partie entière groupée, en chiffres de la locale, exacte (bigint).
  const majorStr = new Intl.NumberFormat(locale, { useGrouping: true }).format(
    major
  )

  // Partie fractionnaire : `minorUnit` chiffres, sans groupe, chiffres de la
  // locale, zéro-remplie à gauche. Passe par Intl pour rester cohérente avec la
  // partie entière (y compris chiffres arabo-indiens en locale « ar »).
  const fractionStr =
    minorUnit > 0
      ? new Intl.NumberFormat(locale, {
          useGrouping: false,
          minimumIntegerDigits: minorUnit,
        }).format(minor)
      : ''

  // Gabarit monétaire : symbole, position, espaces, signe — pris à `Intl`.
  // On formate un nombre témoin (signé pour capter la position du « − »).
  const template = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).formatToParts(negative ? -1 : 1)

  const decimalSep = template.find((p) => p.type === 'decimal')?.value ?? ''
  const numberBlock =
    minorUnit > 0 ? `${majorStr}${decimalSep}${fractionStr}` : majorStr

  // Réassemble en remplaçant le premier segment numérique du gabarit par notre
  // suite exacte, et en supprimant les autres segments numériques du témoin.
  let injected = false
  let out = ''
  for (const part of template) {
    switch (part.type) {
      case 'integer':
      case 'group':
      case 'decimal':
      case 'fraction':
        if (!injected) {
          out += numberBlock
          injected = true
        }
        break
      default:
        // currency, literal (espaces), minusSign, plusSign… conservés tels quels.
        out += part.value
    }
  }
  return out
}

/**
 * Représentation **éditable** d'un montant : chiffres ASCII, séparateur décimal
 * de la locale, **sans symbole ni groupement**. C'est la valeur qu'un champ de
 * saisie affiche et que `parseMoney` sait relire à l'identique (contrairement à
 * `format`, qui porte le symbole et casserait un aller-retour de saisie).
 * Ex. 500 EUR → « 5.00 » (en) / « 5,00 » (fr).
 */
export function toEditableString(money: Money, locale: string): string {
  const { negative, major, minor, minorUnit } = splitMajorMinor(money)
  const decimal = getLocaleSeparators(locale).decimal
  const fraction =
    minorUnit > 0 ? decimal + minor.toString().padStart(minorUnit, '0') : ''
  return `${negative ? '-' : ''}${major.toString()}${fraction}`
}
