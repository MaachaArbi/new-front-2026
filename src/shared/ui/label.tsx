/**
 * ÉTIQUETTE — prélevée de `vendor-metronic/full/src/components/ui/label.tsx`.
 *
 * Écarts : `opacity-50` sur `peer-disabled` devient la couleur de texte désactivée.
 * Même motif que partout ailleurs — une étiquette délavée se lit comme un rendu
 * inachevé ; une étiquette grise se lit comme un champ indisponible.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Label as LabelPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

const labelVariants = cva(
  'text-ink text-2sm leading-none peer-disabled:cursor-not-allowed peer-disabled:text-ink-disabled',
  {
    variants: {
      variant: { primary: 'font-medium', secondary: 'font-normal' },
    },
    defaultVariants: { variant: 'primary' },
  }
)

function Label({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Label, labelVariants }
