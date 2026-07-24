# Demande Backend — Montants transactionnels sérialisés en string (précision)

**Date** : 2026-07-25
**Statut** : 🔴 ATTENDU
**Vague(s) concernée(s)** : S5 (client API), tout écran portant un montant

---

## Description

Les montants transactionnels sont stockés en **BIGINT unités mineures** et
sérialisés dans les DTO HTTP en **nombre JSON** (`amountMinor`, `balanceMinor`,
`matchedAmountMinor`… — vérifié dans `SettlementInstrumentResponse`,
`PostSettlementCreditResponse`, `GetPartySettlementBalanceController`,
`AddBookingChargeResponse`).

Un `BIGINT` peut dépasser `Number.MAX_SAFE_INTEGER` de JavaScript (2^53 ≈
9,007 × 10^15). Quand le front fait `response.json()`, **`JSON.parse` transforme
tout nombre JSON en `number` (double IEEE-754)** : au-delà de 2^53, la valeur est
**arrondie avant** que le noyau Money ne la voie. Le montant est alors faux, en
silence, sans exception.

C'est exactement la classe d'erreur qu'un back-office financier ne peut pas se
permettre sur un grand livre append-only.

### Position actuelle du front (parade partielle)

Le noyau Money (`fromApi` → `fromMinorUnits`) **refuse** un `number` non
entier-sûr (`Number.isSafeInteger`) et lève plutôt que de propager un montant
corrompu. Mais la corruption a lieu **dans `JSON.parse`, avant** Money : côté
front on ne peut que détecter le risque sur les valeurs déjà passées, pas
récupérer les bits perdus. La seule vraie parade est côté producteur.

---

## Spécification demandée

**Sérialiser les montants transactionnels en `string`** (chaîne de chiffres en
unités mineures), pas en nombre JSON. Exemple :

```json
{ "amountMinor": "1240500", "currencyCode": "TND" }
```

au lieu de

```json
{ "amountMinor": 1240500, "currencyCode": "TND" }
```

- S'applique à tous les champs `*AmountMinor` / `*Minor` / `balanceMinor`.
- Le front lit déjà indifféremment `string` **ou** `number` (`ApiMoney.amountMinor`),
  et émet du `string` en écriture (`toApi`) — il est prêt des deux côtés.
- En réception d'écritures, accepter `amountMinor` en `string` (cast BIGINT).

Alternative si le changement de contrat est trop coûteux à court terme :
documenter une **borne maximale garantie** ≤ 2^53 sur les montants, à défaut de
quoi le risque reste. (Peu satisfaisant : un cumul de soldes peut franchir la
borne même si chaque pièce reste petite.)

---

## Références

- ADR-F07 (noyau Money), ADR-F09 (client API typé), ADR-F14 (erreurs).
- Décision front : `docs/decisions/2026-07-25-money-bigint-unites-mineures.md`.
- Backend (lecture seule) : `src/Modules/Settlement/Infrastructure/Http/Dto/*`,
  `DoctrineSettlementBalanceRepository::mapBalanceRow()` (cast `toInt()`).
