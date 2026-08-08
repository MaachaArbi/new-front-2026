import { cn } from '@/shared/lib/cn'

/**
 * Affichage **partagé** (lecture seule) d'un téléphone — le pendant de `PhoneInput`.
 *
 * Signature volontairement minimale (`value` seul) : le jour où on voudra un drapeau
 * ou un format à l'affichage, la modif tient **dans ce fichier**, sans toucher un
 * seul appelant. Aujourd'hui : le texte brut stocké, rien de plus (aucun changement
 * visuel). `dir="ltr"` garde le `+216 …` lisible même en interface arabe (RTL).
 *
 * Le garde « valeur vide » reste chez l'appelant : c'est lui qui décide de masquer la
 * ligne entière (état vide de la fiche), pas ce composant.
 */
export function PhoneDisplay({
  value,
  className,
}: {
  value: string | null | undefined
  className?: string
}) {
  if (!value) return null
  return (
    <span dir="ltr" className={cn('tabular-nums', className)}>
      {value}
    </span>
  )
}
