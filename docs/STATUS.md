# STATUS — OsTravel Front

**Date de mise à jour** : 2026-07-23  
**Projet** : OS-TRAVEL Back Office (React/Vite)  
**Édifeur** : OctaSoft

---

## État des socles

| Vague  | État       | Livrables                                                        | Prochaine |
| ------ | ---------- | ---------------------------------------------------------------- | --------- |
| **S1** | ✅ COMPLET | Vite 7 + React 19 + TS strict + ESLint + Prettier + arborescence | S2        |
| **S2** | ⏳         | Tokens & thème — non commencé                                    |           |
| **S3** | ⏳         | Layout — non commencé                                            |           |
| **S4** | ⏳         | i18n & RTL — non commencé                                        |           |
| ...    | ⏳         | —                                                                |           |

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

Lancer S2 : tokens & thème.
