/**
 * CELLULE DE STATUT.
 *
 * Un statut n'est pas un texte : c'est un texte ET une couleur, et les deux
 * doivent dire la même chose partout. Le jour où « à surveiller » passe de
 * l'ambre au rouge, ça change à UN endroit — pas dans les onze listes qui
 * l'affichent.
 *
 * D'où la forme : l'appelant fournit une TABLE de correspondance
 * (statut → ton + clé de libellé) et la cellule ne fait que l'appliquer. La table
 * vit à côté du domaine qui la définit, pas ici : « bloqué » ne veut pas dire la
 * même chose pour un tiers et pour une réservation.
 *
 * Le libellé passe par une CLÉ i18n, jamais par du texte en clair — sinon un
 * statut se retrouve en français sur une interface arabe, et c'est la colonne
 * qu'on lit le plus vite.
 *
 * Un statut inconnu s'affiche « — », comme toute valeur absente.
 */
import { useIntl } from 'react-intl'
import { Badge } from '@/shared/ui/badge'

/** Tons disponibles, alignés sur les rôles de la planche. */
export type StatusTone =
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'

export interface StatusDefinition {
  readonly tone: StatusTone
  readonly labelKey: string
}

export interface StatusCellProps<T extends string> {
  value: T | undefined
  map: Readonly<Partial<Record<T, StatusDefinition>>>
  /** `light` par défaut : dans une liste dense, un aplat plein crie trop. */
  appearance?: 'default' | 'light' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

function StatusCell<T extends string>({
  value,
  map,
  appearance = 'light',
  size = 'sm',
}: StatusCellProps<T>) {
  const intl = useIntl()
  const definition = value ? map[value] : undefined

  if (!definition) {
    return <span className="text-ink-muted">—</span>
  }

  return (
    <Badge variant={definition.tone} appearance={appearance} size={size}>
      {intl.formatMessage({ id: definition.labelKey })}
    </Badge>
  )
}

export { StatusCell }
