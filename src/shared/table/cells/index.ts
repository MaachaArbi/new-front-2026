/**
 * CELLULES MÉTIER — ce que `shared/ui` ne peut pas savoir.
 *
 * `shared/ui` est la couche PRÉLEVÉE : générique, comparable au template ligne à
 * ligne, elle ne sait pas ce qu'est un dinar ni un statut de tiers. Y mêler nos
 * cellules brouillerait la frontière qui rend le « à l'identique » vérifiable.
 *
 * Ces cellules-ci sont à nous. Elles branchent le noyau Money, la traduction et
 * nos règles d'affichage (« vide ≠ zéro », isolation des chiffres) une fois pour
 * toutes, au lieu de les reprendre dans chaque définition de colonne.
 */
export { MoneyCell, type MoneyCellProps } from './money-cell'
export { DateCell, type DateCellProps } from './date-cell'
export {
  StatusCell,
  type StatusCellProps,
  type StatusDefinition,
  type StatusTone,
} from './status-cell'
export { PartyCell, type PartyCellProps } from './party-cell'
