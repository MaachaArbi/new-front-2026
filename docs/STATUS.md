# STATUS — OsTravel Front

**Date de mise à jour** : 2026-07-24 (S3b clôturée)  
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
| **S3b**    | ✅ COMPLET                         | Layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint      | S4        |
| **S4**     | ⏳                                 | i18n & RTL — infra posée en S2, à consolider (FormatJS)          |           |
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

**Validation visuelle S3b** au navigateur dès que le port 5180 est joignable
(6 points : affichage, navigation modules, thème, RTL arabe déroulants, mode
large, menu utilisateur), puis **S4 — i18n & RTL** (passage à FormatJS/react-intl
pour le pluriel arabe et `Intl`, tests bidirectionnels).
