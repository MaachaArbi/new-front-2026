import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout21 } from '@/shared/layout'
import { ModulePage } from './pages/module-page'
import { DevUxPage } from './pages/dev-ux'
import { DevShortcutsPage } from './pages/dev-shortcuts'
import { DevRefPage } from './pages/dev-ref'
import { PartyListPage } from '@/modules/party/party-list-page'
import { PartyDetailPage } from '@/modules/party/party-detail-page'

// Routage minimal (S3b §6) : une route par module + entrées. Pas de route
// protégée, pas de lazy — vagues ultérieures (S6+). Une page « large »
// (catalogue) démontre le mode large (ADR-F02) via `useWideMode` dans ModulePage.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout21 />}>
        <Route index element={<Navigate to="/parties" replace />} />
        {/* Page de démonstration UX temporaire (S5-UX) — route statique, placée
            avant le catch-all :module. À retirer avec les écrans métier (backlog). */}
        <Route path="_dev/ux" element={<DevUxPage />} />
        {/* Page pédagogique des raccourcis clavier (S-design), temporaire. */}
        <Route path="_dev/shortcuts" element={<DevShortcutsPage />} />
        {/* JETABLE — copie fidèle de la maquette CRM de référence, à supprimer. */}
        <Route path="_ref" element={<DevRefPage />} />
        {/* Premier écran métier réel (V1) — les tiers en lecture. */}
        <Route path="parties" element={<PartyListPage />} />
        {/* Page dossier d'un tiers (hub 360°, scaffoldé). */}
        <Route path="parties/:publicId" element={<PartyDetailPage />} />
        <Route path=":module" element={<ModulePage />} />
        <Route path=":module/*" element={<ModulePage />} />
      </Route>
    </Routes>
  )
}
