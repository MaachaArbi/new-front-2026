# Prompt — Vague S3a — Tokens & thème

> À archiver dans `docs/prompts/2026-07-24-s3a-tokens-theme.md` — **avant la clôture**.

---

Tu interviens sur le projet **front OS-TRAVEL** (éditeur : OctaSoft). C'est la
**vague S3a**, volontairement **petite**, avec **un seul résultat vérifiable** :

> **La bascule clair/sombre fonctionne réellement dans le navigateur.**

La vague S2 a livré l'infrastructure i18n et le RTL (qui fonctionnent), mais le
mode sombre est cassé et les tokens n'ont jamais été prélevés. S3a répare et
prépare le terrain pour S3b (layout-21).

## 0. AVANT TOUTE CHOSE

Lis intégralement :

1. `reference/front-cadrage/01-front-architecture-decisions.md` — en particulier
   **ADR-F01** (Metronic = source), **ADR-F03** (tokens), **ADR-F18** (purge)
2. `reference/front-cadrage/03-front-adr-ux-ia.md`
3. `docs/journal/2026-07-24-s2-socle-visuel.md`

**Règle absolue** : aucune décision déduite ou supposée si elle n'est pas dans
`reference/`. En cas de doute : **arrête-toi et demande**. Tu ne modifies jamais
`reference/`.

## 1. GARDE-FOUS — VPS partagé

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend)
- ❌ **Jamais `--force`, jamais `--legacy-peer-deps`.** Voir §2 : c'est le sujet.

---

## 2. LE DÉFAUT BLOQUANT — `npm ci` échoue

Vérifié sur machine neuve :

```
npm ci → ERESOLVE
react-helmet-async@2.0.5 exige react ^16 || ^17 || ^18
le projet est en react 19
```

**Le projet ne s'installe pas sur une machine vierge.** Il ne fonctionne
aujourd'hui que parce que `node_modules` existe déjà localement. La vague S2 a
donc forcément utilisé un drapeau de contournement, ce que le prompt interdisait
et demandait de signaler.

**Correction** : `react-helmet-async` est déclaré mais **utilisé dans 0 fichier**.
Retire-le simplement de `package.json`.

> Il sera nécessaire en S3b (layout-21 l'importe pour le titre de page). La
> décision est déjà prise : on ne le réintroduira pas — un hook maison
> `useDocumentTitle` de cinq lignes fera l'affaire. **Ne le crée pas maintenant**,
> c'est S3b.

**Critère non négociable de cette vague** : `npm ci` doit passer **sans aucun
drapeau**. Si un autre conflit apparaît, **arrête-toi et signale-le** — ne le
contourne pas.

---

## 3. LES TOKENS — le vrai sujet

### 3.1 Constat

`src/styles/globals.css` contient aujourd'hui **exactement** :

```css
@import 'tailwindcss';
```

Aucun token. Conséquence directe : en Tailwind v4, la variante `dark:` répond par
défaut à la **préférence du système d'exploitation**, pas à une classe. Le
fournisseur ajoute bien `.dark` sur `<html>`, mais aucune règle ne l'écoute.

### 3.2 Prélèvement

Source, **en lecture seule** :

```
/home/ubuntu/vendor-metronic/full/src/css/config.reui.css
/home/ubuntu/vendor-metronic/full/src/css/styles.css
```

Tu **lis**. Tu ne copies **jamais** en bloc. Tu ne les ajoutes **jamais** au
dépôt. (ADR-F01)

| Prends | Vers |
|---|---|
| `config.reui.css` (bloc `:root`, bloc `.dark`, bloc `@theme inline`) | `src/styles/tokens.css` |
| de `styles.css` : le `@layer base` et les `@custom-variant` | `src/styles/globals.css` |

`globals.css` doit finir par ressembler à :

```css
@import 'tailwindcss';
@import './tokens.css';

/* Indispensable en Tailwind v4 : sans ça, dark: suit l'OS et non la classe */
@custom-variant dark (&:is(.dark *));
@custom-variant light (&:not(.dark *));

@layer base {
  * { @apply border-border; }
  *:focus-visible { @apply outline-ring rounded-xs shadow-none outline-2 outline-offset-3 transition-none!; }
}
```

### 3.3 N'importe PAS ces fichiers

`apexcharts.css` · `leaflet.css` · `rating.css` · `image-input.css` · `demo1.css`

Ils référencent **trois variables qui n'existent nulle part** — `--color-mono`
(aliasée vers `--mono`, inexistant), `--box-shadow-sm` (Tailwind v4 expose
`--shadow-sm`), `--gray-100` (expose `--color-gray-100`). Aucun n'est utile ici.
Ne pas les importer supprime le problème au lieu de le corriger.

### 3.4 Correction obligatoire — accessibilité

`config.reui.css` pose `--primary: var(--color-blue-500)` en mode clair.

**Vérifié** : texte blanc sur `blue-500` donne **3,68:1**, sous le seuil WCAG AA
de 4,5:1. Chaque libellé de bouton principal serait non conforme.

→ **En mode clair, `--primary` devient `var(--color-blue-600)`** (5,17:1).
Le mode sombre est déjà en `blue-600`, ne le touche pas.

Tailwind v4 utilise oklch : vérifie la valeur réelle après prélèvement et
reporte le ratio obtenu dans le journal.

---

## 4. LE FOURNISSEUR DE THÈME — rebranché sur `next-themes`

`next-themes` est **déclaré dans `package.json` mais utilisé dans 0 fichier** :
la vague S2 a réécrit un fournisseur maison à la place.

Remplace `src/app/providers/theme-provider.tsx` par une version bâtie sur
`next-themes`, en t'inspirant de
`/home/ubuntu/vendor-metronic/full/src/providers/theme-provider.tsx` :

```tsx
<NextThemesProvider
  attribute="class"
  defaultTheme="system"
  storageKey="ostravel-theme"
  enableSystem
  disableTransitionOnChange
  enableColorScheme
>
```

**Deux adaptations :**

1. **Sépare le `TooltipProvider`** que Metronic y a glissé — un fournisseur de
   thème ne fournit pas des infobulles. (Il n'y a pas encore de composant
   `tooltip` : ne l'ajoute pas, retire simplement cette partie.)
2. `storageKey` = `ostravel-theme`, pas `vite-theme`.

Le bouton de bascule existant dans `App.tsx` doit être recâblé sur `useTheme()`
de `next-themes`.

---

## 5. LES DEUX AVERTISSEMENTS ESLint

Dans `src/app/providers/i18n-provider.tsx` :

```
32:6  useEffect a une dépendance manquante : 'currentLanguage'
58:5  useMemo a des dépendances manquantes : 'setLanguage' et 't'
```

Ce sont de vrais risques de bug, pas du bruit. Corrige-les proprement — en
ajoutant les dépendances, ou en stabilisant les fonctions avec `useCallback`.
**Ne les fais pas taire avec un commentaire de désactivation.**

Les deux avertissements `react-refresh/only-export-components` sont bénins :
laisse-les, ou sépare les hooks des composants si c'est trivial.

---

## 6. HORS PÉRIMÈTRE — ne l'anticipe pas

❌ **Le layout-21** — c'est S3b, la vague suivante. `App.tsx` reste tel quel,
   même s'il est laid : il sera **supprimé** en S3b.
❌ Les 12 composants ReUI, `npx shadcn add` → S3b
❌ `RadixDirectionProvider`, règle ESLint RTL, `vendor-imports.md` → S3b
❌ `useDocumentTitle` → S3b
❌ `react-router-dom`, `react-intl` (l'i18n maison de S2 reste en place)
❌ Client API, authentification, `Money`, permissions, tests → vagues ultérieures

**Ne corrige pas les chaînes anglaises en dur d'`App.tsx`** (« Welcome to
OsTravel », « Menu Item 1 »…). Ce fichier disparaît en S3b : ce serait du travail
jeté.

**Si tu penses qu'un élément hors périmètre est nécessaire pour finir S3a, c'est
que tu te trompes sur le périmètre.** Signale-le au lieu de l'ajouter.

---

## 7. CRITÈRES D'ACCEPTATION

**Chaque case doit être EXÉCUTÉE, pas supposée.** La vague S2 a coché des
critères faux — c'est ce qui coûte cette vague de rattrapage.

### Technique

- [ ] **`rm -rf node_modules && npm ci` passe SANS aucun drapeau** ← le critère central
- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur, **et plus aucun avertissement `exhaustive-deps`**
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] `react-helmet-async` absent de `package.json`
- [ ] `next-themes` **réellement importé** dans `theme-provider.tsx`
- [ ] `src/styles/tokens.css` existe et contient `:root`, `.dark`, `@theme inline`
- [ ] `--primary` en clair vaut `blue-600` — reporte le ratio de contraste mesuré
- [ ] `@custom-variant dark` présent dans `globals.css`

### Visuel — à vérifier réellement au navigateur

- [ ] La bascule clair/sombre **change visiblement** l'apparence
- [ ] Le choix **survit à un rechargement** de page
- [ ] En sombre, le texte reste lisible partout
- [ ] Le RTL arabe fonctionne toujours (non-régression de S2)

Décris dans le journal **ce que tu as observé**, pas ce qui devrait se produire.
Un défaut signalé vaut infiniment mieux qu'une case cochée à tort.

---

## 8. LIVRABLES

- `docs/prompts/2026-07-24-s3a-tokens-theme.md` — ce prompt, tel quel.
  **Discipline permanente : chaque vague archive son prompt avant clôture.**
- `docs/journal/2026-07-24-s3a-tokens-theme.md` — gabarit habituel, section
  **« Dérives & corrections » obligatoire**. Un livrable oublié, un critère non
  exécuté ou un contournement sont des dérives : ils y figurent.
- `docs/STATUS.md` — S3a ✅, prochaine action : **S3b — layout-21**.
- `docs/backlog/todo.md` — mis à jour.

**Ménage documentaire** : `docs/` a reçu en S2 trois fichiers hors structure —
`METRONIC-INTEGRATION-PLAN.md`, `S2-COMPLETION-REPORT.md`,
`test-checklist-s2-visual.md`. Déplace-les dans `docs/journal/` en les préfixant
`2026-07-24-s2-`. La racine de `docs/` ne contient que `STATUS.md`.

**Bloc de clôture chiffré** :

```
npm ci       sans drapeau : oui / non
tsc          exit —
eslint       — erreur(s), — avertissement(s)
bundle       — ko initial / — ko total
--primary    blue-—   contraste mesuré : —:1
sombre       bascule : oui/non   persistance : oui/non
RTL arabe    non-régression : oui/non
```

**Commit unique** : `feat(s3a): tokens ReUI, thème next-themes, npm ci réparé`
**Ne pousse pas** sans que je te le demande.

---

## 9. EN CAS DE BLOCAGE

Arrête-toi et signale si : `npm ci` échoue encore après retrait de
`react-helmet-async` · une variable de `config.reui.css` reste non résolue ·
`next-themes` ne s'accorde pas avec React 19 · une décision t'est nécessaire et
n'est pas dans `reference/`.

**Ne force jamais, ne contourne jamais.** Un blocage signalé coûte cinq minutes.
Un `--legacy-peer-deps` silencieux coûte une vague entière — c'est exactement ce
qui s'est produit en S2.
