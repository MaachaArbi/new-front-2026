/**
 * FICHE TIERS — données de maquette.
 *
 * ⚠️ TOUT est statique et inventé. Rien ne vient d'une API. Ce fichier existe
 * pour que l'écran se juge **complet**, comme la règle du 19/08 le demande :
 * on conçoit la page entière, on marque ce qui reste à alimenter.
 *
 * ── D'OÙ VIENT LA FORME ────────────────────────────────────────────────────────
 * De la RÉFÉRENCE MÉTIER (`ostravel/reference/business/party.md`, `settlement.md`,
 * `booking.md`), pas du contrat d'API. C'est la correction de l'essai précédent :
 * l'API rend aujourd'hui une fraction de ce que le métier connaît, et concevoir
 * sur elle produisait un écran vide.
 *
 * ── LA FORMULE QUI GOUVERNE LA FICHE ───────────────────────────────────────────
 *
 *      capacité = solde du grand livre + plafond + rallonges valides
 *
 * Et surtout : **un livre = (tiers, rôle, bureau, devise)**. Jamais converti,
 * jamais additionné. Il n'existe donc PAS de « solde du client » ni de « crédit
 * disponible » unique — il y en a autant que de couples bureau × devise.
 * Un écran qui en affiche un seul ment.
 */

/** Un grand livre : bureau × devise. Le socle du bloc « capacité ». */
export interface PartyLedger {
  officeName: string
  currencyCode: string
  /** Négatif = le client doit. Unités mineures, en TEXTE. */
  balanceMinor: string
  /** Socle : un seul par bureau et devise. */
  baseLimitMinor: string
  extensions: readonly {
    amountMinor: string
    validTo: string
    /** Renseigné = plafond ventilé par service ; sinon, général. */
    serviceLabel?: string
  }[]
}

export interface PartyContact {
  publicId: string
  displayName: string
  functionLabel: string
  email?: string
  phone?: string
  /** Un interlocuteur PEUT agir : créer et valider des réservations. */
  canAct: boolean
  /** Son travail doit être validé par quelqu'un. */
  needsApprovalBy?: string
}

export interface PartyBooking {
  reference: string
  serviceLabel: string
  label: string
  travelDate: string
  status: 'confirmed' | 'on_request' | 'cancelled'
  amountMinor: string
  currencyCode: string
  officeName: string
  /** Réservation payée à plusieurs (amicale + salarié, par ex.). */
  splitWith?: string
}

export interface PartyInvoice {
  number: string
  issuedOn: string
  dueOn: string
  totalMinor: string
  settledMinor: string
  currencyCode: string
  officeName: string
}

export interface PartyActivity {
  at: string
  actor: string
  kind: 'booking' | 'settlement' | 'field' | 'document' | 'limit'
  text: string
}

export interface PartyManager {
  publicId: string
  displayName: string
  role: 'commercial' | 'collection'
  since: string
  /** L'affectation est HISTORISÉE : une période fermée reste visible. */
  until?: string
}

export interface PartyGroup {
  name: string
  /** Les groupes sont TYPÉS — le legacy les mélangeait tous. */
  type: 'contracting' | 'pricing' | 'collection' | 'reporting'
}

export interface PartyPolicy {
  officeName: string | null
  alwaysOnRequest: boolean
  blockWhenInsufficient: boolean
}

export interface PartyExemption {
  publicId: string
  officeName: string
  kind: 'vat' | 'stamp_duty'
  certificateNumber?: string
  validTo?: string
  hasCertificate: boolean
}

export interface PartyApproval {
  publicId: string
  functionLabel: string
  validatorName: string
  officeName: string | null
  validatorStillQualified: boolean
}

export interface PartyDocument {
  publicId: string
  label: string
  number?: string
  expiryDate?: string
  hasFile: boolean
}

export interface PartyAddress {
  publicId: string
  typeKey: 'legal' | 'billing' | 'delivery'
  line1: string
  city: string
  postalCode: string
}

export interface PartySubAgency {
  publicId: string
  displayName: string
  city: string
  bookingsThisYear: number
}

export interface PartyDetail {
  publicId: string
  nature: 'organization' | 'person'
  displayName: string
  email: string
  emailVerified: boolean
  phonePrimary: string
  phoneSecondary?: string
  website?: string
  legalFormKey: string
  taxId: string
  tradeRegister: string
  country: string
  createdAt: string
  createdBy: string
  roles: readonly ('customer' | 'supplier' | 'franchise' | 'sales_point')[]
  offices: readonly string[]
  isDisabled: boolean
  isProspect: boolean
  isDisputed: boolean
  ledgers: readonly PartyLedger[]
  policies: readonly PartyPolicy[]
  exemptions: readonly PartyExemption[]
  approvals: readonly PartyApproval[]
  managers: readonly PartyManager[]
  groups: readonly PartyGroup[]
  contacts: readonly PartyContact[]
  bookings: readonly PartyBooking[]
  invoices: readonly PartyInvoice[]
  activity: readonly PartyActivity[]
  documents: readonly PartyDocument[]
  addresses: readonly PartyAddress[]
  subAgencies: readonly PartySubAgency[]
}

export const PARTY_DETAIL: PartyDetail = {
  publicId: 'p-001',
  nature: 'organization',
  displayName: 'Groupe Sahara Voyages',
  email: 'contact@sahara.tn',
  emailVerified: false,
  phonePrimary: '+216 71 240 500',
  phoneSecondary: '+216 98 447 210',
  website: 'https://www.sahara-voyages.tn',
  legalFormKey: 'sarl',
  taxId: 'MF 1234567 A M 000',
  tradeRegister: 'B01234562019',
  country: 'TN',
  createdAt: '2019-03-14',
  createdBy: 'Sonia Gharbi',
  roles: ['customer', 'supplier'],
  offices: ['myGO Tunis', 'myGO Sousse'],
  isDisabled: false,
  isProspect: false,
  isDisputed: false,

  /**
   * DEUX LIVRES. Tunis en dinars, Sousse en euros. Ils ne se convertissent ni ne
   * s'additionnent — c'est deux entités légales, deux bilans, deux risques.
   * Sousse est à 77 % de consommation : c'est ce que la vue « Encours > 75 % »
   * du menu remonte.
   */
  ledgers: [
    {
      officeName: 'myGO Tunis',
      currencyCode: 'TND',
      balanceMinor: '-38500000',
      baseLimitMinor: '50000000',
      extensions: [{ amountMinor: '15000000', validTo: '2026-09-30' }],
    },
    {
      officeName: 'myGO Sousse',
      currencyCode: 'EUR',
      balanceMinor: '-620000',
      baseLimitMinor: '800000',
      extensions: [],
    },
  ],

  // NULL = commun à tous les bureaux. La plus précise l'emporte, jamais l'addition.
  policies: [
    { officeName: null, alwaysOnRequest: false, blockWhenInsufficient: true },
    {
      officeName: 'myGO Tunis',
      alwaysOnRequest: true,
      blockWhenInsufficient: false,
    },
  ],

  exemptions: [
    {
      publicId: 'x-1',
      officeName: 'myGO Tunis',
      kind: 'vat',
      certificateNumber: 'EX-2026-0031',
      validTo: '2026-12-31',
      hasCertificate: true,
    },
    // ⚠️ Sans attestation : ressemble à du complet, n'en est pas.
    {
      publicId: 'x-2',
      officeName: 'myGO Sousse',
      kind: 'stamp_duty',
      hasCertificate: false,
    },
  ],

  approvals: [
    {
      publicId: 'r-1',
      functionLabel: 'Agent de comptoir',
      validatorName: 'Sonia Gharbi',
      officeName: 'myGO Tunis',
      validatorStillQualified: true,
    },
    // ⚠️ Parti, mais toujours désigné.
    {
      publicId: 'r-2',
      functionLabel: 'Agent de comptoir',
      validatorName: 'Hatem Jaziri',
      officeName: 'myGO Tunis',
      validatorStillQualified: false,
    },
  ],

  // Affectation HISTORISÉE : on ferme une période, on n'écrase pas.
  managers: [
    {
      publicId: 'm-1',
      displayName: 'Sonia Gharbi',
      role: 'commercial',
      since: '2024-01-01',
    },
    {
      publicId: 'm-2',
      displayName: 'Khaled Mansour',
      role: 'collection',
      since: '2025-06-01',
    },
    {
      publicId: 'm-3',
      displayName: 'Rim Chaabane',
      role: 'commercial',
      since: '2019-03-14',
      until: '2023-12-31',
    },
  ],

  groups: [
    { name: 'Agences Sud', type: 'contracting' },
    { name: 'Barème B2B 2026', type: 'pricing' },
    { name: 'Recouvrement Sud', type: 'collection' },
  ],

  /**
   * Les interlocuteurs sont des COMPTES à part entière, sans solde propre, mais
   * qui peuvent AGIR : créer et valider des réservations au nom de l'organisation.
   */
  contacts: [
    {
      publicId: 'c-1',
      displayName: 'Nadia Belhadj',
      functionLabel: 'Directrice',
      email: 'n.belhadj@sahara.tn',
      phone: '+216 98 220 114',
      canAct: true,
    },
    {
      publicId: 'c-2',
      displayName: 'Fethi Zouari',
      functionLabel: 'Comptable',
      email: 'compta@sahara.tn',
      phone: '+216 71 240 511',
      canAct: false,
    },
    {
      publicId: 'c-3',
      displayName: 'Yosra Amri',
      functionLabel: 'Agent de comptoir',
      email: 'y.amri@sahara.tn',
      canAct: true,
      needsApprovalBy: 'Sonia Gharbi',
    },
  ],

  bookings: [
    {
      reference: '482 019 663',
      serviceLabel: 'Hébergement',
      label: 'Hôtel Marhaba Palace · 4 nuits · 2 chambres',
      travelDate: '2026-09-12',
      status: 'confirmed',
      amountMinor: '4820000',
      currencyCode: 'TND',
      officeName: 'myGO Tunis',
    },
    {
      reference: '482 019 588',
      serviceLabel: 'Vol',
      label: 'Tunis → Istanbul · aller-retour · 6 passagers',
      travelDate: '2026-09-04',
      status: 'on_request',
      amountMinor: '11400000',
      currencyCode: 'TND',
      officeName: 'myGO Tunis',
    },
    {
      reference: '482 018 902',
      serviceLabel: 'Hébergement',
      label: 'Résidence Les Oliviers · 7 nuits',
      travelDate: '2026-08-28',
      status: 'confirmed',
      amountMinor: '318000',
      currencyCode: 'EUR',
      officeName: 'myGO Sousse',
      splitWith: 'Amicale ONAS (60 %)',
    },
    {
      reference: '482 017 441',
      serviceLabel: 'Transfert',
      label: 'Aéroport Enfidha → Sousse · 12 personnes',
      travelDate: '2026-08-22',
      status: 'cancelled',
      amountMinor: '48000',
      currencyCode: 'EUR',
      officeName: 'myGO Sousse',
    },
  ],

  invoices: [
    {
      number: 'FA-2026-04412',
      issuedOn: '2026-07-31',
      dueOn: '2026-08-30',
      totalMinor: '22400000',
      settledMinor: '10000000',
      currencyCode: 'TND',
      officeName: 'myGO Tunis',
    },
    {
      number: 'FA-2026-04310',
      issuedOn: '2026-06-30',
      dueOn: '2026-07-30',
      totalMinor: '16100000',
      settledMinor: '16100000',
      currencyCode: 'TND',
      officeName: 'myGO Tunis',
    },
    {
      number: 'FS-2026-00877',
      issuedOn: '2026-07-31',
      dueOn: '2026-08-30',
      totalMinor: '620000',
      settledMinor: '0',
      currencyCode: 'EUR',
      officeName: 'myGO Sousse',
    },
  ],

  activity: [
    {
      at: '2026-08-20',
      actor: 'Yosra Amri',
      kind: 'booking',
      text: 'Réservation 482 019 663 confirmée',
    },
    {
      at: '2026-08-18',
      actor: 'Khaled Mansour',
      kind: 'settlement',
      text: 'Règlement de 10 000,000 TND lettré sur FA-2026-04412',
    },
    {
      at: '2026-08-12',
      actor: 'Sonia Gharbi',
      kind: 'limit',
      text: 'Rallonge de 15 000,000 TND accordée jusqu’au 30/09/2026',
    },
    {
      at: '2026-08-04',
      actor: 'Fethi Zouari',
      kind: 'field',
      text: 'Adresse de facturation modifiée',
    },
    {
      at: '2026-07-29',
      actor: 'Sonia Gharbi',
      kind: 'document',
      text: 'Contrat CT-2019-0142 remplacé',
    },
  ],

  documents: [
    {
      publicId: 'd-1',
      label: 'Contrat cadre',
      number: 'CT-2019-0142',
      hasFile: true,
    },
    {
      publicId: 'd-2',
      label: 'Carte d’identité du gérant',
      number: '09884412',
      expiryDate: '2031-06-01',
      hasFile: false,
    },
    {
      publicId: 'd-3',
      label: 'Attestation d’exonération TVA',
      number: 'EX-2026-0031',
      expiryDate: '2026-12-31',
      hasFile: true,
    },
  ],

  addresses: [
    {
      publicId: 'a-1',
      typeKey: 'legal',
      line1: '12, avenue Habib Bourguiba',
      city: 'Tunis',
      postalCode: '1001',
    },
    {
      publicId: 'a-2',
      typeKey: 'billing',
      line1: 'Immeuble Yasmine, bloc B — 3ᵉ étage',
      city: 'Tunis',
      postalCode: '1073',
    },
  ],

  /** Le réseau : c'est l'agence MAÎTRE qui reçoit la facture et porte le risque. */
  subAgencies: [
    {
      publicId: 's-1',
      displayName: 'Sahara Voyages — Ariana',
      city: 'Ariana',
      bookingsThisYear: 84,
    },
    {
      publicId: 's-2',
      displayName: 'Sahara Voyages — Nabeul',
      city: 'Nabeul',
      bookingsThisYear: 41,
    },
  ],
}
