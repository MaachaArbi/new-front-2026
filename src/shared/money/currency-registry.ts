/**
 * Registre local des devises — SOURCE PROVISOIRE (S4).
 *
 * ⚠️  PROVISOIRE. L'autorité réelle est la table backend `ref_currency`
 * (colonne `minor_unit`), qui sera exposée par l'API (référentiels, demande
 * backend n°4). Tant qu'elle n'existe pas côté front, ce registre local tient
 * lieu de source de vérité pour **parser et calculer** les montants.
 *
 * Conçu pour être **remplacé par la réponse de l'API sans changer une ligne
 * d'appelant** : les appelants passent toujours par `getCurrency(code)` /
 * `getMinorUnit(code)`. Le jour où l'API répond, on appelle
 * `loadCurrencyRegistry(...)` au démarrage et rien d'autre ne bouge.
 * → backlog : « remplacer le registre local de devises par le référentiel API ».
 *
 * `Intl.NumberFormat` connaît nativement les décimales de chaque devise ISO et
 * sert au **formatage** ; mais le backend reste l'autorité pour parser et
 * calculer (ADR-F07 / ADR-F06). D'où ce registre local, et non `Intl`, comme
 * source de `minorUnit`.
 *
 * Les valeurs `minorUnit` ci-dessous suivent la norme ISO 4217 (ce ne sont pas
 * des règles métier déduites) : dinar tunisien, libyen, jordanien, koweïtien,
 * bahreïni et rial omanais à 3 décimales ; euro, dollar, dirham marocain et
 * émirati, dinar algérien, riyal saoudien à 2.
 */

export interface CurrencyDefinition {
  /** Code ISO 4217, ex. « TND ». */
  readonly code: string
  /** Nombre d'unités mineures (décimales). 2 ou 3 sur les marchés visés. */
  readonly minorUnit: number
}

/** Liste provisoire S4 — minimum ADR-F07/§4.2 + cluster à 3 décimales des marchés visés. */
const PROVISIONAL_CURRENCIES: readonly CurrencyDefinition[] = [
  // Devises à 3 décimales — la norme, pas l'exception, sur les marchés visés.
  { code: 'TND', minorUnit: 3 }, // dinar tunisien
  { code: 'LYD', minorUnit: 3 }, // dinar libyen
  { code: 'JOD', minorUnit: 3 }, // dinar jordanien
  { code: 'KWD', minorUnit: 3 }, // dinar koweïtien
  { code: 'BHD', minorUnit: 3 }, // dinar bahreïni
  { code: 'OMR', minorUnit: 3 }, // rial omanais
  // Devises à 2 décimales.
  { code: 'EUR', minorUnit: 2 },
  { code: 'USD', minorUnit: 2 },
  { code: 'MAD', minorUnit: 2 }, // dirham marocain
  { code: 'DZD', minorUnit: 2 }, // dinar algérien
  { code: 'SAR', minorUnit: 2 }, // riyal saoudien
  { code: 'AED', minorUnit: 2 }, // dirham émirati
]

/**
 * Registre courant. Mutable derrière l'API `getCurrency` uniquement, pour
 * permettre le remplacement par le référentiel backend sans toucher aux
 * appelants. Cloné pour rester immuable côté lecture.
 */
let registry: ReadonlyMap<string, CurrencyDefinition> = buildRegistry(
  PROVISIONAL_CURRENCIES
)

function buildRegistry(
  definitions: readonly CurrencyDefinition[]
): ReadonlyMap<string, CurrencyDefinition> {
  const map = new Map<string, CurrencyDefinition>()
  for (const def of definitions) {
    if (!Number.isInteger(def.minorUnit) || def.minorUnit < 0) {
      throw new RangeError(
        `minorUnit invalide pour ${def.code} : ${def.minorUnit}`
      )
    }
    map.set(def.code, { code: def.code, minorUnit: def.minorUnit })
  }
  return map
}

/**
 * Remplace le registre par la source d'autorité (à appeler au démarrage quand
 * l'API `ref_currency` sera disponible). Point d'extension unique : aucun
 * appelant de `getCurrency` n'a à changer.
 */
export function loadCurrencyRegistry(
  definitions: readonly CurrencyDefinition[]
): void {
  registry = buildRegistry(definitions)
}

/** `true` si la devise est connue du registre courant. */
export function isRegisteredCurrency(code: string): boolean {
  return registry.has(code)
}

/**
 * Définition d'une devise. Lève si inconnue — un montant dans une devise dont
 * on ignore `minorUnit` ne doit jamais être calculé ni affiché en silence
 * (facteur 10 garanti, ADR-F07).
 */
export function getCurrency(code: string): CurrencyDefinition {
  const def = registry.get(code)
  if (!def) {
    throw new RangeError(
      `Devise inconnue du registre : « ${code} ». ` +
        `Ajouter au registre provisoire ou charger le référentiel backend.`
    )
  }
  return def
}

/** Raccourci : nombre d'unités mineures (décimales) d'une devise. */
export function getMinorUnit(code: string): number {
  return getCurrency(code).minorUnit
}

/** Codes couverts par le registre courant (lecture seule). */
export function registeredCurrencyCodes(): readonly string[] {
  return [...registry.keys()]
}
