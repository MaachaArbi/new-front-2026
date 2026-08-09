/**
 * API du module Party (contrat §3, forme figée 04/08 vérifiée live). Pagination
 * **serveur** ; tri **fixe côté back** sur le nom (pas de `sort=` en V1). Filtres
 * réels exposés : `search` (nom/email/tél1/tél2), `nature`, `role`, `state`,
 * `officeAccountId`, `country`. Un critère inconnu → 422 (jamais ignoré).
 *
 * **RLS (§2.4)** : une liste n'est jamais complète ; l'appelant ne suppose pas la
 * globalité ; un vide n'est pas une erreur ; le total est celui de l'appelant.
 * Les libellés (rôles, pays) ne sont **pas** renvoyés : on les résout via
 * `/referentials` (codes → libellés). `logoUrl`, `phone*`, `country` peuvent être
 * vides partout aujourd'hui → l'écran tient le vide.
 */

import { authedRequest } from '@/shared/auth/session'

export type PartyNature = 'person' | 'organization'

/** États orthogonaux (ne partitionnent pas : un tiers peut en cumuler). */
export type PartyState = 'active' | 'disabled' | 'prospect' | 'disputed'

export interface ListMeta {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly totalPages: number
}

export interface ListEnvelope<T> {
  readonly data: readonly T[]
  readonly meta: ListMeta
}

/** Bureau gestionnaire renvoyé dans une ligne (vide si `officeScope = all_offices`). */
export interface PartyOfficeRef {
  readonly publicId: string
  readonly displayName: string
}

/**
 * Rattachement bureau AVEC son titre (fiche détail). Un même bureau peut apparaître **deux
 * fois** (client ET fournisseur). Ne jamais afficher le bureau **sans** son `relationType`.
 */
export interface PartyOfficeRelation {
  readonly publicId: string
  readonly displayName: string
  readonly relationType: 'customer' | 'supplier'
}

/**
 * Interlocuteur : une **personne** (tiers indépendant, `publicId` cliquable) reliée à cette
 * organisation par une **fonction**. Présent (borné à 4) sur une fiche d'organisation, vide
 * pour une personne. Un interlocuteur ne se connecte pas — il apparaît, rien de plus.
 */
export interface PartyContactRef {
  readonly publicId: string
  readonly displayName: string
  readonly functionCode: string
}

/** Ligne de la liste consolidée (forme figée du contrat). */
export interface PartyAccountListItem {
  readonly publicId: string
  readonly nature: PartyNature
  readonly displayName: string
  readonly email: string | null
  readonly phonePrimary: string | null
  readonly phoneSecondary: string | null
  readonly logoUrl: string | null
  /** Code pays alpha-2 (résolu en libellé via /referentials). */
  readonly country: string | null
  /** Codes de rôles courants (résolus en libellés via /referentials). */
  readonly roles: readonly string[]
  readonly officeScope: string
  readonly offices: readonly PartyOfficeRef[]
  readonly isDisabled: boolean
  readonly isProspect: boolean
  readonly isDisputed: boolean
}

export interface PartyPersonIdentity {
  readonly firstName: string | null
  readonly lastName: string | null
  readonly employeeReference: string | null
}

export interface PartyOrganizationIdentity {
  readonly taxId: string | null
  readonly tradeRegister: string | null
  readonly legalFormCode: string | null
  readonly website: string | null
  // Gardés par le back (« export Excel only ») — on ne les AFFICHE pas.
  readonly accountingAccountCode?: string | null
  readonly thirdPartyAccountCode?: string | null
}

/** Groupe de tiers rattaché (contracting/pricing/collection/reporting). */
export interface PartyGroupRef {
  readonly publicId: string
  readonly name: string
  readonly groupTypeCode: string
}

/**
 * Sections finance + documents (livraison finale). **AUCUN de ces réglages ne déclenche
 * quoi que ce soit** aujourd'hui — on saisit et on montre, jamais « bloqué au-delà » ni
 * « en attente de validation ». `officeAccountId` vide = **toutes les sociétés** (portée,
 * pas manque). `amountMinor` reste une **chaîne** (jamais converti en nombre).
 */
export interface PartyDocument {
  readonly publicId: string
  /** passport | cin | driving_license | contract | other */
  readonly documentType: string
  readonly documentNumber: string | null
  readonly issuingCountry: string | null
  readonly issueDate: string | null
  readonly expiryDate: string | null
  /** `false` = pièce sans scan (cas courant) — à MONTRER, sinon personne ne relance. */
  readonly hasFile: boolean
}
export interface PartyCreditLimit {
  readonly publicId: string
  /** Société — **obligatoire** pour un plafond. */
  readonly officeAccountId: number
  /**
   * Nom lisible du bureau, livré par l'API (06/08). `null` a DEUX sens, que
   * `officeAccountId` sépare : identifiant nul aussi = portée commune ; identifiant
   * renseigné = bureau hors du périmètre de visibilité (RLS). Dans ce second cas on
   * affiche un libellé neutre — jamais l'identifiant.
   */
  readonly officeDisplayName: string | null
  readonly currencyCode: string | null
  readonly serviceTypeCode: string | null
  /** Montant en unités mineures, **chaîne** — ne jamais convertir en nombre. */
  readonly amountMinor: string
  /** `null` sur un socle. */
  readonly validFrom: string | null
  /** `null` = **socle** permanent ; renseigné = **rallonge** qui expire (dernier jour inclus). */
  readonly validTo: string | null
  /** `true` = rallonge (s'AJOUTE au socle) ; `false` = socle (un seul par société/devise/service). */
  readonly isExtension: boolean
}
export interface PartyManager {
  readonly publicId: string
  readonly managerPublicId: string
  readonly managerDisplayName: string
  readonly assignmentType: string
  /** `null` = **toutes les sociétés** (portée). Un client peut avoir 2 commerciaux. */
  readonly officeAccountId: number | null
}
export interface PartyTaxExemption {
  readonly publicId: string
  /** Société qui l'accorde — **obligatoire**. */
  readonly officeAccountId: number
  /**
   * Nom lisible du bureau, livré par l'API (06/08). `null` a DEUX sens, que
   * `officeAccountId` sépare : identifiant nul aussi = portée commune ; identifiant
   * renseigné = bureau hors du périmètre de visibilité (RLS). Dans ce second cas on
   * affiche un libellé neutre — jamais l'identifiant.
   */
  readonly officeDisplayName: string | null
  readonly exemptionType: string | null
  readonly certificateNumber: string | null
  /** `false` = exonération **sans justificatif** — à MONTRER en premier. */
  readonly hasCertificate: boolean
  readonly validFrom: string | null
  readonly validTo: string | null
}
export interface PartyCommercialPolicy {
  /** `null` = politique **commune** ; sinon propre à une société. La plus précise l'emporte. */
  readonly officeAccountId: number | null
  /**
   * Nom lisible du bureau, livré par l'API (06/08). `null` a DEUX sens, que
   * `officeAccountId` sépare : identifiant nul aussi = portée commune ; identifiant
   * renseigné = bureau hors du périmètre de visibilité (RLS). Dans ce second cas on
   * affiche un libellé neutre — jamais l'identifiant.
   */
  readonly officeDisplayName: string | null
  readonly forceOnRequest: boolean
  readonly blockWhenInsufficientBalance: boolean
}
export interface PartyApprovalRule {
  readonly publicId: string
  readonly functionCode: string
  readonly validatorPublicId: string
  readonly validatorDisplayName: string
  readonly officeAccountId: number | null
  /**
   * Nom lisible du bureau, livré par l'API (06/08). `null` a DEUX sens, que
   * `officeAccountId` sépare : identifiant nul aussi = portée commune ; identifiant
   * renseigné = bureau hors du périmètre de visibilité (RLS). Dans ce second cas on
   * affiche un libellé neutre — jamais l'identifiant.
   */
  readonly officeDisplayName: string | null
  /** `false` = validateur **parti** de l'organisation (reste désigné) — afficher l'alerte. */
  readonly validatorStillQualified: boolean
}

/**
 * Fiche détaillée d'un tiers — **livrée par le back (04/08)**, 18 champs en 1 appel :
 * tout ce qu'une ligne de liste porte + `identity` (selon la nature, **null** si
 * jamais saisie) + `parentAccount` (null = pas de mère **ou** hors périmètre) +
 * `addresses` (principale d'abord) + `groups`. Les champs restent tolérants au vide
 * (rendu conditionnel). ⚠️ L'ÉCRITURE de logoUrl/phones/country n'existe pas encore
 * (lecture seule ; chantier back non arbitré) — ne pas construire de formulaire dessus.
 */
export interface PartyAccountDetail {
  readonly publicId: string
  readonly nature: PartyNature
  readonly displayName: string
  readonly email: string | null
  readonly officeScope: string
  readonly isDisabled: boolean
  readonly phonePrimary?: string | null
  readonly phoneSecondary?: string | null
  readonly logoUrl?: string | null
  readonly country?: string | null
  readonly roles?: readonly string[]
  readonly offices?: readonly PartyOfficeRelation[]
  /** Interlocuteurs (borné à 4) ; présent, vide pour une personne. */
  readonly contacts?: readonly PartyContactRef[]
  /** Identifiant de compte — organisations uniquement, `null` pour une personne. Attendu par les endpoints de rattachement. */
  readonly accountId?: number | null
  readonly isProspect?: boolean
  readonly isDisputed?: boolean
  /** `null` si jamais saisie ; forme selon `nature`. */
  readonly identity?: PartyPersonIdentity | PartyOrganizationIdentity | null
  readonly parentAccount?: PartyOfficeRef | null
  /** Sous-agences (enfants dont le parent = cette fiche) ; suit la visibilité (RLS). */
  readonly children?: readonly PartyOfficeRef[]
  readonly addresses?: readonly PartyAddress[]
  readonly groups?: readonly PartyGroupRef[]
  /** Date d'anonymisation RGPD (DATE_ATOM) ; `null` = non anonymisé. Ne JAMAIS déduire l'état du préfixe du nom. */
  readonly anonymizedAt?: string | null
  /** Traçabilité (DATE_ATOM). */
  readonly createdAt?: string
  readonly updatedAt?: string
  /** Date du clic de vérification (DATE_ATOM) ; `null` = non vérifié. Lecture seule (module Core). */
  readonly emailVerifiedAt?: string | null
  /** Devises par défaut (code référentiel) ; `null` = suit le défaut du bureau. N'imposent RIEN. */
  readonly displayCurrencyCode?: string | null
  readonly billingCurrencyCode?: string | null
  /** Sections finance + documents (bornées) — aucune ne déclenche rien (Booking plus tard). */
  readonly documents?: readonly PartyDocument[]
  readonly creditLimits?: readonly PartyCreditLimit[]
  readonly managers?: readonly PartyManager[]
  readonly taxExemptions?: readonly PartyTaxExemption[]
  readonly commercialPolicies?: readonly PartyCommercialPolicy[]
  readonly approvalRules?: readonly PartyApprovalRule[]
}

export interface PartyAddress {
  readonly publicId: string
  readonly addressType: string
  readonly line1: string
  readonly line2: string | null
  readonly city: string
  readonly postalCode: string | null
  readonly countryAlpha2: string | null
  readonly isPrimary: boolean
}

export interface ListPartyParams {
  page?: number
  limit?: number
  search?: string
  nature?: PartyNature
  /** Code de rôle (référentiel `roles`). */
  role?: string
  state?: PartyState
  /** Id numérique du bureau (vient de `/me`, exception assumée §186). */
  officeAccountId?: number
  /** Code pays alpha-2 (référentiel `countries`). */
  country?: string
}

export function listPartyAccounts(
  params: ListPartyParams
): Promise<ListEnvelope<PartyAccountListItem>> {
  return authedRequest<ListEnvelope<PartyAccountListItem>>(
    'GET',
    '/party-accounts',
    {
      query: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        nature: params.nature,
        role: params.role,
        state: params.state,
        officeAccountId: params.officeAccountId,
        country: params.country,
      },
    }
  )
}

export function getPartyAccount(publicId: string): Promise<PartyAccountDetail> {
  return authedRequest<PartyAccountDetail>('GET', `/party-accounts/${publicId}`)
}

export async function getPartyAddresses(
  publicId: string
): Promise<readonly PartyAddress[]> {
  const response = await authedRequest<{ data: readonly PartyAddress[] }>(
    'GET',
    `/party-accounts/${publicId}/addresses`
  )
  return response.data
}

/**
 * `PATCH` partiel — seuls les champs **fournis** sont modifiés (les autres restent) ;
 * `null` **efface**. `parentAccountPublicId: null` détache (organisations seulement —
 * une personne n'a pas de mère : 400). `email`/`phone*`/`country` sont modifiables
 * depuis le 05/08. **Ni format de téléphone imposé, ni validation front** (le back
 * accepte 50 car. libres). `nature` et `logoUrl` ne passent PAS par le PATCH.
 */
export interface PartyAccountPatch {
  displayName?: string
  isDisabled?: boolean
  isProspect?: boolean
  isDisputed?: boolean
  parentAccountPublicId?: string | null
  email?: string | null
  phonePrimary?: string | null
  phoneSecondary?: string | null
  /** Code pays alpha-2 (référentiel) ; `null` efface. */
  country?: string | null
  /** Devises par défaut (code référentiel) ; `null` efface (→ défaut du bureau). */
  displayCurrencyCode?: string | null
  billingCurrencyCode?: string | null
}

export async function patchPartyAccount(
  publicId: string,
  patch: PartyAccountPatch
): Promise<void> {
  await authedRequest<unknown>('PATCH', `/party-accounts/${publicId}`, {
    body: patch,
  })
}

/** Suppression douce, idempotente — le tiers sort du périmètre ; l'historique le garde. */
export async function deletePartyAccount(publicId: string): Promise<void> {
  await authedRequest<unknown>('DELETE', `/party-accounts/${publicId}`)
}

/**
 * Création (shell) — `nature`+`displayName`+`officeScope` requis ; `officeAccountIds`
 * (numériques, de `/me`) + `relationType` requis SI `restricted` ; email/tél/pays/parent
 * optionnels. Identité, rôles, adresses s'ajoutent APRÈS sur la fiche. 422 possibles :
 * email déjà utilisé, pays inconnu, parent introuvable. Renvoie le `publicId` créé.
 */
export interface PartyAccountCreate {
  nature: PartyNature
  displayName: string
  email?: string | null
  phonePrimary?: string | null
  phoneSecondary?: string | null
  country?: string | null
  officeScope: 'all_offices' | 'restricted'
  officeAccountIds?: number[]
  relationType?: 'customer' | 'supplier'
  parentAccountPublicId?: string | null
  /** Devises par défaut (code référentiel) ; facultatives, `null`/absent = défaut du bureau. */
  displayCurrencyCode?: string | null
  billingCurrencyCode?: string | null
}

export async function createPartyAccount(
  input: PartyAccountCreate
): Promise<{ publicId: string }> {
  return authedRequest<{ publicId: string }>('POST', '/party-accounts', {
    body: input,
  })
}

/**
 * Identité — `PUT` = **remplacement TOTAL du bloc** : TOUS les champs doivent être
 * présents (un manquant → 422). `null` = effacer volontairement. Geste : reprendre
 * l'`identity` de la fiche, la modifier, la renvoyer entière. Les 2 codes comptables
 * font l'aller-retour (non affichés, jamais inventés).
 */
export interface PartyPersonIdentityInput {
  firstName: string | null
  lastName: string | null
  employeeReference: string | null
}
export interface PartyOrganizationIdentityInput {
  taxId: string | null
  tradeRegister: string | null
  legalFormCode: string | null
  website: string | null
  accountingAccountCode: string | null
  thirdPartyAccountCode: string | null
}

export async function putPersonIdentity(
  publicId: string,
  block: PartyPersonIdentityInput
): Promise<void> {
  await authedRequest<unknown>(
    'PUT',
    `/party-accounts/${publicId}/person-identity`,
    { body: block }
  )
}

export async function putOrganizationIdentity(
  publicId: string,
  block: PartyOrganizationIdentityInput
): Promise<void> {
  await authedRequest<unknown>(
    'PUT',
    `/party-accounts/${publicId}/organization-identity`,
    { body: block }
  )
}

/**
 * Adresses — même corps pour l'ajout (`POST`) et le remplacement (`PUT`). Seuls
 * `addressType` et `line1` sont obligatoires. Marquer `isPrimary` déclasse l'ancienne
 * principale du même type. Le pays se dit en `alpha2`.
 */
export interface PartyAddressInput {
  addressType: string
  line1: string
  line2: string | null
  city: string | null
  postalCode: string | null
  countryAlpha2: string | null
  isPrimary: boolean
}

export async function createPartyAddress(
  publicId: string,
  input: PartyAddressInput
): Promise<void> {
  await authedRequest<unknown>(
    'POST',
    `/party-accounts/${publicId}/addresses`,
    {
      body: input,
    }
  )
}

export async function updatePartyAddress(
  publicId: string,
  addressPublicId: string,
  input: PartyAddressInput
): Promise<void> {
  await authedRequest<unknown>(
    'PUT',
    `/party-accounts/${publicId}/addresses/${addressPublicId}`,
    { body: input }
  )
}

export async function deletePartyAddress(
  publicId: string,
  addressPublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/addresses/${addressPublicId}`
  )
}

/**
 * Rôles commerciaux — assigner/révoquer par code (référentiel `roles`). Cumulables et
 * historisés côté base. `franchise` est **exclusif** (garde-fou base) : l'ajouter à un
 * tiers qui a déjà un rôle est refusé — on affiche le message d'erreur du back.
 */
export async function assignPartyRole(
  publicId: string,
  roleCode: string
): Promise<void> {
  await authedRequest<unknown>(
    'PUT',
    `/party-accounts/${publicId}/roles/${roleCode}`
  )
}

export async function revokePartyRole(
  publicId: string,
  roleCode: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/roles/${roleCode}`
  )
}

/**
 * LOGO (§2.11) — **le fichier ne traverse jamais l'API**. Trois temps : demander un
 * lien signé (`upload-intent`), **déposer directement chez l'hébergeur** (PUT hors
 * API, sur Cloudflare), puis **confirmer** (l'API vérifie le dépôt avant d'enregistrer).
 *
 * `logoUrl` est **fabriqué à l'affichage** (fiche/liste) : on ne le **stocke** ni ne le
 * **met en cache applicatif** — le domaine changera avant la mise en service, relire la
 * fiche suffira. Le navigateur, lui, peut le garder (un nouveau logo = **adresse neuve**).
 */

/** Miroir client des règles back — pour échouer vite. Le back reste l'autorité (svg refusé, etc.). */
export const LOGO_MAX_BYTES = 2 * 1024 * 1024
export const LOGO_ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export interface LogoUploadIntent {
  readonly uploadUrl: string
  readonly fileKey: string
  readonly expiresInSeconds: number
  readonly requiredHeaders: Record<string, string>
}

/** Étape 1 — « je voudrais déposer ceci » → un lien temporaire. 422 si type/taille refusés. */
export function requestLogoUploadIntent(
  publicId: string,
  input: { contentType: string; sizeBytes: number }
): Promise<LogoUploadIntent> {
  return authedRequest<LogoUploadIntent>(
    'POST',
    `/party-accounts/${publicId}/logo/upload-intent`,
    { body: input }
  )
}

/**
 * Étape 2 — dépôt **direct** chez l'hébergeur, **hors API** : `fetch` nu, sans cookie de
 * session. On renvoie `requiredHeaders` **à l'identique** ; `Content-Length` est posé par
 * le navigateur (en-tête interdit à JS) et vaut la taille du fichier — soit le `sizeBytes`
 * signé. Tant que le CORS n'est pas posé sur le seau, cet appel échoue en amont (erreur
 * réseau/CORS non diagnosticable côté JS) — c'est attendu, pas un défaut du code.
 */
export async function uploadToStorage(
  intent: LogoUploadIntent,
  file: File
): Promise<void> {
  const response = await fetch(intent.uploadUrl, {
    method: 'PUT',
    headers: intent.requiredHeaders,
    body: file,
  })
  if (!response.ok) {
    throw new Error(`storage-upload-failed:${response.status}`)
  }
}

/** Étape 3 — « c'est déposé ». 422 si le fileKey n'appartient pas au tiers ou n'a pas été déposé. */
export async function confirmLogo(
  publicId: string,
  fileKey: string
): Promise<void> {
  await authedRequest<unknown>('PUT', `/party-accounts/${publicId}/logo`, {
    body: { fileKey },
  })
}

/** Retirer le logo — 204. Le fichier n'est pas supprimé de l'hébergeur (balayage séparé côté back). */
export async function deletePartyLogo(publicId: string): Promise<void> {
  await authedRequest<unknown>('DELETE', `/party-accounts/${publicId}/logo`)
}

/**
 * HISTORIQUE (§1.3) — qui a changé quoi, et quand. Suit la visibilité de la fiche (404 si
 * invisible). `subject` = quelle partie du tiers a bougé (code à libeller). `actor: null` ne
 * veut PAS dire « système » (trace ancienne, écriture sans agent, ou auteur hors périmètre).
 * `logo`/`file` portent une référence de stockage, pas une adresse. `meta.satellitesSince` :
 * la date depuis laquelle les éléments liés (≠ `party`) sont tracés — à lire, jamais en dur.
 */
export interface PartyHistoryChange {
  readonly field: string
  readonly before: string | null
  readonly after: string | null
}
export interface PartyHistoryEntry {
  readonly at: string
  readonly operation: 'INSERT' | 'UPDATE' | 'DELETE'
  readonly subject: string
  readonly actor: { readonly displayName: string } | null
  readonly changes: readonly PartyHistoryChange[]
}
export interface PartyHistoryMeta {
  readonly page: number
  readonly limit: number
  /**
   * « Le journal porte encore des écritures au-delà » — et NON « la page suivante
   * montrera quelque chose ». Le `LIMIT` découpe les lignes du journal, puis l'API
   * écarte celles dont l'écran n'aurait rien à dire ; une page peut donc être plus
   * courte que `limit` sans être la dernière. Ne jamais déduire la fin du nombre
   * d'entrées rendues.
   */
  readonly hasMore: boolean
  readonly satellitesSince: string
}
export interface PartyHistoryPage {
  readonly data: readonly PartyHistoryEntry[]
  readonly meta: PartyHistoryMeta
}

/** `limit` défaut 20, max 100 côté back. */
export function listPartyHistory(
  publicId: string,
  params: { page: number; limit: number }
): Promise<PartyHistoryPage> {
  return authedRequest<PartyHistoryPage>(
    'GET',
    `/party-accounts/${publicId}/history`,
    { query: { page: params.page, limit: params.limit } }
  )
}

/**
 * INTERLOCUTEURS (fonctions) — inscrit / retire une **personne** chez une **organisation**.
 * L'endpoint porte le `publicId` de la PERSONNE ; `organizationAccountId` = l'`accountId` de
 * la fiche organisation. Règle back : « je vois ce tiers, je gère ses interlocuteurs ».
 * **403** si l'organisation n'est pas visible, ou si la personne visée est l'utilisateur
 * connecté (s'inscrire soi-même = s'accorder une visibilité). Inscrire ne connecte personne.
 */
export async function assignPartyFunction(
  personPublicId: string,
  input: { organizationAccountId: number; functionCode: string }
): Promise<void> {
  await authedRequest<unknown>(
    'POST',
    `/party-accounts/${personPublicId}/functions`,
    { body: input }
  )
}

export async function revokePartyFunction(
  personPublicId: string,
  input: { organizationAccountId: number; functionCode: string }
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${personPublicId}/functions`,
    {
      query: {
        organizationAccountId: input.organizationAccountId,
        functionCode: input.functionCode,
      },
    }
  )
}

/**
 * DROIT À L'OUBLI (RGPD) — **irréversible**. Vide nom→« ANONYMISÉ (RGPD) #… », courriel,
 * téléphones, logo, identité, adresses et numéros de documents. Les factures/réservations
 * gardent l'identité **figée** (obligation comptable). **204** fait ; **409** déjà anonymisé.
 * Exige une **confirmation explicite** de l'agent (l'API ne distingue pas un clic malheureux).
 */
export async function anonymizePartyAccount(publicId: string): Promise<void> {
  await authedRequest<unknown>('POST', `/party-accounts/${publicId}/anonymize`)
}

/**
 * DOCUMENTS (pièces du dossier). `documentType` **uniquement à la création** (le changer n'a
 * pas de sens). Dates en `AAAA-MM-JJ` ; expiration ≥ émission (sinon 422). Le **fichier est
 * facultatif** et suit la même mécanique que le logo — MAIS **seau PRIVÉ** : la lecture passe
 * par un **lien signé 5 min** (`getDocumentReadLink`), à ouvrir **à la demande**, jamais stocké.
 * Accepté : PDF, PNG, JPEG, WebP, 10 Mio ; svg refusé.
 */
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024
export const DOCUMENT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export interface PartyDocumentInput {
  /** Requis à la création uniquement ; omis au PATCH. */
  documentType?: string
  documentNumber?: string | null
  issuingCountry?: string | null
  issueDate?: string | null
  expiryDate?: string | null
}

export function createPartyDocument(
  publicId: string,
  input: PartyDocumentInput
): Promise<PartyDocument> {
  return authedRequest<PartyDocument>(
    'POST',
    `/party-accounts/${publicId}/documents`,
    { body: input }
  )
}

export function updatePartyDocument(
  publicId: string,
  documentPublicId: string,
  input: PartyDocumentInput
): Promise<PartyDocument> {
  return authedRequest<PartyDocument>(
    'PATCH',
    `/party-accounts/${publicId}/documents/${documentPublicId}`,
    { body: input }
  )
}

export async function deletePartyDocument(
  publicId: string,
  documentPublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/documents/${documentPublicId}`
  )
}

/** Étape 1 du fichier — mêmes règles que le logo, mais borne DOCUMENT (10 Mio, PDF admis). */
export function requestDocumentFileUploadIntent(
  publicId: string,
  documentPublicId: string,
  input: { contentType: string; sizeBytes: number }
): Promise<LogoUploadIntent> {
  return authedRequest<LogoUploadIntent>(
    'POST',
    `/party-accounts/${publicId}/documents/${documentPublicId}/file/upload-intent`,
    { body: input }
  )
}

export async function confirmDocumentFile(
  publicId: string,
  documentPublicId: string,
  fileKey: string
): Promise<void> {
  await authedRequest<unknown>(
    'PUT',
    `/party-accounts/${publicId}/documents/${documentPublicId}/file`,
    { body: { fileKey } }
  )
}

export async function deleteDocumentFile(
  publicId: string,
  documentPublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/documents/${documentPublicId}/file`
  )
}

/** Lien de lecture SIGNÉ (5 min) — à ouvrir aussitôt, ne jamais stocker. */
export function getDocumentReadLink(
  publicId: string,
  documentPublicId: string
): Promise<{ url: string; expiresInSeconds: number }> {
  return authedRequest<{ url: string; expiresInSeconds: number }>(
    'GET',
    `/party-accounts/${publicId}/documents/${documentPublicId}/file`
  )
}

/**
 * PLAFOND DE CRÉDIT — `officeAccountId` **obligatoire** (une société), `currencyCode` requis
 * (devise active), `amountMinor` **positif en chaîne**, `serviceTypeCode` facultatif. **Ne
 * déclenche RIEN** (Booking plus tard). N'agit que sur SES bureaux (garde `/me`).
 */
export interface PartyCreditLimitInput {
  officeAccountId: number
  currencyCode: string
  amountMinor: string
  serviceTypeCode?: string | null
  /** Dates (AAAA-MM-JJ). Sans `validTo` = socle ; avec = rallonge (dernier jour inclus). */
  validFrom?: string | null
  validTo?: string | null
}
export async function createCreditLimit(
  publicId: string,
  input: PartyCreditLimitInput
): Promise<void> {
  await authedRequest<unknown>(
    'POST',
    `/party-accounts/${publicId}/credit-limits`,
    { body: input }
  )
}
export async function deleteCreditLimit(
  publicId: string,
  creditLimitPublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/credit-limits/${creditLimitPublicId}`
  )
}

/**
 * CHARGÉ DE COMPTE — `managerPublicId` (une **personne**), `assignmentType` (**commercial**
 * ou **collection**), `officeAccountId` **facultatif** (`null`/absent = **toutes les sociétés**).
 * Un client peut avoir **plusieurs** commerciaux à la fois.
 */
export interface PartyManagerInput {
  managerPublicId: string
  assignmentType: string
  officeAccountId?: number | null
}
export async function createManager(
  publicId: string,
  input: PartyManagerInput
): Promise<void> {
  await authedRequest<unknown>('POST', `/party-accounts/${publicId}/managers`, {
    body: input,
  })
}
export async function deleteManager(
  publicId: string,
  managerPublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/managers/${managerPublicId}`
  )
}

/**
 * EXONÉRATION DE TVA — nomme **obligatoirement la société** qui l'accorde (sinon 422).
 * `exemptionType` = **stamp_duty | vat**. Le **justificatif** (numéro et/ou document) se pose
 * après, par PATCH — `hasCertificate` dit lesquelles n'en ont pas (à montrer en premier).
 */
export interface PartyTaxExemptionInput {
  officeAccountId: number
  exemptionType: string
  certificateNumber?: string | null
  validFrom?: string | null
  validTo?: string | null
  documentPublicId?: string | null
}
export interface PartyTaxExemptionCertificateInput {
  certificateNumber?: string | null
  documentPublicId?: string | null
}
export async function createTaxExemption(
  publicId: string,
  input: PartyTaxExemptionInput
): Promise<void> {
  await authedRequest<unknown>(
    'POST',
    `/party-accounts/${publicId}/tax-exemptions`,
    { body: input }
  )
}
export async function updateTaxExemptionCertificate(
  publicId: string,
  exemptionPublicId: string,
  input: PartyTaxExemptionCertificateInput
): Promise<void> {
  await authedRequest<unknown>(
    'PATCH',
    `/party-accounts/${publicId}/tax-exemptions/${exemptionPublicId}`,
    { body: input }
  )
}
export async function deleteTaxExemption(
  publicId: string,
  exemptionPublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/tax-exemptions/${exemptionPublicId}`
  )
}

/**
 * POLITIQUE COMMERCIALE — **PUT par portée** (`officeAccountId` `null` = commune ; sinon
 * propre à une société). Une commune et une de société **coexistent, la plus précise
 * l'emporte** — jamais additionnées. **Ne déclenche RIEN.** (Pas de suppression : on ré-écrit.)
 */
export interface PartyCommercialPolicyInput {
  officeAccountId?: number | null
  forceOnRequest: boolean
  blockWhenInsufficientBalance: boolean
}
export async function putCommercialPolicy(
  publicId: string,
  input: PartyCommercialPolicyInput
): Promise<void> {
  await authedRequest<unknown>(
    'PUT',
    `/party-accounts/${publicId}/commercial-policy`,
    { body: input }
  )
}

/**
 * RÈGLE D'APPROBATION — `functionCode` (référentiel), `validatorPublicId` (une **personne**),
 * `officeAccountId` facultatif. **Plusieurs validateurs** pour une même fonction ; **l'accord
 * d'un seul suffit**. `validatorStillQualified` (lecture) alerte si le validateur est parti.
 */
export interface PartyApprovalRuleInput {
  functionCode: string
  validatorPublicId: string
  officeAccountId?: number | null
}
export async function createApprovalRule(
  publicId: string,
  input: PartyApprovalRuleInput
): Promise<void> {
  await authedRequest<unknown>(
    'POST',
    `/party-accounts/${publicId}/approval-rules`,
    { body: input }
  )
}
export async function deleteApprovalRule(
  publicId: string,
  approvalRulePublicId: string
): Promise<void> {
  await authedRequest<unknown>(
    'DELETE',
    `/party-accounts/${publicId}/approval-rules/${approvalRulePublicId}`
  )
}
