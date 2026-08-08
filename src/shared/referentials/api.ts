/**
 * Référentiels — listes fermées servies en **un seul appel** (§2.8). Ne dépendent
 * pas de qui regarde (aucun RLS) → chargées après login et **gardées en cache**
 * (voir `use-referentials`). On désigne toujours un référentiel par son `code` ;
 * le `label` est traduit selon `Accept-Language`. Les référentiels **ouverts**
 * (villes, hôtels…) ne passent pas par ici — ils se cherchent (à venir).
 */

import { authedRequest } from '@/shared/auth/session'

export interface ReferentialItem {
  readonly code: string
  readonly label: string
}

export interface Referentials {
  readonly legalForms: readonly ReferentialItem[]
  readonly addressTypes: readonly ReferentialItem[]
  readonly roles: readonly ReferentialItem[]
  readonly functions: readonly ReferentialItem[]
  readonly countries: readonly ReferentialItem[]
  /** Devises (§ référentiels) — libellés EN temporaires ; afficher « CODE — Label ». */
  readonly currencies: readonly ReferentialItem[]
  /** Types de service (plafonds…) ; `hotel` = « Hébergement » (couvre résidences/locations), pas « Hôtel ». */
  readonly serviceTypes: readonly ReferentialItem[]
}

export function fetchReferentials(): Promise<Referentials> {
  return authedRequest<Referentials>('GET', '/referentials')
}
