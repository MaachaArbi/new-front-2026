/**
 * CELLULE DE DATE.
 *
 * Trois décisions qu'on ne veut pas reprendre par colonne :
 *  1. Le FORMAT suit la langue (`react-intl`), jamais une chaîne codée en dur.
 *  2. **ISOLATION SEULE — surtout pas `dir="ltr"`.** C'est le piège, et je m'y
 *     suis fait prendre : en arabe, `Intl.DateTimeFormat` produit
 *     « 18‏/8‏/2026 » avec des marques RLM (U+200F) entre les parties. Ces
 *     marques existent précisément pour que la date se lise juste en RTL. Forcer
 *     `ltr` les combat et affiche « 182026/8/ » — une date FAUSSE, pas seulement
 *     mal placée.
 *
 *     La règle qui s'en dégage, et qui vaut partout :
 *     **on isole une chaîne qu'on a formatée soi-même ; on ne force jamais la
 *     direction d'une chaîne qu'`Intl` a formatée pour la langue de la page.**
 *  3. Vide ≠ zéro : une date absente s'écrit « — », comme partout ailleurs.
 *
 * `relative` sert aux colonnes « dernière activité » : « il y a 3 jours » se lit
 * plus vite qu'une date quand ce qui compte est la fraîcheur, pas le jour exact.
 */
import { useIntl } from 'react-intl'
import { cn } from '@/shared/lib/cn'

export interface DateCellProps {
  /** ISO 8601, ou `undefined` pour « inconnu ». */
  value: string | Date | undefined
  /** `date` = 18/08/2026 · `dateTime` = avec l'heure · `relative` = il y a 3 jours */
  mode?: 'date' | 'dateTime' | 'relative'
  className?: string
}

const DAY_MS = 86_400_000

function DateCell({ value, mode = 'date', className }: DateCellProps) {
  const intl = useIntl()

  if (!value) {
    return <span className={cn('text-ink-muted', className)}>—</span>
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return <span className={cn('text-ink-muted', className)}>—</span>
  }

  if (mode === 'relative') {
    // Arrondi au jour : « il y a 3 jours » n'a pas besoin d'être à l'heure près,
    // et une valeur qui change à chaque rendu rendrait les captures instables.
    const days = Math.round((date.getTime() - Date.now()) / DAY_MS)
    return (
      <span className={cn('text-ink-secondary', className)}>
        {intl.formatRelativeTime(days, 'day', { numeric: 'auto' })}
      </span>
    )
  }

  return (
    <span
      className={cn('text-ink-secondary [unicode-bidi:isolate]', className)}
    >
      {mode === 'dateTime'
        ? intl.formatDate(date, {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : intl.formatDate(date, { dateStyle: 'short' })}
    </span>
  )
}

export { DateCell }
