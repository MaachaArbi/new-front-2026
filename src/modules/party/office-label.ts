type Translate = (id: string) => string

/**
 * NOM DE BUREAU sur les objets financiers — plafonds, exonérations, politiques, règles.
 *
 * Avant : le front résolvait `officeAccountId` via la liste des organisations de
 * l'utilisateur (`/me`). Cette liste ne connaît que SES organisations : dès qu'un objet
 * relevait d'un autre bureau — le cas courant dans un groupe multi-agences — la
 * résolution échouait et l'écran affichait `#119751`.
 *
 * Depuis le 06/08, l'API livre `officeDisplayName`. Trois cas, et un seul mot pour
 * chacun :
 *
 * | `officeAccountId` | `officeDisplayName` | Sens                                    |
 * |-------------------|---------------------|-----------------------------------------|
 * | `null`            | `null`              | portée commune — vaut pour toutes        |
 * | renseigné         | `null`              | bureau hors du périmètre de visibilité   |
 * | renseigné         | renseigné           | le nom                                   |
 *
 * Le deuxième cas rend un libellé NEUTRE, jamais l'identifiant : le back ne le comble
 * pas par un repli parce que `party_account` est filtrée par row level security — il ne
 * remplace pas ce qu'il ne sait pas par ce qu'il a sous la main. Nous non plus.
 */
export function officeLabelOf(
  officeAccountId: number | null,
  officeDisplayName: string | null,
  t: Translate
): string {
  if (officeAccountId == null) return t('party.finance.allOffices')
  return officeDisplayName ?? t('party.finance.otherOffice')
}
