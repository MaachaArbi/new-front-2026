# Front — Index des modules

**Rôle** : équivalent front de `00-INDEX.md` (BDD) et de `02-backend-module-index.md`. À relire avant d'ouvrir une session sur un module.
**Version** : 1.0 — 23/07/2026

**Règle absolue** : aucun écran front sur un module dont le backend n'expose rien. La phase socle, elle, ne dépend d'aucun endpoint.

---

## 1. État réel par module

Colonne « Backend HTTP » vérifiée dans le code du dépôt, pas dans la documentation.

| Module BDD                                | BDD               | Backend HTTP                                                                                               | Front |
| ----------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- | ----- |
| **Party** (tiers unifié)                  | ✅ V1.4           | ✅ CRUD + liste paginée + assignations rôle/fonction/groupe                                                | ⏳    |
| **Core** (identité/auth)                  | ✅ V1.2           | ⚠️ **login JWT seul** — pas de `/me`, pas de MFA, pas de session                                           | ⏳    |
| **Booking**                               | ✅ V1.3           | ✅ create/get/list + voyageurs, hôtel, transport, location, annulation, charges, settlements, payer-splits | ⏳    |
| **Règlements**                            | ✅ V1.0           | ✅ instrument, transition, crédit, lettrage, solde                                                         | ⏳    |
| **Cash Management**                       | ✅ V1.0           | ⚠️ **Domain partiel, aucun HTTP**                                                                          | ⏳    |
| **Référentiel commun** (langues, devises) | ✅ V1.2           | ❌ **rien**                                                                                                | ⏳    |
| **Référentiel Hébergement & Géographie**  | ✅ V1.0           | ❌ rien                                                                                                    | ⏳    |
| **Point de vente**                        | ✅ V1.0           | ❌ rien                                                                                                    | ⏳    |
| **Facturation / Avoirs**                  | ✅ V1.0           | ❌ rien                                                                                                    | ⏳    |
| **Product / Catalogue**                   | ✅ V1.0           | ❌ rien                                                                                                    | ⏳    |
| **Pricing**                               | ✅ V1.1           | ❌ rien                                                                                                    | ⏳    |
| **Log** (activité + audit)                | ✅ V1.0           | ❌ rien                                                                                                    | ⏳    |
| **Permissions / Franchises / Config**     | ✅ V1.0           | ❌ **rien** — bloquant transverse                                                                          | ⏳    |
| **Provider Integration**                  | ✅ V1.0           | ❌ rien                                                                                                    | ⏳    |
| **Contracting hôtelier avancé**           | ❌ dernier module | ❌                                                                                                         | ⏳    |

**Lecture** : le backend couvre bien 4 modules sur 14. Mais **aucun référentiel n'est exposé**, et un ERP c'est majoritairement des listes déroulantes. C'est le vrai goulot, plus que le nombre de modules.

> ⚠️ `reference/backend-cadrage/02-backend-module-index.md` (photo du 21/07) déclare « aucun module n'a de code backend » — **c'est faux**. Ne pas s'y fier, vérifier dans le code.

---

## 2. Phase socle — ne dépend d'aucun endpoint

Une vague = un prompt = un journal = une clôture chiffrée.

| #       | Vague                       | Contenu                                                                                                                                   | Dépend de                |
| ------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **S1**  | Squelette & purge           | Dépôt, Vite 7, TS strict + `noUncheckedIndexedAccess`, ESLint/Prettier, purge ADR-F18, `base` corrigée, `reference/` initial              | —                        |
| **S2**  | Tokens & thème              | Un seul jeu de tokens, 3-5 thèmes dont sombre, variables manquantes corrigées, contraste vérifié par thème                                | S1                       |
| **S3**  | Layout unique               | `layout-21` importé et nettoyé, `left-1.75` → `start-1.75`, `layout.css` supprimé, axes de paramétrage exposés, état de layout en Zustand | S2                       |
| **S4**  | i18n & RTL                  | `react-intl`, catalogues en/fr/ar, bascule `dir`, **règle ESLint classes physiques**, rendu testé dans les deux directions                | S1                       |
| **S5**  | Client API                  | Génération de types depuis `openapi.json`, client à deux implémentations, diff de contrat en CI, `Accept-Language`, `X-Request-Id`        | S1 · **demande #1**      |
| **S6**  | Authentification            | Login, stockage du jeton, expiration, `/me` (bouchonné si absent), route protégée                                                         | S5 · **demandes #2, #3** |
| **S7**  | Noyau Money                 | `minor_unit`, `Intl.NumberFormat`, composant de saisie, tests des cas limites (TND 3 décimales)                                           | S4                       |
| **S8**  | Permissions & entitlements  | `can()` à deux ensembles (ADR-F08), `<Permission>`, `<Entitlement>`, `data-acl`, mode Capture paresseux                                   | S6 · **demande #2**      |
| **S9**  | Patterns liste & formulaire | Data Grid ReUI + pagination serveur, Filters à état URL, formulaire RHF+Zod avec remontée des `violations` sur les champs                 | S5 · S7                  |
| **S10** | Erreur & observabilité      | Enveloppe d'erreur, mapping 404/409/422/400, error boundaries, `X-Request-Id` affiché                                                     | S5                       |
| **S11** | Tests & CI                  | Vitest + Testing Library + Playwright, budget de bundle, bloc de clôture chiffré                                                          | toutes                   |

**S1 à S4 sont totalement indépendantes du backend.** S5 peut démarrer sur un `openapi.json` partiel.

**Modèle de menu (ADR-F19)** — `MenuItem` étendu avec `titleKey`, `permission`, `entitlement` : traité en S3, câblé en S8.

---

## 3. Demandes backend

Une par fichier dans `docs/demandes-backend/`, avec statut. Aucune ne bloque le socle grâce aux bouchons (ADR-F09).

| #     | Demande                       | Détail                                                                                                                                                                                             | Bloque            |
| ----- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **1** | **OpenAPI**                   | `openapi.json` généré (NelmioApiDocBundle, déjà prescrit dans `06-api-contracts.md`), commité et versionné                                                                                         | S5, tout écran    |
| **2** | **`/me`**                     | identité · bureau · langue · thème · **catalogue** des permissions · permissions **accordées** · entitlements. Les **deux listes** de permissions sont indispensables à l'opt-in inversé (ADR-F08) | S6, S8            |
| **3** | **Refresh token**             | `POST /api/v1/auth/refresh`. Spécifié dans le document hérité, jamais implémenté. Définit l'UX d'expiration de session                                                                             | S6                |
| **4** | **Référentiels**              | devises (+ `minor_unit`), langues, pays/villes, `party_role`, `party_function`, types de service, modes de paiement, statuts, types de charge                                                      | Tout écran métier |
| **5** | **Harmonisation d'enveloppe** | Les listes renvoient `{data, meta}`, les GET unitaires l'objet **nu**. Deux formes pour deux cas                                                                                                   | S5                |
| **6** | **Tri & filtres**             | `sort`, `filter[champ][op]` normalisés. Aujourd'hui seuls `page`, `limit`, `nature`, `search` existent sur Party                                                                                   | S9                |

**Deux points transverses à signaler au chat backend**, hors demande front :

- `config_application_setting` n'a **aucune colonne** pour logo / thème / layout (ADR-F03) → remonte au chat BDD.
- `config_application_setting.mfa_issuer_name` a `'MyGo'` — un nom de client — en valeur par défaut d'un schéma figé.

---

## 4. Ordre des écrans métier

Après le socle. Piloté par la disponibilité HTTP réelle, pas par l'urgence.

### Vague 1 — Party

Le backend est le plus complet, et Party est la fondation référencée par tous les autres modules. C'est aussi la première confrontation réelle aux patterns du socle : liste paginée, filtres, formulaire, onglets de fiche.

**Dépendance immédiate** : demande #4. Une fiche tiers a besoin de `party_role`, `party_function`, pays, devises. C'est ici que la chaîne de demande s'active pour de bon.

### Vague 2 — Core / Authentification avancée

2FA (`input-otp` disponible, `core_mfa_totp` **déjà en base**), sessions, tentatives. Bon candidat précoce : la structure BDD existe, seul le backend manque — la chaîne se résout au premier niveau.

### Vague 3 — Booking (lecture)

Liste et fiche. La création multi-services viendra après : c'est le formulaire le plus complexe du produit (Stepper ReUI).

### Vague 4 — Règlements

HTTP complet côté backend. Attention ADR-F15 : **aucune mise à jour optimiste** sur le grand livre.

> À rouvrir ici : le **lettrage automatique**, explicitement différé côté backend le 23/07 — _« difficile à trancher sans voir les écrans, à reprendre pendant le chantier frontend »_. Trois mécanismes distincts, dont un nécessitant des jobs asynchrones inexistants.

### Ensuite

Cash Management, Facturation, Product/Catalogue, Pricing, Point de vente, Permissions (écran d'administration — le composant Tree de ReUI correspond à `core_permission_category`), Provider Integration.

**Contracting hôtelier avancé en dernier**, comme côté BDD : le legacy sert de passerelle API temporaire.

---

## 5. Sujets ouverts

| Sujet                                                         | Statut                                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Chiffres arabo-indiens selon la locale                        | 🟡 reporté, ADR-F04                                                                           |
| Calendrier hégirien en affichage secondaire                   | 🟡 reporté, ADR-F04                                                                           |
| Couleurs du rail : une par module ou teinte unique            | 🟡 à trancher en S2/S3                                                                        |
| Préfixe `kt-` des classes utilitaires : renommer ou conserver | 🟡 à trancher en S1                                                                           |
| Stockage du jeton (mémoire + refresh, ou cookie httpOnly)     | 🟡 CORS actuel en `allow_credentials: false` — le cookie httpOnly exige un changement backend |
| Redis pour le cache de permissions                            | 🟡 non tranché côté backend                                                                   |
| Rate limiting                                                 | 🟡 non implémenté, peu prioritaire en back-office                                             |
| Politique de résiliation (dégradation lecture seule)          | 🟡 à écrire avant la première vente de module optionnel                                       |
| Observabilité (Sentry / GlitchTip)                            | 🟡 décision d'infrastructure transverse, hors périmètre front seul                            |

---

**Dépend de** : `00-front-project-overview.md` · `01-front-architecture-decisions.md` · `00-INDEX.md` (BDD) · `docs/STATUS.md` (backend)
