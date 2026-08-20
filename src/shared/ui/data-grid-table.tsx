/**
 * TABLEAU DE DONNÉES — le rendu.
 * Prélevé de `vendor-metronic/full/src/components/ui/data-grid-table.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. **ÉPINGLAGE DE COLONNES — vrai bug RTL, invisible pour le lint.**
 *     Le template calcule `{ left: …, right: … }` en JavaScript, pas en classes :
 *     aucune règle ne pouvait l'attraper. En arabe, une colonne « épinglée au
 *     début » se collait donc au bord DROIT de l'écran, c'est-à-dire du mauvais
 *     côté. Corrigé en `insetInlineStart` / `insetInlineEnd`. Le vocabulaire de
 *     TanStack reste `left`/`right` (on ne le contrôle pas), mais son `left`
 *     signifie « les premières colonnes » — la traduction logique est donc juste.
 *
 *  2. **HAUTEUR DE LIGNE indexée sur `--ui-row`.** Le template fige `h-10` et
 *     `py-3`. C'est LA mesure qui compte dans un ERP : elle décide combien de
 *     lignes un agent voit sans défiler. `tableLayout.dense` se combine désormais
 *     avec le réglage global au lieu de le doubler.
 *
 *  3. **LIGNE SÉLECTIONNÉE : `--bg-primary` au lieu d'un gris.** La planche donne
 *     ce jeton pour « tuiles, badges, lignes actives ». Une ligne sélectionnée en
 *     gris se confond avec le survol ; elle doit se lire d'un coup d'œil, parce
 *     qu'on sélectionne pour agir ensuite.
 *
 *  4. Survol en `bg-accent` (le survol du système) au lieu de `bg-muted/40`.
 *
 *  5. `text-left rtl:text-right` → `text-start`. Le template corrigeait à la main
 *     ce que la propriété logique fait toute seule.
 *
 *  6. Le voyant de chargement : SVG en ligne et centrage physique remplacés par
 *     l'icône lucide et `inset-0 m-auto`.
 *
 *  7. **Tous les textes sont traduits.** Le template écrit « No data available »,
 *     « Loading… », « Select row », « Select all » en dur. Un tableau vide qui
 *     parle anglais dans une interface arabe, c'est le message qu'on lit le plus
 *     souvent au démarrage d'un module.
 *
 *  8. Coquille du template corrigée : `DataGridTableBodyRowExpandded`.
 */
import * as React from 'react'
import { type CSSProperties, Fragment, type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { Loader2 } from 'lucide-react'
import {
  type Cell,
  type Column,
  flexRender,
  type Header,
  type HeaderGroup,
  type Row,
} from '@tanstack/react-table'
import { cva } from 'class-variance-authority'
import { Checkbox } from '@/shared/ui/checkbox'
import { useDataGrid } from '@/shared/ui/data-grid'
import { cn } from '@/shared/lib/cn'

/**
 * `dense` descend d'un cran dans l'échelle de densité au lieu d'imposer une
 * hauteur figée : les deux réglages se composent au lieu de se contredire.
 */
const headerCellSpacingVariants = cva('', {
  variants: {
    size: {
      dense: 'h-(--ui-row) px-2.5',
      default: 'h-(--ui-row-lg) px-4',
    },
  },
  defaultVariants: { size: 'default' },
})

const bodyCellSpacingVariants = cva('', {
  variants: {
    size: { dense: 'px-2.5 py-2', default: 'px-4 py-3' },
  },
  defaultVariants: { size: 'default' },
})

const bodyRowHeightVariants = cva('', {
  variants: {
    size: { dense: 'h-(--ui-row)', default: 'h-(--ui-row-lg)' },
  },
  defaultVariants: { size: 'default' },
})

/**
 * ⚠️ Propriétés LOGIQUES obligatoires ici. Voir l'écart 1 en tête de fichier :
 * ce calcul est en JavaScript, donc hors de portée de la règle de lint — c'est
 * exactement le genre d'endroit où une fuite RTL survit des mois.
 */
function getPinningStyles<TData>(column: Column<TData>): CSSProperties {
  const isPinned = column.getIsPinned()

  return {
    insetInlineStart:
      isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    insetInlineEnd:
      isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

function DataGridTableBase({ children }: { children: ReactNode }) {
  const { props } = useDataGrid()

  return (
    <table
      data-slot="data-grid-table"
      className={cn(
        'text-ink text-2sm w-full caption-bottom text-start align-middle font-normal',
        !props.tableLayout?.columnsDraggable &&
          'border-separate border-spacing-0',
        props.tableLayout?.width === 'fixed' ? 'table-fixed' : 'table-auto',
        props.tableClassNames?.base
      )}
    >
      {children}
    </table>
  )
}

function DataGridTableHead({ children }: { children: ReactNode }) {
  const { props } = useDataGrid()

  return (
    <thead
      className={cn(
        props.tableClassNames?.header,
        props.tableLayout?.headerSticky && props.tableClassNames?.headerSticky
      )}
    >
      {children}
    </thead>
  )
}

function DataGridTableHeadRow<TData>({
  children,
  headerGroup,
}: {
  children: ReactNode
  headerGroup: HeaderGroup<TData>
}) {
  const { props } = useDataGrid()

  return (
    <tr
      key={headerGroup.id}
      className={cn(
        'bg-muted',
        props.tableLayout?.headerBorder && '[&>th]:border-b',
        props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
        props.tableLayout?.stripped && 'bg-transparent',
        props.tableLayout?.headerBackground === false && 'bg-transparent',
        props.tableClassNames?.headerRow
      )}
    >
      {children}
    </tr>
  )
}

function DataGridTableHeadRowCell<TData>({
  children,
  header,
  dndRef,
  dndStyle,
}: {
  children: ReactNode
  header: Header<TData, unknown>
  dndRef?: React.Ref<HTMLTableCellElement>
  dndStyle?: CSSProperties
}) {
  const { props } = useDataGrid()
  const { column } = header
  const isPinned = column.getIsPinned()
  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinned =
    isPinned === 'right' && column.getIsFirstColumn('right')
  const headerCellSpacing = headerCellSpacingVariants({
    size: props.tableLayout?.dense ? 'dense' : 'default',
  })

  return (
    <th
      key={header.id}
      ref={dndRef}
      style={{
        ...(props.tableLayout?.width === 'fixed' && {
          width: `${header.getSize()}px`,
        }),
        ...(props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          getPinningStyles(column)),
        ...(dndStyle ?? null),
      }}
      data-pinned={isPinned || undefined}
      data-last-col={
        isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined
      }
      className={cn(
        'text-ink-secondary relative text-start align-middle font-normal [&:has([role=checkbox])]:pe-0',
        headerCellSpacing,
        props.tableLayout?.cellBorder && 'border-e',
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          'truncate',
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          '[&[data-pinned][data-last-col]]:border-border data-pinned:bg-muted data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-s!',
        header.column.columnDef.meta?.headerClassName,
        column.getIndex() === 0 ||
          column.getIndex() === header.headerGroup.headers.length - 1
          ? props.tableClassNames?.edgeCell
          : ''
      )}
    >
      {children}
    </th>
  )
}

function DataGridTableHeadRowCellResize<TData>({
  header,
}: {
  header: Header<TData, unknown>
}) {
  const { column } = header

  return (
    <div
      onDoubleClick={() => column.resetSize()}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      className="user-select-none before:bg-border absolute -end-2 top-0 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px"
    />
  )
}

function DataGridTableRowSpacer() {
  return <tbody aria-hidden="true" className="h-2" />
}

function DataGridTableBody({ children }: { children: ReactNode }) {
  const { props } = useDataGrid()

  return (
    <tbody
      className={cn(
        '[&_tr:last-child]:border-0',
        props.tableLayout?.rowRounded &&
          '[&_td:first-child]:rounded-s-lg [&_td:last-child]:rounded-e-lg',
        props.tableClassNames?.body
      )}
    >
      {children}
    </tbody>
  )
}

/** Classes partagées par la ligne réelle et la ligne squelette. */
function useBodyRowClasses() {
  const { props, table } = useDataGrid()

  return cn(
    bodyRowHeightVariants({
      size: props.tableLayout?.dense ? 'dense' : 'default',
    }),
    'hover:bg-accent data-[state=selected]:bg-bg-primary',
    props.onRowClick && 'cursor-pointer',
    !props.tableLayout?.stripped &&
      props.tableLayout?.rowBorder &&
      'border-border border-b [&:not(:last-child)>td]:border-b',
    props.tableLayout?.cellBorder && '[&_>:last-child]:border-e-0',
    props.tableLayout?.stripped &&
      'odd:bg-muted hover:bg-transparent odd:hover:bg-accent',
    table.options.enableRowSelection && '[&_>:first-child]:relative',
    props.tableClassNames?.bodyRow
  )
}

function DataGridTableBodyRowSkeleton({ children }: { children: ReactNode }) {
  return <tr className={useBodyRowClasses()}>{children}</tr>
}

function DataGridTableBodyRowSkeletonCell<TData>({
  children,
  column,
}: {
  children: ReactNode
  column: Column<TData>
}) {
  const { props, table } = useDataGrid()
  const bodyCellSpacing = bodyCellSpacingVariants({
    size: props.tableLayout?.dense ? 'dense' : 'default',
  })

  return (
    <td
      className={cn(
        'align-middle',
        bodyCellSpacing,
        props.tableLayout?.cellBorder && 'border-e',
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          'truncate',
        column.columnDef.meta?.cellClassName,
        column.getIndex() === 0 ||
          column.getIndex() === table.getVisibleFlatColumns().length - 1
          ? props.tableClassNames?.edgeCell
          : ''
      )}
    >
      {children}
    </td>
  )
}

function DataGridTableBodyRow<TData>({
  children,
  row,
  dndRef,
  dndStyle,
}: {
  children: ReactNode
  row: Row<TData>
  dndRef?: React.Ref<HTMLTableRowElement>
  dndStyle?: CSSProperties
}) {
  const { props, table } = useDataGrid()

  return (
    <tr
      ref={dndRef}
      style={{ ...(dndStyle ?? null) }}
      data-state={
        table.options.enableRowSelection && row.getIsSelected()
          ? 'selected'
          : undefined
      }
      onClick={() => props.onRowClick?.(row.original)}
      className={useBodyRowClasses()}
    >
      {children}
    </tr>
  )
}

function DataGridTableBodyRowExpanded<TData>({ row }: { row: Row<TData> }) {
  const { props, table } = useDataGrid()

  return (
    <tr
      className={cn(
        props.tableLayout?.rowBorder && '[&:not(:last-child)>td]:border-b'
      )}
    >
      <td colSpan={row.getVisibleCells().length}>
        {table
          .getAllColumns()
          .find((column) => column.columnDef.meta?.expandedContent)
          ?.columnDef.meta?.expandedContent?.(row.original)}
      </td>
    </tr>
  )
}

function DataGridTableBodyRowCell<TData>({
  children,
  cell,
  dndRef,
  dndStyle,
}: {
  children: ReactNode
  cell: Cell<TData, unknown>
  dndRef?: React.Ref<HTMLTableCellElement>
  dndStyle?: CSSProperties
}) {
  const { props } = useDataGrid()
  const { column, row } = cell
  const isPinned = column.getIsPinned()
  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinned =
    isPinned === 'right' && column.getIsFirstColumn('right')
  const bodyCellSpacing = bodyCellSpacingVariants({
    size: props.tableLayout?.dense ? 'dense' : 'default',
  })

  return (
    <td
      key={cell.id}
      ref={dndRef}
      style={{
        ...(props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          getPinningStyles(column)),
        ...(dndStyle ?? null),
      }}
      data-pinned={isPinned || undefined}
      data-last-col={
        isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined
      }
      className={cn(
        'align-middle',
        bodyCellSpacing,
        props.tableLayout?.cellBorder && 'border-e',
        props.tableLayout?.columnsResizable &&
          column.getCanResize() &&
          'truncate',
        cell.column.columnDef.meta?.cellClassName,
        props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          '[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-e! [&[data-pinned=right][data-last-col=right]]:border-s!',
        column.getIndex() === 0 ||
          column.getIndex() === row.getVisibleCells().length - 1
          ? props.tableClassNames?.edgeCell
          : ''
      )}
    >
      {children}
    </td>
  )
}

function DataGridTableEmpty() {
  const intl = useIntl()
  const { table, props } = useDataGrid()

  return (
    <tr>
      <td
        colSpan={table.getAllColumns().length}
        className="text-ink-muted py-6 text-center"
      >
        {props.emptyMessage ?? intl.formatMessage({ id: 'ui.table.empty' })}
      </td>
    </tr>
  )
}

function DataGridTableLoader() {
  const intl = useIntl()
  const { props } = useDataGrid()

  return (
    <div className="pointer-events-none absolute inset-0 m-auto flex h-fit w-fit items-center">
      <div className="text-ink-muted bg-card border-border text-2sm shadow-shade flex items-center gap-2 rounded-md border px-4 py-2 leading-none font-medium shadow-xs">
        <Loader2 className="size-4 animate-spin" />
        {props.loadingMessage ?? intl.formatMessage({ id: 'ui.table.loading' })}
      </div>
    </div>
  )
}

function DataGridTableRowSelect<TData>({
  row,
  size,
}: {
  row: Row<TData>
  size?: 'sm' | 'md' | 'lg'
}) {
  const intl = useIntl()

  return (
    <>
      {/* Filet vertical au bord de la ligne : la case seule ne se voit pas quand
          on balaie une liste longue du regard. */}
      <div
        className={cn(
          'bg-primary absolute inset-y-0 start-0 hidden w-0.5',
          row.getIsSelected() && 'block'
        )}
      />
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={intl.formatMessage({ id: 'ui.table.selectRow' })}
        size={size ?? 'sm'}
        className="align-[inherit]"
      />
    </>
  )
}

function DataGridTableRowSelectAll({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  const intl = useIntl()
  const { table, recordCount, isLoading } = useDataGrid()

  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
      }
      disabled={isLoading || recordCount === 0}
      onCheckedChange={(value) =>
        table.toggleAllPageRowsSelected(Boolean(value))
      }
      aria-label={intl.formatMessage({ id: 'ui.table.selectAll' })}
      size={size}
      className="align-[inherit]"
    />
  )
}

function DataGridTable<TData>() {
  const { table, isLoading, props } = useDataGrid()
  const pagination = table.getState().pagination

  return (
    <DataGridTableBase>
      <DataGridTableHead>
        {table
          .getHeaderGroups()
          .map((headerGroup: HeaderGroup<TData>, index) => (
            <DataGridTableHeadRow headerGroup={headerGroup} key={index}>
              {headerGroup.headers.map((header, cellIndex) => {
                const { column } = header
                return (
                  <DataGridTableHeadRowCell header={header} key={cellIndex}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {props.tableLayout?.columnsResizable &&
                      column.getCanResize() && (
                        <DataGridTableHeadRowCellResize header={header} />
                      )}
                  </DataGridTableHeadRowCell>
                )
              })}
            </DataGridTableHeadRow>
          ))}
      </DataGridTableHead>

      {(props.tableLayout?.stripped || !props.tableLayout?.rowBorder) && (
        <DataGridTableRowSpacer />
      )}

      <DataGridTableBody>
        {props.loadingMode === 'skeleton' &&
        isLoading &&
        pagination?.pageSize ? (
          Array.from({ length: pagination.pageSize }).map((_, rowIndex) => (
            <DataGridTableBodyRowSkeleton key={rowIndex}>
              {table.getVisibleFlatColumns().map((column, colIndex) => (
                <DataGridTableBodyRowSkeletonCell
                  column={column}
                  key={colIndex}
                >
                  {column.columnDef.meta?.skeleton}
                </DataGridTableBodyRowSkeletonCell>
              ))}
            </DataGridTableBodyRowSkeleton>
          ))
        ) : table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row: Row<TData>) => (
            <Fragment key={row.id}>
              <DataGridTableBodyRow row={row}>
                {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                  <DataGridTableBodyRowCell cell={cell} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </DataGridTableBodyRowCell>
                ))}
              </DataGridTableBodyRow>
              {row.getIsExpanded() && (
                <DataGridTableBodyRowExpanded row={row} />
              )}
            </Fragment>
          ))
        ) : (
          <DataGridTableEmpty />
        )}
      </DataGridTableBody>
    </DataGridTableBase>
  )
}

export {
  DataGridTable,
  DataGridTableBase,
  DataGridTableBody,
  DataGridTableBodyRow,
  DataGridTableBodyRowCell,
  DataGridTableBodyRowExpanded,
  DataGridTableBodyRowSkeleton,
  DataGridTableBodyRowSkeletonCell,
  DataGridTableEmpty,
  DataGridTableHead,
  DataGridTableHeadRow,
  DataGridTableHeadRowCell,
  DataGridTableHeadRowCellResize,
  DataGridTableLoader,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
  DataGridTableRowSpacer,
}
