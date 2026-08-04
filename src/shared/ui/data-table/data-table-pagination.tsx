import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

/** Fenêtre de pages compacte (par groupes de `windowSize`). */
const WINDOW = 5

/** Défauts du « plugin » — surchargeables par page. Tailles ≤ 100 (limite serveur). */
export const DATA_TABLE_PAGE_SIZES = [10, 20, 50, 100] as const
export const DATA_TABLE_DEFAULT_PAGE_SIZE = 10

export interface DataTablePaginationProps {
  /** Page courante (base 0). */
  pageIndex: number
  pageCount: number
  pageSize: number
  /** Tailles proposées — plafonnées à 100 (limite serveur). */
  pageSizes?: readonly number[]
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (size: number) => void
  /** Libellé « Lignes par page » (i18n, fourni par l'écran). */
  rowsPerPageLabel: string
  /** Info pré-formatée, ex. « 1–20 sur 50 606 que vous pouvez voir ». */
  info: string
  prevLabel: string
  nextLabel: string
  className?: string
}

/**
 * Pagination partagée (motif template) : sélecteur « lignes par page » (≤ 100,
 * limite serveur) + info + strip de pages compact. **Contrôlée** : elle ne connaît
 * ni TanStack ni l'i18n, l'écran lui passe les valeurs et les libellés → réutilisable
 * partout. Pagination **serveur** : chaque changement déclenche une requête.
 */
export function DataTablePagination({
  pageIndex,
  pageCount,
  pageSize,
  pageSizes = DATA_TABLE_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  rowsPerPageLabel,
  info,
  prevLabel,
  nextLabel,
  className,
}: DataTablePaginationProps) {
  const groupStart = Math.floor(pageIndex / WINDOW) * WINDOW
  const groupEnd = Math.min(groupStart + WINDOW, pageCount)
  const pages: number[] = []
  for (let i = groupStart; i < groupEnd; i++) pages.push(i)

  const arrow = 'size-7 p-0 rtl:rotate-180'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-2.5 sm:flex-row',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground text-sm">
          {rowsPerPageLabel}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-16 justify-between"
            >
              {pageSize}
              <ChevronDown className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-16">
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              {pageSizes.map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>
                  {size}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground text-sm text-nowrap">
          {info}
        </span>
        {pageCount > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              className={arrow}
              disabled={pageIndex <= 0}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <span className="sr-only">{prevLabel}</span>
              <ChevronLeft className="size-4" />
            </Button>

            {groupStart > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                mode="icon"
                className="size-7 p-0"
                onClick={() => onPageChange(groupStart - 1)}
              >
                …
              </Button>
            ) : null}

            {pages.map((i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                mode="icon"
                className={cn(
                  'text-muted-foreground size-7 p-0',
                  pageIndex === i && 'bg-accent text-accent-foreground'
                )}
                onClick={() => onPageChange(i)}
              >
                {i + 1}
              </Button>
            ))}

            {groupEnd < pageCount ? (
              <Button
                variant="ghost"
                size="sm"
                mode="icon"
                className="size-7 p-0"
                onClick={() => onPageChange(groupEnd)}
              >
                …
              </Button>
            ) : null}

            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              className={arrow}
              disabled={pageIndex >= pageCount - 1}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              <span className="sr-only">{nextLabel}</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
