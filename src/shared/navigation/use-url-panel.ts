/**
 * Synchronise l'ouverture d'un panneau/modale avec un paramètre d'URL
 * (ADR-F20.2) : « tout est adressable par URL, panneaux compris ».
 *
 * Ouvrir un panneau sur une ligne donne `?open=<id>`. Bénéfices concrets :
 * - ouvrir dans un second onglet pour comparer deux fiches ;
 * - le bouton Retour du navigateur se comporte normalement ;
 * - le support peut dire « envoyez-moi votre URL ».
 *
 * L'état d'ouverture vit dans l'URL, **pas** dans un `useState` isolé.
 */

import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface UrlPanel {
  /** Valeur courante du paramètre (l'`id` ouvert), ou `null`. */
  value: string | null
  /** `true` si un panneau est ouvert. */
  isOpen: boolean
  /** Ouvre le panneau sur `id` (écrit `?<param>=<id>`). */
  open: (id: string) => void
  /** Ferme le panneau (retire le paramètre). */
  close: () => void
  /**
   * Adaptateur pour `onOpenChange` des primitives Radix (`Sheet`/`Dialog`) :
   * `false` ferme. Ouvrir passe par `open(id)` (il faut un id).
   */
  onOpenChange: (next: boolean) => void
}

/**
 * @param param nom du paramètre d'URL (défaut `open`).
 * Plusieurs panneaux sur une même page utilisent des noms distincts
 * (`?open=…&peek=…`).
 */
export function useUrlPanel(param = 'open'): UrlPanel {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(param)

  const open = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(param, id)
          return next
        },
        { replace: false }
      )
    },
    [param, setSearchParams]
  )

  const close = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete(param)
        return next
      },
      { replace: false }
    )
  }, [param, setSearchParams])

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!next) close()
    },
    [close]
  )

  return { value, isOpen: value !== null, open, close, onOpenChange }
}
