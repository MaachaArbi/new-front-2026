# Prompt — Vague S1-bis — Corrections & protection de `reference/`

> À archiver ensuite dans `docs/prompts/2026-07-24-s1bis-corrections.md`.

---

Tu interviens sur le projet **front OS-TRAVEL** (éditeur : OctaSoft), back-office
React/Vite. C'est la **vague S1-bis : corrections**. Elle fait suite à la vérification de S1, qui a validé le socle
(build ✅, lint ✅) mais relevé sept défauts et une violation de la règle de
lecture seule sur `reference/`.

## 0. Lis d'abord

`reference/front-cadrage/00`, `01`, `02` — intégralement.
`docs/journal/2026-07-23-s1-squelette.md` — la vague précédente.

**Tu ne modifies jamais le contenu de `reference/`.** C'est justement l'objet de
cette vague.

## 1. Garde-fous VPS (inchangés, toujours critiques)

Ce VPS héberge d'autres projets en production, dont un projet React qui tourne.

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend) — lecture seule
- ❌ Jamais `npm install --force` : un conflit de dépendances pairs se **signale**, ne se force pas

---

## 2. LES SEPT CORRECTIONS

### 2.1 Déclarer les dépendances fantômes

`vite` et `@eslint/js` sont **utilisés mais absents de `package.json`**. Ils
n'arrivent qu'en transitif — leur version n'est donc pas maîtrisée.

Ajoute en `devDependencies` : `vite@^7`, `@eslint/js@^9`.

### 2.2 Supprimer `vite.config.js`

`vite.config.js` **et** `vite.config.ts` coexistent avec un contenu identique.
Vite résout le `.js` en premier : le `.ts` est mort, et toute future modification
du `.ts` sera silencieusement sans effet.

**Supprime `vite.config.js`.** Garde le `.ts`, et remplace `__dirname` (non défini
en ESM) par la forme correcte :

```ts
import { fileURLToPath, URL } from 'node:url'
// …
alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
```

### 2.3 Corriger l'émission TypeScript

`tsc -b` seul écrit **13 fichiers** (`.js`, `.d.ts`, `.map`) dans `dist/`. C'est
masqué uniquement parce que `vite build` vide `dist` juste après. Quiconque lance
`tsc -b` pour un simple typage pollue la sortie de build.

Dans `tsconfig.app.json` : **retire** `declaration`, `declarationMap`, `outDir`.
**Ajoute** `"noEmit": true` et
`"tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo"`.

### 2.4 Restructurer les `tsconfig`

Le `tsconfig.json` racine mélange `compilerOptions`, `include` **et**
`references` — il compile donc `src` une seconde fois, sans `strict` et sans
`jsx`. Il inclut aussi `vite.config.ts` alors qu'aucun `tsconfig.node.json`
n'existe.

Adopte la structure standard :

```jsonc
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
  ],
}
```

- `tsconfig.app.json` → `"include": ["src"]`, options strictes (inchangées, dont
  **`noUncheckedIndexedAccess: true`** qui reste non négociable), plus 2.3
- `tsconfig.node.json` → `"include": ["vite.config.ts"]`, `noEmit`, son propre
  `tsBuildInfoFile`, `"types": ["node"]`

### 2.5 Ignorer les artefacts de build

`tsconfig.tsbuildinfo` est **commité**. Retire-le du dépôt
(`git rm --cached`) et ajoute au `.gitignore` :

```
*.tsbuildinfo
.vite/
coverage/
playwright-report/
test-results/
```

### 2.6 Supprimer `.eslintignore`

ESLint 9 l'ignore et l'annonce à chaque lancement :
_« The ".eslintignore" file is no longer supported »_. Conséquence : `reference/`
n'est **pas** protégé, contrairement à ce qu'affirme le journal S1.

Supprime le fichier, et déclare les exclusions dans `eslint.config.js` :

```js
{
  ignores: ['dist', 'reference/**', 'node_modules']
}
```

### 2.7 Mettre à niveau les versions en retard

| Paquet                   | Actuel | Cible               | Raison                            |
| ------------------------ | ------ | ------------------- | --------------------------------- |
| `@vitejs/plugin-react`   | ^4     | **^5**              | version alignée React 19 / Vite 7 |
| `tailwind-merge`         | ^2     | **^3**              | les composants ReUI attendent v3  |
| `lucide-react`           | ^0.408 | **dernière stable** |                                   |
| `globals`                | ^15    | **^16**             |                                   |
| `eslint-config-prettier` | ^9     | **^10**             |                                   |

Après mise à niveau : `npm run build` et `npm run lint` doivent toujours passer.
Si une montée casse quelque chose, **signale-le** au lieu de contourner.

---

## 3. PROTÉGER `reference/` PAR OUTILLAGE

La règle de lecture seule est tombée dès la première vague. Une consigne ne
suffit pas : il faut un mécanisme.

### 3.1 Créer `reference/README.md`

**Il n'existe pas** — c'est probablement pourquoi rien n'a arrêté Prettier.
Contenu : l'ordre de lecture (front-cadrage 00 → 01 → 02, puis meta, adr,
conceptual-models, api/openapi.json), la règle absolue (_aucune règle métier
déduite ou supposée ; en cas de doute, s'arrêter et demander_), l'interdiction
formelle de modifier quoi que ce soit dans ce dossier, et le fait que la
synchronisation est une **étape de clôture explicite**.

### 3.2 `.prettierignore`

Doit contenir au minimum `reference/` et `dist/`. Vérifie qu'il est bien pris en
compte : lance `npx prettier --check reference/` — **aucun fichier ne doit être
listé**.

### 3.3 Contrôle d'intégrité par empreintes

Crée `tools/check-reference-integrity.sh` :

- **sans argument** : recalcule le SHA-256 de chaque fichier de `reference/`,
  compare à `reference/.checksums`, et **sort en erreur** au moindre écart, en
  affichant les fichiers concernés
- **avec `--update`** : régénère `reference/.checksums` (geste délibéré, jamais
  automatique)

Génère `reference/.checksums` **après** qu'Arbi a restauré les trois documents.

Ajoute le script à `package.json` : `"check:reference": "bash tools/check-reference-integrity.sh"`.

C'est ce mécanisme, et lui seul, qui aurait détecté la dérive de S1.

### 3.4 CI

Crée `.github/workflows/ci.yml` (Node 22, `npm ci`) enchaînant :

```
npm run check:reference
npm run lint
npm run build
```

---

## 4. COMPLÉTER LA STRUCTURE

Manquants depuis S1. **N'écrase aucun fichier existant.**

- `.env.example` :
  ```
  VITE_API_BASE_URL=http://127.0.0.1:8080/api/v1
  VITE_USE_API_STUBS=true
  VITE_DEFAULT_LOCALE=fr
  ```
- Dossiers : `tests/e2e/`, `tools/`, `public/`, `.github/workflows/` (`.gitkeep` si vides)
- Gabarits manquants dans `docs/` : `decisions/_GABARIT.md`,
  `demandes-backend/_GABARIT.md`, `prompts/_GABARIT.md` (calqués sur
  `docs/journal/_GABARIT.md`)
- Déplace `reference/sujets-reportes.md` → `reference/meta/sujets-reportes.md`

Les dossiers `reference/adr/` et `reference/conceptual-models/` restent vides :
c'est à Arbi de les remplir depuis le dépôt backend. **Ne copie rien toi-même
depuis `/home/ubuntu/ostravel`.**

---

## 5. HORS PÉRIMÈTRE — ne l'anticipe pas

❌ Metronic, tokens, thème → **S2** · ❌ layout → **S3** · ❌ i18n et règle ESLint
RTL → **S4** · ❌ client API → **S5** · ❌ auth → **S6** · ❌ composants ReUI,
`npx shadcn add` → au fil des vagues · ❌ routeur, TanStack Query, Zustand →
leurs vagues · ❌ Vitest, Playwright → **S11** (la CI de 3.4 ne fait que lint +
build + intégrité)

---

## 6. CRITÈRES D'ACCEPTATION

- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur **et plus aucun avertissement `.eslintignore`**
- [ ] `rm -rf dist && npx tsc -b` → **`dist/` reste vide ou inexistant**
- [ ] `npm run check:reference` → succès
- [ ] `npx prettier --check reference/` → aucun fichier listé
- [ ] `vite` et `@eslint/js` présents dans `package.json`
- [ ] `vite.config.js` supprimé, `vite.config.ts` sans `__dirname`
- [ ] `tsconfig.node.json` existe ; `tsconfig.json` réduit à `files: []` + `references`
- [ ] `tsconfig.tsbuildinfo` absent du dépôt
- [ ] `noUncheckedIndexedAccess: true` toujours présent
- [ ] `git status` propre après commit

---

## 7. LIVRABLES DOCUMENTAIRES

### `docs/prompts/2026-07-24-s1bis-corrections.md`

Ce prompt, copié tel quel.

### `docs/journal/2026-07-24-s1bis-corrections.md`

Gabarit habituel. Section **« Dérives & corrections » obligatoire**.

### `docs/journal/2026-07-23-s1-squelette.md` — correction, sans réécriture

**N'efface rien.** Ajoute en fin de fichier :

```md
## Correction apportée en S1-bis (2026-07-24)

Le critère « Aucun fichier de `reference/` modifié ✅ » de ce journal était
**faux**. Prettier avait reformaté les 3 documents de `reference/front-cadrage/`,
et réécrit les blocs de code de `01-front-architecture-decisions.md` (7
points-virgules supprimés dans les extraits d'ADR-F08 et ADR-F19). Le
`.eslintignore` créé en réponse est inopérant sous ESLint 9.

Corrigé en S1-bis : documents restaurés manuellement, `reference/README.md` créé,
`.prettierignore` vérifié, exclusions passées dans la config plate ESLint, et
contrôle d'intégrité par empreintes SHA-256 ajouté en CI.
```

Un journal ne se réécrit pas : il se corrige en s'allongeant. C'est ce qui permet
à une session future de comprendre _comment_ l'erreur a pu passer.

### `docs/decisions/2026-07-24-reference-protegee-par-outillage.md`

Première décision du projet. Contexte : la règle de lecture seule est tombée à la
première vague. Décision : `reference/` est protégé par **outillage** —
`.prettierignore`, `ignores` ESLint, empreintes SHA-256 vérifiées en CI — jamais
par consigne seule. Conséquence : toute mise à jour légitime passe par
`--update`, geste délibéré et tracé.

### `docs/STATUS.md`

Ajoute une ligne S1-bis ✅, mets à jour dernière et prochaine action (**S2 —
tokens & thème**).

### Commit

Un seul : `fix(s1bis): dépendances déclarées, tsconfig assaini, reference/ protégée par empreintes`

**Ne pousse pas** sans que je te le demande.

---

## 8. EN CAS DE BLOCAGE

Arrête-toi et signale si : une montée de version casse le build ou le lint · un
conflit de dépendances pairs apparaît · les trois documents de `reference/` n'ont
pas été restaurés au préalable · une décision t'est nécessaire et n'est pas dans
`reference/front-cadrage/`.

**Ne force jamais.** Cette vague existe parce que S1 a coché des cases sans les
vérifier — ne reproduis pas ça : chaque critère de la section 6 doit être
**exécuté**, et son résultat réel reporté dans le journal.
