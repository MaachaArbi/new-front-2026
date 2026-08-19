import { SidebarHeader } from './sidebar-header'
import { SidebarNav } from './sidebar-nav'

/**
 * La colonne de navigation — une seule, désormais.
 *
 * Le rail d'icônes de modules a disparu : il imposait deux gestes pour atteindre un
 * écran (choisir le module, puis l'entrée) et sa colonne coûtait 70 px sur toute la
 * hauteur. Les modules sont maintenant des entrées comme les autres, groupées par
 * métier. Ce qu'on perd, et qu'il faut savoir : les carrés de couleur par module et
 * leur indicateur animé.
 */
export function SidebarSecondary() {
  return (
    <div className="border-sidebar-border bg-sidebar text-sidebar-foreground flex min-h-0 grow flex-col overflow-hidden border lg:rounded-s-xl">
      <SidebarHeader />
      <SidebarNav />
    </div>
  )
}
