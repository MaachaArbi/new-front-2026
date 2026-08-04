import * as React from 'react'
import {
  flexRender,
  type Cell,
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
 * modification (densité, séparateurs, en-tête collant) se **propage partout**,
 * jamais de table dupliquée dans un écran.
 *
 * Volontairement **minimal** (principe « minimal maintenant ») : rendu, visibilité
 * de colonnes, densité, en-tête + colonnes marquées `sticky` collants, squelette,
 * état vide. Pas de DnD / resize / pin — ajoutables plus tard **sans toucher les
 * écrans**. Le style suit l'image cible : plein largeur, **sans bordures**
 * verticales, lignes séparées par un filet léger, survol discret.
 *
 * Pagination et **tri = serveur** : en V1 le back trie en dur sur le nom, donc
 * les en-têtes ne sont pas cliquables ici (on activera le tri quand le back
 * exposera `sort=`).
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
  'text-muted-foreground text-start align-middle font-medium whitespace-nowrap',
  {
    variants: {
      density: { compact: 'h-9 px-3', comfortable: 'h-11 px-4' },
    },
    defaultVariants: { density: 'comfortable' },
  }
)

const bodyCell = cva('align-middle', {
  variants: {
    density: { compact: 'px-3 py-1.5', comfortable: 'px-4 py-3' },
  },
  defaultVariants: { density: 'comfortable' },
})

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
  density = 'comfortable',
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
      <table className="w-full caption-bottom border-separate border-spacing-0 text-start text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const explicitSize = header.column.columnDef.size
                return (
                  <th
                    key={header.id}
                    style={
                      explicitSize != null
                        ? { width: `${explicitSize}px` }
                        : undefined
                    }
                    className={cn(
                      headCell({ density }),
                      'bg-muted/40 border-border sticky top-0 z-10 border-b',
                      meta?.sticky && 'start-0 z-20',
                      meta?.headerClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                {table.getVisibleLeafColumns().map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      bodyCell({ density }),
                      'border-border/60 border-b',
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
                {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                  <td
                    key={cell.id}
                    className={cn(
                      bodyCell({ density }),
                      'border-border/60 border-b',
                      cell.column.columnDef.meta?.sticky &&
                        'bg-background group-hover:bg-muted/40 sticky start-0 z-10 transition-colors',
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
