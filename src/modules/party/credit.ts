import type { PartyCreditLimit } from './api'

/**
 * PLAFOND EFFECTIF — la seule définition, pour toute l'application.
 *
 * Le calcul vivait en double : une fois dans l'onglet Finance, une fois dans le rail de
 * la fiche. Le jour où l'on a corrigé la règle d'un côté, les deux se sont contredits à
 * l'écran — la carte annonçait 10 000,500 TND et le rail 10 500,500 TND pour le même
 * client. Un chiffre de crédit qui dépend de l'endroit où on le lit ne vaut rien.
 *
 * La règle : **socle + Σ rallonges actives aujourd'hui**, une rallonge étant active si
 * elle a commencé (`validFrom ≤ aujourd'hui`) et n'a pas expiré (`validTo ≥ aujourd'hui`).
 * Une borne absente ne borne pas.
 *
 * La borne de DÉBUT avait été oubliée : une rallonge datée du mois prochain gonflait le
 * plafond du jour, et un agent pouvait engager un montant que le client n'a pas encore.
 * Les rallonges à venir et expirées restent listées — on ne les cache pas, on ne les
 * compte pas.
 *
 * `amountMinor` est une **chaîne** d'unités mineures : la somme se fait en `BigInt`,
 * jamais en `number`, sous peine de perdre les millimes sur les gros montants.
 */

/** Une portée = une société × une devise × un type de service. */
export interface CreditScope {
  readonly key: string
  readonly officeAccountId: number
  /** Nom livré par l'API ; `null` = bureau hors du périmètre de visibilité. */
  readonly officeDisplayName: string | null
  readonly currencyCode: string | null
  readonly serviceTypeCode: string | null
  readonly socle: PartyCreditLimit | null
  readonly extensions: readonly PartyCreditLimit[]
  /** Somme retenue aujourd'hui, en unités mineures. */
  readonly effectiveMinor: string
}

export function isExtensionActive(
  extension: PartyCreditLimit,
  todayIso: string
): boolean {
  const started = !extension.validFrom || extension.validFrom <= todayIso
  const notExpired = !extension.validTo || extension.validTo >= todayIso
  return started && notExpired
}

/** `true` tant que la rallonge n'a pas commencé — à signaler, jamais à compter. */
export function isExtensionPending(
  extension: PartyCreditLimit,
  todayIso: string
): boolean {
  return !!extension.validFrom && extension.validFrom > todayIso
}

export function isExtensionExpired(
  extension: PartyCreditLimit,
  todayIso: string
): boolean {
  return !!extension.validTo && extension.validTo < todayIso
}

/** Date du jour en ISO local — jamais `toISOString()`, qui bascule en UTC. */
export function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function groupCreditLimits(
  limits: readonly PartyCreditLimit[],
  today: string
): CreditScope[] {
  const map = new Map<
    string,
    {
      officeAccountId: number
      officeDisplayName: string | null
      currencyCode: string | null
      serviceTypeCode: string | null
      socle: PartyCreditLimit | null
      extensions: PartyCreditLimit[]
    }
  >()

  for (const limit of limits) {
    const key = `${limit.officeAccountId}|${limit.currencyCode ?? ''}|${limit.serviceTypeCode ?? ''}`
    let group = map.get(key)
    if (!group) {
      group = {
        officeAccountId: limit.officeAccountId,
        officeDisplayName: limit.officeDisplayName,
        currencyCode: limit.currencyCode,
        serviceTypeCode: limit.serviceTypeCode,
        socle: null,
        extensions: [],
      }
      map.set(key, group)
    }
    if (limit.isExtension) group.extensions.push(limit)
    else group.socle = limit
  }

  return Array.from(map.entries()).map(([key, group]) => {
    let effective = group.socle ? BigInt(group.socle.amountMinor) : 0n
    for (const extension of group.extensions) {
      if (isExtensionActive(extension, today)) {
        effective += BigInt(extension.amountMinor)
      }
    }
    return { key, ...group, effectiveMinor: effective.toString() }
  })
}
