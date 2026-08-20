/**
 * TABLEAU DE DONNÉES — l'en-tête d'une colonne.
 * Prélevé de `vendor-metronic/full/src/components/ui/data-grid-column-header.tsx`.
 *
 * Trois formes selon ce que la colonne permet :
 *   · un simple libellé si elle ne fait rien ;
 *   · un bouton de tri si elle est triable ;
 *   · un menu si elle est épinglable, déplaçable, masquable ou filtrable.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. **`moveColumn('left' | 'right')` devient `('start' | 'end')`** — troisième
 *     occurrence du même défaut (après `indicatorPosition` et `side`). Déplacer
 *     une colonne « à gauche », c'est la remonter dans l'ORDRE ; en arabe l'ordre
 *     va vers la droite. Le libellé du menu disait donc l'inverse de ce que
 *     l'action faisait.
 *
 *  2. Les flèches directionnelles se retournent en RTL (`rtl:-scale-x-100`). Le
 *     template les laissait pointer du même côté dans les deux sens de lecture.
 *
 *  3. **Tous les libellés sont traduits** — « Asc », « Desc », « Pin to left »,
 *     « Move to Left », « Columns » étaient en dur.
 *
 *  4. Hauteurs sur `--ui-row-sm`, texte en `text-2sm` : l'en-tête suit la densité
 *     comme le reste.
 */
import { type HTMLAttributes, type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import type { Column } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  Check,
  ChevronsUpDown,
  PinOff,
  Settings2,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useDataGrid } from '@/shared/ui/data-grid'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'

/** Côté de LECTURE, pas côté d'écran : « start » = vers le début de l'ordre. */
type MoveSide = 'start' | 'end'

interface DataGridColumnHeaderProps<
  TData,
  TValue,
> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title?: string
  icon?: ReactNode
  pinnable?: boolean
  filter?: ReactNode
  visibility?: boolean
}

/** Une flèche qui désigne un sens de lecture doit se retourner en arabe. */
const FLIP = 'rtl:-scale-x-100'

function DataGridColumnHeader<TData, TValue>({
  column,
  title = '',
  icon,
  className,
  filter,
  visibility = false,
}: DataGridColumnHeaderProps<TData, TValue>) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const { isLoading, table, props, recordCount } = useDataGrid()

  const moveColumn = (direction: MoveSide) => {
    const currentOrder = [...table.getState().columnOrder]
    const currentIndex = currentOrder.indexOf(column.id)
    const target = direction === 'start' ? currentIndex - 1 : currentIndex + 1
    if (target < 0 || target >= currentOrder.length) return

    const newOrder = [...currentOrder]
    const [moved] = newOrder.splice(currentIndex, 1)
    if (moved === undefined) return
    newOrder.splice(target, 0, moved)
    table.setColumnOrder(newOrder)
  }

  const canMove = (direction: MoveSide): boolean => {
    const currentIndex = table.getState().columnOrder.indexOf(column.id)
    return direction === 'start'
      ? currentIndex > 0
      : currentIndex < table.getState().columnOrder.length - 1
  }

  const headerLabel = () => (
    <div
      className={cn(
        'text-ink-secondary text-2sm inline-flex h-full items-center gap-1.5 font-normal [&_svg]:size-3.5 [&_svg]:opacity-60',
        className
      )}
    >
      {icon}
      {title}
    </div>
  )

  const headerButton = () => (
    <Button
      variant="ghost"
      className={cn(
        'text-ink-secondary hover:bg-secondary hover:text-ink data-[state=open]:bg-secondary data-[state=open]:text-ink -ms-2 h-(--ui-row-sm) rounded-md px-2 font-normal',
        className
      )}
      disabled={isLoading || recordCount === 0}
      onClick={() => {
        const isSorted = column.getIsSorted()
        if (isSorted === 'asc') column.toggleSorting(true)
        else if (isSorted === 'desc') column.clearSorting()
        else column.toggleSorting(false)
      }}
    >
      {icon}
      {title}
      {column.getCanSort() &&
        (column.getIsSorted() === 'desc' ? (
          <ArrowDown className="mt-px size-[0.7rem]!" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="mt-px size-[0.7rem]!" />
        ) : (
          <ChevronsUpDown className="mt-px size-[0.7rem]!" />
        ))}
    </Button>
  )

  const headerPin = () => (
    <Button
      mode="icon"
      size="sm"
      variant="ghost"
      className="-me-1 rounded-md"
      onClick={() => column.pin(false)}
      aria-label={intl.formatMessage({ id: 'ui.table.unpin' }, { title })}
      title={intl.formatMessage({ id: 'ui.table.unpin' }, { title })}
    >
      <PinOff className="size-3.5! opacity-50!" aria-hidden="true" />
    </Button>
  )

  const tick = <Check className="text-primary size-4 opacity-100!" />

  const headerControls = () => (
    <div className="flex h-full items-center justify-between gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{headerButton()}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="start">
          {filter && <DropdownMenuLabel>{filter}</DropdownMenuLabel>}
          {filter &&
            (column.getCanSort() || column.getCanPin() || visibility) && (
              <DropdownMenuSeparator />
            )}

          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  column.getIsSorted() === 'asc'
                    ? column.clearSorting()
                    : column.toggleSorting(false)
                }
              >
                <ArrowUp className="size-3.5!" />
                <span className="grow">{t('ui.table.sortAsc')}</span>
                {column.getIsSorted() === 'asc' && tick}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  column.getIsSorted() === 'desc'
                    ? column.clearSorting()
                    : column.toggleSorting(true)
                }
              >
                <ArrowDown className="size-3.5!" />
                <span className="grow">{t('ui.table.sortDesc')}</span>
                {column.getIsSorted() === 'desc' && tick}
              </DropdownMenuItem>
            </>
          )}

          {(filter || column.getCanSort()) &&
            (column.getCanSort() || column.getCanPin() || visibility) && (
              <DropdownMenuSeparator />
            )}

          {props.tableLayout?.columnsPinnable && column.getCanPin() && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  column.pin(column.getIsPinned() === 'left' ? false : 'left')
                }
              >
                <ArrowLeftToLine
                  className={cn('size-3.5!', FLIP)}
                  aria-hidden="true"
                />
                <span className="grow">{t('ui.table.pinStart')}</span>
                {column.getIsPinned() === 'left' && tick}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  column.pin(column.getIsPinned() === 'right' ? false : 'right')
                }
              >
                <ArrowRightToLine
                  className={cn('size-3.5!', FLIP)}
                  aria-hidden="true"
                />
                <span className="grow">{t('ui.table.pinEnd')}</span>
                {column.getIsPinned() === 'right' && tick}
              </DropdownMenuItem>
            </>
          )}

          {props.tableLayout?.columnsMovable && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => moveColumn('start')}
                disabled={!canMove('start') || column.getIsPinned() !== false}
              >
                <ArrowLeft
                  className={cn('size-3.5!', FLIP)}
                  aria-hidden="true"
                />
                <span>{t('ui.table.moveStart')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => moveColumn('end')}
                disabled={!canMove('end') || column.getIsPinned() !== false}
              >
                <ArrowRight
                  className={cn('size-3.5!', FLIP)}
                  aria-hidden="true"
                />
                <span>{t('ui.table.moveEnd')}</span>
              </DropdownMenuItem>
            </>
          )}

          {props.tableLayout?.columnsVisibility &&
            visibility &&
            (column.getCanSort() || column.getCanPin() || filter) && (
              <DropdownMenuSeparator />
            )}

          {props.tableLayout?.columnsVisibility && visibility && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings2 className="size-3.5!" />
                <span>{t('ui.table.columns')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {table
                    .getAllColumns()
                    .filter(
                      (col) =>
                        typeof col.accessorFn !== 'undefined' &&
                        col.getCanHide()
                    )
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={col.getIsVisible()}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(value) =>
                          col.toggleVisibility(Boolean(value))
                        }
                      >
                        {col.columnDef.meta?.headerTitle ?? col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {props.tableLayout?.columnsPinnable &&
        column.getCanPin() &&
        column.getIsPinned() &&
        headerPin()}
    </div>
  )

  if (
    props.tableLayout?.columnsMovable ||
    (props.tableLayout?.columnsVisibility && visibility) ||
    (props.tableLayout?.columnsPinnable && column.getCanPin()) ||
    filter
  ) {
    return headerControls()
  }

  if (
    column.getCanSort() ||
    (props.tableLayout?.columnsResizable && column.getCanResize())
  ) {
    return <div className="flex h-full items-center">{headerButton()}</div>
  }

  return headerLabel()
}

export { DataGridColumnHeader, type DataGridColumnHeaderProps }
