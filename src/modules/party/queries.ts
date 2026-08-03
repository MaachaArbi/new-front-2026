/**
 * Hooks TanStack Query du module Party (ADR-013).
 *
 * `placeholderData: keepPreviousData` : au changement de page/filtre, les données
 * précédentes restent affichées (la liste ne clignote pas — ADR-F20.4).
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  listPartyAccounts,
  getPartyAccount,
  getPartyAddresses,
  type ListPartyParams,
} from './api'

const PARTY_KEY = 'party-accounts'

export function usePartyAccounts(params: ListPartyParams) {
  return useQuery({
    queryKey: [PARTY_KEY, 'list', params],
    queryFn: () => listPartyAccounts(params),
    placeholderData: keepPreviousData,
  })
}

export function usePartyAccount(publicId: string | null) {
  return useQuery({
    queryKey: [PARTY_KEY, 'detail', publicId],
    queryFn: () => getPartyAccount(publicId as string),
    enabled: publicId !== null,
  })
}

export function usePartyAddresses(publicId: string | null) {
  return useQuery({
    queryKey: [PARTY_KEY, 'addresses', publicId],
    queryFn: () => getPartyAddresses(publicId as string),
    enabled: publicId !== null,
  })
}
