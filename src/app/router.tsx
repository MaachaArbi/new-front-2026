import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/shared/layout'

/**
 * Routage — la coquille et rien d'autre pour l'instant.
 *
 * Les écrans naîtront un par un, chacun après son cadrage. `*` renvoie sur un repère
 * neutre : la coquille se juge sans contenu, c'est même le seul moment où elle se
 * juge honnêtement.
 */
export function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="*" element={<Blank />} />
      </Route>
    </Routes>
  )
}

function Blank() {
  return (
    <div className="px-4 lg:px-7.5">
      <div className="border-border text-muted-foreground text-2sm flex min-h-[60vh] items-center justify-center rounded-xl border border-dashed">
        La coquille est en place — les écrans viendront un par un.
      </div>
    </div>
  )
}
