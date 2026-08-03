/**
 * API du module Party (contrat §3). Formes vérifiées dans les tests
 * d'intégration :
 * - liste `{ data, meta:{page,limit,total,totalPages} }`, item à 4 clés ;
 * - détail = identité de base ;
 * - adresses = `{ data: [...] }` (sous-collection).
 *
 * Tout passe par `authedRequest` (401 → refresh → rejeu). **Une liste n'est
 * jamais complète** (RLS §2.4) : l'appelant ne suppose pas la globalité.
 */

import { authedRequest } from '@/shared/auth/session'

export type PartyNature = 'person' | 'organization'

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

export interface PartyAccountListItem {
  readonly publicId: string
  readonly nature: PartyNature
  readonly displayName: string
  readonly email: string | null
}

export interface PartyAccountDetail {
  readonly publicId: string
  readonly nature: PartyNature
  readonly displayName: string
  readonly email: string | null
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
  nature?: PartyNature
  search?: string
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
        nature: params.nature,
        search: params.search,
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
