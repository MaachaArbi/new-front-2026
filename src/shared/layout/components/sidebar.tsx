import { SidebarPrimary } from './sidebar-primary'
import { SidebarSecondary } from './sidebar-secondary'

// Prélevé de layout-21/components/sidebar.tsx — inchangé (déjà en propriétés
// logiques : `start-0`, `w-(--sidebar-width)`).
export function Sidebar() {
  return (
    <aside className="fixed start-0 top-(--page-margin) bottom-(--page-margin) z-20 flex w-(--sidebar-width) shrink-0 items-stretch overflow-hidden transition-all duration-300 in-data-[sidebar-open=false]:w-(--sidebar-collapsed-width)">
      <SidebarPrimary />
      <SidebarSecondary />
    </aside>
  )
}
