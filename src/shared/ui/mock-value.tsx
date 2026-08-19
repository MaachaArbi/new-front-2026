import * as React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * VALEUR ENCORE STATIQUE — marquée à l'écran, et comptée.
 *
 * Depuis le 19/08 on conçoit chaque page COMPLÈTE, sans attendre que l'API sache la
 * remplir : c'est ce qui a débloqué le travail, des écrans à moitié vides ne se jugent
 * pas. Le danger est immédiat et connu : une valeur inventée qui ressemble en tout
 * point à une valeur réelle finit en production sans que personne ne s'en aperçoive.
 *
 * D'où ce composant. Il fait deux choses, et c'est tout :
 *  - il SOULIGNE la valeur en pointillé, pour qu'un coup d'œil suffise à la distinguer ;
 *  - il se DÉCLARE, pour qu'un compteur d'en-tête totalise ce qui reste à brancher.
 *
 * Le soulignement est volontairement neutre, pas ambré : c'est un repère de chantier,
 * pas une alerte. Il ne doit jamais rivaliser avec la sévérité d'une vraie anomalie.
 *
 * `reason` n'est pas décoratif — c'est ce qui permettra de chiffrer le reste à faire
 * sans relire tous les écrans. Écrire « API absente » suffit rarement : dire QUELLE
 * donnée manque et de quel module elle viendra rend l'inventaire exploitable.
 */

interface Registry {
  register: (id: string, reason: string) => void
  unregister: (id: string) => void
}

const RegistryContext = React.createContext<Registry | null>(null)
const CountContext = React.createContext<number>(0)

export function MockValueProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<ReadonlyMap<string, string>>(
    () => new Map()
  )

  const registry = React.useMemo<Registry>(
    () => ({
      register: (id, reason) =>
        setEntries((current) => {
          if (current.get(id) === reason) return current
          const next = new Map(current)
          next.set(id, reason)
          return next
        }),
      unregister: (id) =>
        setEntries((current) => {
          if (!current.has(id)) return current
          const next = new Map(current)
          next.delete(id)
          return next
        }),
    }),
    []
  )

  return (
    <RegistryContext.Provider value={registry}>
      <CountContext.Provider value={entries.size}>
        {children}
      </CountContext.Provider>
    </RegistryContext.Provider>
  )
}

/** Nombre de valeurs statiques actuellement à l'écran. */
export function useMockCount(): number {
  return React.useContext(CountContext)
}

export function MockValue({
  reason,
  className,
  children,
}: {
  /** Ce qui manque, et d'où ça viendra — « encours : module Règlements ». */
  reason: string
  className?: string
  children: React.ReactNode
}) {
  const registry = React.useContext(RegistryContext)
  const id = React.useId()

  React.useEffect(() => {
    if (!registry) return
    registry.register(id, reason)
    return () => registry.unregister(id)
  }, [registry, id, reason])

  return (
    <span
      data-mock="true"
      title={reason}
      className={cn(
        'decoration-input [text-decoration-line:underline] decoration-dashed underline-offset-4',
        className
      )}
    >
      {children}
    </span>
  )
}
