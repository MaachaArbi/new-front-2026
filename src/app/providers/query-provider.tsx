import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

/**
 * État serveur via TanStack Query (ADR-013). `retry: false` : nos erreurs ont
 * une sémantique (401 → reconnexion géré par `authedRequest`, 403/404/422
 * métier) — on ne rejoue pas à l'aveugle. `refetchOnWindowFocus: false` pour ne
 * pas marteler l'API à chaque retour d'onglet.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
