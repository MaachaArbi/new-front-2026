import * as React from 'react'
import {
  flexRender,
  type Cell,
  type Header,
  type HeaderGroup,
  type Row,
  type RowData,
  type Table,
} from '@tanstack/react-table'
import { cva } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

/**
 * `DataTable` — LE tableau partagé du système (copy-and-own du Data Grid ReUI,
 * ADR-F01 ; bâti sur TanStack Table, ADR-014). Toute liste passe par lui : une
 * modification (densité, séparateurs, en-tête collant, largeurs) se **propage
 * partout**, jamais de table dupliquée dans un écran.
 *
 * Contenu : rendu, visibilité de colonnes, densité, en-tête + colonnes `sticky`
 * collants, **redimensionnement des colonnes** (poignée), squelette, état vide.
 * Style de la cible : plein largeur, **sans bordures** verticales, lignes séparées
 * par un filet léger, survol discret.
 *
 * Pagination et **tri = serveur**. Ce tableau **ne trie pas** (le back trie en dur
 * sur le nom) : les en-têtes sont des libellés, pas des boutons de tri.
 */

// Métadonnées par colonne, lues via `columnDef.meta`.
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Libellé lisible dans le menu « Colonnes » (sinon `column.id`). */
    headerTitle?: string
    /** Classe appliquée aux cellules d'en-tête de cette colonne. */
    headerClassName?: string
    /** Classe appliquée aux cellules de corps de cette colonne. */
    cellClassName?: string
    /** Rendu du squelette de chargement pour cette colonne. */
    skeleton?: React.ReactNode
    /** Colle la colonne au bord de départ (ex. le nom du tiers) au défilement. */
    sticky?: boolean
  }
}

export type DataTableDensity = 'compact' | 'comfortable'

const headCell = cva(
  'text-muted-foreground text-start align-middle font-medium',
  {
    variants: {
      density: { compact: 'h-9 px-3', comfortable: 'h-10 px-4' },
    },
    defaultVariants: { density: 'comfortable' },
  }
)

const bodyCell = cva('align-middle overflow-hidden', {
  variants: {
    density: { compact: 'px-3 py-1.5', comfortable: 'px-4 py-3' },
  },
  defaultVariants: { density: 'comfortable' },
})

/**
 * Poignée de redimensionnement entre deux colonnes : zone de préhension large
 * (`w-4`) chevauchant le bord (`-end-2`), avec un **filet 1px centré visible en
 * permanence** (pour qu'on devine qu'on peut redimensionner). Le filet s'accentue
 * au survol et devient primaire pendant le redimensionnement.
 */
function ResizeHandle<TData>({ header }: { header: Header<TData, unknown> }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() => header.column.resetSize()}
      className={cn(
        'absolute -end-2 top-0 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center select-none',
        'before:bg-border before:absolute before:inset-y-0 before:start-1/2 before:w-px before:-translate-x-1/2 before:transition-colors',
        'hover:before:bg-muted-foreground',
        header.column.getIsResizing() && 'before:bg-primary before:w-0.5'
      )}
    />
  )
}

export interface DataTableProps<TData> {
  table: Table<TData>
  /** Chargement initial : affiche des lignes squelette. */
  isLoading?: boolean
  density?: DataTableDensity
  onRowClick?: (row: TData) => void
  /** Contenu de l'état vide (RLS : un vide n'est pas une erreur). */
  emptyMessage?: React.ReactNode
  /** Nombre de lignes squelette (défaut : taille de page courante, sinon 8). */
  skeletonRows?: number
  className?: string
}

export function DataTable<TData>({
  table,
  isLoading = false,
  density = 'compact',
  onRowClick,
  emptyMessage,
  skeletonRows,
  className,
}: DataTableProps<TData>) {
  const visibleCount = table.getVisibleLeafColumns().length
  const rows = table.getRowModel().rows
  const pageSize = table.getState().pagination?.pageSize
  const skeletonCount = skeletonRows ?? pageSize ?? 8

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table
        className="w-full table-fixed caption-bottom border-separate border-spacing-0 text-start text-sm"
        style={{ minWidth: table.getTotalSize() }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, colIndex, arr) => {
                const meta = header.column.columnDef.meta
                return (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      headCell({ density }),
                      'bg-muted/40 border-border sticky top-0 z-10 border-b',
                      'relative overflow-hidden',
                      // Gouttière de bord : la bande touche le bord (flush), le
                      // contenu reste en retrait, aligné sur les filtres.
                      colIndex === 0 && 'ps-4 lg:ps-7.5',
                      colIndex === arr.length - 1 && 'pe-4 lg:pe-7.5',
                      meta?.sticky && 'start-0 z-20',
                      meta?.headerClassName
                    )}
                  >
                    <span className="block truncate">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </span>
                    {header.column.getCanResize() ? (
                      <ResizeHandle header={header} />
                    ) : null}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonCount }).map((_, rowIndex) => (
              <tr
                key={`skeleton-${rowIndex}`}
                className="border-border/60 border-b"
              >
                {table.getVisibleLeafColumns().map((column, colIndex, arr) => (
                  <td
                    key={column.id}
                    className={cn(
                      bodyCell({ density }),
                      'border-border/60 border-b',
                      colIndex === 0 && 'ps-4 lg:ps-7.5',
                      colIndex === arr.length - 1 && 'pe-4 lg:pe-7.5',
                      column.columnDef.meta?.sticky &&
                        'bg-background sticky start-0 z-10',
                      column.columnDef.meta?.cellClassName
                    )}
                  >
                    {column.columnDef.meta?.skeleton ?? (
                      <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length ? (
            rows.map((row: Row<TData>) => (
              <tr
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={cn(
                  'group hover:bg-muted/40 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {row
                  .getVisibleCells()
                  .map((cell: Cell<TData, unknown>, colIndex, arr) => (
                    <td
                      key={cell.id}
                      className={cn(
                        bodyCell({ density }),
                        'border-border/60 border-b',
                        colIndex === 0 && 'ps-4 lg:ps-7.5',
                        colIndex === arr.length - 1 && 'pe-4 lg:pe-7.5',
                        cell.column.columnDef.meta?.sticky &&
                          'bg-background group-hover:bg-muted/40 sticky start-0 z-10 transition-colors',
                        cell.column.columnDef.meta?.cellClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={visibleCount}
                className="text-muted-foreground px-4 py-10 text-center text-sm"
              >
                {emptyMessage ?? 'Aucune donnée.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Bouton « Colonnes » — affiche/masque les colonnes cachables (image cible).
 * `trigger` = ton propre Button, pour rester cohérent avec le design system.
 */
export function DataTableColumnsButton<TData>({
  table,
  trigger,
  label,
}: {
  table: Table<TData>
  trigger: React.ReactNode
  label?: string
}) {
  const columns = table.getAllColumns().filter((column) => column.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {label ? <DropdownMenuLabel>{label}</DropdownMenuLabel> : null}
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {column.columnDef.meta?.headerTitle ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
