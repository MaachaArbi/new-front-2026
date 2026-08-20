/**
 * ACTIONS DE LIGNE — le menu « … » en fin de ligne.
 *
 * Écrit par nous : le paquet Metronic ne le livre pas, chaque page de démo le
 * recompose. C'est le même cas que le champ mot de passe — un comportement
 * répété qui finit par diverger.
 *
 * ── CE QUE ÇA ENCAPSULE ────────────────────────────────────────────────────────
 *
 *  1. **`data-no-row-click`.** Sans lui, ouvrir le menu ouvrirait aussi la fiche
 *     (l'événement remonte à la ligne). La garde est portée ici, une fois, au
 *     lieu d'être oubliée par le neuvième appelant.
 *  2. **Le menu s'aligne sur la FIN** : en arabe il s'ouvre de l'autre côté sans
 *     qu'on ait à y penser.
 *  3. **L'action destructive est séparée et colorée.** Une suppression qui a la
 *     même allure qu'un « dupliquer » se clique par erreur.
 *  4. **Le libellé du déclencheur est traduit et nomme la ligne** : « Actions
 *     pour Groupe Sahara Voyages », pas « … ». Au lecteur d'écran, vingt-cinq
 *     boutons appelés « … » ne veulent rien dire.
 */
import { type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'

export interface RowAction {
  id: string
  label: string
  icon?: ReactNode
  onSelect: () => void
  disabled?: boolean
  /** Placée en dernier, après un séparateur, et colorée en danger. */
  destructive?: boolean
}

export interface DataGridRowActionsProps {
  actions: readonly RowAction[]
  /** Nom de la ligne — sert au libellé du lecteur d'écran. */
  rowLabel?: string
  className?: string
}

function DataGridRowActions({
  actions,
  rowLabel,
  className,
}: DataGridRowActionsProps) {
  const intl = useIntl()
  const ordinary = actions.filter((a) => !a.destructive)
  const destructive = actions.filter((a) => a.destructive)

  if (actions.length === 0) return null

  const label = rowLabel
    ? intl.formatMessage({ id: 'ui.table.actionsFor' }, { name: rowLabel })
    : intl.formatMessage({ id: 'ui.table.actions' })

  return (
    <div data-no-row-click className={cn('flex justify-end', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button mode="icon" variant="ghost" size="sm" aria-label={label}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {ordinary.map((action) => (
            <DropdownMenuItem
              key={action.id}
              disabled={action.disabled}
              onSelect={action.onSelect}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
          {ordinary.length > 0 && destructive.length > 0 && (
            <DropdownMenuSeparator />
          )}
          {destructive.map((action) => (
            <DropdownMenuItem
              key={action.id}
              disabled={action.disabled}
              onSelect={action.onSelect}
              className="text-text-danger focus:text-text-danger"
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { DataGridRowActions }
