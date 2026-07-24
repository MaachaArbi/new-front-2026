# STATUS — OsTravel Front

**Date de mise à jour** : 2026-07-25 (S4 Money clôturée)  
**Projet** : OS-TRAVEL Back Office (React/Vite)  
**Éditeur** : OctaSoft

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
| **S4**     | ✅ COMPLET                         | Noyau Money (bigint/unités mineures), Vitest, règle ESLint toFixed | S5      |
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

**S4 — Noyau Money** livré (`src/shared/money/`) : type `bigint`/unités mineures
indissociable de la devise, `Rate` distinct, registre de devises provisoire,
formatage/parsing localisés (`Intl`), conversion API, `MoneyInput`. Outillage de
test **Vitest + Testing Library** introduit (67 tests, 141 assertions). Règle
ESLint anti-`toFixed` + facteur 100/1000, testée (mord hors noyau, tolère dans le
noyau). Build vert, `tsc -b` → `dist` vide, `npm ci` sans drapeau, `check:reference`
vert.

## Prochaine action

1. **Réconcilier la numérotation** (voir bandeau en tête) avec le chat pilote.
2. Puis consolidation i18n FormatJS/react-intl (ancienne « S4 ») **ou**
   **S5 — Client API typé depuis OpenAPI** (ADR-F09), avec bouchons.
   ⚠️ Bloquant S5 : `openapi.json` n'existe pas encore (demande backend n°1).

Validation visuelle S3b/S3c au navigateur possible à tout moment (serveur dev
sur 5180) : mise en page, palette sombre à trois niveaux, RTL arabe.
