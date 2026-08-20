/**
 * ACTIONS GROUPÉES — la barre qui apparaît quand des lignes sont sélectionnées.
 *
 * Écrite par nous. Sans elle, la case à cocher ne sert **à rien** : on peut
 * sélectionner, mais rien ne se passe ensuite. C'était l'état du tableau jusqu'à
 * maintenant, et c'est le genre de manque qui ne se voit pas sur une capture.
 *
 * ── DÉCISIONS ──────────────────────────────────────────────────────────────────
 *
 *  1. **Elle prend la place de la barre d'outils, elle ne s'ajoute pas.** Une
 *     barre qui se superpose déplace tout le tableau de quelques pixels au
 *     premier clic, et l'œil perd la ligne qu'il suivait.
 *  2. **Le compte est isolé en LTR** — encore les chiffres qui se réagencent.
 *  3. **« Tout désélectionner » est toujours là.** Sortir d'une sélection doit
 *     être aussi facile qu'y entrer ; sans ce bouton on décoche à la main.
 *  4. **Les actions destructives sont séparées** et portent le ton danger.
 *  5. **Elle annonce la sélection** (`role="status"`) : au lecteur d'écran, une
 *     barre qui apparaît en silence n'existe pas.
 */
import { type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useDataGrid } from '@/shared/ui/data-grid'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/cn'

export interface BulkAction {
  id: string
  label: string
  icon?: ReactNode
  onSelect: (selectedIds: string[]) => void
  disabled?: boolean
  destructive?: boolean
}

export interface DataGridBulkActionsProps {
  actions: readonly BulkAction[]
  className?: string
}

function DataGridBulkActions({ actions, className }: DataGridBulkActionsProps) {
  const intl = useIntl()
  const { table } = useDataGrid()

  const selectedIds = Object.keys(table.getState().rowSelection)
  if (selectedIds.length === 0) return null

  const ordinary = actions.filter((a) => !a.destructive)
  const destructive = actions.filter((a) => a.destructive)

  return (
    <div
      role="status"
      data-slot="data-grid-bulk-actions"
      className={cn(
        'bg-bg-primary border-border-primary flex flex-wrap items-center gap-2 rounded-lg border px-2.5 py-1.5',
        className
      )}
    >
      <span className="text-ink text-2sm font-medium">
        {intl.formatMessage(
          { id: 'ui.table.selectedCount' },
          {
            count: selectedIds.length,
            n: (
              <span dir="ltr" className="tabular-nums [unicode-bidi:isolate]">
                {selectedIds.length}
              </span>
            ),
          }
        )}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => table.resetRowSelection()}
        className="text-ink-secondary"
      >
        <X />
        {intl.formatMessage({ id: 'ui.table.clearSelection' })}
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <div className="flex flex-wrap items-center gap-2">
        {ordinary.map((action) => (
          <Button
            key={action.id}
            variant="secondary"
            size="sm"
            disabled={action.disabled}
            onClick={() => action.onSelect(selectedIds)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        {destructive.map((action) => (
          <Button
            key={action.id}
            variant="destructive"
            size="sm"
            disabled={action.disabled}
            onClick={() => action.onSelect(selectedIds)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export { DataGridBulkActions }
