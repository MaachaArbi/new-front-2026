import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

/**
 * BOUTON — première brique de la bibliothèque reprise.
 *
 * Née avec la densité : la hauteur vient de `--ui-row`, jamais d'un `h-9` écrit en
 * dur. C'est ce qui rend le réglage « très dense / confort » gratuit — l'ajouter après
 * coup aurait demandé de reprendre chaque composant.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-2sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-ink-foreground hover:bg-ink/90',
        outline:
          'border border-input bg-background text-foreground shadow-xs shadow-black/5 hover:bg-accent',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
      },
      mode: {
        default: 'px-3',
        icon: 'aspect-square p-0',
      },
    },
    defaultVariants: { variant: 'outline', mode: 'default' },
  }
)

export function Button({
  className,
  variant,
  mode,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type="button"
      data-slot="button"
      // La hauteur suit la densité ; `min-h` plutôt que `h` pour qu'un libellé qui
      // passe à la ligne ne soit jamais tronqué.
      style={{ minHeight: 'var(--ui-row)' }}
      className={cn(buttonVariants({ variant, mode }), className)}
      {...props}
    />
  )
}
