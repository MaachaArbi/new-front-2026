/**
 * ZONE DE TEXTE — prélevée de `vendor-metronic/full/src/components/ui/textarea.tsx`.
 *
 * Mêmes écarts que le champ de saisie, et pour les mêmes raisons (voir input.tsx) :
 * anneau de focus unique, désactivé neutre, lecture seule LISIBLE, survol de
 * bordure, placeholder à `--text-muted`, ombres retirées.
 *
 * Le template écrivait `[&[readonly]]:opacity-70` : une note de dossier en lecture
 * seule serait devenue pâle alors que c'est exactement ce qu'on vient lire.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'

const textareaVariants = cva(
  `bg-background border-border-strong text-ink w-full border
   transition-[color,border-color,box-shadow] duration-[120ms] ease-out
   placeholder:text-ink-muted
   hover:border-border-stronger
   focus-visible:border-fill-primary focus-visible:outline-hidden focus-visible:[box-shadow:var(--focus-ring)]
   disabled:border-border-disabled disabled:bg-fill-disabled disabled:text-ink-disabled disabled:cursor-not-allowed
   [&[readonly]]:bg-fill-disabled [&[readonly]]:cursor-default
   aria-invalid:border-fill-danger aria-invalid:focus-visible:[box-shadow:var(--focus-ring-danger)]`,
  {
    variants: {
      variant: {
        sm: 'rounded-md px-2.5 py-2.5 text-xs',
        md: 'text-2sm rounded-md px-3 py-3',
        lg: 'rounded-md px-4 py-4 text-sm',
      },
    },
    defaultVariants: { variant: 'md' },
  }
)

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
