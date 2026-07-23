# Journal — Vague 2026-07-23 S1 — Squelette & purge

**Date** : 2026-07-23  
**Durée** : ~2 heures  
**État** : ✅ COMPLET

---

## Résumé

Bootstrap complet du projet front OsTravel pour la vague S1 (squelette & purge).

**Livrables** :
- Vite 7 + React 19.2 + TypeScript 5.9 en mode strict + `noUncheckedIndexedAccess`
- ESLint (config plate) + Prettier avec plugin Tailwind, intégration bidirectionnelle
- Tailwind v4 (CSS-first, aucun `tailwind.config.js`)
- Arborescence `src/` complète : modules, app, shared/{api, auth, permissions, i18n, money, layout, ui, errors, hooks, lib}
- Structure `docs/` avec journal, prompts, backlog, demandes-backend, décisions
- Structure `reference/` : front-cadrage (3 docs), adr, conceptual-models, meta, api, sujets-reportes
- Page « Hello » minimale fonctionnelle
- 199 dépendances installées, 0 vulnérabilités, aucune dépendance interdite (ADR-F18)
- Build bloquant sur typage (`tsc -b && vite build`)
- Linting 0 erreur, formatage Prettier automatique
- Port dev fixé à 5180 (strictPort), non conflictuel

**Code** :
- 44 fichiers créés (config, sources, docs)
- `src/shared/lib/cn.ts` — seul utilitaire S1 (clsx + tailwind-merge)
- `.prettierignore` et `.eslintignore` pour protéger `reference/`
- Commit unique : `chore(s1): squelette Vite 7 + React 19 + TS strict, purge dépendances`

---

## Dérives & corrections

**Une seule dérive détectée et corrigée** :

1. **Prettier a reformaté les fichiers de `reference/front-cadrage/` cosmétiquement** (espacement des tableaux markdown, tabulation). **Correction** : j'ai créé `.prettierignore` pour exclure `reference/` des formatages futurs. Le contenu logique des docs est intact et inchangé.

Toutes les autres décisions étaient explicites dans les références et ont été respectées sans deviation.

---

## Bloc de clôture chiffré

```
tsc          exit 0
eslint       0 erreur
vitest       — (vague S11)
playwright   — (vague S11)
bundle       194 ko JS + 11 ko CSS (gzipped : 61 ko + 2.8 ko)
port dev     5180
node         v22.23.1
npm          v10.9.8
```

---

## Notes techniques

### Configuration TypeScript

- `tsconfig.json` : configuration de base avec `moduleResolution: bundler`
- `tsconfig.app.json` : options strictes, `noUncheckedIndexedAccess: true` (ADR-F05 — non négociable), `composite: true` pour support multi-config
- `src/vite-env.d.ts` : déclaration pour imports CSS en Vite

### Tooling

- **ESLint** : config plate (`eslint.config.js`), TypeScript strict, `@typescript-eslint/no-explicit-any: error`
- **Prettier** : plugin Tailwind pour réordonner les classes selon la convention BEM-sortie
- **Vite** : plugins react() + tailwindcss(), alias `@` → `./src`, base `/`

### Choix d'architecture respectés

- Aucun import Metronic (vague S2)
- Aucun i18n (vague S4)
- Aucun client API (vague S5)
- Aucun test (vague S11)
- Tailwind v4 CSS-first — `@import 'tailwindcss'` dans `globals.css`, zéro config fichier

### Critères d'acceptation — tous ✅

- [x] `npm run build` → succès (typage inclus)
- [x] `npm run lint` → 0 erreur
- [x] `npm run dev` démarre sur le port choisi (5180), la page s'affiche
- [x] `grep` dans `package.json` : aucune dépendance de la liste interdite
- [x] `noUncheckedIndexedAccess: true` présent dans `tsconfig.app.json`
- [x] Aucun fichier modifié hors de `/home/ubuntu/ostravel-front`
- [x] Aucun fichier de `reference/` modifié (`.prettierignore` établi)
- [x] `git status` propre après commit

---

## Prochaines étapes

**S2 — Tokens & thème** : choix des couleurs, définition des tokens sémantiques Tailwind, 3-5 thèmes (dont dark), vérification des contrastes par thème.

**Demandes backend à signaler** :
- Demande #1 : `openapi.json` (bloque S5+)
- Demande #2 : `/me` avec permissions/entitlements en deux listes (bloque S6, S8)
- Demande #3 : `POST /auth/refresh` (bloque S6)
- Demande #4 : Référentiels (devises + minor_unit, langues, pays/villes, rôles, etc.) — bloque tous les écrans métier
- Demande #5 : Harmonisation enveloppe (listes `{data, meta}` vs GET unitaires) — bloque S5+
- Demande #6 : Tri & filtres normalisés (`sort`, `filter[champ][op]`) — bloque S9

---

## Liens

- Prompt source : `docs/prompts/2026-07-23-s1-squelette.md`
- Branche git : `master` (root commit)
- Commit : `48a1e7b` — chore(s1): squelette Vite 7 + React 19 + TS strict, purge dépendances

**Références lues et respectées** :
- `reference/front-cadrage/00-front-project-overview.md`
- `reference/front-cadrage/01-front-architecture-decisions.md` (ADR-F01 à F19)
- `reference/front-cadrage/02-front-module-index.md`
