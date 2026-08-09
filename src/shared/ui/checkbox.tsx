'use client'

import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

/**
 * CASE À COCHER — un oui/non indépendant, ou une sélection multiple dans une liste.
 *
 * Comme pour la liste déroulante, la case native est peinte par le système : elle
 * arrive bleu Windows sur un poste, grise sur un autre, et ignore notre thème sombre.
 * Radix la redessine en gardant le clavier et les rôles ARIA.
 *
 * L'état **indéterminé** (le tiret) sert aux cases « tout sélectionner » posées au-dessus
 * d'une liste partiellement cochée — un tableau en aura besoin dès la première case de
 * sélection de lignes.
 */
export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'border-input focus-visible:border-ring focus-visible:ring-ring/30 peer size-4 shrink-0 rounded-[4px] border shadow-xs shadow-black/5 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white',
        'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-white',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === 'indeterminate' ? (
          <Minus className="size-3" strokeWidth={3} />
        ) : (
          <Check className="size-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

/** Le cas courant : une case suivie de son libellé, le tout cliquable. */
export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
  disabled,
  className,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
  disabled?: boolean
  className?: string
}) {
  const id = React.useId()
  return (
    <label
      htmlFor={id}
      className={cn('flex cursor-pointer items-start gap-2', className)}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-foreground text-2sm">{label}</span>
        {hint ? (
          <span className="text-muted-foreground text-xs">{hint}</span>
        ) : null}
      </span>
    </label>
  )
}
