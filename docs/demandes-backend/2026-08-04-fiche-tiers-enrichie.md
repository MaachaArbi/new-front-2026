# Demande Backend — Fiche tiers enrichie (détail en 1 appel)

**Date** : 2026-08-04
**Statut** : 🔴 ATTENDU
**Bloque** : le **panneau détail** du module Tiers (adressable par URL)

---

## Le besoin (pas la solution — règle R1)

Le panneau détail d'un tiers est **adressable par URL** (`?open=<publicId>`) : ouvrir ce
lien dans un **onglet neuf**, sans passer par la liste, doit afficher **la fiche complète**.
Il faut donc **une lecture qui rend tout le nécessaire en un seul appel** — sinon la fiche
est soit incomplète, soit reconstituée en N requêtes fragiles.

Aujourd'hui `GET /api/v1/party-accounts/{publicId}` rend un **DTO pauvre (6 champs)** :
`publicId, nature, displayName, email, isDisabled, officeScope`. C'est **moins** que ce
qu'une **ligne de liste** porte déjà, et il manque **l'identité**.

**Demandé** : que la lecture d'un tiers rende, en un appel, **au moins ce qu'une ligne de
liste porte** + **le bloc d'identité selon la nature**. Le front ne prescrit pas la forme
exacte ni l'endpoint (enrichir le `GET {publicId}` ou en exposer un dédié) — **le back
tranche**. Comme partout : **codes, pas libellés** (rôles, pays, forme juridique traduits
via `/referentials`).

### Ce que le panneau doit afficher

- **En-tête / résumé** (déjà dans une ligne de liste) : `nature`, `displayName`, `email`,
  `phonePrimary`, `phoneSecondary`, `logoUrl`, `country` (alpha-2), `roles[]` (codes),
  `officeScope`, `offices[]` (`{publicId, displayName}`), `isDisabled`, `isProspect`,
  `isDisputed`.
- **Identité selon la nature** (le manque principal) :
  - `person` → `firstName`, `lastName`, `employeeReference` ;
  - `organization` → `taxId`, `tradeRegister`, `legalFormCode` (code réf.), `website`
    (les comptes comptables `accountingAccountCode`/`thirdPartyAccountCode` restent
    « export Excel only » — pas besoin de sémantique à l'écran).
- **Hiérarchie** (contexte réseau, si simple) : `parentAccount` → `{publicId, displayName}`
  ou `null`.

Les **adresses** peuvent rester sur la sous-ressource existante
(`GET /party-accounts/{publicId}/addresses`) — le front sait la charger à part ;
les inclure dans la fiche serait un bonus (1 appel de moins), pas une exigence.

### Exemple d'utilisation

```ts
// À l'ouverture du panneau (depuis la liste OU depuis une URL collée) :
const fiche = await authedRequest('GET', `/party-accounts/${publicId}`)
// -> en-tête + identité (selon fiche.nature) rendus immédiatement, sans autre appel.
```

---

## Spécification (indicative — le back décide)

- Endpoint : enrichir `GET /api/v1/party-accounts/{publicId}` (ou un `.../detail` dédié).
- Réponse : les champs ci-dessus ; **RLS** respecté (un 404 peut vouloir dire « invisible
  pour vous », comme pour la liste).
- Erreurs : `404` (inexistant **ou** hors périmètre), `401` (reconnexion).
- Dépend de : `party_account` + `party_account_person_identity` /
  `party_account_organization_identity` (déjà en base, cf. carte du domaine 04/08).

## En attendant

Le panneau est construit en parallèle avec ce que le front a **déjà** (résumé issu de la
ligne/`GET` actuel + adresses). Le **bloc identité** est ajouté dès la livraison — pas de
rework du reste.

## Références

- ADR : contrat d'API §3 (points d'entrée Party), §2.4 (RLS), §2.8 (référentiels).
- Décisions Tiers : `docs/decisions/2026-08-04-tableaux-full-bleed-datatable-configurable.md`.
- Rappel : l'**enveloppe de liste** `{data, meta}` est **stable** — rien à changer dessus.
