import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout21 } from '@/shared/layout'
import { ModulePage } from './pages/module-page'

// Routage minimal (S3b §6) : une route par module + entrées. Pas de route
// protégée, pas de lazy — vagues ultérieures (S6+). Une page « large »
// (catalogue) démontre le mode large (ADR-F02) via `useWideMode` dans ModulePage.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout21 />}>
        <Route index element={<Navigate to="/parties" replace />} />
        <Route path=":module" element={<ModulePage />} />
        <Route path=":module/*" element={<ModulePage />} />
      </Route>
    </Routes>
  )
}
