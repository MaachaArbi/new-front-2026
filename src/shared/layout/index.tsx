import { useLocation } from 'react-router-dom'
import { useI18n } from '@/app/providers/i18n-provider'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { moduleFromPath } from './menu.config'
import { LayoutProvider } from './components/context'
import { Wrapper } from './components/wrapper'

// Prélevé de layout-21/index.tsx. Adaptations S3b :
//  - `react-helmet-async` (retiré en S3a) → hook maison `useDocumentTitle` ;
//  - titre de page traduit depuis la route (i18n).
export function Layout21() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const activeModule = moduleFromPath(pathname)

  const title = activeModule
    ? `${t(activeModule.titleKey)} — OS-TRAVEL`
    : 'OS-TRAVEL'
  useDocumentTitle(title)

  return (
    <LayoutProvider bodyClassName="lg:bg-muted lg:overflow-hidden">
      <Wrapper />
    </LayoutProvider>
  )
}
