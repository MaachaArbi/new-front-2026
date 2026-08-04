/**
 * `useReferentials` — charge les listes fermées une fois puis les garde en cache
 * pour toute la session (`staleTime: Infinity`). Le gain vient de « ne pas
 * redemander » (§2.8), pas de la pagination. `codeLabel` résout un code en libellé.
 */

import { useQuery } from '@tanstack/react-query'
import { fetchReferentials, type ReferentialItem } from './api'

const REFERENTIALS_KEY = 'referentials'

export function useReferentials() {
  return useQuery({
    queryKey: [REFERENTIALS_KEY],
    queryFn: fetchReferentials,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/** Construit une fonction code → libellé à partir d'une liste de référentiel. */
export function codeLabel(
  items: readonly ReferentialItem[] | undefined
): (code: string) => string {
  const map = new Map((items ?? []).map((item) => [item.code, item.label]))
  return (code: string) => map.get(code) ?? code
}
