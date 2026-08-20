/**
 * TABLEAU DE DONNÉES — la pagination.
 * Prélevée de `vendor-metronic/full/src/components/ui/data-grid-pagination.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. **« 1 – 25 sur 128 » est isolé en LTR.** C'est la leçon des montants qui se
 *     réordonnaient : dans un paragraphe arabe, une suite de nombres séparés par
 *     des tirets est réagencée par l'algorithme bidi — « 1 – 25 sur 128 »
 *     devenait « 128 sur 25 – 1 ». La page affichée mentait sur elle-même.
 *
 *  2. `indicatorPosition="right"` devient `"end"` : notre sélecteur a été corrigé
 *     ce matin, l'ancienne valeur n'existe plus.
 *
 *  3. `space-x-*` → `gap-x-*` (marge à gauche ⇒ mauvais côté en arabe).
 *
 *  4. Tailles des boutons sur `--ui-row-sm`, textes en `text-2sm`.
 *
 *  5. Libellés traduits, y compris ceux des lecteurs d'écran.
 */
import { type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useDataGrid } from '@/shared/ui/data-grid'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'

interface DataGridPaginationProps {
  sizes?: number[]
  sizesLabel?: string
  sizesSkeleton?: ReactNode
  more?: boolean
  moreLimit?: number
  infoSkeleton?: ReactNode
  className?: string
}

function DataGridPagination(props: DataGridPaginationProps) {
  const intl = useIntl()
  const { table, recordCount, isLoading } = useDataGrid()

  const merged: DataGridPaginationProps = {
    sizes: [10, 25, 50, 100],
    sizesSkeleton: <Skeleton className="h-(--ui-row) w-44" />,
    infoSkeleton: <Skeleton className="h-(--ui-row) w-60" />,
    moreLimit: 5,
    more: false,
    ...props,
  }

  const btnBase = 'size-(--ui-row-sm) p-0 text-2sm'
  // Les chevrons pointent vers une page « précédente » / « suivante » : ce sens
  // suit la lecture, donc ils se retournent en arabe.
  const btnArrow = cn(btnBase, 'rtl:rotate-180')

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const from = recordCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, recordCount)
  const pageCount = table.getPageCount()

  const moreLimit = merged.moreLimit ?? 5
  const groupStart = Math.floor(pageIndex / moreLimit) * moreLimit
  const groupEnd = Math.min(groupStart + moreLimit, pageCount)

  const pageButtons = () => {
    const buttons = []
    for (let i = groupStart; i < groupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          mode="icon"
          variant="ghost"
          dir="ltr"
          className={cn(
            btnBase,
            'text-ink-muted tabular-nums',
            pageIndex === i && 'bg-accent text-ink'
          )}
          onClick={() => pageIndex !== i && table.setPageIndex(i)}
        >
          {i + 1}
        </Button>
      )
    }
    return buttons
  }

  return (
    <div
      data-slot="data-grid-pagination"
      className={cn(
        'flex grow flex-col flex-wrap items-center justify-between gap-2.5 py-2.5 sm:flex-row sm:py-0',
        merged.className
      )}
    >
      <div className="order-2 flex flex-wrap items-center gap-x-2.5 pb-2.5 sm:order-1 sm:pb-0">
        {isLoading ? (
          merged.sizesSkeleton
        ) : (
          <>
            <div className="text-ink-muted text-2sm">
              {merged.sizesLabel ??
                intl.formatMessage({ id: 'ui.table.rowsPerPage' })}
            </div>
            <Select
              value={`${pageSize}`}
              indicatorPosition="end"
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-fit" size="sm">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-[50px]">
                {merged.sizes?.map((size: number) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <div className="order-1 flex flex-col items-center justify-center gap-2.5 sm:order-2 sm:flex-row sm:justify-end sm:pt-0">
        {isLoading ? (
          merged.infoSkeleton
        ) : (
          <>
            {/* Isolé : sans ça, « 1 – 25 sur 128 » se réagence en arabe. */}
            <div
              dir="ltr"
              className="text-ink-muted text-2sm order-2 text-nowrap tabular-nums [unicode-bidi:isolate] sm:order-1"
            >
              {intl.formatMessage(
                { id: 'ui.table.range' },
                { from, to, count: recordCount }
              )}
            </div>
            {pageCount > 1 && (
              <div className="order-1 flex items-center gap-x-1 sm:order-2">
                <Button
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className={btnArrow}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">
                    {intl.formatMessage({ id: 'ui.table.previousPage' })}
                  </span>
                  <ChevronLeftIcon className="size-4" />
                </Button>

                {groupStart > 0 && (
                  <Button
                    size="sm"
                    mode="icon"
                    variant="ghost"
                    className={btnBase}
                    onClick={() => table.setPageIndex(groupStart - 1)}
                  >
                    …
                  </Button>
                )}

                {pageButtons()}

                {groupEnd < pageCount && (
                  <Button
                    size="sm"
                    mode="icon"
                    variant="ghost"
                    className={btnBase}
                    onClick={() => table.setPageIndex(groupEnd)}
                  >
                    …
                  </Button>
                )}

                <Button
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className={btnArrow}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">
                    {intl.formatMessage({ id: 'ui.table.nextPage' })}
                  </span>
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export { DataGridPagination, type DataGridPaginationProps }
