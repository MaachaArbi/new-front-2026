/**
 * CELLULE MONÉTAIRE.
 *
 * ── POURQUOI CE COMPOSANT EXISTE ───────────────────────────────────────────────
 * Un montant dans un tableau n'est pas « un nombre qu'on formate ». C'est CINQ
 * décisions, et les reprendre dans chaque définition de colonne, c'est en rater
 * deux ou trois :
 *
 *  1. **Unités mineures et `bigint`.** Le dinar a TROIS décimales. `toFixed` est
 *     interdit par l'ADR-F07 et refusé par le lint : il code les décimales en dur
 *     et se trompe d'un facteur 10 sur le TND. Le calcul passe par
 *     `shared/money`, jamais par du JavaScript à la main.
 *  2. **Sens de lecture — `dir="ltr"` ASSUMÉ.** Contrairement à la date (voir
 *     `date-cell.tsx`), la direction est ici forcée, et c'est délibéré : dans une
 *     COLONNE de montants, l'alignement sur la virgule prime. Une quantité
 *     s'écrit de gauche à droite dans toutes les langues qu'on sert — la Tunisie
 *     utilise les chiffres latins — et le symbole reste lisible à l'intérieur du
 *     segment. Sans ça, « 11 240,500 » se réagence et le montant est FAUX.
 *     Ce n'est pas une contradiction avec la date : `Intl.DateTimeFormat` insère
 *     des marques de direction dans la date, `Intl.NumberFormat` n'en insère pas
 *     dans un nombre.
 *  3. **Chiffres tabulaires.** Sans eux, les virgules ne s'alignent pas d'une
 *     ligne à l'autre et une colonne de montants devient illisible.
 *  4. **La devise varie par ligne.** Le module Tiers est multidevise : afficher
 *     un montant sans sa devise, c'est afficher un nombre.
 *  5. **Zéro n'est pas vide.** « 0,000 » veut dire « rien dû » ; « — » veut dire
 *     « on ne sait pas ». Les confondre, c'est mentir sur un encours.
 *
 * ── ALIGNEMENT ─────────────────────────────────────────────────────────────────
 * La cellule s'aligne sur la FIN, mais c'est la COLONNE qui doit le décider :
 * pense à poser `meta.headerClassName` pour que l'en-tête suive, sinon le titre
 * et les chiffres partent chacun de leur côté.
 */
import { useIntl } from 'react-intl'
import { format, isZero, type Money } from '@/shared/money'
import { cn } from '@/shared/lib/cn'

export interface MoneyCellProps {
  /** `undefined` signifie « inconnu », et s'affiche « — ». Un zéro s'affiche. */
  value: Money | undefined
  /** Cacher le symbole quand la colonne le porte déjà dans son titre. */
  showCurrency?: boolean
  /** Adoucit un zéro : il reste lisible mais ne tire pas l'œil. */
  muteZero?: boolean
  className?: string
}

function MoneyCell({
  value,
  showCurrency = true,
  muteZero = true,
  className,
}: MoneyCellProps) {
  const intl = useIntl()

  if (!value) {
    return (
      <span className={cn('text-ink-muted block text-end', className)}>—</span>
    )
  }

  const formatted = format(value, intl.locale)
  // `format` rend « 1 240,500 DT ». Sans devise, on retire le symbole final.
  const text = showCurrency
    ? formatted
    : formatted.replace(/\s*\p{Sc}?[^\d\s]*$/u, '').trim()

  return (
    <span
      dir="ltr"
      className={cn(
        'block text-end tabular-nums [unicode-bidi:isolate]',
        muteZero && isZero(value) ? 'text-ink-muted' : 'text-ink',
        className
      )}
    >
      {text}
    </span>
  )
}

export { MoneyCell }
