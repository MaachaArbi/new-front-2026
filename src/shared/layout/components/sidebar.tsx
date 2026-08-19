import { SidebarSecondary } from './sidebar-secondary'

/**
 * Une seule colonne de 238 px (voir `SidebarSecondary` pour le pourquoi du rail
 * supprimé). Propriétés logiques : correct en arabe sans règle supplémentaire.
 */
export function Sidebar() {
  return (
    <aside className="fixed start-0 top-(--page-margin) bottom-(--page-margin) z-20 flex w-(--sidebar-width) shrink-0 items-stretch overflow-hidden transition-all duration-300 in-data-[sidebar-open=false]:w-(--sidebar-collapsed-width)">
      <SidebarSecondary />
    </aside>
  )
}
