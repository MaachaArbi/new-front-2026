# Prompt — Vague S1 — Squelette & purge

> À coller tel quel dans Claude Code (ou Cursor).
> À archiver ensuite dans `docs/prompts/2026-07-23-s1-squelette.md`.

---

Tu interviens sur le projet **front OS-TRAVEL** (éditeur : OctaSoft), back-office
React/Vite. C'est la **vague S1 : squelette & purge**. Aucun code n'existe encore.

## 0. AVANT TOUTE CHOSE — lis la référence

Le dépôt contient un dossier `reference/` **en lecture seule**. Lis-le
intégralement avant d'écrire une ligne, dans cet ordre :

1. `reference/front-cadrage/00-front-project-overview.md`
2. `reference/front-cadrage/01-front-architecture-decisions.md`
3. `reference/front-cadrage/02-front-module-index.md`

**Règle absolue** : aucune décision technique ou métier ne doit être déduite,
supposée ou « améliorée » si elle n'est pas explicitement dans ces documents.
En cas de doute ou d'absence d'information : **arrête-toi et demande**. Ne
propose jamais une règle plausible à la place.

Tu ne modifies **jamais** le contenu de `reference/`.

---

## 1. GARDE-FOUS — VPS partagé (CRITIQUE)

Ce VPS héberge **d'autres projets en production, dont un projet React qui
tourne actuellement**. Tu ne dois rien casser.

**Interdictions absolues :**

- ❌ Ne travaille **que** dans `/home/ubuntu/ostravel-front`. Aucune écriture,
  aucun déplacement, aucune suppression ailleurs.
- ❌ Jamais de `sudo`, jamais de `npm install -g`, jamais de `npm -g`.
- ❌ Ne touche pas à `nginx`, `systemd`, `pm2`, `docker`, `crontab`,
  `~/.bashrc`, `~/.profile`, `~/.npmrc` global, ni à aucun gestionnaire de
  version Node (nvm, fnm, volta).
- ❌ Ne tue aucun processus. Ne redémarre aucun service.
- ❌ Ne modifie **pas** `/home/ubuntu/ostravel` (le backend Symfony). Tu peux
  le **lire** si besoin, jamais l'écrire.
- ❌ N'utilise pas `npm install --force`. Si un conflit de dépendances pairs
  apparaît, **arrête-toi et signale-le** au lieu de le forcer.

**Port de développement :**

Un autre projet React tourne, probablement sur 5173. Avant de configurer Vite :

\`\`\`bash
ss -tlnp 2>/dev/null | grep -E ':(517[0-9]|300[0-9])' || echo "aucun port occupé dans la plage"
\`\`\`

Choisis le **premier port libre à partir de 5180** et fixe-le explicitement dans
\`vite.config.ts\` (\`server.port\`, \`strictPort: true\`). Note le port retenu dans
le journal de vague.

**Version de Node :** vérifie-la (\`node -v\`). Il faut ≥ 20. Si elle est
insuffisante, **arrête-toi et signale-le** — ne l'installe pas, ne la change pas.

---

## 2. PÉRIMÈTRE DE CETTE VAGUE

### Ce que S1 fait

1. Squelette Vite 7 + React 19 + TypeScript
2. Configuration TypeScript stricte
3. Tailwind v4 (CSS-first, sans \`tailwind.config.js\`)
4. ESLint + Prettier
5. Arborescence \`src/\` complète (dossiers vides marqués)
6. Complément de la structure \`docs/\` et \`reference/\` si des dossiers manquent
7. Une page « Hello » minimale pour vérifier que la chaîne fonctionne

### Ce que S1 NE fait PAS — hors périmètre, ne l'anticipe pas

- ❌ Aucun import de Metronic, aucun token, aucun thème → **vague S2**
- ❌ Aucun layout → **vague S3**
- ❌ Aucun i18n, aucune règle ESLint RTL → **vague S4**
- ❌ Aucun client API, aucun appel réseau → **vague S5**
- ❌ Aucune authentification → **vague S6**
- ❌ Aucun composant ReUI, aucun \`npx shadcn add\` → au fil des vagues
- ❌ Aucun routeur, aucun TanStack Query, aucun Zustand → leurs vagues
- ❌ Aucun test → **vague S11**

Si tu penses qu'un de ces éléments est nécessaire pour finir S1, **c'est que tu
te trompes sur le périmètre** : signale-le au lieu de l'ajouter.

---

## 3. DÉPENDANCES

### À installer — exactement celles-ci, rien de plus

**Runtime**
\`\`\`
react@^19 react-dom@^19
clsx tailwind-merge class-variance-authority
lucide-react
\`\`\`
(\`clsx\`, \`tailwind-merge\` et \`class-variance-authority\` sont importés par tous
les composants ReUI qui arriveront plus tard ; \`lucide-react\` est le seul jeu
d'icônes retenu — ADR-F17.)

**Développement**
\`\`\`
vite@^7 @vitejs/plugin-react
typescript@^5.9 @types/react @types/react-dom @types/node
tailwindcss@^4 @tailwindcss/vite
eslint typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss
\`\`\`

### Formellement INTERDITES (ADR-F18)

Ne les installe pas, même si une commande d'initialisation te les propose :

\`react-query\` (v3) · \`formik\` · \`react-helmet\` · \`apexcharts\` ·
\`react-apexcharts\` · \`notistack\` · \`react-aria-components\` · \`@remixicon/react\` ·
\`vite-plugin-windicss\` · \`@supabase/supabase-js\` · \`@auth0/auth0-spa-js\` ·
\`@faker-js/faker\` · \`ag-grid-react\` · toute police d'icônes Keenicons ·
\`autoprefixer\` et \`postcss-preset-env\` (inutiles avec Tailwind v4)

---

## 4. CONFIGURATION ATTENDUE

### \`tsconfig.app.json\`

Base Vite standard, **plus** ces options obligatoires :

\`\`\`jsonc
"strict": true,
"noUncheckedIndexedAccess": true, // ADR-F05 — non négociable
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true,
"noUncheckedSideEffectImports": true,
"target": "ES2022",
"baseUrl": "./",
"paths": { "@/_": ["./src/_"] }
\`\`\`

Le build doit être **bloquant sur le typage** : \`"build": "tsc -b && vite build"\`.

### \`vite.config.ts\`

- plugins : \`react()\`, \`tailwindcss()\`
- alias \`@\` → \`./src\`
- \`base: '/'\` (surtout pas de chemin de base en dur)
- \`server.port\` = le port libre détecté, \`strictPort: true\`

### ESLint

- Config plate (\`eslint.config.js\`), TypeScript strict
- Interdiction de \`any\` (\`@typescript-eslint/no-explicit-any\` en **error**)
- Intégration Prettier
- \`npm run lint\` doit sortir **0 erreur**

### \`src/styles/globals.css\`

Uniquement \`@import 'tailwindcss';\` pour l'instant. **Aucun token, aucune
couleur** — c'est la vague S2.

---

## 5. ARBORESCENCE \`src/\`

Crée cette structure. Les dossiers vides reçoivent un \`.gitkeep\`.

\`\`\`
src/
├── main.tsx
├── App.tsx page « Hello » minimale
├── app/ (vide)
├── shared/
│ ├── api/ auth/ permissions/ i18n/ money/
│ ├── layout/ ui/ errors/ hooks/
│ └── lib/
│ └── cn.ts clsx + tailwind-merge
├── modules/ (vide)
└── styles/globals.css
\`\`\`

\`src/shared/lib/cn.ts\` est le seul fichier utilitaire de cette vague.

**Vérifie aussi** que \`docs/\` et \`reference/\` contiennent bien les sous-dossiers
prévus (\`docs/{journal,decisions,backlog,prompts,demandes-backend}\`,
\`reference/{front-cadrage,adr,conceptual-models,meta,api}\`). Crée ceux qui
manquent avec un \`.gitkeep\`. **N'écrase jamais un fichier existant.**

---

## 6. CRITÈRES D'ACCEPTATION

Tous doivent passer avant de clore :

- [ ] \`npm run build\` → succès (typage inclus)
- [ ] \`npm run lint\` → 0 erreur
- [ ] \`npm run dev\` démarre sur le port choisi, la page s'affiche
- [ ] \`grep\` dans \`package.json\` : **aucune** dépendance de la liste interdite
- [ ] \`noUncheckedIndexedAccess: true\` présent dans \`tsconfig.app.json\`
- [ ] Aucun fichier modifié hors de \`/home/ubuntu/ostravel-front\`
- [ ] Aucun fichier de \`reference/\` modifié
- [ ] \`git status\` propre après commit

---

## 7. LIVRABLES DOCUMENTAIRES — aussi importants que le code

### \`docs/prompts/2026-07-23-s1-squelette.md\`

Le présent prompt, copié **tel quel**, sans reformulation.

### \`docs/journal/2026-07-23-s1-squelette.md\`

Suis le gabarit \`docs/journal/_GABARIT.md\`. La section **« Dérives &
corrections » est obligatoire** — même vide, écris explicitement « aucune ».

Elle sert à détecter des motifs : si la même dérive revient trois fois, ce n'est
pas toi qui es fautif, c'est \`reference/\` qui a un trou. Note donc franchement
tout ce que tu as dû deviner, tout ce qui t'a semblé ambigu, tout ce que tu as
failli ajouter hors périmètre.

Reporte le **bloc de clôture chiffré** :

\`\`\`
tsc exit 0
eslint 0 erreur
vitest — (vague S11)
playwright — (vague S11)
bundle — ko initial / — ko total
port dev 51xx
node vXX.X.X
\`\`\`

### \`docs/STATUS.md\`

Mets à jour : versions réelles, S1 → ✅, dernière action, prochaine action (S2).

### \`docs/backlog/todo.md\` et \`in-progress.md\`

Coche S1, remets \`in-progress.md\` à vide.

### Commit

Un seul commit, message conventionnel :
\`chore(s1): squelette Vite 7 + React 19 + TS strict, purge dépendances\`

**Ne pousse pas** sans que je te le demande.

---

## 8. EN CAS DE BLOCAGE

Arrête-toi et signale, plutôt que de contourner, si :

- Node < 20
- un conflit de dépendances pairs apparaît
- aucun port libre dans la plage
- un fichier de \`reference/\` semble incohérent ou manquant
- une décision t'est nécessaire et n'est pas dans \`reference/front-cadrage/\`

**Ne force jamais.** Un blocage signalé coûte cinq minutes ; un contournement
silencieux coûte une vague entière.
