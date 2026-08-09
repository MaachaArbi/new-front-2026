import { formatMinor } from '@/shared/lib/money'
import { cn } from '@/shared/lib/cn'

/**
 * Montant monétaire — `amountMinor` est une **chaîne d'unités mineures** (millimes pour
 * le TND, centimes pour l'EUR) : on ne la convertit jamais en `number`, la précision
 * s'y perdrait sur les gros montants.
 *
 * `tabular-nums` est ici et pas ailleurs : dans une colonne de montants, les chiffres
 * doivent s'aligner verticalement, sinon l'œil ne peut pas comparer.
 */
export function MoneyText({
  minor,
  currency,
  /** Préfixe « + » pour une rallonge, un crédit, un ajout. */
  signed,
  className,
}: {
  minor: string
  currency: string | null
  signed?: boolean
  className?: string
}) {
  const code = currency ?? ''
  return (
    <span className={cn('tabular-nums', className)}>
      {signed ? '+' : ''}
      {formatMinor(minor, code)}
      {code ? ` ${code}` : ''}
    </span>
  )
}
