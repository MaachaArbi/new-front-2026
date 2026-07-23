# STATUS — OsTravel Front

**Date de mise à jour** : 2026-07-24 (S3c clôturée)  
**Projet** : OS-TRAVEL Back Office (React/Vite)  
**Éditeur** : OctaSoft

---

## État des socles

| Vague      | État                               | Livrables                                                        | Prochaine |
| ---------- | ---------------------------------- | ---------------------------------------------------------------- | --------- |
| **S1**     | ✅ COMPLET (retro-corrigée S1-bis) | Vite 7 + React 19 + TS strict + ESLint + Prettier + arborescence | S2        |
| **S1-bis** | ✅ COMPLET                         | 7 corrections + protection `reference/` par SHA-256              | S2        |
| **S2**     | ✅ COMPLET                         | Infrastructure i18n/thème + layout de base (jetable)             | S3a       |
| **S3a**    | ✅ COMPLET                         | Tokens ReUI, thème next-themes, `npm ci` réparé                  | S3b       |
| **S3b**    | ✅ COMPLET                         | Layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint      | S3c       |
| **S3c**    | ✅ COMPLET                         | Mise en page, palette sombre à trois niveaux, états pastel        | S5        |
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

---

## Prochaine action

**S5 — Client API typé depuis OpenAPI** (ADR-F09), avec bouchons.
⚠️ Bloquant connu : `openapi.json` n'existe pas encore (demande backend n°1).

Validation visuelle S3b/S3c au navigateur possible à tout moment (serveur dev
sur 5180) : mise en page, palette sombre à trois niveaux, RTL arabe.
