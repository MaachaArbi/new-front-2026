# STATUS — OsTravel Front

**Date de mise à jour** : 2026-08-03 (V1 — accès API + Party en lecture, code livré)  
**Projet** : OS-TRAVEL Back Office (React/Vite)  
**Éditeur** : OctaSoft

> 🔓 **Dégel prononcé le 03/08.** Développement front repris. Source d'ouverture :
> le **contrat d'API** (`/home/ubuntu/ostravel/docs/contrat-de-l-api.md`). Méthode :
> cadrage écrit avant de coder (`docs/cadrage/`), validé par Arbi.

## Dernière action — V1 (code livré, 117 tests)

**Fondation d'accès API + Party en lecture.** Client API typé (enveloppe d'erreur,
`X-Request-Id`, `Accept-Language`), **auth sans stockage** (access token mémoire +
refresh en cookie httpOnly, single-flight + verrou inter-onglets), écran de
connexion, app protégée, `/me` + sélecteur de bureau, **liste des tiers**
(pagination serveur, vide≠erreur) + **panneau détail** `?open=`. `@tanstack/react-query`
+ `zustand` ajoutés (ADR-013/F10).

⚠️ **Test bout-en-bout contre l'API en attente** : déclarer `http://localhost:5180`
dans `CORS_ALLOW_ORIGIN` (back) + tunnel SSH.

> ⚠️ **Numérotation à réconcilier** (voir journal S4, dérive n°1) : le prompt de
> cette vague l'intitule **« S4 — Noyau Money »**, alors que le backlog planifiait
> S4 = consolidation i18n/react-intl et S7 = Money. Le contenu du prompt (Money +
> Vitest) a été livré ; la consolidation i18n **reste à faire**. À trancher par le
> chat pilote : Money devient officiellement S4, ou renuméroter.

---

## État des socles

| Vague      | État                               | Livrables                                                        | Prochaine |
| ---------- | ---------------------------------- | ---------------------------------------------------------------- | --------- |
| **S1**     | ✅ COMPLET (retro-corrigée S1-bis) | Vite 7 + React 19 + TS strict + ESLint + Prettier + arborescence | S2        |
| **S1-bis** | ✅ COMPLET                         | 7 corrections + protection `reference/` par SHA-256              | S2        |
| **S2**     | ✅ COMPLET                         | Infrastructure i18n/thème + layout de base (jetable)             | S3a       |
| **S3a**    | ✅ COMPLET                         | Tokens ReUI, thème next-themes, `npm ci` réparé                  | S3b       |
| **S3b**    | ✅ COMPLET                         | Layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint      | S3c       |
| **S3c**    | ✅ COMPLET                         | Mise en page, palette sombre à trois niveaux, états pastel        | S4        |
| **S4**     | ✅ COMPLET                         | Noyau Money (bigint/unités mineures), Vitest, règle ESLint toFixed | S5-UX   |
| **S5-UX**  | ✅ COMPLET                         | Socle d'interactions : raccourcis (event.code), squelettes, panneaux↔URL, palette Ctrl+K | S-i18n |
| **S-i18n** | ✅ COMPLET                         | Migration react-intl / ICU (interpolation + 6 formes de pluriel arabe) | S-design |
| **S-design** | ✅ COMPLET                       | Alignement fin template (déjà aligné ; 1 écart réel) + page `/_dev/shortcuts` | S6 |
| **S5**     | ⏳                                 | Client API typé (OpenAPI + bouchons) — bloqué : `openapi.json`   |           |
| ...        | ⏳                                 | —                                                                |           |

---

## Configuration locale

- Node : v22.23.1
- npm : v10.9.8
- Port dev : 5180 (Vite, strictPort)
- Port back : 8080 (Docker, http://127.0.0.1:8080)

---

## Demandes backend en attente

| #   | Sujet                   | Statut    | Bloque     |
| --- | ----------------------- | --------- | ---------- |
| 1   | OpenAPI `openapi.json`  | 🔴 absent | S5+        |
| 2   | `/me` avec permissions  | 🔴 absent | S6, S8     |
| 3   | `POST /auth/refresh`    | 🔴 absent | S6         |
| 4   | Référentiels            | 🔴 absent | Tout écran |
| 5   | Harmonisation enveloppe | 🔴 absent | S5+        |
| 6   | Tri & filtres           | 🔴 absent | S9         |
| 7   | Montants en string (JSON) | 🔴 absent | Tout écran à montant |

Détail demande n°7 : `docs/demandes-backend/2026-07-25-montants-json-string.md`
(montants BIGINT sérialisés en nombre JSON → perte de précision au-delà de 2^53
dans `JSON.parse`, avant le noyau Money).

---

## Dernière action

**S-design — Alignement fin + page raccourcis** livrée. Constat mesuré : le
layout est **déjà aligné** sur le template (finitions fournies par les composants
ReUI ; écarts apparents = démo écartée en S3b). Un seul écart réel porté :
`space-y-6` → `space-y-7.5` (espacement inter-groupes du menu). Nouvelle page
pédagogique **`/_dev/shortcuts`** : raccourcis extraits du registre en direct
(`useActiveShortcuts`) + zone d'essai **`event.code` vs `event.key`**. 93 tests,
195 assertions, 0 couleur brute, dimensions `--sidebar-*` inchangées (300/60/54).
**Aucune dépendance ajoutée.**

⚠️ Vérification **perceptuelle** (rail vs template, `/_dev/shortcuts`, RTL) non
faite ici (port 5180 non joignable) — laissée à Arbi.

## Prochaine action

1. **Réconcilier la numérotation** (voir bandeau S4 en tête) avec le chat pilote
   (Money = S4 officiel ? place de S5-UX et S-i18n ?).
2. Validation perceptuelle fr/en/ar + `/_dev/ux` au navigateur.
3. Puis **S6 — Authentification** (JWT Lexik existe ; `core_mfa_totp` /
   `core_mfa_recovery_code` en base depuis le 20/07) **ou** **S5 — Client API**
   (bloqué : `openapi.json` — demande backend n°1).

### Dette suivie (voir backlog)

- Découpage de bundle : **663 ko** JS initial (react-intl a ajouté ~60 ko).
- `react-refresh` : 12 avertissements (vendor `ui/` + socle clavier, hors périmètre).
- `react-router` : 2 « high » — correctif = **montée majeure v8**, non appliqué.
