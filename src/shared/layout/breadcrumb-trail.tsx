import * as React from 'react'

/**
 * FIL D'ARIANE — la page dit où elle se trouve.
 *
 * L'en-tête ne peut pas deviner le nom d'une fiche : il ne connaît que la route, et
 * `/parties/652a9d05-…` ne se lit pas. Une fiche ouverte affichait donc « Accueil /
 * Tiers », le même chemin que la liste — le fil d'Ariane ne servait à rien puisqu'il
 * ne distinguait pas les deux écrans.
 *
 * Chaque page pose donc son propre chemin. Le tableau est mémorisé par l'appelant
 * (`useMemo`) : sans ça, un nouveau tableau à chaque rendu relancerait l'effet en
 * boucle.
 */

export interface Crumb {
  readonly label: string
  /** Absent sur le dernier maillon : on ne met pas de lien vers la page courante. */
  readonly href?: string
}

const TrailContext = React.createContext<{
  trail: readonly Crumb[]
  setTrail: (trail: readonly Crumb[]) => void
} | null>(null)

export function BreadcrumbTrailProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [trail, setTrail] = React.useState<readonly Crumb[]>([])
  const value = React.useMemo(() => ({ trail, setTrail }), [trail])
  return <TrailContext.Provider value={value}>{children}</TrailContext.Provider>
}

export function useBreadcrumbTrail(): readonly Crumb[] {
  return React.useContext(TrailContext)?.trail ?? []
}

/** Pose le chemin de la page ; le retire en sortant, pour ne pas le laisser traîner. */
export function usePageBreadcrumb(trail: readonly Crumb[]): void {
  const context = React.useContext(TrailContext)
  const setTrail = context?.setTrail

  React.useEffect(() => {
    if (!setTrail) return
    setTrail(trail)
    return () => setTrail([])
  }, [setTrail, trail])
}
