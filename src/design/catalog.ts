/**
 * CATALOGUE — la liste des composants et leur état d'avancement.
 *
 * Un composant n'apparaît « prélevé » qu'après avoir été copié du template ET vu par
 * Arbi. Tant qu'il est « à prélever », il figure quand même dans le menu : la liste
 * dit ce qu'il reste à faire autant que ce qui est fait.
 */
export interface CatalogEntry {
  readonly id: string
  readonly titleKey: string
  /** Fichier d'origine dans `vendor-metronic`, pour qu'on puisse toujours recomparer. */
  readonly source?: string
  /** Écart au template, s'il y en a un. Toujours motivé, jamais silencieux. */
  readonly adapted?: string
  readonly ported: boolean
}

export interface CatalogGroup {
  readonly titleKey: string
  readonly entries: readonly CatalogEntry[]
}

export const CATALOG: readonly CatalogGroup[] = [
  {
    titleKey: 'design.group.controls',
    entries: [
      {
        id: 'button',
        titleKey: 'design.comp.button',
        source: 'full/src/components/ui/button.tsx',
        adapted:
          'cinq variantes au lieu de huit ; états en couleurs et non en opacités ; désactivé neutre ; hauteurs indexées sur --ui-row. Le détail et les motifs sont en tête de button.tsx.',
        ported: true,
      },
      {
        id: 'input',
        titleKey: 'design.comp.input',
        source: 'full/src/components/ui/input.tsx',
        adapted:
          'hauteurs sur --ui-row ; anneau de focus unique ; désactivé neutre ; lecture seule distincte du désactivé ; survol ajouté ; ombres retirées. Détail en tête de input.tsx.',
        ported: true,
      },
      {
        id: 'password',
        titleKey: 'design.comp.password',
        source:
          'aucune — écrit par nous (le template le recompose 4 fois, en RTL cassé)',
        adapted:
          'bâti sur Input + Button ; bouton en propriété logique (end-0) ; libellé traduit et aria-pressed',
        ported: true,
      },
      {
        id: 'select',
        titleKey: 'design.comp.select',
        source: 'full/src/components/ui/select.tsx',
        adapted:
          "indicatorPosition passe de left|right à start|end — l'API mentait en arabe ; hauteurs sur --ui-row ; focus, désactivé et invalide alignés sur le système",
        ported: true,
      },
      {
        id: 'choice',
        titleKey: 'design.comp.choice',
        source: 'full/src/components/ui/{checkbox,radio-group}.tsx',
        adapted:
          'désactivé neutre MAIS état encore lisible (le template masquait la coche) ; variante radio « mono » retirée (elle ne faisait rien) ; tailles volontairement NON indexées sur la densité',
        ported: true,
      },
      {
        id: 'textarea',
        titleKey: 'design.comp.textarea',
        source: 'full/src/components/ui/textarea.tsx',
        adapted:
          'mêmes écarts que le champ de saisie ; lecture seule lisible au lieu de opacity-70',
        ported: true,
      },
      {
        id: 'label',
        titleKey: 'design.comp.label',
        source: 'full/src/components/ui/label.tsx',
        adapted:
          'opacity-50 sur peer-disabled remplacé par la couleur de texte désactivée',
        ported: true,
      },
      {
        id: 'switch',
        titleKey: 'design.comp.switch',
        source: 'starter-kit/src/components/ui/switch.tsx',
        ported: true,
      },
    ],
  },
  {
    titleKey: 'design.group.foundations',
    entries: [
      {
        id: 'palette',
        titleKey: 'design.comp.palette',
        source: 'planche « Bleu de Prusse » — Arbi, 20/08',
        adapted:
          "couches 1 et 2 reprises telles quelles ; ajout d'une couche de raccordement vers les noms ReUI, des surfaces de barre latérale, et renommage de --text-primary-role en --text-link",
        ported: true,
      },
      {
        id: 'badge',
        titleKey: 'design.comp.badge',
        source: 'starter-kit/src/components/ui/badge.tsx',
        ported: true,
      },
      {
        id: 'dropdown',
        titleKey: 'design.comp.dropdown',
        source: 'starter-kit/src/components/ui/dropdown-menu.tsx',
        ported: true,
      },
      {
        id: 'scroll-area',
        titleKey: 'design.comp.scrollArea',
        source: 'starter-kit/src/components/ui/scroll-area.tsx',
        // Résumé lisible ici ; les noms de classes exacts vivent dans
        // `scroll-area.tsx`, à côté du code qu'ils décrivent. Les répéter dans une
        // phrase déclencherait la règle RTL sur de la prose, pas sur du code.
        adapted:
          'bordure physique → logique : le template ignore le RTL (ADR-F04)',
        ported: true,
      },
      {
        id: 'calendar',
        titleKey: 'design.comp.calendar',
        source: 'registre ReUI — npx shadcn add @reui/date-selector',
        adapted:
          "AUCUNE retouche visuelle : il consomme les noms que la couche de raccordement alimente déjà. Seuls la locale date-fns et le sens de lecture lui sont passés par l'appelant.",
        ported: true,
      },
      { id: 'tooltip', titleKey: 'design.comp.tooltip', ported: false },
      { id: 'dialog', titleKey: 'design.comp.dialog', ported: false },
      { id: 'table', titleKey: 'design.comp.table', ported: false },
    ],
  },
]
