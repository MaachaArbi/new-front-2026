/**
 * Nom localisé d'un pays depuis son code alpha-2, via `Intl.DisplayNames`
 * (contrat §4 : les pays circulent en alpha-2, ex. `TN`). On n'invente **aucune**
 * liste : le navigateur connaît les noms ISO dans la locale active. Repli sur le
 * code si indisponible.
 */
export function countryName(
  alpha2: string | null | undefined,
  locale: string
): string {
  if (!alpha2) return ''
  const code = alpha2.toUpperCase()
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}
