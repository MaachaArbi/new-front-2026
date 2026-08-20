/**
 * BOUTONS RADIO — prélevés de
 * `vendor-metronic/full/src/components/ui/radio-group.tsx`.
 *
 * ── ÉCARTS ASSUMÉS ─────────────────────────────────────────────────────────────
 *
 *  1. La variante `mono` disparaît. Elle ne changeait RIEN dans le template — ses
 *     deux entrées `cva` étaient vides — mais son existence laissait croire à un
 *     choix. Le contexte qui la transportait suit : il ne reste que la taille.
 *
 *  2. DÉSACTIVÉ neutre, et **le point reste visible** : on doit encore pouvoir lire
 *     laquelle des options est retenue. Même principe que la case à cocher.
 *
 *  3. Anneau de focus unique, sans `ring-offset` ; invalide sur les jetons de danger.
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Circle } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

type RadioSize = 'sm' | 'md' | 'lg'

const radioGroupVariants = cva('grid gap-2.5', {
  variants: { size: { sm: '', md: '', lg: '' } },
  defaultVariants: { size: 'md' },
})

/** La taille se transmet du groupe aux options — on ne la répète pas sur chacune. */
const RadioGroupContext = React.createContext<{ size: RadioSize }>({
  size: 'md',
})

function RadioGroup({
  className,
  size,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> &
  VariantProps<typeof radioGroupVariants>) {
  return (
    <RadioGroupContext.Provider value={{ size: size ?? 'md' }}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn(radioGroupVariants({ size }), className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
}

const radioItemVariants = cva(
  `peer border-border-strong text-fill-primary aspect-square rounded-full border outline-hidden
   transition-[background-color,border-color,box-shadow] duration-[120ms] ease-out
   hover:border-border-stronger
   focus-visible:border-fill-primary focus-visible:[box-shadow:var(--focus-ring)]
   data-[state=checked]:border-fill-primary data-[state=checked]:bg-fill-primary data-[state=checked]:text-on-primary
   disabled:border-border-disabled disabled:bg-fill-disabled disabled:text-ink-muted disabled:cursor-not-allowed
   disabled:data-[state=checked]:border-border-disabled disabled:data-[state=checked]:bg-fill-disabled disabled:data-[state=checked]:text-ink-muted
   aria-invalid:border-fill-danger aria-invalid:focus-visible:[box-shadow:var(--focus-ring-danger)]
   [[data-invalid=true]_&]:border-fill-danger`,
  {
    variants: {
      size: {
        sm: 'size-4.5 [&_svg]:size-2',
        md: 'size-5 [&_svg]:size-2.5',
        lg: 'size-5.5 [&_svg]:size-3',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

function RadioGroupItem({
  className,
  size,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioItemVariants>) {
  const { size: contextSize } = React.useContext(RadioGroupContext)

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        radioItemVariants({ size: size ?? contextSize }),
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <Circle className="fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
