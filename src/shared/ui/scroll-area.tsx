'use client'

import * as React from 'react'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/cn'

/**
 * Zone défilante — **prélevée telle quelle** de
 * `vendor-metronic/starter-kit/src/components/ui/scroll-area.tsx`.
 *
 * Seule adaptation : le chemin d'import de `cn`. Aucune classe, aucune valeur, aucune
 * structure n'a été retouchée — c'est la condition pour que la coquille soit
 * réellement « à l'identique » (ADR-F01 : Metronic est une source, on la copie).
 *
 * Pourquoi ce composant plutôt que `overflow-y-auto` : la barre native du système
 * **prend 15 px de largeur** et affiche ses flèches. Celle-ci est posée en
 * surimpression, ne consomme rien, et n'apparaît qu'au défilement.
 */
function ScrollArea({
  className,
  viewportClassName,
  children,
  viewportRef,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportRef?: React.Ref<HTMLDivElement>
  viewportClassName?: string
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className={cn('h-full w-full rounded-[inherit]', viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none transition-colors select-none',
        orientation === 'vertical' &&
          'h-full w-2 border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' &&
          'h-2 flex-col border-t border-t-transparent p-[1px]',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
