/**
 * TABLEAU DE DONNÉES — le menu « colonnes visibles ».
 * Prélevé de `vendor-metronic/full/src/components/ui/data-grid-column-visibility.tsx`.
 *
 * Écarts : le libellé « Toggle Columns » est traduit, et `capitalize` est retiré —
 * il forçait une majuscule sur des noms de colonnes déjà écrits correctement, et
 * n'a aucun sens en arabe.
 */
import { type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import type { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

function DataGridColumnVisibility<TData>({
  table,
  trigger,
}: {
  table: Table<TData>
  trigger: ReactNode
}) {
  const intl = useIntl()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuLabel className="font-medium">
          {intl.formatMessage({ id: 'ui.table.toggleColumns' })}
        </DropdownMenuLabel>
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(value) =>
                column.toggleVisibility(Boolean(value))
              }
            >
              {column.columnDef.meta?.headerTitle ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DataGridColumnVisibility }
