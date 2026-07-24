# Journal — Vague S-design — Alignement fin sur le template + page raccourcis

**Date** : 2026-07-25
**État** : ✅ COMPLET côté technique (tout exécuté) ; **jugement perceptuel
(rendu visuel, RTL) laissé à Arbi** (port 5180 non joignable)
**Résultat visé** : combler les écarts de finition avec le template Metronic, et
créer une page pédagogique des raccourcis clavier.

---

## Résumé

**Livrable 2 (page raccourcis) est le gros de la vague.** Le livrable 1
(alignement) s'est révélé, **à la mesure**, quasi sans objet : le layout est déjà
fidèlement aligné, les finitions étant fournies par les composants ReUI. Un seul
vrai écart de finition applicable a été trouvé et corrigé.

La page `/_dev/shortcuts` rend visible le socle clavier (S5-UX) : raccourcis
**extraits du registre en direct** (`useActiveShortcuts`), séquences de démo
fonctionnelles, et une **zone d'essai `event.code` vs `event.key`** qui montre
pourquoi les raccourcis se basent sur la position (robustesse au clavier arabe).

93 tests / 195 assertions. `npm ci` sans drapeau, `tsc -b` → `dist` vide, lint 0
erreur, `check:reference` vert, **0 couleur brute**, **aucune dépendance ajoutée**.

---

## Livrable 1 — Alignement sur le template : le constat mesuré

**Méthode** : comparaison côte à côte, composant par composant, de
`src/shared/layout/components/` et
`vendor-metronic/starter-kit/src/components/layouts/layout-21/components/`.

### Ce que la mesure montre — le layout est déjà aligné

Les finitions que §3.2 supposait « perdues » (`size-3`, `size-4`, `rounded-md`)
sont en réalité :

1. **Fournies automatiquement par les composants ReUI**, pas par le layout :
   - `DropdownMenuItem` : `[&_svg:not([class*=size-])]:size-4` (icônes de menu à
     size-4 par défaut) ; sous-déclencheur chevron `size-3.5!` + `rtl:rotate-180`.
   - `Button` `mode="icon"` : `[&_svg:not([class*=size-])]:size-4` (icônes du rail).
   - `accordion-menu` : svg `size-4`, chevron `size-3.5!` avec rotation RTL.
   → Les `<Icon />` / `<Sun/>` sans taille explicite rendent **déjà** à size-4 ;
     ré-ajouter `size-4` serait un no-op.

2. **Présentes et déjà transposées en tokens** là où elles comptent :
   - `sidebar-header.tsx` : `size-6` + `rounded-md` sur l'icône de bureau, `size-4`
     sur l'icône interne et le `Check` — **déjà là**, et les couleurs brutes du
     template (`bg-teal-600`, `text-white`…) sont **déjà** en tokens
     (`bg-primary`, `bg-muted`, `text-primary`).

3. **Sur des éléments de démonstration délibérément supprimés** (S3b) :
   - `size-3` du template = `<ExternalLink className="size-3">` de l'item démo
     « Download SDK » (absent chez nous).
   - `rounded-md` « perdu » = l'item démo « Set availability »
     (`rounded-md border`) (absent chez nous).
   - Icônes multicolores du rail (violet/teal/lime), avatars `toAbsoluteUrl`,
     `ScrollArea`, sections Workspaces/Communities/Resources — tous écartés à
     dessein (contenu de démo, ADR-F03/§3.2).

### Le seul vrai écart de finition applicable — corrigé

| Composant | Écart mesuré | Report |
| --- | --- | --- |
| `sidebar-primary-menu.tsx` | Espacement inter-groupes du menu : projet `space-y-6` (24px) vs template **`space-y-7.5`** (30px) | **Porté** `space-y-6` → `space-y-7.5` (espacement interne, valeur du template ; `space-y-` est vertical → neutre en RTL). |

Non porté (et pourquoi) sur ce même fichier : `[&[data-selected=true]_svg]:opacity-100`
— **non applicable**, nos items de menu ne rendent pas d'icône (le template rend
`{child.icon && <child.icon/>}`, nous non).

### Icônes du rail — laissées monochromes (ADR-F03)

Conformément à §3.3 : rail monochrome (`text-muted-foreground` au repos, actif =
`bg-primary` + `text-primary-foreground`). Les icônes multicolores de la démo
Metronic **ne sont pas** réintroduites. Le carré actif se distingue par le fond.

### Dimensions structurelles — inchangées

`--sidebar-width: 300px`, `--sidebar-collapsed-width: 60px`,
`--sidebar-header-height: 54px`, `--header-height: 60px` (dans `context.tsx`) —
non touchées.

---

## Livrable 2 — Page pédagogique des raccourcis (`/_dev/shortcuts`)

`src/app/pages/dev-shortcuts.tsx`, route statique placée avant le catch-all
`:module`. Temporaire (préfixe `_dev`).

- **Note pédagogique** (i18n) : pourquoi la position physique et pas le caractère
  (clavier arabe).
- **Raccourcis extraits du registre en direct** via `useActiveShortcuts()` — pas
  inventés. Capturés après un `requestAnimationFrame` (pour laisser les
  composants frères — palette, aide — s'enregistrer). Affichés en deux sections :
  **globaux** (Ctrl+K / Cmd+K palette, `?` aide) et **séquences** (g→p, g→b,
  enregistrées via le socle réel sur cette page, donc fonctionnelles).
- Chaque raccourci rendu avec le composant **`Kbd`** existant + libellé i18n +
  séparateur « puis » pour les séquences.
- **Zone d'essai** : un cadre focalisable qui capture une frappe et affiche
  **`event.code`** (position) et **`event.key`** (caractère) côte à côte. Un
  écouteur natif `keydown` avec `stopPropagation` empêche la frappe d'atteindre
  l'écouteur global du socle (la zone n'ouvre donc pas la palette). Accessible :
  `tabIndex`, `role`, `aria-label`, `Échap` pour sortir.

Prouvé par test (`dev-shortcuts.test.tsx`) : la liste contient les séquences
extraites du registre ; la zone d'essai affiche `KeyR` + « ق » pour un même appui
(preuve position vs caractère).

---

## Dérives & corrections

**Obligatoire, même vide.**

### 1. Premisse de §3.2 non confirmée par la mesure — SIGNALÉ

§3.2 annonçait que le projet avait « perdu quelques classes de finition »
(`size-3`, `size-4`, `rounded-md`). **La comparaison directe montre que non** :
ces finitions sont fournies par les composants ReUI ou vivent sur des éléments de
démo supprimés (détail ci-dessus). Je n'ai donc **pas fabriqué** de changements
redondants ni réimporté de style de démo. Un seul écart réel (`space-y`) a été
porté. C'est le comportement attendu (mesurer, puis signaler l'écart entre le
prompt et la réalité, comme S5-UX l'a fait sur son §6).

### 2. Report de finition volontairement minimal

Le prompt demandait de reporter « tailles d'icônes, espacements, rayons… » pour
rail/sidebar/en-tête/fil d'Ariane. Après lecture intégrale : **rien à reporter**
sur ces zones (déjà à parité ou géré par les composants), sauf l'espacement du
menu. Ajouter des classes déjà appliquées par défaut aurait été du bruit.

### 3. `align` du sélecteur de bureau — différence assumée, non modifiée

Le template ouvre le menu bureau avec `align="end" alignOffset={-80}` (décalage
magique de démo) ; le projet utilise `align="start"` (naturel pour un déclencheur
aligné au début, et plus sûr en RTL). Laissé tel quel — c'est un positionnement,
pas une finition, et le choix projet est défendable. Signalé.

### 4. Zone d'essai : écouteur natif plutôt que `onKeyDown` React

Pour empêcher la zone d'essai de déclencher les raccourcis globaux (dont
`Ctrl+K`, marqué `allowInInput`), un écouteur **natif** sur l'élément appelle
`stopPropagation` avant que l'événement n'atteigne `window` (où vit l'écouteur du
socle). Le socle clavier n'est **pas** modifié (§5).

### 5. `react-refresh` (12) / `react-router` (2 high) — inchangés, hors périmètre

Aucun avertissement ajouté (12, comme avant). react-router : correctif =
montée majeure v8 (établi en S-i18n), non appliqué. Déjà au backlog.

---

## Vérification visuelle (§6)

**Contrainte** : pas de pilotage navigateur (port 5180 non joignable). Build OK
(modules transformés sans erreur), 0 couleur brute, dimensions inchangées, RTL
garanti par la règle ESLint (aucune classe physique).

| Point | État |
| --- | --- |
| Rail/sidebar/en-tête proches du template | déjà aligné (mesuré) ; rendu à confirmer |
| Icônes du rail monochromes, actif par le fond | en place (tokens) ; à confirmer |
| Page raccourcis s'affiche ; zone montre code + key | **prouvé par test** ; rendu à confirmer |
| Clair/sombre + RTL arabe sans régression | tokens + propriétés logiques ; **à confirmer à l'œil** |

---

## Bloc de clôture chiffré

```
npm ci       sans drapeau : oui  (exit 0)
tsc          exit 0        (rm -rf dist && npx tsc -b → dist reste vide)
eslint       0 erreur, 12 avertissements  (inchangé ; aucun ajouté)
vitest       93 tests, 195 assertions, 13 fichiers — tous verts
bundle       671,43 ko JS initial (207,94 ko gzip) / 67,82 ko CSS (11,06 ko gzip)
             (+8 ko JS vs S-i18n : la page /_dev/shortcuts)
couleurs     brutes dans src/*.tsx : 0
page         /_dev/shortcuts : raccourcis listés = extraits du registre en direct
             (globaux Ctrl+K/Cmd+K/? + séquences g→p, g→b) ; zone code/key testée
```

---

## Critères d'acceptation — état réel

- [x] `rm -rf node_modules && npm ci` **sans drapeau** (exit 0)
- [x] `npm run build` → succès
- [x] `npm run lint` → 0 erreur
- [x] `npm run test` → 93 tests, tous verts
- [x] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [x] `npm run check:reference` → succès
- [x] `grep (bg|text|border)-(slate|zinc|gray|blue|red|green)-[0-9] src/*.tsx` → **aucun**
- [x] Aucune classe directionnelle physique (règle ESLint)
- [x] Aucune chaîne d'interface en dur (i18n en/fr/ar, 139 clés × 3)
- [x] Aucune dépendance ajoutée
- [x] Dimensions `--sidebar-*` restent 300/60/54
- [x] `/_dev/shortcuts` liste des raccourcis **extraits du code** (registre live)

Visuel : logique prouvée par test ; perceptuel laissé à Arbi.

---

## Livrables

- ✅ `docs/prompts/2026-07-25-sdesign-alignement.md`
- ✅ `docs/journal/2026-07-25-sdesign-alignement.md` (ce fichier)
- ✅ `docs/STATUS.md` + `docs/backlog/todo.md` mis à jour
- ✅ `docs/vendor-imports.md` (valeur `space-y-7.5` reprise du template)

**Commit unique prévu** : `feat(sdesign): alignement fin sur template + page raccourcis clavier`
(non poussé — attente de la demande explicite).

---

## Correctif post-clôture — séquences de navigation rendues globales

**Retour d'Arbi** : sur `/_dev/shortcuts`, `g→p` menait bien à Tiers, mais depuis
la page Tiers, `g→b` ne faisait rien.

**Cause** : les séquences `g→p` / `g→b` n'étaient enregistrées que **sur la page**
`/_dev/shortcuts` (et sur `/_dev/ux`). Déclencher `g→p` navigue vers `/parties`,
ce qui **démonte la page** et désenregistre ses raccourcis — donc `g→b` n'existe
plus sur Tiers. Comportement logiquement correct vu le montage, mais inutile.

**Correction** (conforme à ADR-F20.5, qui prévoit la navigation `g`+touche comme
fonction **globale**) : nouveau composant `src/shared/navigation/navigation-shortcuts.tsx`
qui enregistre les séquences de navigation, **monté globalement dans `App.tsx`**
(à l'intérieur du routeur, à côté de la palette). Elles fonctionnent désormais
depuis n'importe quelle page.

- Enregistrement local retiré de `dev-shortcuts.tsx` (la page continue de les
  **lister** via `useActiveShortcuts`) et de `dev-ux.tsx` (dé-duplication).
- Le socle clavier lui-même n'est pas touché — `NavigationShortcuts` en est un
  simple consommateur, comme `CommandPalette`.
- Liste volontairement minimale (parties=`g p`, bookings=`g b`) et extensible.

**Prouvé par test** (`navigation-shortcuts.test.tsx`) : depuis `/parties`, `g`
puis `b` → `/bookings` ; depuis `/bookings`, `g` puis `p` → `/parties` ; et la
position prime (mêmes `code` sous caractères arabes). Total : **96 tests**.
Build/lint/tsc/`npm ci`/`check:reference` re-vérifiés verts.

---

## Prochaine action

Validation perceptuelle au navigateur (`/_dev/shortcuts`, rail vs template, RTL).
Puis S6 (authentification) ou S5 (client API, bloqué `openapi.json`).
