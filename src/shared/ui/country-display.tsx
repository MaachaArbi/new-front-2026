import { cn } from '@/shared/lib/cn'
import { useReferentials, codeLabel } from '@/shared/referentials'
import { CountryFlag } from '@/shared/ui/flag'

/**
 * Affichage **partagé** (lecture seule) d'un pays — le pendant lecture de `CountrySelect`,
 * comme `PhoneDisplay` l'est de `PhoneInput`. Signature minimale (`code` seul) : il **résout
 * lui-même** le libellé via le référentiel `countries` (en cache), pour que les appelants
 * restent triviaux et qu'un futur changement d'affichage tienne dans ce seul fichier.
 *
 * Le garde « vide » reste chez l'appelant (masquer la ligne — état vide de la fiche).
 */
export function CountryDisplay({
  code,
  className,
}: {
  code: string | null | undefined
  className?: string
}) {
  const referentials = useReferentials().data
  if (!code) return null
  const label = codeLabel(referentials?.countries)(code)
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <CountryFlag alpha2={code} />
      <span>{label}</span>
    </span>
  )
}
