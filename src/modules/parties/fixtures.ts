/**
 * FIXTURES DE LA LISTE TIERS — statiques, marquées, temporaires.
 *
 * ⚠️ AUCUNE de ces lignes n'est une donnée. Elles imitent la forme du contrat de
 * liste figé le 04/08 (`GET /api/v1/party-accounts`), champ pour champ, pour que
 * l'écran se juge sur la vraie structure et pas sur une invention.
 *
 * ── UNE HONNÊTETÉ À GARDER EN TÊTE ─────────────────────────────────────────────
 * Le scan du 04/08 dit que `logoUrl`, `phonePrimary` et `country` sont **vides
 * partout** — 0 sur 106 000 lignes. Ici ils sont RENSEIGNÉS, parce que la règle du
 * 19/08 demande de concevoir l'écran complet plutôt que l'écran appauvri.
 *
 * Mais deux lignes les laissent volontairement vides (Slim Ferchichi, Nour
 * Travel) : l'écran doit tenir le vide, et ça ne se vérifie qu'en le voyant.
 * Le registre `docs/backlog/en-attente-donnees.md` porte l'écart.
 */

/** Reprend le contrat de ligne, sans rien ajouter. */
export interface PartyRow {
  publicId: string
  nature: 'person' | 'organization'
  displayName: string
  email?: string
  phonePrimary?: string
  phoneSecondary?: string
  logoUrl?: string
  /** Alpha-2. Vide dans les 106k lignes actuelles. */
  country?: string
  /** Cumulables et historisés — un tiers peut être client ET fournisseur. */
  roles: readonly ('customer' | 'supplier' | 'franchise' | 'sales_point')[]
  offices: readonly { publicId: string; displayName: string }[]
  /** Les trois états sont INDÉPENDANTS : ils ne partitionnent pas l'ensemble. */
  isDisabled: boolean
  isProspect: boolean
  isDisputed: boolean
}

type Raw = [
  string, // displayName
  'person' | 'organization',
  string | undefined, // email
  string | undefined, // phone
  string | undefined, // country
  PartyRow['roles'],
  string[], // bureaux
  [boolean, boolean, boolean], // disabled, prospect, disputed
]

const RAW: readonly Raw[] = [
  [
    'Groupe Sahara Voyages',
    'organization',
    'contact@sahara.tn',
    '+216 71 240 500',
    'TN',
    ['customer'],
    ['Tunis'],
    [false, false, false],
  ],
  [
    'Carthage Travel Services',
    'organization',
    'info@carthage.tn',
    '+216 71 986 210',
    'TN',
    ['customer', 'supplier'],
    ['Tunis', 'Sousse'],
    [false, false, false],
  ],
  [
    'Oasis Tours International',
    'organization',
    'ops@oasis-tours.tn',
    '+216 75 650 120',
    'TN',
    ['customer'],
    ['Djerba'],
    [false, false, true],
  ],
  [
    'Medina Holidays',
    'organization',
    'hello@medina.tn',
    '+216 73 224 880',
    'TN',
    ['supplier'],
    ['Sousse'],
    [false, false, false],
  ],
  [
    'Atlas Voyages & Loisirs',
    'organization',
    'compta@atlas.tn',
    '+216 74 401 330',
    'TN',
    ['customer'],
    ['Sfax'],
    [true, false, false],
  ],
  [
    'Sidi Bou Travel',
    'organization',
    'sbt@sidibou.tn',
    '+216 71 745 900',
    'TN',
    ['customer'],
    ['Tunis'],
    [false, false, false],
  ],
  [
    'Tabarka Évasion',
    'organization',
    'contact@tabarka-ev.tn',
    '+216 78 671 040',
    'TN',
    ['customer', 'supplier'],
    ['Tabarka'],
    [false, true, false],
  ],
  [
    'Hammamet Sun Tours',
    'organization',
    'book@hst.tn',
    '+216 72 280 615',
    'TN',
    ['supplier'],
    ['Hammamet'],
    [false, false, false],
  ],
  [
    'Kairouan Pèlerinages',
    'organization',
    'agence@kairouan-p.tn',
    '+216 77 232 440',
    'TN',
    ['customer'],
    ['Kairouan'],
    [false, false, false],
  ],
  [
    'Bizerte Marine Travel',
    'organization',
    'marine@bizerte.tn',
    '+216 72 431 770',
    'TN',
    ['supplier'],
    ['Bizerte'],
    [true, false, true],
  ],
  [
    'Tozeur Desert Expeditions',
    'organization',
    'desert@tozeur.tn',
    '+216 76 452 190',
    'TN',
    ['customer'],
    ['Tozeur'],
    [false, false, false],
  ],
  [
    'Monastir Ribat Voyages',
    'organization',
    'ribat@monastir.tn',
    '+216 73 461 205',
    'TN',
    ['customer', 'supplier'],
    ['Monastir'],
    [false, false, false],
  ],
  [
    'Nefta Caravane',
    'organization',
    'nefta@caravane.tn',
    '+216 76 430 118',
    'TN',
    ['supplier'],
    ['Tozeur'],
    [false, true, false],
  ],
  [
    'Mahdia Bleu Voyages',
    'organization',
    'contact@mahdiableu.tn',
    '+216 73 681 442',
    'TN',
    ['customer'],
    ['Mahdia'],
    [false, false, false],
  ],
  [
    'Gammarth Prestige Travel',
    'organization',
    'prestige@gammarth.tn',
    '+216 71 912 330',
    'TN',
    ['customer'],
    ['Tunis'],
    [false, false, false],
  ],
  [
    'Air Méditerranée Tunisie',
    'organization',
    'tn@airmed.fr',
    '+33 4 67 20 88 00',
    'FR',
    ['supplier'],
    ['Tunis'],
    [false, false, false],
  ],
  [
    'Voyages Vernet',
    'organization',
    'agence@vernet.fr',
    '+33 1 45 22 71 90',
    'FR',
    ['customer'],
    ['Tunis'],
    [false, true, false],
  ],
  [
    'Milano Viaggi Srl',
    'organization',
    'info@milanoviaggi.it',
    '+39 02 7788 4410',
    'IT',
    ['customer'],
    ['Tunis', 'Sousse'],
    [false, false, false],
  ],
  [
    'Amine Bouazizi',
    'person',
    'a.bouazizi@gmail.com',
    '+216 22 340 771',
    'TN',
    ['customer'],
    ['Sfax'],
    [false, false, false],
  ],
  [
    'Leïla Ben Hassine',
    'person',
    'leila.bh@outlook.com',
    '+216 98 112 604',
    'TN',
    ['customer'],
    ['Tunis'],
    [false, false, false],
  ],
  [
    'Mohamed Trabelsi',
    'person',
    'm.trabelsi@yahoo.fr',
    '+216 21 887 330',
    'TN',
    ['customer'],
    ['Sousse'],
    [false, false, true],
  ],
  // ── Deux lignes VOLONTAIREMENT creuses : l'écran doit tenir le vide.
  [
    'Slim Ferchichi',
    'person',
    undefined,
    undefined,
    undefined,
    ['customer'],
    ['Tunis'],
    [false, true, false],
  ],
  [
    'Nour Travel',
    'organization',
    undefined,
    undefined,
    undefined,
    ['customer'],
    [],
    [false, true, false],
  ],
  [
    'Sfax Business Travel',
    'organization',
    'corp@sbt-sfax.tn',
    '+216 74 226 900',
    'TN',
    ['customer', 'supplier'],
    ['Sfax'],
    [false, false, false],
  ],
]

export const PARTIES: readonly PartyRow[] = RAW.map(
  (
    [displayName, nature, email, phonePrimary, country, roles, offices, flags],
    index
  ) => ({
    publicId: `p-${String(index + 1).padStart(3, '0')}`,
    nature,
    displayName,
    email,
    phonePrimary,
    country,
    roles,
    offices: offices.map((name, i) => ({
      publicId: `o-${index}-${i}`,
      displayName: `myGO ${name}`,
    })),
    isDisabled: flags[0],
    isProspect: flags[1],
    isDisputed: flags[2],
  })
)

/** Bureaux visibles par l'agent — viendra de `/me`, jamais de la liste. */
export const OFFICES: readonly { value: string; label: string }[] = [
  ...new Set(
    PARTIES.flatMap((party) => party.offices.map((o) => o.displayName))
  ),
]
  .sort()
  .map((label) => ({ value: label, label }))

/** Pays présents — viendra du référentiel fermé `countries`. */
export const COUNTRIES: readonly { value: string; label: string }[] = [
  { value: 'TN', label: 'Tunisie' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italie' },
]
