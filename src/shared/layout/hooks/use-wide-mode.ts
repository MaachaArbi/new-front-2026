import { useEffect } from 'react'
import { useLayout } from '../components/context'

/**
 * Mode large (ADR-F02). Une page déclare `useWideMode()` : la barre latérale se
 * replie (le rail reste visible), sans écraser la préférence manuelle de
 * l'utilisateur, qui reprend dès qu'on quitte la page. Un seul chemin de code,
 * aucun second layout.
 */
export function useWideMode(enabled = true) {
  const { setPageWide } = useLayout()
  useEffect(() => {
    setPageWide(enabled)
    return () => setPageWide(false)
  }, [enabled, setPageWide])
}
