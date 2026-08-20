import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/shared/layout'
import { DesignSidebar } from '@/design/design-sidebar'
import { DesignPage } from '@/design/design-page'
import { PartiesListPage } from '@/modules/parties/parties-list-page'

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
      {/* Le système de design occupe la MÊME coquille : seul le menu de gauche
          change. C'est la condition pour juger un composant dans son décor réel. */}
      <Route element={<Layout nav={<DesignSidebar />} />}>
        <Route path="/design" element={<DesignPage />} />
        <Route path="/design/:componentId" element={<DesignPage />} />
      </Route>
      <Route element={<Layout />}>
        {/* Premier écran réel. STATIQUE : fixtures en mémoire, aucune API
            (règle du 20/08). Ce qui manque est au registre. */}
        <Route path="/parties" element={<PartiesListPage />} />
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
