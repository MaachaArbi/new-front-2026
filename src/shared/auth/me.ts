/**
 * `/me` (contrat §2.2) — identité, permissions et organisations de l'utilisateur.
 *
 * Forme vérifiée dans `GetAuthenticatedIdentityControllerTest` : `accountId`
 * numérique des organisations (exception assumée §1.1), `isOffice` distingue le
 * bureau ; `permissions` = codes résolus (rôles + octrois + bornes de dates).
 * Un compte nu → listes vides (ADR-017, tout fermé par défaut).
 */

import { authedRequest } from './session'

export interface MeOrganization {
  /** Identifiant numérique du bureau/organisation — attendu en retour par l'API. */
  readonly accountId: number
  readonly publicId: string
  readonly displayName: string
  readonly isOffice: boolean
  /** Pays de l'entité LÉGALE (alpha2), pas l'adresse ; `null` pour une org non-bureau. */
  readonly country?: string | null
}

export interface Me {
  readonly publicId: string
  readonly displayName: string
  readonly email: string | null
  readonly permissions: readonly string[]
  readonly organizations: readonly MeOrganization[]
}

export function fetchMe(): Promise<Me> {
  return authedRequest<Me>('GET', '/me')
}

/** Les organisations qui sont des bureaux — alimentent le sélecteur de bureau. */
export function officesOf(me: Me): readonly MeOrganization[] {
  return me.organizations.filter((organization) => organization.isOffice)
}

/**
 * Pays (alpha2) du bureau de l'utilisateur — présélectionne l'indicatif du `PhoneInput`.
 * `null` si aucun bureau, aucun pays, ou plusieurs bureaux de pays différents (pas de repli
 * inventé : on ne devine pas). C'est le pays de l'entité légale, pas d'une adresse.
 */
export function officeCountryOf(me: Me): string | null {
  const list = officesOf(me)
    .map((office) => office.country)
    .filter((country): country is string => !!country)
  const unique = new Set(list)
  return unique.size === 1 ? (list[0] ?? null) : null
}
