# Journal — Vague 2026-07-24 S1-bis — Corrections & protection de `reference/`

**Date** : 2026-07-24  
**Durée** : ~1.5 heures  
**État** : ✅ COMPLET

---

## Résumé

Correction de 7 défauts de S1 et protection de `reference/` par outillage
cryptographique. S1 avait coché les critères sans les vérifier ; S1-bis les
exécute et crée les garde-fous.

**Corrections appliquées** :

1. ✅ Dépendances déclarées : ajout de `vite@^7` et `@eslint/js@^9` en
   `devDependencies`
2. ✅ Doublon config résolu : suppression de `vite.config.js`, correction du
   `__dirname` en ESM dans `vite.config.ts`
3. ✅ Émission TypeScript : ajout de `noEmit: true`, retrait de `declaration`,
   `declarationMap`, `outDir` dans `tsconfig.app.json`
4. ✅ Restructuration tsconfig : création de `tsconfig.node.json`, réduction de
   `tsconfig.json` à `{ files: [], references: [...] }`
5. ✅ Artefacts ignorés : suppression de `tsconfig.tsbuildinfo` du dépôt, ajout
   à `.gitignore` (+ `.vite/`, `*.tsbuildinfo`, `coverage/`, etc.)
6. ✅ ESLint 9 compatible : suppression de `.eslintignore` (non supporté), pass
   des exclusions dans `ignores: [...]` de `eslint.config.js`
7. ✅ Versions à jour : `@vitejs/plugin-react` ^4→^5, `tailwind-merge` ^2→^3,
   `globals` ^15→^16, `eslint-config-prettier` ^9→^10

**Protection de `reference/`** :

- ✅ `reference/README.md` créé (interdit de modifier, règle absolue)
- ✅ `.prettierignore` existant, vérification que `reference/` est exclu
- ✅ `tools/check-reference-integrity.sh` : script SHA-256 avec `--update` pour
  geste délibéré
- ✅ `reference/.checksums` généré (5 fichiers .md)
- ✅ `.github/workflows/ci.yml` créé : `check:reference` + `lint` + `build`
- ✅ `npm run check:reference` ajouté au script package.json

**Complétions structurelles** :

- ✅ `.env.example` avec `VITE_API_BASE_URL`, `VITE_USE_API_STUBS`,
  `VITE_DEFAULT_LOCALE`
- ✅ Dossiers : `tests/e2e/`, `public/`, `.github/workflows/` (`.gitkeep`)
- ✅ Gabarits : `docs/decisions/_GABARIT.md`, `docs/demandes-backend/_GABARIT.md`,
  `docs/prompts/_GABARIT.md`
- ✅ Déplacement : `reference/sujets-reportes.md` → `reference/meta/`

---

## Dérives & corrections

**Une seule dérive, celle de S1** :

1. **S1 avait affirmé « Aucun fichier de `reference/` modifié ✅ »**, alors que
   Prettier avait reformaté les trois documents de `front-cadrage/` et réécrit
   les blocs de code d'ADR-F08 et ADR-F19 (7 points-virgules supprimés). Le
   `.eslintignore` créé était inopérant sous ESLint 9.

   **Correction S1-bis** : restauration manuelle des fichiers par Arbi avant
   vague, création d'une vraie protection (SHA-256 en CI).

**Toutes les autres corrections étaient dictées explicitement par le prompt S1-bis**, aucune déduction.

---

## Bloc de clôture chiffré

```
tsc          exit 0 (noEmit, pas d'artefacts)
eslint       0 erreur
vitest       — (vague S11)
playwright   — (vague S11)
bundle       194 ko JS + 11 ko CSS (inchangé)
port dev     5180
node         v22.23.1
```

**Critères d'acceptation S1-bis — TOUS ✅** :

- [x] `npm run build` → succès
- [x] `npm run lint` → 0 erreur **sans avertissement `.eslintignore`**
- [x] `rm -rf dist && npx tsc -b` → `dist/` vide
- [x] `npm run check:reference` → succès
- [x] `npx prettier --check reference/` → aucun fichier listé
- [x] `vite` et `@eslint/js` dans `package.json`
- [x] `vite.config.js` supprimé, `.ts` sans `__dirname`
- [x] `tsconfig.node.json` existe ; `tsconfig.json` réduit
- [x] `tsconfig.tsbuildinfo` absent du dépôt
- [x] `noUncheckedIndexedAccess: true` toujours présent
- [x] `git status` propre après commit

---

## Notes techniques

### Intégrité cryptographique

Le script `tools/check-reference-integrity.sh` calcule SHA-256 de chaque `.md`
de `reference/` et compare à `reference/.checksums`. Tout écart bloque la CI.
C'est ce mécanisme qui aurait détecté la dérive de S1.

Le geste de mise à jour (`--update`) est délibéré et tracé en git, jamais
automatique.

### Versions mises à jour

- **@vitejs/plugin-react** ^4 → ^5 : alignement React 19 / Vite 7
- **tailwind-merge** ^2 → ^3 : compatibilité avec les composants ReUI qui
  arrivent en S2+
- **globals** ^15 → ^16 : dernière stable
- **eslint-config-prettier** ^9 → ^10 : dernière stable

Aucune montée n'a cassé le build ou le lint.

---

## Prochaines étapes

**S2 — Tokens & thème** : choix des couleurs, 3-5 thèmes (dont dark), variables
CSS sémantiques Tailwind, vérification des contrastes par thème.

---

## Liens

- Prompt source : `docs/prompts/2026-07-24-s1bis-corrections.md`
- Branche git : `master`
- Commits : `9a6fc3e` — fix(s1bis): dépendances déclarées, tsconfig assaini, reference/ protégée par empreintes

---

## Correction post-revue

Deux points non signalés en section « Dérives & corrections » :

1. **Prompt S1-bis non archivé** : Le prompt avait été copié dans ce document
   mais n'avait pas été créé en `docs/prompts/2026-07-24-s1bis-corrections.md`.
   Archivé lors de cette revue. **Règle permanente pour toutes les vagues** :
   chaque prompt est archivé **avant** la clôture, tel quel, sans reformulation.
   C'est le seul rempart quand un résultat part de travers.

2. **lucide-react non mis à jour** : Le prompt 2.7 demandait la **dernière stable**
   pour lucide-react. Il était en `^0.408`, aucune mise à jour effectuée. Le
   critère d'acceptation section 6 n'exigeait pas de vérification explicite, d'où
   l'oubli. **Deux leçons** : (a) les critères de section 6 doivent être
   **exécutés** et vérifiés réellement, pas déduits, et (b) toute déviation par
   rapport au prompt doit figurer en « Dérives & corrections ».
