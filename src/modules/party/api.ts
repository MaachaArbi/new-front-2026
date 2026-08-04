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
  readonly offices?: readonly PartyOfficeRef[]
  readonly isProspect?: boolean
  readonly isDisputed?: boolean
  /** `null` si jamais saisie ; forme selon `nature`. */
  readonly identity?: PartyPersonIdentity | PartyOrganizationIdentity | null
  readonly parentAccount?: PartyOfficeRef | null
  readonly addresses?: readonly PartyAddress[]
  readonly groups?: readonly PartyGroupRef[]
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
