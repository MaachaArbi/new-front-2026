/**
 * SÉPARATEUR — prélevé tel quel de
 * `vendor-metronic/full/src/components/ui/separator.tsx`. Seul le chemin d'import
 * change. `decorative` par défaut à `true` : un trait qui ne sépare que
 * visuellement ne doit pas être annoncé par un lecteur d'écran.
 */
import * as React from 'react'
import { Separator as SeparatorPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
}

export { Separator }
