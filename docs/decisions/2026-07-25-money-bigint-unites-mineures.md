# Décision — 2026-07-25 Noyau Money : bigint, unités mineures, devise indissociable, taux distinct

**Date** : 2026-07-25
**Décideur** : chat pilote 00-Main DEV Front (vague S4)
**Statut** : ✅ ACCEPTÉE

---

## Contexte

ADR-F07 fixe le principe (« un noyau Money unique, reflet du Value Object
backend ; interdits : `toFixed`, flottant sur l'argent, division sans arrondi
explicite »). Restait à trancher la **représentation interne** avant d'écrire une
ligne. Trois questions se posaient, chacune avec un piège coûteux si mal tranchée
sur de l'argent réel de 100+ agences en devises à 2 **et 3** décimales.

Faits vérifiés côté backend (`/home/ubuntu/ostravel`, lecture seule) :

- Value Object `App\Shared\Domain\ValueObject\Money` : `int $amount`,
  `string $currencyCode`, fabrique `fromMinorUnits(int, string)`. Il **ne
  résout pas** `minor_unit` (docblock explicite : « ref_currency non modélisé
  Domain »).
- Les montants transactionnels sont des **BIGINT unités mineures**
  (`amount_minor`, `balance_minor`, `matched_amount_minor`).
- Les taux/marges vivent dans `pricing_*` en `NUMERIC(12,4)` — type distinct.
- `ref_currency.minor_unit` (SMALLINT, TND=3, EUR/USD=2…) vit **en base
  uniquement** et n'est **jamais** exposé dans les DTO HTTP.

---

## Décision

### 1. `bigint`, pas `number`

Le montant interne est un `bigint` en **unités mineures**.

- **Précision.** Les cumuls d'un grand livre append-only (2064 pièces réelles
  déjà côté Règlements) dépassent `Number.MAX_SAFE_INTEGER` (2^53). Un `number`
  y perd des unités en silence. `bigint` est exact sans limite. Prouvé par test
  (`money.test.ts` : 2^53+1 conservé ; `Number('9007199254740993')` dérive).
- **Anti-flottant mécanique.** `bigint` **interdit** syntaxiquement de mélanger
  un flottant : `1240500n * 1.2` ne compile pas. L'interdit ADR-F07 « pas
  d'arithmétique flottante sur l'argent » devient une propriété du type, pas une
  discipline.

### 2. La devise est indissociable du montant

`Money = { amount: bigint, currency: string }`, immuable, **marqué** (brand
nominal). Un nombre nu n'est jamais un montant. Toute opération à deux montants
(add, subtract, compare) **exige la même devise** et **échoue explicitement**
sinon (`CurrencyMismatchError`) — jamais de somme silencieuse entre EUR et USD.
Reflet direct de `Money::add()` + `CurrencyMismatchException` backend.

### 3. `minor_unit` vient d'un registre, jamais codé en dur ni supposé = 2

Le backend n'exposant pas `minor_unit`, le front le résout via
`currency-registry` (source **provisoire** S4, remplaçable par le référentiel API
sans changer un appelant). `Intl.NumberFormat` sert au **formatage** (il connaît
les décimales ISO), mais le registre reste l'autorité pour **parser et calculer**
— le backend est l'autorité, pas le navigateur (ADR-F06).

### 4. Les taux `pricing_*` sont un **type distinct** (`Rate`), non un montant

`Rate` porte une forme (`scaled: bigint` × 10^4) et une marque différentes de
`Money`. Le typage rend **impossible à la compilation** de passer un taux là où
un montant est attendu (et réciproquement). La multiplication `Money × Rate`
exige une **stratégie d'arrondi explicite** (`RoundingMode`) — jamais implicite.

---

## Conséquences

**Pour**

- Exactitude prouvée au-delà de 2^53 (arithmétique, formatage, parsing).
- Confusion montant/taux et mélange de devises impossibles à la compilation.
- `minor_unit` variable géré par construction (TND=3 comme EUR=2), pas par cas
  particulier — le facteur 10 est éliminé à la racine.
- Répartition sans perte (`split`, `allocate`) : la somme des parts égale
  **exactement** l'original (méthode du plus grand reste), y compris négatifs.

**Contre / limites**

- `bigint` n'est pas sérialisable par `JSON.stringify` : la conversion API est
  explicite (`fromApi`/`toApi`, `toMinorUnitsString`).
- Le registre de devises est provisoire → dépend d'une future API référentiel
  (backlog). Une devise absente du registre **lève** (jamais de silence).
- Les montants sortant de l'API en **nombre JSON** (et non string) peuvent être
  corrompus par `JSON.parse` avant Money → garde `Number.isSafeInteger` +
  demande backend (voir `docs/demandes-backend/2026-07-25-montants-json-string.md`).

---

## Références

- ADR-F07 (Money), ADR-F05 (TS strict + `noUncheckedIndexedAccess`),
  ADR-F06 (i18n/`Intl`), ADR-F04 (RTL, chiffres arabo-indiens reportés).
- Backend (lecture seule) : `src/Shared/Domain/ValueObject/Money.php`,
  `src/Modules/Settlement/**`, `reference/schemas/schema-ref-common.sql`
  (`ref_currency.minor_unit`).
- Code : `src/shared/money/` — voir `docs/journal/2026-07-25-s4-money.md`.
