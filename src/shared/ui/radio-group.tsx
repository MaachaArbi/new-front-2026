'use client'

import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

/**
 * BOUTONS RADIO — un choix exclusif dont toutes les options tiennent à l'écran.
 *
 * Quand les préférer à une liste déroulante : dès que les options sont peu nombreuses
 * et courtes. Une liste demande deux clics et ne montre qu'une valeur à la fois ;
 * l'utilisateur ne voit pas ce qu'il refuse. Deux ou trois options se lisent d'un coup.
 * Au-delà de cinq, l'inverse est vrai — la liste redevient le bon outil.
 *
 * Le point noir est dessiné avec `bg-current` : il hérite de la couleur du bouton, donc
 * une seule règle décide de la teinte à l'état coché.
 */

export function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-2.5', className)}
      {...props}
    />
  )
}

export function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs shadow-black/5 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="size-2 rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

/** Une option — même forme que `SelectField`, pour pouvoir passer de l'un à l'autre. */
export type RadioOption = { code: string; label: string; hint?: string }

/**
 * Le cas courant : un libellé, puis les options les unes sous les autres.
 *
 * `orientation="horizontal"` met les options sur une ligne — lisible tant qu'elles sont
 * deux ou trois et courtes.
 */
export function RadioField({
  label,
  value,
  onChange,
  options,
  orientation = 'vertical',
  disabled,
  className,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: readonly RadioOption[]
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  className?: string
}) {
  const id = React.useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label !== undefined ? (
        <span className="text-muted-foreground text-sm">{label}</span>
      ) : null}
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        aria-label={label}
        className={orientation === 'horizontal' ? 'flex flex-wrap gap-5' : ''}
      >
        {options.map((option) => (
          <label
            key={option.code}
            htmlFor={`${id}-${option.code}`}
            className="flex cursor-pointer items-start gap-2"
          >
            <RadioGroupItem
              id={`${id}-${option.code}`}
              value={option.code}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-foreground text-2sm">{option.label}</span>
              {option.hint ? (
                <span className="text-muted-foreground text-xs">
                  {option.hint}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
