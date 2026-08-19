import {
  BarChart3,
  Folder,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * NAVIGATION — une seule colonne, groupée par métier.
 *
 * Remplace le double dispositif « rail d'icônes + menu du module courant ». Le rail
 * obligeait à deux gestes pour atteindre un écran : choisir le module, puis l'entrée.
 * Ici tout est atteignable d'un clic, et les sections disent à quoi sert chaque bloc —
 * ce qu'on exploite, ce qu'on encaisse, ce qu'on pilote.
 *
 * Les compteurs sont encore statiques : ils devront venir d'un décompte SERVEUR, pas
 * d'un chargement de la liste (compter 128 tiers en les téléchargeant coûterait le
 * prix de la liste à chaque affichage du menu).
 */

export interface NavEntry {
  readonly titleKey: string
  readonly icon: LucideIcon
  readonly path: string
  /** Compteur affiché à droite. `null` = pas de compteur sur cette entrée. */
  readonly count: number | null
  /** `true` tant que le compteur est inventé — marqué à l'écran. */
  readonly countIsMock?: boolean
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
        titleKey: 'nav.module.parties',
        icon: Users,
        path: '/parties',
        count: 128,
        countIsMock: true,
      },
      {
        titleKey: 'nav.module.bookings',
        icon: ShoppingCart,
        path: '/bookings',
        count: 42,
        countIsMock: true,
      },
      {
        titleKey: 'nav.entry.folders',
        icon: Folder,
        path: '/bookings/folders',
        count: 8,
        countIsMock: true,
      },
    ],
  },
  {
    titleKey: 'nav.group.finance',
    entries: [
      {
        titleKey: 'nav.module.invoicing',
        icon: Receipt,
        path: '/invoicing',
        count: 18,
        countIsMock: true,
      },
      {
        titleKey: 'nav.entry.cash',
        icon: Wallet,
        path: '/cash',
        count: null,
      },
      {
        titleKey: 'nav.entry.credits',
        icon: ShieldCheck,
        path: '/settlements/credits',
        count: 4,
        countIsMock: true,
      },
    ],
  },
  {
    titleKey: 'nav.group.pilotage',
    entries: [
      {
        titleKey: 'nav.entry.stats',
        icon: BarChart3,
        path: '/pricing',
        count: null,
      },
    ],
  },
]

/**
 * VUES ENREGISTRÉES — des filtres nommés, pas des écrans.
 *
 * Elles épargnent un aller-retour quotidien : « qui dépasse 75 % de son plafond ? »
 * se répond d'un clic au lieu d'ouvrir la liste, poser un filtre et le retirer.
 * La pastille de couleur dit l'urgence, pas la catégorie.
 */
export interface SavedView {
  readonly titleKey: string
  readonly path: string
  readonly count: number
  readonly tone: 'warning' | 'danger' | 'accent'
}

export const SAVED_VIEWS: readonly SavedView[] = [
  {
    titleKey: 'nav.view.overLimit',
    path: '/parties?view=over-limit',
    count: 4,
    tone: 'warning',
  },
  {
    titleKey: 'nav.view.expiring',
    path: '/parties?view=expiring',
    count: 2,
    tone: 'danger',
  },
  {
    titleKey: 'nav.view.departures',
    path: '/bookings?view=departures',
    count: 6,
    tone: 'accent',
  },
]
