import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Folder,
  History,
  ShoppingCart,
  Tags,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * NAVIGATION — par métier, pas par découpage serveur.
 *
 * Le serveur expose quinze modules ; cinq seulement sont quotidiens, et certains
 * (`Core`, `Log`, `Provider`) ne sont pas des écrans. Les aligner au même niveau
 * noierait ce qui compte. Voir l'ADR du 19/08.
 *
 * ⚠️ Les compteurs sont INVENTÉS. Ils servent à juger un menu rempli ; aucun ne vient
 * d'un décompte serveur, et il faudra en demander un — compter 128 tiers en les
 * téléchargeant coûterait le prix de la liste à chaque affichage du menu.
 */
export interface NavEntry {
  readonly titleKey: string
  readonly icon: LucideIcon
  readonly path: string
  /** Couleur d'identité du module — le seul usage de couleur saturée du menu. */
  /** Teinte du module, définie dans `tokens.css` — jamais une couleur en clair. */
  readonly tint: string
  readonly count?: number
}

export interface NavGroup {
  readonly titleKey: string
  readonly entries: readonly NavEntry[]
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    titleKey: 'nav.group.exploitation',
    entries: [
      {
        titleKey: 'nav.parties',
        icon: Users,
        path: '/parties',
        tint: 'text-module-parties',
        count: 128,
      },
      {
        titleKey: 'nav.bookings',
        icon: ShoppingCart,
        path: '/bookings',
        tint: 'text-module-bookings',
        count: 42,
      },
      {
        titleKey: 'nav.folders',
        icon: Folder,
        path: '/folders',
        tint: 'text-module-folders',
        count: 8,
      },
    ],
  },
  {
    titleKey: 'nav.group.offer',
    entries: [
      {
        titleKey: 'nav.products',
        icon: Boxes,
        path: '/products',
        tint: 'text-module-products',
      },
      {
        titleKey: 'nav.pricing',
        icon: Tags,
        path: '/pricing',
        tint: 'text-module-pricing',
      },
    ],
  },
  {
    titleKey: 'nav.group.finance',
    entries: [
      {
        titleKey: 'nav.invoicing',
        icon: FileSpreadsheet,
        path: '/invoicing',
        tint: 'text-module-invoicing',
        count: 18,
      },
      {
        titleKey: 'nav.settlements',
        icon: FileText,
        path: '/settlements',
        tint: 'text-module-settlements',
      },
      {
        titleKey: 'nav.cash',
        icon: Wallet,
        path: '/cash',
        tint: 'text-module-cash',
      },
    ],
  },
  {
    titleKey: 'nav.group.insights',
    entries: [
      {
        titleKey: 'nav.statistics',
        icon: BarChart3,
        path: '/statistics',
        tint: 'text-module-insights',
      },
      {
        titleKey: 'nav.journal',
        icon: History,
        path: '/journal',
        tint: 'text-module-journal',
      },
    ],
  },
]

/**
 * VUES ENREGISTRÉES — des filtres nommés, pas des écrans.
 *
 * Elles épargnent un aller-retour quotidien : « qui dépasse 75 % de son plafond ? »
 * se répond d'un clic au lieu d'ouvrir la liste, poser un filtre et le retirer.
 * La pastille dit l'urgence ; elle ne classe pas.
 */
export interface SavedView {
  readonly titleKey: string
  readonly path: string
  readonly count: number
  readonly tone: string
}

export const SAVED_VIEWS: readonly SavedView[] = [
  {
    titleKey: 'nav.view.overLimit',
    path: '/parties?view=over-limit',
    count: 4,
    tone: 'bg-fill-warning',
  },
  {
    titleKey: 'nav.view.expiring',
    path: '/parties?view=expiring',
    count: 2,
    tone: 'bg-destructive',
  },
  {
    titleKey: 'nav.view.departures',
    path: '/bookings?view=departures',
    count: 6,
    tone: 'bg-primary',
  },
]

/** Réglages — configurés une fois puis oubliés : ils ne sont pas dans le quotidien. */
export const SETTINGS_ENTRY = {
  titleKey: 'nav.settings',
  icon: ClipboardList,
  path: '/settings',
} as const
