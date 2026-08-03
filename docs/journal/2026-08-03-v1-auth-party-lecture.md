# Journal — Vague V1 — Fondation d'accès + Party en lecture

**Date** : 2026-08-03
**État** : ✅ COMPLET côté code (117 tests verts) ; **test bout-en-bout contre
l'API en attente** (origine dev à déclarer côté back + tunnel — voir §Accès)
**Résultat visé** : se connecter, lire son périmètre (`/me`), lister et consulter
les tiers — contre le vrai backend, dans le respect du contrat.

---

## Recherche consignée

Contrat d'API lu en entier ; formes exactes vérifiées dans les tests d'intégration
back (le contrat y renvoie) : liste `{data,meta}` (item 4 clés), login/refresh
`{token}` + cookie `httpOnly` (corps vide pour refresh/logout), `/me`
`{publicId,displayName,email,permissions[],organizations[{accountId,publicId,displayName,isOffice}]}`,
détail = identité de base, adresses `{data:[{publicId,addressType,line1,line2?,city,postalCode,countryAlpha2,isPrimary}]}`.
Réconcilié avec nos ADR (F06/F07/F09/F12/F14/F20). Cadrage validé par Arbi.

---

## Ce qui a été fait

**Client API** (`src/shared/api/`) : `errors` (ApiError, deux formes d'enveloppe,
violations, X-Request-Id, drapeaux de statut), `http-client` (Accept-Language,
Bearer, credentials, query, 204→undefined), `locale`, `config`.

**Auth** (`src/shared/auth/`) : access token **en mémoire seule** ; `session`
(login/logout/refresh `credentials:'include'`, **single-flight + verrou
inter-onglets Web Locks**, `authedRequest` 401→refresh→rejeu, `restoreSession`) ;
`me` (`/me` + `officesOf`) ; `office-store` (Zustand, bureau courant).

**App** : `auth-provider` (reprise de session au démarrage, login/logout),
`query-provider` (TanStack Query), **écran de connexion** (RHF, erreur générique,
i18n, RTL, accessible), **porte `AuthGate`** (splash → login → app protégée),
i18n → `Accept-Language`.

**Party** (`src/modules/party/`) : `api` (list/detail/addresses), `queries`
(TanStack Query, `keepPreviousData` → pas de clignotement), **liste** (table
serveur, recherche différée, filtre nature, squelette, **vide≠erreur**, erreur
avec `X-Request-Id`), **panneau détail** `?open=<publicId>` (identité + adresses,
pays via `Intl.DisplayNames`). Route `/parties` câblée. **Sélecteur de bureau**
branché sur `/me` (fini le mock).

Tests : client + auth (single-flight, 401→rejeu, bootstrap), api Party, pays. 117 au total.

---

## Dérives & corrections

1. **Table serveur au lieu du Data Grid ReUI** (dérive au cadrage, assumée) —
   pagination serveur → aucune grande liste en mémoire → la virtualisation du Data
   Grid est inutile ici ; table propre = l'outil juste. Data Grid reporté aux
   écrans qui exigent ses fonctions avancées. Actée :
   `docs/decisions/2026-08-03-contrat-prime-bouchons-et-table-serveur.md`.
2. **Deux dépendances ajoutées** : `@tanstack/react-query` + `zustand` (mandatées
   par ADR-013/F10, déferrées au socle faute d'API). Sans drapeau, `npm ci` vert.
3. **Contrat > bouchons** (ADR-F09) — on ne simule aucun endpoint absent ; drapeau
   `VITE_USE_API_STUBS` retiré. Même décision que ci-dessus.
4. **`addressType` affiché en code brut** (billing…) — c'est un référentiel sans
   endpoint (§4) ; on ne code pas la liste en dur, on montre le code. Le pays, lui,
   se localise via `Intl` (codes ISO connus).
5. **Bundle 749 ko** (+react-intl/query/zustand). Découpage par module au backlog.

---

## Qu'avons-nous établi qui ne soit écrit nulle part ?

- La **réconciliation Data Grid / table serveur** et **contrat > bouchons** —
  désormais écrites (décision du jour).
- Le **schéma de session sans stockage** (access token mémoire + reprise par
  refresh silencieux via cookie) — écrit dans `session.ts` et le cadrage.
- **Rien d'autre d'implicite** : les formes viennent du contrat/tests, pas de
  déduction.

---

## Accès (bloque uniquement le test bout-en-bout, pas le code)

Le code est vérifié en tests unitaires (mocks). Le **vrai login contre l'API**
attend deux choses côté Arbi :
1. déclarer `http://localhost:5180` dans `CORS_ALLOW_ORIGIN` côté back (prompt fourni) ;
2. tunnel SSH `-L 5180:localhost:5180 -L 8080:localhost:8080`, ouvrir `http://localhost:5180`.

---

## Bloc de clôture chiffré

```
npm ci       sans drapeau : oui
tsc          exit 0        (rm -rf dist && npx tsc -b → dist reste vide)
eslint       0 erreur, 14 avertissements (react-refresh, bénins)
vitest       117 tests, 20 fichiers — tous verts
bundle       749,73 ko JS initial (233,35 ko gzip)
deps         ajoutées : @tanstack/react-query, zustand (ADR-013/F10) — sans drapeau
api          réel (docker :8080) ; test bout-en-bout en attente (origine + tunnel)
```

---

## Critères d'acceptation — état

- [x] `npm ci` sans drapeau ; build ; lint 0 err ; `tsc -b` → dist vide ; test vert ; check:reference vert
- [x] Login / refresh / logout `credentials:'include'`, **rien de stocké**, single-flight prouvé
- [x] `/me` → sélecteur de bureau peuplé
- [x] Liste tiers : pagination serveur, **vide≠erreur**, message sur 422 (via ApiError)
- [x] Détail + adresses ; panneau `?open=`
- [x] Aucune liste référentielle en dur ; pays via `Intl`
- [x] Enveloppe d'erreur + `X-Request-Id` remontés
- [~] **Test bout-en-bout** contre l'API : en attente (origine + tunnel) — signalé, pas coché

---

## Livrables

- ✅ `docs/cadrage/2026-08-03-v1-auth-party-lecture.md` (validé)
- ✅ `docs/journal/2026-08-03-v1-auth-party-lecture.md` (ce fichier)
- ✅ `docs/decisions/2026-08-03-contrat-prime-bouchons-et-table-serveur.md`
- ✅ `docs/demandes-backend/2026-08-03-refresh-token-hors-portee-js.md` (livrée)
- ✅ `docs/STATUS.md` + `docs/backlog/todo.md`

**Commit unique** : `feat(v1): fondation d'accès API + Party en lecture (auth, /me, tiers)`

## Prochaine action

Test bout-en-bout ensemble (origine + tunnel). Puis vague suivante : création/édition
de tiers **quand les endpoints référentiels arrivent** (§5), ou lecture Booking.
