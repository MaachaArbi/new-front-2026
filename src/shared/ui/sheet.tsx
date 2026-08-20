/**
 * FEUILLE LATÉRALE — prélevée de
 * `vendor-metronic/full/src/components/ui/sheet.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. `side` passe de `'left' | 'right'` à **`'start' | 'end'`** — exactement le
 *     même mensonge d'API que `indicatorPosition` sur le sélecteur : le template
 *     nomme la prop en physique alors qu'il émet déjà `start-0` / `end-0` et des
 *     surcharges `rtl:`. Demander `side="right"` ouvrait la feuille À GAUCHE en
 *     arabe. `top` et `bottom` restent, eux ne dépendent pas du sens de lecture.
 *     Défaut : `end` — un panneau de détail s'ouvre du côté où le regard finit.
 *
 *  2. `space-x-2` du pied devient `gap-x-2` (voir dialog.tsx, même motif RTL).
 *
 *  3. BOUTON DE FERMETURE : opacité → couleur, anneau de focus du système, et
 *     libellé de lecteur d'écran TRADUIT.
 *
 *  4. `items-strech` corrigé en `items-stretch`. Coquille du template : la classe
 *     n'existait pas, donc la règle ne s'appliquait pas.
 */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>
) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>
) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-scrim fixed inset-0 z-50 [backdrop-filter:blur(4px)]',
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = cva(
  'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-400 fixed z-50 flex flex-col items-stretch gap-4 p-6 shadow-lg transition ease-in-out',
  {
    variants: {
      side: {
        top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 border-b',
        bottom:
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 border-t',
        start:
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left rtl:data-[state=closed]:slide-out-to-right rtl:data-[state=open]:slide-in-from-right inset-y-0 start-0 h-full w-3/4 border-e sm:max-w-sm',
        end: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-left inset-y-0 end-0 h-full w-3/4 border-s sm:max-w-sm',
      },
    },
    defaultVariants: { side: 'end' },
  }
)

interface SheetContentProps
  extends
    React.ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  overlay?: boolean
  close?: boolean
}

function SheetContent({
  side = 'end',
  overlay = true,
  close = true,
  className,
  children,
  ...props
}: SheetContentProps) {
  const intl = useIntl()

  return (
    <SheetPortal>
      {overlay && <SheetOverlay />}
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {close && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="text-ink-muted hover:text-ink focus-visible:border-fill-primary absolute end-5 top-4 cursor-pointer rounded-sm transition-colors focus-visible:[box-shadow:var(--focus-ring)] focus-visible:outline-hidden disabled:pointer-events-none"
          >
            <X className="size-4" />
            <span className="sr-only">
              {intl.formatMessage({ id: 'ui.close' })}
            </span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'flex flex-col space-y-1 text-center sm:text-start',
        className
      )}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn('grow py-2.5', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-x-2',
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-ink text-base font-semibold', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-ink-muted text-2sm', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
