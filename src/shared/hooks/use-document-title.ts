import { useEffect } from 'react'

/**
 * Pose `document.title`. Remplace `react-helmet-async` (retiré en S3a, pair
 * incompatible React 19) — un hook de cinq lignes suffit pour un back-office
 * sans SSR. Restaure le titre précédent au démontage.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
