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
 *
 * ── CORRECTION du 21/08 : la barre passait DERRIÈRE le contenu ─────────────────
 * La barre est une SŒUR du contenu, posée en absolu, sans `z-index`. Tout ce qui
 * porte un `z-index` à l'intérieur — l'en-tête collant d'un tableau (`z-20`), une
 * colonne épinglée (`z-1`) — remontait donc au-dessus d'elle, parce que le
 * conteneur ne créait aucun contexte d'empilement.
 *
 * `isolate` sur le conteneur règle la classe entière du problème : les `z-index`
 * du contenu restent CONFINÉS à l'intérieur, et la barre, sœur suivante, passe
 * devant quoi qu'on y mette. Relever le `z-index` de la barre aurait marché une
 * fois, jusqu'à ce qu'une page y pose un `z-50`.
 *
 * ── AJOUT du 21/08 : la barre HORIZONTALE ──────────────────────────────────────
 * Le template n'en pose qu'une, verticale. Il en faut une seconde depuis qu'un
 * tableau peut être plus large que son panneau (colonnes redimensionnées) : sans
 * elle, le contenu déborde sans qu'on puisse l'atteindre. C'est aussi ce qui
 * permet à l'en-tête de tableau de COLLER — voir `data-grid.tsx`.
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
        className={cn(
          'isolate h-full w-full rounded-[inherit]',
          viewportClassName
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
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
        // ÉCART IMPOSÉ par ADR-F04 : le template écrit `border-l`, une propriété
        // PHYSIQUE. En arabe la barre passe à gauche et le filet se retrouverait du
        // mauvais côté. `border-s` vise le côté de DÉBUT — donc l'arête intérieure
        // de la barre dans les deux sens de lecture. Notre règle ESLint l'a refusé
        // avant que ça n'arrive à l'écran.
        orientation === 'vertical' &&
          'h-full w-2 border-s border-s-transparent p-[1px]',
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
