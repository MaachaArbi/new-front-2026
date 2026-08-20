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
        adapted:
          "re-cartographié sur les rôles de la planche. Le template écrivait la MÊME variable pour le fond et pour le texte en mode sombre — l'étiquette devenait invisible dès qu'on définissait le jeton. Douze jetons de compatibilité retirés.",
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
      {
        id: 'tooltip',
        titleKey: 'design.comp.tooltip',
        source: 'full/src/components/ui/tooltip.tsx',
        adapted:
          "la variante sombre écrivait deux couleurs littérales de la palette Tailwind, hors système. Remplacées par des jetons qui s'inversent déjà avec le thème.",
        ported: true,
      },
      {
        id: 'dialog',
        titleKey: 'design.comp.dialog',
        source: 'full/src/components/ui/{dialog,sheet}.tsx',
        adapted:
          "feuille : side passe de left|right à start|end (même mensonge d'API que le sélecteur) ; dialogue centré par inset-0 m-auto au lieu de classes physiques ; space-x → gap-x ; bouton de fermeture doté d'un anneau de focus et d'un libellé traduit",
        ported: true,
      },
      {
        id: 'card',
        titleKey: 'design.comp.card',
        source: 'full/src/components/ui/{card,separator}.tsx',
        adapted:
          "ombre retirée (la classe du template, « black/5 », n'existait pas) ; garde du contexte impossible retirée ; séparateur pris tel quel",
        ported: true,
      },
      {
        id: 'table',
        titleKey: 'design.comp.table',
        source:
          'full/src/components/ui/data-grid{,-table,-column-header,-pagination,-column-visibility}.tsx',
        adapted:
          'épinglage de colonnes corrigé en propriétés logiques (vrai bug RTL, calculé en JS donc hors de portée du lint) ; hauteur de ligne sur --ui-row ; ligne sélectionnée en --bg-primary et non en gris ; « 1 – 25 sur 128 » isolé en LTR ; moveColumn left|right → start|end ; tous les libellés traduits',
        ported: true,
      },
    ],
  },
]
