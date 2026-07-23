# Journal — Vague S3b — Layout-21 & composants

**Date** : 2026-07-24
**État** : ✅ COMPLET (critères techniques exécutés ; vérification visuelle au
navigateur différée — port 5180 non joignable, voir §Visuel)
**Résultat visé** : le vrai layout-21 s'affiche — clair, sombre, arabe RTL.

---

## Résumé

Le layout provisoire de S2 (169 lignes, 51 couleurs brutes, chaînes en dur) est
**supprimé** et remplacé par le layout-21 de Metronic, prélevé et adapté au
domaine OS-TRAVEL. Les 12 composants ReUI nécessaires sont prélevés, la direction
RTL est propagée à Radix, une règle ESLint interdit désormais les classes
directionnelles physiques, et un routeur minimal démontre le mode large.

**La vague a été livrée en entier**, contrairement au risque signalé au §12. Une
décision de périmètre a toutefois été prise et assumée (voir Dérives §3).

---

## Ce qui a été fait

### 1. Les 12 composants ReUI (§3) — `src/shared/ui/`

Prélevés de `starter-kit/src/components/ui/`. Import `@/lib/utils` → `@/shared/lib/cn`.
Détails et modifications par fichier : `docs/vendor-imports.md`.

- **Correction de fond** : le prompt supposait des paquets `@radix-ui/react-*` à
  installer un par un. La réalité du starter-kit : les composants importent le
  paquet **unifié `radix-ui`** (`import { Avatar as AvatarPrimitive } from 'radix-ui'`).
  J'ai donc installé **un seul** paquet `radix-ui@^1.6.5`, sans drapeau, 0 conflit
  de pairs, 0 vulnérabilité. (§2/§15 : suivre la source réelle, pas la supposition.)
- **Strict TypeScript** : `accordion-menu.tsx` échouait sous
  `noUncheckedIndexedAccess` (ADR-F05) ; corrigé par gardes explicites, pas par
  `any` ni `!`.

### 2. Piège RTL Radix (§5)

`@radix-ui/react-direction` était déclaré depuis S2 mais utilisé nulle part.
`DirectionProvider` est maintenant monté dans `i18n-provider.tsx`, alimenté par
la direction de la langue courante. Sans lui, les menus déroulants s'ouvriraient
du mauvais côté en arabe.

### 3. Le layout-21 (§4) — `src/shared/layout/`

Ossature prélevée (context, wrapper, sidebar, header, header-menu mobile,
toolbar) ; contenu réécrit vers notre domaine (rail des 8 modules, sélecteur de
bureau, menu du module courant, fil d'Ariane réel, sélecteur langue + thème,
menu utilisateur). Tout en tokens sémantiques et i18n.

**Les 5 adaptations obligatoires**, toutes faites :

- **4.1 Fuite RTL** : `left-1.75` → `start-1.75` dans le rail (indicateur de
  module actif).
- **4.2 Animation** : `framer-motion` → `motion/react` (résout bien ; `motion`
  déjà présent, `framer-motion` non installé).
- **4.3 Titre de page** : `react-helmet-async` → hook maison `useDocumentTitle`
  (`src/shared/hooks/`). `react-helmet-async` reste absent de `package.json`.
- **4.4 i18n** : aucun libellé d'interface en dur ; `en/fr/ar` complétés, arabe
  en vrai texte arabe (الأطراف, الحجوزات, التسويات…).
- **4.5 Modèle de menu (ADR-F19)** : `MenuItem` redéfini avec `titleKey`,
  `permission`, `entitlement`, `badgeKey`. `permission`/`entitlement` sont
  **déclarés, non câblés** (S8) — posés sur quelques entrées à titre d'exemple.

### 4. Routage minimal (§6) + mode large (§7)

- `react-router-dom` (déclaré depuis S2, non utilisé) branché : une route par
  module + entrées, redirection index → `/parties`.
- **Mode large** : un seul chemin de code, `useWideMode()` par page, la barre se
  replie et le rail reste visible ; la préférence manuelle (mémorisée) reprend en
  sortie. Aucun second layout. Décision : `docs/decisions/2026-07-24-mode-large-sans-second-layout.md`.
  Le module `catalogue` sert de démonstration large.

### 5. Règle ESLint RTL (§8)

Ajout d'une règle `no-restricted-syntax` interdisant les classes directionnelles
physiques (`pl-`, `pr-`, `ml-`, `mr-`, `left-`, `right-`, `border-l/r`,
`rounded-l/r/tl/tr/bl/br`, `text-left/right`, `space-x-`, `inset-x-` sauf
`inset-x-0`). Regex conçue pour **ne pas** faux-positiver sur `rounded-lg`,
`border-ring`, `slide-in-from-left-2`.

**Test que la règle mord** (§8, exécuté) : injection d'un `ml-4` dans
`toolbar.tsx` → `npm run lint` échoue avec
« Classe directionnelle physique interdite (ADR-F04) » ligne 29 ; après retrait,
lint repasse à 0 erreur. ✅

### 6. Suppression du layout provisoire (§9)

`src/App.tsx` réécrit : ne monte plus que providers + routeur. Plus aucune
couleur brute ni chaîne en dur. `mock-modules.ts` nettoyé (l'ancien tableau
`MODULES` à couleurs brutes est remplacé par `menu.config.ts`).

---

## Dérives & corrections

### Décision de périmètre assumée — le layout-21 livré est une démo

Le layout-21 du starter-kit est **une démonstration** : données factices
(« Thunder AI », « Chris Harris »), **couleurs brutes** partout
(`bg-violet-500`, `bg-teal-500`…), chaînes anglaises en dur, et trois sections de
menu sans rapport avec le domaine (workspaces, communities, resources).

Un « copié fidèle » aurait importé cette démo, en violation directe de **§9**
(tokens uniquement) et **§4.4** (aucune chaîne en dur). J'ai donc pris la lecture
fidèle de §4 + §9 : **prélever l'ossature du layout, piloter le contenu depuis
notre configuration, et ne PAS prélever les 3 sections purement démonstratives**
(`sidebar-workspaces-menu`, `sidebar-communities`, `sidebar-resources-menu`) ni
`toolbar-menu` (onglets démo, relèvent du contenu d'écran S9). Détail exhaustif
dans `docs/vendor-imports.md` → « NON prélevé ».

Conséquence chiffrée : **13 fichiers** portés dans `layout/components/` (sur 17
d'origine) + `index.tsx`. Les 4 non portés sont listés et justifiés. Ce n'est
pas un demi-travail masqué (§12) : c'est un choix explicite pour respecter §9.

### Couleurs brutes dans les composants ReUI prélevés — corrigées

Le grep §13 a d'abord trouvé des couleurs brutes **dans les composants ReUI**
(non dans mon code de layout) :

- `button.tsx` variante `mono`, `tooltip.tsx` variante `dark` : inversions
  haut-contraste → mappées sur `bg-foreground text-background` (tokens).
- `avatar.tsx` statuts (online/busy/away/offline) : `bg-green-600`… → tokens
  existants (`bg-primary`, `bg-destructive`, `bg-muted-foreground`,
  `bg-secondary-foreground`). Il n'existe pas de palette de statut dans nos
  tokens : ADR-F03 renvoie les couleurs au catalogue de thèmes fermé, non encore
  défini. Je n'invente pas de palette (§0) ; le mappage est documenté et à
  revisiter avec le catalogue.

Après correction : `grep -rE "(bg|text|border)-(slate|zinc|gray|blue)-[0-9]" src/ --include="*.tsx"` → **vide**.

### Deux fuites RTL réelles dans les composants prélevés — corrigées

- `scroll-area.tsx` : `border-l border-l-transparent` → `border-s border-s-transparent`.
- `sheet.tsx` : `sm:space-x-2` → `sm:gap-2`.

(La seule fuite annoncée par l'audit ADR-F02 était `left-1.75` dans le layout ;
ces deux-là étaient dans les composants `ui/`, cohérent avec ADR-F04 qui situait
les fuites dans `components/ui/`.)

### Correction d'une supposition du prompt — paquet Radix

Voir §1 ci-dessus : `radix-ui` unifié au lieu de `@radix-ui/react-*` séparés.
Signalé plutôt que contourné.

---

## Vérification visuelle (§13, 6 points)

**Contrainte de session** : le port 5180 n'est pas joignable depuis la machine de
l'utilisateur (souci de redirection de port, test navigateur explicitement
différé). Je ne peux pas cliquer moi-même. Comme en S3a, je reporte **ce que j'ai
réellement observé**, sans cocher à l'aveugle.

Vérifié au niveau build / serveur :

- Le serveur de dev démarre et sert `HTTP 200` sur `/` (titre « OsTravel Back
  Office », `/src/main.tsx` chargé, aucune erreur au démarrage).
- `npm run build` transforme 2080 modules sans erreur → l'arbre complet
  (layout + 12 composants + Radix + router) compile et résout.
- `DirectionProvider` est monté dans l'arbre (i18n-provider) : les primitives
  Radix recevront `dir` — condition nécessaire au point visuel 4.
- Règle RTL active + testée : le code ne contient aucune classe physique.

**Non exécuté cette session (à faire au navigateur dès que le port est joignable)** :

| # | Point | État |
| --- | --- | --- |
| 1 | Layout s'affiche (rail + barre + fil d'Ariane + contenu) | à confirmer à l'œil |
| 2 | Clic module → change le menu de la barre | logique en place, à confirmer |
| 3 | Bascule clair/sombre sans zone illisible | mécanisme S3a validé, à confirmer |
| 4 | Arabe : rail à droite + **déroulants du bon côté** | DirectionProvider monté, à confirmer |
| 5 | Repli barre + page large pleine largeur | logique en place, à confirmer |
| 6 | Menu utilisateur s'ouvre et est rempli | en place, à confirmer |

> Honnêteté assumée (comme en S3a) : je ne coche pas ce que je n'ai pas vu à
> l'écran. Le mécanisme est en place et compile ; la validation perceptuelle
> reste à faire par un œil humain.

---

## Bloc de clôture chiffré

```
npm ci       sans drapeau : oui
tsc          exit 0 (dist/ vide après tsc -b seul — noEmit respecté)
eslint       0 erreur, 7 avertissements (react-refresh, bénins)  règle RTL testée : oui
bundle       559 ko JS initial (176 ko gzip) / 62,6 ko CSS (10,1 ko gzip)
couleurs     brutes restantes dans src/ (*.tsx) : 0
composants   12 / 12 prélevés
layout-21    ossature prélevée : 13 fichiers portés + index ; 4 démos non portées (justifiées)
visuel       vérifié par l'agent : non (port 5180 non joignable — build/serveur OK, clic différé)
```

> Note bundle : 559 ko (>500 ko) déclenche l'avertissement Vite de découpage.
> Le code-splitting / lazy-loading est explicitement hors périmètre S3b (§11,
> vagues ultérieures). À traiter quand les modules métier arriveront.

---

## Critères d'acceptation — état réel

### Technique (tous exécutés)

- [x] `rm -rf node_modules && npm ci` sans drapeau
- [x] `npm run build` → succès
- [x] `npm run lint` → 0 erreur
- [x] `rm -rf dist && npx tsc -b` → `dist/` vide
- [x] `npm run check:reference` → succès
- [x] Règle RTL vérifiée : `ml-4` volontaire fait échouer le lint
- [x] `grep (bg|text|border)-(slate|zinc|gray|blue)-[0-9] src/ *.tsx` → aucun résultat
- [x] Aucune chaîne d'interface en dur — tout via i18n
- [x] `RadixDirectionProvider` réellement importé et monté
- [x] `react-helmet-async` toujours absent de `package.json`
- [x] `src/App.tsx` provisoire supprimé

### Visuel

- [~] 6 points : mécanisme en place et compilé ; **clic navigateur différé**
  (port 5180 non joignable cette session).

---

## Livrables

- ✅ `docs/prompts/2026-07-24-s3b-layout-composants.md`
- ✅ `docs/journal/2026-07-24-s3b-layout-composants.md` (ce fichier)
- ✅ `docs/vendor-imports.md` (manifeste)
- ✅ `docs/decisions/2026-07-24-mode-large-sans-second-layout.md`
- ✅ `docs/STATUS.md` + `docs/backlog/todo.md` mis à jour

**Commit unique** : `feat(s3b): layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint`
(non poussé — attente de la demande explicite)

---

## Prochaine action

**S4 — i18n & RTL (consolidation)** : passer à FormatJS/react-intl (ADR-F06) pour
le pluriel arabe et `Intl` ; tests bidirectionnels ; ou, si priorité, validation
visuelle navigateur de S3b dès que le port est joignable.
