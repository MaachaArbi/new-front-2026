# Demande Backend — Rendre les rattachements bureaux GÉRABLES depuis la fiche

**Date** : 2026-08-05
**Statut** : 🔴 ATTENDU
**Bloque** : l'**édition des bureaux** (multi-rattachement) sur la page dossier Tiers

---

## Le besoin (pas la solution — règle R1)

Un tiers est rattaché à **plusieurs bureaux**, comme **client** et/ou **fournisseur**
(§173 ; ~20 % des clients travaillent avec plusieurs bureaux). On veut le **gérer**
depuis la fiche : voir les rattachements, en **ajouter**, en **retirer**.

Les points d'entrée existent et sont clairs :
- `POST   /party-accounts/{publicId}/office-relations` — body `{ officeAccountId (int), relationType }`
- `DELETE /party-accounts/{publicId}/office-relations?officeAccountId=…&relationType=…`

**Le trou** : pour **détacher** (et pour afficher **client vs fournisseur** par bureau),
il faut `officeAccountId` (numérique) **et** `relationType`. Or la **fiche** ne rend
`offices[]` que sous la forme `{ publicId, displayName }` — **ni `relationType`, ni
l'id numérique**. On peut donc **lire** les bureaux, mais **ni les détacher ni dire le
rôle**. C'est le « on lit mais on ne peut pas gérer » que vous nous avez invités à
signaler.

**Demandé** : que la lecture expose, **par rattachement**, de quoi le gérer — au
minimum `relationType`, et l'identifiant que le DELETE attend (`officeAccountId`
numérique, dont vous avez déjà admis qu'il n'est pas un secret, §186). Le front ne
prescrit pas la forme — enrichir `offices[]` de la fiche, ou un read dédié : **le back
tranche**.

### Forme qui nous suffirait (indicative)

```json
"offices": [
  { "accountId": 12, "publicId": "…", "displayName": "myGO Tunis", "relationType": "customer" },
  { "accountId": 12, "publicId": "…", "displayName": "myGO Tunis", "relationType": "supplier" }
]
```
Un même bureau peut apparaître **deux fois** (client ET fournisseur) — ce sont deux
rattachements distincts, chacun détachable.

## Impact

- **Sans** : les bureaux restent en **lecture seule** sur la fiche (affichés, non
  gérables). L'ajout/retrait de rattachement est impossible côté front.
- **Avec** : on construit l'édition multi-bureaux (puces client/fournisseur, ajout
  depuis vos bureaux `/me`, retrait) — comme les rôles.

## En attendant

La fiche **affiche** les bureaux (section « Bureaux », lecture seule) et sépare
proprement l'**agence mère** (unique, `parent_account_id`, déjà éditable) des
**bureaux** (multiples). L'édition des rattachements est **prête à brancher** dès la
livraison.

## Références

- Contrat d'API §3 (points d'entrée), §2.4 (RLS / garde bureau).
- Domaine : `reference/business/party.md` §173 ; `party_account_office_relation`.
