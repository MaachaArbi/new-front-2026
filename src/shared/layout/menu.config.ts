import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Clock,
  Settings,
  type LucideIcon,
} from 'lucide-react'

/**
 * Modèle de menu étendu — ADR-F19.
 *
 * Le `MenuItem` de Metronic ne portait qu'un `title` en dur, sans clé de
 * traduction ni ancrage de droits. On le redéfinit ici :
 *  - `titleKey` : clé i18n, jamais une chaîne d'interface en dur (ADR-F06)
 *  - `permission` / `entitlement` : DÉCLARÉS mais NON câblés en S3b — le gating
 *    réel arrive en S8. Les poser maintenant évite de retoucher toute la
 *    navigation plus tard (ADR-F08).
 */
export interface MenuItem {
  titleKey: string
  icon?: LucideIcon
  path?: string
  permission?: string
  entitlement?: string
  badgeKey?: string
  /** Badge numérique (compteur) — donnée, pas une chaîne d'interface. */
  badgeCount?: number
  children?: MenuConfig
}

export type MenuConfig = MenuItem[]

/** Un module = une icône dans le rail (ADR-F02). */
export interface ModuleItem {
  id: string
  titleKey: string
  icon: LucideIcon
  path: string
  /**
   * Teinte du module dans le rail (ADR-F03 laissait « une couleur par module vs
   * teinte unique » à trancher — tranché : UNE COULEUR PAR MODULE, comme le
   * layout-21 Metronic). Ce sont les SEULES couleurs saturées de l'interface :
   * elles servent de repère de navigation, pas de décoration.
   */
  tint: string
}

export const MODULES: ModuleItem[] = [
  {
    id: 'parties',
    titleKey: 'nav.module.parties',
    icon: Users,
    path: '/parties',
    tint: 'bg-violet-500 hover:bg-violet-600',
  },
  {
    id: 'bookings',
    titleKey: 'nav.module.bookings',
    icon: Calendar,
    path: '/bookings',
    tint: 'bg-teal-500 hover:bg-teal-600',
  },
  {
    id: 'settlements',
    titleKey: 'nav.module.settlements',
    icon: FileText,
    path: '/settlements',
    tint: 'bg-lime-500 hover:bg-lime-600',
  },
  {
    id: 'cash',
    titleKey: 'nav.module.cash',
    icon: DollarSign,
    path: '/cash',
    tint: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'invoicing',
    titleKey: 'nav.module.invoicing',
    icon: ShoppingCart,
    path: '/invoicing',
    tint: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    id: 'catalogue',
    titleKey: 'nav.module.catalogue',
    icon: BarChart3,
    path: '/catalogue',
    tint: 'bg-rose-500 hover:bg-rose-600',
  },
  {
    id: 'pricing',
    titleKey: 'nav.module.pricing',
    icon: Clock,
    path: '/pricing',
    tint: 'bg-cyan-500 hover:bg-cyan-600',
  },
  {
    id: 'settings',
    titleKey: 'nav.module.settings',
    icon: Settings,
    path: '/settings',
    tint: 'bg-zinc-500 hover:bg-zinc-600',
  },
]

/**
 * Menu de la barre latérale par module. Le CONTENU factice (groupes, entrées,
 * badges) vit dans `src/shared/dev/mock-menus.ts` (préfixe mock-, S3c §5) ; il
 * sera remplacé par l'API. Ici on n'expose que la structure et les helpers.
 */
export { MODULE_MENUS } from '@/shared/dev/mock-menus'

/** Retrouve le module auquel appartient un chemin (`/parties/clients` → parties). */
export function moduleFromPath(pathname: string): ModuleItem | undefined {
  return MODULES.find(
    (m) => pathname === m.path || pathname.startsWith(m.path + '/')
  )
}

/** Aplatit un menu (groupes compris) en ses seules entrées portant un `path`. */
export function flattenMenu(items: MenuConfig): MenuItem[] {
  return items.flatMap((item) =>
    item.children ? flattenMenu(item.children) : item.path ? [item] : []
  )
}
