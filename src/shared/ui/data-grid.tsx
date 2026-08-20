/**
 * TABLEAU DE DONNÉES — le contexte et les réglages.
 * Prélevé de `vendor-metronic/full/src/components/ui/data-grid.tsx`.
 *
 * ── CE QUE C'EST ───────────────────────────────────────────────────────────────
 * Ce fichier ne dessine rien. Il porte les RÉGLAGES d'un tableau (`tableLayout`)
 * et l'instance TanStack, et les distribue par contexte aux pièces qui dessinent
 * (`data-grid-table`, `-pagination`, `-column-header`). C'est ce qui permet
 * d'écrire `<DataGrid table={…} tableLayout={{ dense: true }}>` une fois, au lieu
 * de passer dix props à chaque sous-partie.
 *
 * ── POURQUOI LE PAQUET LOCAL ET PAS LE REGISTRE ────────────────────────────────
 * Le registre ReUI publie un `data-grid` de 6 179 lignes contre 193 ici, avec
 * `@base-ui/react` EN PLUS de Radix, quatre paquets `@dnd-kit` et la
 * virtualisation. L'ADR-F01 dit qu'un composant « est relu, typé, il devient
 * nôtre » : 6 179 lignes ne se relisent pas honnêtement, et une seconde
 * bibliothèque sans tête à côté de Radix veut dire deux gestions du focus, deux
 * systèmes de portails, deux jeux de bugs. Le registre reste la voie de secours
 * le jour où il nous faudra la virtualisation (listes de 10 000 lignes) ou le
 * glisser-déposer de colonnes.
 *
 * ── ÉCART ASSUMÉ ───────────────────────────────────────────────────────────────
 * `--ui-row` gouverne la hauteur de ligne (voir `data-grid-table.tsx`). C'est LA
 * décision qui compte dans un ERP : elle décide combien de lignes un agent voit
 * sans défiler. `tableLayout.dense` se combine avec elle au lieu de la doubler.
 */
import { createContext, type ReactNode, useContext } from 'react'
import type {
  ColumnFiltersState,
  RowData,
  SortingState,
  Table,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/cn'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Nom lisible de la colonne, pour le menu « colonnes visibles ». */
    headerTitle?: string
    headerClassName?: string
    cellClassName?: string
    /** Ce qu'on affiche à la place de la cellule pendant le chargement. */
    skeleton?: ReactNode
    /** Contenu de la ligne dépliée, s'il y en a une. */
    expandedContent?: (row: TData) => ReactNode
  }
}

export type DataGridApiFetchParams = {
  pageIndex: number
  pageSize: number
  sorting?: SortingState
  filters?: ColumnFiltersState
  searchQuery?: string
}

export type DataGridApiResponse<T> = {
  data: T[]
  empty: boolean
  pagination: { total: number; page: number }
}

export interface DataGridContextProps<TData extends object> {
  props: DataGridProps<TData>
  table: Table<TData>
  recordCount: number
  isLoading: boolean
}

export type DataGridRequestParams = {
  pageIndex: number
  pageSize: number
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
}

export interface DataGridProps<TData extends object> {
  className?: string
  table?: Table<TData>
  /** Nombre TOTAL de lignes côté serveur — pas le nombre affiché. */
  recordCount: number
  children?: ReactNode
  onRowClick?: (row: TData) => void
  isLoading?: boolean
  loadingMode?: 'skeleton' | 'spinner'
  loadingMessage?: ReactNode | string
  emptyMessage?: ReactNode | string
  tableLayout?: {
    /** Resserre encore les lignes, EN PLUS du réglage global de densité. */
    dense?: boolean
    cellBorder?: boolean
    rowBorder?: boolean
    rowRounded?: boolean
    stripped?: boolean
    headerBackground?: boolean
    headerBorder?: boolean
    headerSticky?: boolean
    width?: 'auto' | 'fixed'
    columnsVisibility?: boolean
    columnsResizable?: boolean
    columnsPinnable?: boolean
    columnsMovable?: boolean
    columnsDraggable?: boolean
    rowsDraggable?: boolean
  }
  tableClassNames?: {
    base?: string
    header?: string
    headerRow?: string
    headerSticky?: string
    body?: string
    bodyRow?: string
    footer?: string
    edgeCell?: string
  }
}

const DataGridContext = createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataGridContextProps<any> | undefined
>(undefined)

function useDataGrid() {
  const context = useContext(DataGridContext)
  if (!context) {
    throw new Error('useDataGrid doit être appelé sous <DataGrid>.')
  }
  return context
}

function DataGridProvider<TData extends object>({
  children,
  table,
  ...props
}: DataGridProps<TData> & { table: Table<TData> }) {
  return (
    <DataGridContext.Provider
      value={{
        props,
        table,
        recordCount: props.recordCount,
        isLoading: props.isLoading ?? false,
      }}
    >
      {children}
    </DataGridContext.Provider>
  )
}

function DataGrid<TData extends object>({
  children,
  table,
  ...props
}: DataGridProps<TData>) {
  const defaultProps: Partial<DataGridProps<TData>> = {
    loadingMode: 'skeleton',
    tableLayout: {
      dense: false,
      cellBorder: false,
      rowBorder: true,
      rowRounded: false,
      stripped: false,
      headerSticky: false,
      headerBackground: true,
      headerBorder: true,
      width: 'fixed',
      columnsVisibility: false,
      columnsResizable: false,
      columnsPinnable: false,
      columnsMovable: false,
      columnsDraggable: false,
      rowsDraggable: false,
    },
    tableClassNames: {
      base: '',
      header: '',
      headerRow: '',
      headerSticky: 'bg-background/90 sticky top-0 z-10 backdrop-blur-xs',
      body: '',
      bodyRow: '',
      footer: '',
      edgeCell: '',
    },
  }

  const mergedProps: DataGridProps<TData> = {
    ...defaultProps,
    ...props,
    tableLayout: { ...defaultProps.tableLayout, ...(props.tableLayout ?? {}) },
    tableClassNames: {
      ...defaultProps.tableClassNames,
      ...(props.tableClassNames ?? {}),
    },
  }

  if (!table) {
    throw new Error('DataGrid attend une prop « table ».')
  }

  return (
    <DataGridProvider table={table} {...mergedProps}>
      {children}
    </DataGridProvider>
  )
}

function DataGridContainer({
  children,
  className,
  border = true,
}: {
  children: ReactNode
  className?: string
  border?: boolean
}) {
  return (
    <div
      data-slot="data-grid"
      className={cn(
        // `overflow-x-auto` : un tableau plus large que son conteneur doit
        // DÉFILER, jamais déborder sur la page. Absent du template, où le
        // débordement passait inaperçu tant que le tableau était pleine largeur —
        // il se voit dès qu'on en pose deux côte à côte.
        'grid w-full overflow-x-auto',
        border && 'border-border rounded-lg border',
        className
      )}
    >
      {children}
    </div>
  )
}

export { useDataGrid, DataGridProvider, DataGrid, DataGridContainer }
