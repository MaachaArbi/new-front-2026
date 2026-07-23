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
 * Menu de la barre latérale par module. Libellés métier réalistes (pas de
 * « Menu Item 1 »), tous en clés i18n. `permission` posée à titre d'exemple sur
 * quelques entrées, non exploitée (S8).
 */
export const MODULE_MENUS: Record<string, MenuConfig> = {
  parties: [
    {
      titleKey: 'menu.parties.clients',
      path: '/parties/clients',
      permission: 'party.client.view',
    },
    {
      titleKey: 'menu.parties.suppliers',
      path: '/parties/suppliers',
      permission: 'party.supplier.view',
    },
    { titleKey: 'menu.parties.contacts', path: '/parties/contacts' },
    { titleKey: 'menu.parties.addresses', path: '/parties/addresses' },
    { titleKey: 'menu.parties.balances', path: '/parties/balances' },
  ],
  bookings: [
    { titleKey: 'menu.bookings.list', path: '/bookings/list' },
    { titleKey: 'menu.bookings.quotes', path: '/bookings/quotes' },
    { titleKey: 'menu.bookings.services', path: '/bookings/services' },
    { titleKey: 'menu.bookings.passengers', path: '/bookings/passengers' },
  ],
  settlements: [
    { titleKey: 'menu.settlements.receipts', path: '/settlements/receipts' },
    { titleKey: 'menu.settlements.payments', path: '/settlements/payments' },
    { titleKey: 'menu.settlements.matching', path: '/settlements/matching' },
    {
      titleKey: 'menu.settlements.statements',
      path: '/settlements/statements',
    },
  ],
  cash: [
    { titleKey: 'menu.cash.journals', path: '/cash/journals' },
    { titleKey: 'menu.cash.movements', path: '/cash/movements' },
    { titleKey: 'menu.cash.reconciliation', path: '/cash/reconciliation' },
  ],
  invoicing: [
    { titleKey: 'menu.invoicing.invoices', path: '/invoicing/invoices' },
    { titleKey: 'menu.invoicing.creditNotes', path: '/invoicing/credit-notes' },
    { titleKey: 'menu.invoicing.schedule', path: '/invoicing/schedule' },
  ],
  catalogue: [
    { titleKey: 'menu.catalogue.products', path: '/catalogue/products' },
    { titleKey: 'menu.catalogue.hotels', path: '/catalogue/hotels' },
    { titleKey: 'menu.catalogue.flights', path: '/catalogue/flights' },
    { titleKey: 'menu.catalogue.transfers', path: '/catalogue/transfers' },
  ],
  pricing: [
    { titleKey: 'menu.pricing.grids', path: '/pricing/grids' },
    { titleKey: 'menu.pricing.margins', path: '/pricing/margins' },
    { titleKey: 'menu.pricing.promotions', path: '/pricing/promotions' },
  ],
  settings: [
    { titleKey: 'menu.settings.offices', path: '/settings/offices' },
    {
      titleKey: 'menu.settings.users',
      path: '/settings/users',
      permission: 'core.user.view',
    },
    {
      titleKey: 'menu.settings.roles',
      path: '/settings/roles',
      permission: 'core.role.view',
    },
    { titleKey: 'menu.settings.currencies', path: '/settings/currencies' },
    { titleKey: 'menu.settings.general', path: '/settings/general' },
  ],
}

/** Retrouve le module auquel appartient un chemin (`/parties/clients` → parties). */
export function moduleFromPath(pathname: string): ModuleItem | undefined {
  return MODULES.find(
    (m) => pathname === m.path || pathname.startsWith(m.path + '/')
  )
}
