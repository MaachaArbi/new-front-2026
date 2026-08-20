/**
 * CASE À COCHER — prélevée de `vendor-metronic/full/src/components/ui/checkbox.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. DÉSACTIVÉ neutre, jamais `opacity-50`. Et surtout : **une case désactivée
 *     doit encore montrer si elle est cochée.** Le template appliquait l'opacité à
 *     tout le contrôle — coche comprise — de sorte qu'on ne pouvait plus lire
 *     l'état. C'est le même principe que la lecture seule du champ de saisie :
 *     indisponible ne veut pas dire illisible. La coche désactivée est donc à
 *     `--text-muted` (4,7:1), pas à `--text-disabled`.
 *
 *  2. Anneau de focus unique du système, sans `ring-offset`.
 *
 *  3. L'invalide passe aux jetons de danger, sans fractions d'opacité.
 *
 * ── NON adapté, délibérément ───────────────────────────────────────────────────
 * Les tailles restent FIXES (18 / 20 / 22 px) et ne suivent pas `--ui-row`. Une
 * case n'est pas un contrôle de ligne : à la densité « confort » elle deviendrait
 * un carré de 40 px. C'est la prop `size` qui la fait varier, pas la densité.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Minus } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

const checkboxVariants = cva(
  `group peer bg-background border-border-strong shrink-0 rounded-md border
   transition-[background-color,border-color,box-shadow] duration-[120ms] ease-out
   hover:border-border-stronger
   focus-visible:border-fill-primary focus-visible:outline-hidden focus-visible:[box-shadow:var(--focus-ring)]
   data-[state=checked]:border-fill-primary data-[state=checked]:bg-fill-primary data-[state=checked]:text-on-primary
   data-[state=indeterminate]:border-fill-primary data-[state=indeterminate]:bg-fill-primary data-[state=indeterminate]:text-on-primary
   disabled:border-border-disabled disabled:bg-fill-disabled disabled:text-ink-muted disabled:cursor-not-allowed
   disabled:data-[state=checked]:border-border-disabled disabled:data-[state=checked]:bg-fill-disabled disabled:data-[state=checked]:text-ink-muted
   disabled:data-[state=indeterminate]:border-border-disabled disabled:data-[state=indeterminate]:bg-fill-disabled disabled:data-[state=indeterminate]:text-ink-muted
   aria-invalid:border-fill-danger aria-invalid:focus-visible:[box-shadow:var(--focus-ring-danger)]
   [[data-invalid=true]_&]:border-fill-danger`,
  {
    variants: {
      size: {
        sm: 'size-4.5 [&_svg]:size-3',
        md: 'size-5 [&_svg]:size-3.5',
        lg: 'size-5.5 [&_svg]:size-4',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

function Checkbox({
  className,
  size,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="group-data-[state=indeterminate]:hidden" />
        <Minus className="hidden group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }
