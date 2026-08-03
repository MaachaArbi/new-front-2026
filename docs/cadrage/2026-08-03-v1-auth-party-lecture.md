# Cadrage — Vague V1 — Fondation d'accès + Party en lecture

**Date** : 2026-08-03
**Statut** : ✅ VALIDÉ puis LIVRÉ (code, 117 tests) — test bout-en-bout en attente (origine + tunnel). Journal : `docs/journal/2026-08-03-v1-auth-party-lecture.md`
**Méthode** : cadrage écrit avant de coder ; source = le contrat d'API (back), pas la mémoire.

> **Source** : `/home/ubuntu/ostravel/docs/contrat-de-l-api.md`. Ce cadrage **renvoie**
> au contrat, il n'en recopie pas le contenu (un document qui redit finit par contredire).

---

## Recherche consignée (avant de cadrer)

Lu et vérifié, côté back (lecture seule) :

- **Contrat d'API** en entier (`docs/contrat-de-l-api.md`).
- Tests d'intégration (le contrat dit que « la forme exacte se lit dans son test ») :
  - `ListPartyAccountsControllerTest` → liste `{data, meta:{page,limit,total,totalPages}}` ;
    item = **4 clés** `{publicId, nature, displayName, email}` ; `?page&limit&nature&search` ;
    `limit>max` → `422 validation_failed` (champ `limit`) ; `page>total` → `200` **data vide** ;
    sans JWT → `401`.
  - `AuthLoginTest` + `SessionLifecycleTest` → login/refresh rendent **`{token, refreshToken}`
    dans le corps** (refreshToken 64 car.) ; JWT porte `public_id`/`username`, **pas** `account_id` ;
    échec de connexion = `401 {code, message:"Invalid credentials."}` (indistinct).
  - `GetAuthenticatedIdentityControllerTest` → `/me` =
    `{publicId, displayName, email, permissions:[codes], organizations:[{accountId, publicId, displayName, isOffice}]}` ;
    compte nu → listes vides (ADR-017, tout fermé par défaut).
  - `GetPartyAccountControllerTest` → détail = identité de base `{publicId, nature, displayName, email}` ;
    404 traduit `{error:{code:'party_account.not_found', message, context}}` ; 500 générique sans fuite.

Côté front : ADR-F06 (i18n), **F07 (Money)**, F08 (permissions/entitlements), F09 (client typé),
F12 (Data Grid, pagination serveur), F14 (enveloppe d'erreur), F20 (UX). Socle déjà en place
(layout-21, tokens, Money, i18n react-intl, clavier, panneaux↔URL).

---

## Objectif de la vague

Poser la **fondation d'accès à l'API réelle** et le **premier module en lecture (Party)** :
se connecter, lire son identité et son périmètre (`/me`), puis **lister et consulter les
tiers** — dans le respect strict du contrat (RLS, `publicId`, enveloppe d'erreur, montants
en unité mineure).

C'est la première vague qui parle au **vrai backend** (Docker `:8080`, `/api/v1`).

---

## Ce que le contrat impose (et qui cadre cette vague)

- **RLS — une liste n'est jamais complète** (§2.4). Écran vide ≠ erreur ; compteur = celui de
  l'utilisateur ; jamais de cache « global ».
- **`publicId` partout, jamais d'`id`** (§1.1). Exception : `accountId`/`officeAccountId`
  (bureaux/organisations) — numériques, assumés.
- **Enveloppe d'erreur** `{error:{code,message,context}}` + `validation_failed/violations` (§1.2) ;
  `code` stable non traduit, `message` affiché, **`X-Request-Id`** sur toute réponse (§1.5).
- **`Accept-Language`** envoyé systématiquement (§2.1).
- **Montants en unité mineure, TND 3 décimales** (§4) → **noyau `Money` tel quel** (ADR-F07).
- **Rotation du refresh, jamais deux fois en parallèle** (§1.6) — voir hors-périmètre.

---

## Périmètre — CE QU'ON FAIT

1. **Client API typé** (`src/shared/api/`) : wrapper `fetch` + types.
   - Envoie `Accept-Language` (langue active i18n) et le `Bearer`.
   - Mappe l'enveloppe d'erreur → objet typé ; **remonte `X-Request-Id`** dans l'affichage d'erreur.
   - `401` → renvoi à la connexion ; `403/404/409/422` typés pour l'appelant.
2. **Connexion + session** (contrat mis à jour 03/08, back `216685f`) :
   - `POST /auth/login` `{email,password}` **avec `credentials:'include'`** → `{token}`.
     L'**access token vit en mémoire** (Bearer, 1 h). Le **refresh token est un cookie
     `httpOnly` `ostravel_refresh`** que le JS ne voit pas — **on ne stocke RIEN**.
   - `POST /auth/refresh` **corps vide**, `credentials:'include'` → `{token}`. Le cookie
     désigne la session.
   - `POST /auth/logout` **corps vide**, `credentials:'include'` → 204.
   - **Reprise de session au chargement** : au démarrage de l'app, un `refresh` silencieux
     (le cookie persiste) rend un access token si la session vaut encore, sinon 401 → login.
     **Aucune persistance côté JS.**
   - **Verrou anti-refresh-parallèle inter-onglets OBLIGATOIRE** (§1.6) : deux refresh
     simultanés = jeton rejoué = **toutes les sessions fermées**. Single-flight + coordination
     entre onglets (Web Locks / BroadcastChannel).
   - `credentials:'include'` **uniquement** sur les 3 routes auth (cookie `Path=/api/v1/auth`) ;
     les routes métier restent en **Bearer** simple.
   - Erreur de connexion → message générique (401 indistinct, §1.2).
3. **`/me` + sélecteur de bureau** : identité, `permissions`, `organizations`.
   - Sélecteur alimenté par les `organizations` (`isOffice`) ; `officeAccountId` prêt à être
     renvoyé aux endpoints qui l'exigent. `permissions` exposées au front (gating S8 non câblé).
4. **Tiers en lecture** :
   - **Liste** `GET /party-accounts` via **ReUI Data Grid** — pagination **serveur**
     (`page/limit/total/totalPages`), filtre `nature`, recherche `search` (nom affiché uniquement),
     **écran vide sans erreur**, message sur `422` (`limit>max`).
   - **Détail** `GET /party-accounts/{publicId}` (identité de base) — en **panneau latéral
     adressable** `?open=<publicId>` (ADR-F20.2).
   - **Adresses** `GET /party-accounts/{publicId}/addresses` (seule sous-ressource lisible).
5. **Câblage layout** : la route `/parties` affiche la vraie liste (remplace le placeholder).
6. **Pays / devises** affichés via **`Intl.DisplayNames`** (localisé, non figé) — **aucune liste
   en dur**. `nature` (person/organization) : 2 libellés i18n stables.

---

## Hors-périmètre — CE QU'ON NE FAIT PAS (et pourquoi)

- **Création / édition** de tiers et sous-ressources → dépend des **référentiels absents**
  (rôles, fonctions, formes juridiques, types d'adresse — §4) qu'on **ne code pas en dur**, et
  `POST /party-accounts` exige `officeScope`/`relationType`. **Différé** jusqu'aux endpoints
  référentiels (§5 : ajout à venir).
- **Lecture des rôles / fonctions / office-relations** d'un tiers → **pas de GET** (§5, à venir).
- **Bookings, Settlements, solde** → vagues ultérieures (endpoints existent, non traités ici).
- **Caisse, Facturation, Tarification, Catalogue, Documents** → **n'existent pas** (§4).
- **`front-jetable`** → conservé comme preuve d'accès jusqu'à ce que notre client marche, **puis
  supprimé** (son README le dit ; il stocke le jeton en localStorage — à ne pas reproduire).

---

## Décisions à enregistrer (à porter en `docs/decisions/` à la clôture)

1. **Le contrat prime sur ADR-F09 pour les bouchons.** Le contrat interdit de **simuler un
   endpoint absent** (« ne le cherche pas, ne le simule pas »). Donc : **aucun bouchon pour faire
   tourner un écran contre un endpoint inexistant.** Les bouchons/`fakes` restent légitimes en
   **tests unitaires** (mock du client). C'est un ajustement d'ADR-F09 à acter.
2. **Montants** : le contrat confirme unité mineure + TND 3 décimales → le noyau `Money` (S4)
   s'applique sans changement.

## Questions ouvertes → RÉSOLUES

- **Transport du refresh token** — ✅ **livré par le back (03/08, `216685f`)** : cookie
  `httpOnly` `ostravel_refresh` (`Secure`, `Path=/api/v1/auth`, `SameSite=None`) + **garde
  d'origine** sur `/api/v1/auth/*` (403 `origin_not_allowed`). L'auth n'est plus différée.

## Prérequis d'ACCÈS DEV (à régler AVANT tout test bout-en-bout)

1. **Origine déclarée** : le back n'autorise que `http://localhost:5173` ; notre dev est sur
   **`5180`** (5173 étant pris par un autre projet du VPS). → **relayer au back** de déclarer
   `http://localhost:5180` dans `CORS_ALLOW_ORIGIN`. Sans ça : `login` paraît OK, `refresh` → 401.
2. **Contexte sécurisé** : le cookie est `Secure` → il n'est posé que sur un **contexte
   sécurisé**. `http://localhost` en est un ; **une IP publique en http, non**. → charger le
   front via un **tunnel SSH** vers `localhost:5180` (+ `:8080` pour l'API), pas via l'IP publique
   en clair. Sinon le cookie n'est jamais gardé.
3. **URL de base de l'API** : `http://localhost:8080/api/v1` (accessible via le tunnel).

---

## Critères d'acceptation (exécutés, pas supposés)

- [ ] `rm -rf node_modules && npm ci` sans drapeau ; `npm run build` ; `npm run lint` 0 erreur ;
      `rm -rf dist && npx tsc -b` → `dist` vide ; `npm run test` vert (nombre reporté) ;
      `npm run check:reference` vert.
- [ ] **Login réel** contre l'API (`:8080`) → `{token, refreshToken}` obtenu (prouvé par test/essai documenté).
- [ ] **`/me`** → sélecteur de bureau peuplé depuis `organizations` (isOffice).
- [ ] **Liste tiers** : pagination serveur câblée sur `meta` ; `page>total` → **écran vide, pas
      d'erreur** ; `limit>max` → message issu du `422`.
- [ ] **Détail + adresses** affichés ; panneau adressable `?open=<publicId>`.
- [ ] **Aucune liste référentielle en dur** ; pays via `Intl.DisplayNames`.
- [ ] **Enveloppe d'erreur** typée + **`X-Request-Id`** affiché dans toute erreur montrée.
- [ ] Montants (si affichés) via le noyau **Money** (aucun `toFixed`).

---

## Livrables

- `docs/cadrage/2026-08-03-v1-auth-party-lecture.md` (ce fichier)
- `docs/journal/2026-08-03-v1-auth-party-lecture.md` (clôture : dérives + « qu'a-t-on établi
  qui ne soit écrit nulle part ? »)
- `docs/decisions/` (contrat > bouchons ; toute décision implicite surgie)
- `docs/STATUS.md` + `docs/backlog/todo.md` mis à jour
- `docs/demandes-backend/` : trace de la demande « refresh token hors de portée du JS »

**Prochain pas après validation** : je code, un commit unique, non poussé sans demande.
