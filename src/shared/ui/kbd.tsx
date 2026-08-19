import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/** Touche de clavier — toujours `ltr` : `⌘K` ne se lit pas de droite à gauche. */
export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      dir="ltr"
      className={cn(
        'border-input text-muted-foreground text-2xs inline-flex items-center rounded border px-1.5 py-0.5 font-sans [unicode-bidi:isolate]',
        className
      )}
      {...props}
    />
  )
}
