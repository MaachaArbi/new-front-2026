/**
 * FIL D'ARIANE — prélevé de
 * `vendor-metronic/full/src/components/ui/breadcrumb.tsx`.
 *
 * Le template le livre déjà RTL-correct : son chevron porte `rtl:rotate-180`.
 * C'est rare, et ça mérite d'être noté — le reste du paquet ne l'est pas.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. `aria-label="breadcrumb"` était en dur, en anglais. Traduit : c'est le
 *     libellé qui annonce la navigation au lecteur d'écran.
 *  2. Idem pour le « More » de l'ellipse.
 *  3. `text-sm` → `text-2sm` : le fil vit dans la barre du haut, à 13 px comme
 *     le reste de la coquille.
 *  4. La prop `separator` de `Breadcrumb` n'était **jamais lue** — un résidu.
 *     Retirée : une prop qui ne fait rien finit par être utilisée en croyant
 *     qu'elle marche.
 */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { Slot as SlotPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

function Breadcrumb(props: React.ComponentProps<'nav'>) {
  const intl = useIntl()
  return (
    <nav
      data-slot="breadcrumb"
      aria-label={intl.formatMessage({ id: 'ui.breadcrumb' })}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'text-ink-muted text-2sm flex flex-wrap items-center gap-1.5 break-words',
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : 'a'

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('hover:text-ink transition-colors', className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-ink font-normal', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight className="rtl:rotate-180" />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  const intl = useIntl()
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">{intl.formatMessage({ id: 'ui.more' })}</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
