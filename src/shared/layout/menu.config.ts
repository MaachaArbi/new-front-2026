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
}

export const MODULES: ModuleItem[] = [
  {
    id: 'parties',
    titleKey: 'nav.module.parties',
    icon: Users,
    path: '/parties',
  },
  {
    id: 'bookings',
    titleKey: 'nav.module.bookings',
    icon: Calendar,
    path: '/bookings',
  },
  {
    id: 'settlements',
    titleKey: 'nav.module.settlements',
    icon: FileText,
    path: '/settlements',
  },
  { id: 'cash', titleKey: 'nav.module.cash', icon: DollarSign, path: '/cash' },
  {
    id: 'invoicing',
    titleKey: 'nav.module.invoicing',
    icon: ShoppingCart,
    path: '/invoicing',
  },
  {
    id: 'catalogue',
    titleKey: 'nav.module.catalogue',
    icon: BarChart3,
    path: '/catalogue',
  },
  {
    id: 'pricing',
    titleKey: 'nav.module.pricing',
    icon: Clock,
    path: '/pricing',
  },
  {
    id: 'settings',
    titleKey: 'nav.module.settings',
    icon: Settings,
    path: '/settings',
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
