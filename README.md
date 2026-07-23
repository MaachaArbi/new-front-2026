# OsTravel Back Office — Frontend

Vague **S1 : Squelette & purge** ✅ · **S2 : Socle visuel** ⏳ (en cours)  
React 19 + Vite 7 + TypeScript strict + Tailwind v4 + i18n/RTL + thème clair/sombre

## Démarrage rapide

```bash
npm run dev    # Démarre le serveur de développement (port 5180)
npm run build  # Build production (avec vérification TypeScript)
npm run lint   # Exécute ESLint
npm run format # Formate le code avec Prettier
```

## Structure du projet

```
ostravel-front/
├── src/
│   ├── main.tsx              # Point d'entrée React
│   ├── App.tsx               # Composant racine
│   ├── styles/               # Feuilles de styles globales
│   ├── shared/               # Code partagé
│   │   ├── api/              # (vide, S5)
│   │   ├── auth/             # (vide, S6)
│   │   ├── permissions/      # (vide, S8)
│   │   ├── i18n/             # (vide, S4)
│   │   ├── money/            # (vide, S7)
│   │   ├── layout/           # (vide, S3)
│   │   ├── ui/               # (vide, S2)
│   │   ├── errors/           # (vide, S10)
│   │   ├── hooks/            # (vide)
│   │   └── lib/              # Utilitaires
│   │       └── cn.ts         # clsx + tailwind-merge
│   ├── modules/              # (vide, écrans métier)
│   └── app/                  # (vide, layout/routage S3)
├── docs/
│   ├── STATUS.md             # État vivant du projet
│   ├── journal/              # Journaux de clôture des vagues
│   ├── prompts/              # Prompts exacts envoyés
│   ├── backlog/              # TODO et IN-PROGRESS
│   ├── decisions/            # Décisions ponctuelles
│   └── demandes-backend/     # Blocages attendant le backend
├── reference/                # EN LECTURE SEULE
│   └── front-cadrage/        # Docs de cadrage projet
├── vite.config.ts            # Config Vite + React + Tailwind
├── tsconfig.*.json           # TypeScript strict
├── eslint.config.js          # ESLint plat + Prettier
├── .prettierrc.json          # Prettier + plugin Tailwind
└── package.json              # Dépendances (199 packages)
```

## Configuration

### TypeScript

- **Strict mode** : `strict: true`
- **`noUncheckedIndexedAccess`** : **obligatoire** (ADR-F05)
- **Target** : ES2022
- **Build bloquant** : `tsc -b && vite build`

### Tailwind

- **v4**, CSS-first (`@import 'tailwindcss'`)
- Aucun `tailwind.config.js`
- Plugin Prettier pour réordonner les classes

### ESLint

- **Pas de `any`** : `@typescript-eslint/no-explicit-any: error`
- Intégration Prettier
- React Hooks + React Refresh

## Port de développement

Vite démarre sur **port 5180** (strictPort, non-négociable pour VPS partagé).

```bash
http://localhost:5180
```

## Dépendances

### Runtime (9 packages)

- `react@^19`, `react-dom@^19`
- `tailwind-merge`, `clsx`, `class-variance-authority`
- `lucide-react` (icônes — seul jeu retenu)

### Dev (22 packages)

- Vite 7, TypeScript 5.9
- ESLint + TypeScript ESLint + React plugins
- Prettier + plugin Tailwind
- Tailwind CSS 4

**Aucune dépendance interdite** (ADR-F18) : `react-query` v3, `formik`, `apexcharts`, `notistack`, `@remixicon/react`, `ag-grid`, Keenicons, etc. sont explicitement exclus.

## Prochaines vagues

| Vague   | Sujet                       | État         |
| ------- | --------------------------- | ------------ |
| **S1**  | ✅ Squelette & purge        | **COMPLET**  |
| **S2**  | ✅ Socle visuel             | **EN COURS** |
| **S3**  | Layout unique               | ⏳           |
| **S4**  | i18n & RTL                  | ⏳           |
| **S5**  | Client API typé             | ⏳           |
| **S6**  | Authentification            | ⏳           |
| **S7**  | Noyau Money                 | ⏳           |
| **S8**  | Permissions & entitlements  | ⏳           |
| **S9**  | Patterns liste & formulaire | ⏳           |
| **S10** | Erreur & observabilité      | ⏳           |
| **S11** | Tests & CI                  | ⏳           |

## Documentation

- **Référence de cadrage** : `reference/front-cadrage/`
- **Journal par vague** : `docs/journal/`
- **Backlog** : `docs/backlog/`
- **Demandes backend** : `docs/demandes-backend/`
- **Décisions** : `docs/decisions/`

## CI/CD (attendu vague S11)

- ✅ `npm run build` bloquant sur typage
- ✅ `npm run lint` 0 erreur
- ⏳ `npm run test` (Vitest)
- ⏳ `npm run e2e` (Playwright)
- ⏳ Budget de bundle (ko)
- ⏳ Dérive de contrat API (`openapi.json` diff)

## Notes

- **VPS partagé** : aucun `sudo`, aucun `-g`, aucun restart de services
- **Backend** : se connecte à `http://127.0.0.1:8080` (Docker Compose)
- **Aucun code Metronic** : composants réimportés avec `npx shadcn add` au besoin
- **i18n** : FormatJS/react-intl en S4 (3 langues : en/fr/ar)
- **RTL** : garanti par ESLint + test bidirectionnel

---

**Pilote** : `00-Main DEV Front` (chat)  
**Référence BDD** : `00-Main DB architect` (14 modules, 293 tables figées)  
**Backend** : Symfony 7.2 + PostgreSQL 16 + Docker Compose (`/home/ubuntu/ostravel`)
