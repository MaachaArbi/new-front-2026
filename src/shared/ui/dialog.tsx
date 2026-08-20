/**
 * DIALOGUE — prélevé de `vendor-metronic/full/src/components/ui/dialog.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. CENTRAGE. Le template écrit `left-[50%] top-[50%] translate-x-[-50%]` — des
 *     classes physiques, refusées par notre lint (ADR-F04). Ici le physique n'est
 *     pas une erreur du template : un dialogue se centre sur l'ÉCRAN, pas selon le
 *     sens de lecture. Mais plutôt que de désactiver la règle, on centre par
 *     `inset-0 m-auto` : même résultat, aucune direction en jeu, rien à désactiver.
 *
 *  2. `space-x-2.5` du pied devient `gap-x-2.5`. `space-x` pose une marge à GAUCHE
 *     de chaque enfant sauf le premier : en arabe, l'espacement des boutons se
 *     retrouve du mauvais côté et le dernier bouton colle au bord.
 *
 *  3. BOUTON DE FERMETURE : `opacity-60 hover:opacity-100` devient une couleur
 *     (`text-ink-muted` → `text-ink`), et il reçoit l'anneau de focus du système.
 *     Le template n'en donnait aucun : au clavier, on ne voyait pas où on était sur
 *     le seul élément qui permet de sortir.
 *
 *  4. Le libellé « Close » du lecteur d'écran est TRADUIT. En dur, il excluait
 *     l'utilisateur arabophone du seul bouton de sortie.
 *
 *  5. `export default DialogContent` au milieu du fichier : retiré. C'était un
 *     résidu — le composant est déjà exporté nommément en bas.
 */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

const dialogContentVariants = cva(
  'border-border bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed z-50 flex flex-col border p-6 shadow-lg shadow-shade outline-0 duration-200 sm:rounded-lg',
  {
    variants: {
      variant: {
        // `inset-0 m-auto` centre sur les deux axes sans jamais nommer un côté.
        default:
          'inset-0 m-auto h-fit max-h-[calc(100%-2.5rem)] w-full max-w-lg',
        fullscreen: 'inset-5',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-scrim fixed inset-0 z-50 [backdrop-filter:blur(4px)]',
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlay = true,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContentVariants> & {
    showCloseButton?: boolean
    overlay?: boolean
  }) {
  const intl = useIntl()

  return (
    <DialogPortal>
      {overlay && <DialogOverlay />}
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose className="text-ink-muted hover:text-ink focus-visible:border-fill-primary absolute end-5 top-5 cursor-pointer rounded-sm outline-0 transition-colors focus-visible:[box-shadow:var(--focus-ring)] focus-visible:outline-hidden disabled:pointer-events-none">
            <X className="size-4" />
            <span className="sr-only">
              {intl.formatMessage({ id: 'ui.close' })}
            </span>
          </DialogClose>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-header"
    className={cn(
      'mb-5 flex flex-col space-y-1 text-center sm:text-start',
      className
    )}
    {...props}
  />
)

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      'flex flex-col-reverse pt-5 sm:flex-row sm:justify-end sm:gap-x-2.5',
      className
    )}
    {...props}
  />
)

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'text-ink text-lg leading-none font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  )
}

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="dialog-body" className={cn('grow', className)} {...props} />
)

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-ink-muted text-2sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
