/**
 * FIXTURES DE LA FICHE TIERS — statiques, calquées sur le contrat back du 07/08.
 *
 * ⚠️ Aucune donnée. La forme suit `GET /party-accounts/{publicId}` tel que le back
 * l'a livré : 33 champs, dont **six listes bornées** (≤ 4, sans pagination) —
 * `documents`, `creditLimits`, `managers`, `taxExemptions`, `commercialPolicies`,
 * `approvalRules`.
 *
 * ── DEUX RÈGLES D'ARBI QUI GOUVERNENT CE FICHIER ───────────────────────────────
 *
 *  **N° 1 (06/08).** Aucun de ces réglages ne DÉCLENCHE quoi que ce soit
 *  aujourd'hui — les comportements vivront dans Réservations. On ne doit jamais
 *  écrire « réservations bloquées au-delà » ni « en attente de validation ».
 *  **On saisit et on montre, point.**
 *
 *  **Principe E — montrer ce qui MANQUE.** `hasFile`, `hasCertificate`,
 *  `validatorStillQualified` : une pièce sans scan, une exonération sans
 *  justificatif, un validateur parti ressemblent à du complet à l'écran. Si on ne
 *  le montre pas, personne ne relance et l'agence paie. Les fixtures contiennent
 *  donc EXPRÈS un cas de chaque.
 *
 * ── LES MONTANTS SONT DES CHAÎNES ──────────────────────────────────────────────
 * `amountMinor: "1000000"` — jamais un nombre. Le back le rend en texte parce
 * qu'un BIGINT ne tient pas dans un `number` JavaScript, et le noyau Money le
 * consomme tel quel.
 */

export interface PartyDocument {
  publicId: string
  documentType: 'passport' | 'cin' | 'driving_license' | 'contract' | 'other'
  documentNumber?: string
  issuingCountry?: string
  issueDate?: string
  expiryDate?: string
  /** Le fichier est FACULTATIF, et c'est le cas le plus courant. */
  hasFile: boolean
}

export interface PartyCreditLimit {
  publicId: string
  officeAccountId: number
  officeName: string
  currencyCode: string
  amountMinor: string
  validFrom?: string
  /** `null` = SOCLE (un seul par société/devise). Renseigné = RALLONGE. */
  validTo?: string | null
  isExtension: boolean
}

export interface PartyManager {
  publicId: string
  managerDisplayName: string
  assignmentType: 'commercial' | 'collection'
  /** `null` = toutes les sociétés — jamais afficher un champ vide. */
  officeAccountId: number | null
  officeName?: string
}

export interface PartyTaxExemption {
  publicId: string
  officeAccountId: number
  officeName: string
  exemptionType: 'stamp_duty' | 'vat'
  certificateNumber?: string
  hasCertificate: boolean
  validFrom?: string
  validTo?: string
}

export interface PartyCommercialPolicy {
  /** `null` = politique COMMUNE. La clé est l'office, il n'y a pas de publicId. */
  officeAccountId: number | null
  officeName?: string
  forceOnRequest: boolean
  blockWhenInsufficientBalance: boolean
}

export interface PartyApprovalRule {
  publicId: string
  functionCode: string
  validatorDisplayName: string
  officeAccountId: number | null
  officeName?: string
  /** Un validateur parti reste désigné — il FAUT le signaler. */
  validatorStillQualified: boolean
}

export interface PartyAddress {
  publicId: string
  addressType: 'legal' | 'billing' | 'delivery' | 'domiciliation' | 'other'
  isPrimary: boolean
  line1?: string
  city?: string
  postalCode?: string
  country?: string
}

export interface PartyDetail {
  publicId: string
  nature: 'person' | 'organization'
  displayName: string
  email?: string
  emailVerified: boolean
  phonePrimary?: string
  phoneSecondary?: string
  country?: string
  roles: readonly ('customer' | 'supplier' | 'franchise' | 'sales_point')[]
  offices: readonly { publicId: string; displayName: string }[]
  isDisabled: boolean
  isProspect: boolean
  isDisputed: boolean
  createdAt: string
  /** Identité organisation (1-1, éclatée côté base). */
  taxId?: string
  tradeRegister?: string
  legalFormCode?: string
  website?: string
  addresses: readonly PartyAddress[]
  documents: readonly PartyDocument[]
  creditLimits: readonly PartyCreditLimit[]
  managers: readonly PartyManager[]
  taxExemptions: readonly PartyTaxExemption[]
  commercialPolicies: readonly PartyCommercialPolicy[]
  approvalRules: readonly PartyApprovalRule[]
}

export const PARTY_DETAIL: PartyDetail = {
  publicId: 'p-001',
  nature: 'organization',
  displayName: 'Groupe Sahara Voyages',
  email: 'contact@sahara.tn',
  emailVerified: false,
  phonePrimary: '+216 71 240 500',
  phoneSecondary: '+216 98 447 210',
  country: 'TN',
  roles: ['customer'],
  offices: [
    { publicId: 'o-1', displayName: 'myGO Tunis' },
    { publicId: 'o-2', displayName: 'myGO Sousse' },
  ],
  isDisabled: false,
  isProspect: false,
  isDisputed: false,
  createdAt: '2019-03-14',
  taxId: 'MF 1234567 A M 000',
  tradeRegister: 'B01234562019',
  legalFormCode: 'sarl',
  website: 'https://www.sahara-voyages.tn',

  addresses: [
    {
      publicId: 'a-1',
      addressType: 'legal',
      isPrimary: true,
      line1: '12, avenue Habib Bourguiba',
      city: 'Tunis',
      postalCode: '1001',
      country: 'TN',
    },
    {
      publicId: 'a-2',
      addressType: 'billing',
      isPrimary: true,
      line1: 'Immeuble Yasmine, bloc B — 3ᵉ étage',
      city: 'Tunis',
      postalCode: '1073',
      country: 'TN',
    },
  ],

  documents: [
    {
      publicId: 'd-1',
      documentType: 'contract',
      documentNumber: 'CT-2019-0142',
      issueDate: '2019-03-20',
      hasFile: true,
    },
    // ⚠️ Sans scan — le cas qu'il faut voir.
    {
      publicId: 'd-2',
      documentType: 'cin',
      documentNumber: '09884412',
      issuingCountry: 'TN',
      issueDate: '2021-06-02',
      expiryDate: '2031-06-01',
      hasFile: false,
    },
  ],

  creditLimits: [
    // Socle : `validTo` absent.
    {
      publicId: 'c-1',
      officeAccountId: 1,
      officeName: 'myGO Tunis',
      currencyCode: 'TND',
      amountMinor: '50000000',
      validFrom: '2024-01-01',
      validTo: null,
      isExtension: false,
    },
    // Rallonge : elle S'AJOUTE au socle et expire.
    {
      publicId: 'c-2',
      officeAccountId: 1,
      officeName: 'myGO Tunis',
      currencyCode: 'TND',
      amountMinor: '15000000',
      validFrom: '2026-08-01',
      validTo: '2026-09-30',
      isExtension: true,
    },
    {
      publicId: 'c-3',
      officeAccountId: 2,
      officeName: 'myGO Sousse',
      currencyCode: 'EUR',
      amountMinor: '800000',
      validFrom: '2025-05-01',
      validTo: null,
      isExtension: false,
    },
  ],

  managers: [
    {
      publicId: 'm-1',
      managerDisplayName: 'Sonia Gharbi',
      assignmentType: 'commercial',
      officeAccountId: 1,
      officeName: 'myGO Tunis',
    },
    // Sans société : vaut pour TOUTES.
    {
      publicId: 'm-2',
      managerDisplayName: 'Khaled Mansour',
      assignmentType: 'collection',
      officeAccountId: null,
    },
  ],

  taxExemptions: [
    {
      publicId: 'e-1',
      officeAccountId: 1,
      officeName: 'myGO Tunis',
      exemptionType: 'vat',
      certificateNumber: 'EX-2026-0031',
      hasCertificate: true,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
    },
    // ⚠️ Sans justificatif — à montrer en premier.
    {
      publicId: 'e-2',
      officeAccountId: 2,
      officeName: 'myGO Sousse',
      exemptionType: 'stamp_duty',
      hasCertificate: false,
      validFrom: '2026-04-01',
    },
  ],

  commercialPolicies: [
    // Commune et société COEXISTENT — la plus précise l'emporte, jamais additionnées.
    {
      officeAccountId: null,
      forceOnRequest: false,
      blockWhenInsufficientBalance: true,
    },
    {
      officeAccountId: 1,
      officeName: 'myGO Tunis',
      forceOnRequest: true,
      blockWhenInsufficientBalance: false,
    },
  ],

  approvalRules: [
    {
      publicId: 'r-1',
      functionCode: 'booking_override',
      validatorDisplayName: 'Sonia Gharbi',
      officeAccountId: 1,
      officeName: 'myGO Tunis',
      validatorStillQualified: true,
    },
    // ⚠️ Validateur parti mais toujours désigné.
    {
      publicId: 'r-2',
      functionCode: 'booking_override',
      validatorDisplayName: 'Hatem Jaziri',
      officeAccountId: 1,
      officeName: 'myGO Tunis',
      validatorStillQualified: false,
    },
  ],
}
