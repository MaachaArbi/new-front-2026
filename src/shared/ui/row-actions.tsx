import { Pencil, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

/**
 * Actions de fin de ligne — « éditer » et « retirer ».
 *
 * Pourquoi les mutualiser : le même couple de boutons fantômes était recopié dans les
 * adresses, les interlocuteurs, les chargés, les plafonds, les exonérations, les
 * approbations et les documents. Le jour où l'on change la taille des icônes, la
 * couleur au survol ou l'ordre des actions, on ne veut pas visiter sept fichiers.
 *
 * Le RETRAIT utilise « × » et non une corbeille : décision d'Arbi, pour que toutes les
 * listes du produit suppriment de la même façon.
 */
export function RowActions({
  onEdit,
  onRemove,
  editLabel,
  removeLabel,
  removing,
  className,
}: {
  onEdit?: () => void
  onRemove?: () => void
  /** Libellés accessibles — obligatoires dès qu'une action est fournie. */
  editLabel?: string
  removeLabel?: string
  removing?: boolean
  className?: string
}) {
  if (!onEdit && !onRemove) return null
  return (
    <span className={cn('-me-2 flex shrink-0 items-center', className)}>
      {onEdit ? (
        <Button
          size="sm"
          mode="icon"
          variant="ghost"
          className="text-muted-foreground"
          onClick={onEdit}
          aria-label={editLabel}
        >
          <Pencil />
        </Button>
      ) : null}
      {onRemove ? (
        <Button
          size="sm"
          mode="icon"
          variant="ghost"
          className="text-muted-foreground"
          onClick={onRemove}
          disabled={removing}
          aria-label={removeLabel}
        >
          <X />
        </Button>
      ) : null}
    </span>
  )
}
