/**
 * Langue active pour l'en-tête `Accept-Language` (contrat §2.1).
 *
 * Le client API n'est pas un composant React : il lit la langue via ce petit
 * module, que le provider i18n tient à jour (`setApiLocale`) à chaque bascule.
 * Sans `Accept-Language`, l'API répond en anglais.
 */

let currentLocale = 'fr'

export function setApiLocale(locale: string): void {
  currentLocale = locale
}

export function getApiLocale(): string {
  return currentLocale
}
