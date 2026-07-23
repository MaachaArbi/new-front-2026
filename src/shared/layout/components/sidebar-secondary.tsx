import { useLocation } from 'react-router-dom'
import { useI18n } from '@/app/providers/i18n-provider'
import { moduleFromPath } from '../menu.config'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { SidebarHeader } from './sidebar-header'
import { SidebarSearch } from './sidebar-search'
import { SidebarPrimaryMenu } from './sidebar-primary-menu'

// Réécrit de layout-21/components/sidebar-secondary.tsx : on garde l'ossature
// (en-tête + zone défilante) mais les sections de démonstration
// (workspaces / communities / resources) sont retirées — elles n'ont pas
// d'équivalent dans le domaine OS-TRAVEL. La barre affiche le nom du module
// courant en clair (ADR-F02) puis son menu.
export function SidebarSecondary() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const activeModule = moduleFromPath(pathname)

  return (
    <div className="border-border bg-background overflow-hidden border lg:rounded-s-xl">
      <SidebarHeader />
      <ScrollArea className="mt-0 mb-2.5 h-[calc(100vh-4.5rem)] shrink-0 lg:h-[calc(100vh-5.5rem)]">
        <SidebarSearch />

        {/* Nom du module courant en clair — une icône seule est ambiguë (ADR-F02) */}
        <div className="px-5 pt-3.5 pb-1">
          <span className="text-foreground text-sm font-semibold">
            {activeModule ? t(activeModule.titleKey) : ''}
          </span>
        </div>

        <SidebarPrimaryMenu />
      </ScrollArea>
    </div>
  )
}
