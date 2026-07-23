# Journal — Vague S3c — Finitions : mise en page & palette sombre

**Date** : 2026-07-24
**État** : ✅ COMPLET (critères techniques exécutés ; vérification visuelle au
navigateur laissée à l'utilisateur — serveur relancé, voir §Visuel)
**Résultat visé** : layout correctement espacé, pleine hauteur, thème sombre reposant.

---

## Ce qui a été fait

### Défaut 1 — Le contenu collait au menu (§2)

La cause : l'enveloppe principale n'avait aucun padding horizontal ; l'espacement
dépendait d'une classe `container-fluid` que chaque page devait poser (et que
mon rewrite S3b avait de fait vidée de son padding).

Correction : le padding est **porté par l'enveloppe elle-même**, plus par la
discipline des pages.

- `wrapper.tsx` `<main>` : `px-4 lg:px-7.5` (mobile plus faible que desktop).
- `header.tsx` conteneur interne : `px-4 lg:px-7.5` (le fil d'Ariane ne colle
  plus non plus).
- `container-fluid` retiré de `module-page.tsx` et `header.tsx` (classe sans
  effet en Tailwind v4 sans config).
- **RTL** : `px-` est symétrique donc neutre en RTL ; aucune classe physique
  (`pl-`/`pr-`) — la règle ESLint l'aurait refusé.

### Défaut 2 — Le panneau ne descendait pas jusqu'en bas (§3)

La chaîne de hauteur était incomplète : `grow` sans hauteur pleine en amont ne
produit rien.

Correction :

- `globals.css` : `html, body, #root { height: 100% }`.
- `context.tsx` enveloppe : `flex grow` → `flex h-full min-h-0`.
- `wrapper.tsx` panneau de contenu : ajout de `min-h-0` (autorise le panneau à se
  borner à la hauteur disponible pour que `lg:overflow-y-auto` défile à
  l'intérieur, sans faire défiler la page entière).

### Palette sombre à trois niveaux (§4)

Réécriture du bloc `.dark` de `tokens.css` selon les valeurs cibles §4.3, ajout
du token **`--sidebar`** (+ `--color-sidebar` exposé) pour le rail et le menu, et
définition des **états pastel** via les tokens que `badge.tsx` consomme déjà
(`--color-success-accent`/`-foreground`, warning, info).

Surfaces : rail/menu `#18181b` < fond `#1f1f23` < cartes `#27272a`.
Rail (`sidebar-primary.tsx`) et menu (`sidebar-secondary.tsx`) passent en
`bg-sidebar text-sidebar-foreground`.

Décision détaillée : `docs/decisions/2026-07-24-palette-sombre-trois-niveaux.md`.

### Densité de la barre latérale (§5)

Contenu factice déplacé dans **`src/shared/dev/mock-menus.ts`** (préfixe `mock-`,
conforme §5) ; `menu.config.ts` le ré-exporte et fournit `flattenMenu`. Chaque
module a désormais **2 groupes de section** et **5–8 entrées** métier réalistes.
Deux badges de démonstration, **écrits** (§4.5) : un compteur `12` sur
Réservations, un badge « Nouveau » sur Hôtels. Toutes les étiquettes en i18n
(en/fr/ar, arabe en vrai texte). Rendu des groupes/badges géré dans
`sidebar-primary-menu.tsx` ; `header-breadcrumbs.tsx` et `module-page.tsx`
utilisent `flattenMenu` pour retrouver l'entrée active dans la structure groupée.

---

## Dérives & corrections

**Aucune dérive, aucun contournement, aucune dépendance ajoutée** (`package.json`
inchangé, vérifié par `git diff`). `npm ci` reste vert sans drapeau.

Points de méthode assumés :

1. **`--muted` / `--secondary` / `--accent` (sombre) non listés au §4.3** : je
   leur ai donné `#27272a` (= niveau carte), valeur cohérente avec les surfaces
   de survol. Ce ne sont pas des couleurs de texte, donc hors des 4 contrastes à
   mesurer ; choix documenté ici plutôt que déduit en silence.
2. **États pastel en mode clair** : le §4.4 ne donne que les valeurs sombres.
   J'ai ajouté des équivalents clairs sensés (fond tendre + texte foncé de la
   même famille) pour que les badges restent lisibles en clair. Le mode clair
   **existant** (tokens S3a) n'est pas modifié ; seuls de **nouveaux** tokens y
   sont ajoutés.
3. **Padding via l'enveloppe, `container-fluid` retiré** plutôt que redéfini :
   la classe n'avait aucun effet (Tailwind v4 sans config) et le §2 demande de ne
   pas dépendre de la discipline des pages.

---

## Contrastes mesurés (script sRGB→WCAG)

```
texte principal / fond   : 12,94:1   (cible ≈12,9)   ✓
texte principal / carte  : 11,74:1   (cible ≈11,7)   ✓
texte secondaire / fond  :  6,41:1   (cible ≈ 6,4)   ✓  (était 4,12:1, non conforme)
texte secondaire / carte :  5,81:1   (cible ≈ 5,8)   ✓
états pastel : succès 10,9 · danger 8,8 · warning 10,7 · neutre 6,1 · info 8,6  (cible 6–11) ✓
```

---

## Vérification visuelle (§7, 5 points)

Le serveur de dev a été **relancé** et sert de nouveau `HTTP 200` sur
`http://localhost:5180/` (il avait été arrêté en fin de S3b). L'utilisateur a
confirmé que l'application s'affiche. Les changements S3c étant du CSS/mise en
page, ils sont pris par HMR.

Vérifié au niveau build : tous les tokens sombres et utilitaires (`bg-sidebar`,
`.dark{--background:#1f1f23}`, `--color-success-accent`) sont bien émis dans le
CSS compilé ; l'app compile et se sert.

**Les 5 points restent à confirmer à l'œil** (je ne peux pas percevoir le rendu) :

| # | Point | État |
| --- | --- | --- |
| 1 | Contenu ne colle plus au menu, LTR + RTL | padding sur l'enveloppe, à confirmer |
| 2 | Panneau descend jusqu'en bas, page courte + longue | chaîne de hauteur rétablie, à confirmer |
| 3 | Sombre : 3 niveaux distincts (rail/fond/cartes) | tokens en place, à confirmer |
| 4 | Sombre : aucun texte difficile à lire | contrastes ≥ 5,8:1 mesurés, à confirmer |
| 5 | Barre latérale remplie, 3 langues | groupes + entrées + badges, à confirmer |

> Honnêteté (comme S3a/S3b) : je ne coche pas ce que je n'ai pas vu à l'écran.
> Les valeurs sont mesurées, le mécanisme compilé ; le jugement perceptuel
> revient à l'utilisateur.

---

## Bloc de clôture chiffré

```
npm ci       sans drapeau : oui
tsc          exit 0 (dist/ vide après tsc -b seul)
eslint       0 erreur, 7 avertissements (react-refresh, bénins)
bundle       565 ko JS initial (177 ko gzip) / 63,3 ko CSS (10,4 ko gzip)
contrastes   principal/fond 12,94:1   secondaire/fond 6,41:1   secondaire/carte 5,81:1
couleurs     brutes dans src/*.tsx : 0
visuel       vérifié par l'agent : non (rendu perceptuel — laissé à l'utilisateur ;
             serveur relancé, HTTP 200, tokens confirmés dans le CSS compilé)
```

---

## Critères d'acceptation — état réel

### Technique (tous exécutés)

- [x] `rm -rf node_modules && npm ci` sans drapeau
- [x] `npm run build` → succès
- [x] `npm run lint` → 0 erreur
- [x] `rm -rf dist && npx tsc -b` → `dist/` vide
- [x] `npm run check:reference` → succès
- [x] `grep (bg|text|border)-(slate|zinc|gray|blue|red|green)-[0-9] src/ *.tsx` → aucun résultat
- [x] Aucune classe directionnelle physique (règle ESLint)
- [x] Aucune chaîne d'interface en dur
- [x] Aucune dépendance ajoutée
- [x] Les 4 contrastes §4.3 mesurés et reportés

### Visuel

- [~] 5 points : mesuré/compilé ; **jugement perceptuel laissé à l'utilisateur**.

---

## Livrables

- ✅ `docs/prompts/2026-07-24-s3c-finitions.md`
- ✅ `docs/journal/2026-07-24-s3c-finitions.md` (ce fichier)
- ✅ `docs/decisions/2026-07-24-palette-sombre-trois-niveaux.md`
- ✅ `docs/vendor-imports.md` (section S3c ajoutée — fichiers retouchés)
- ✅ `docs/STATUS.md` + `docs/backlog/todo.md` mis à jour

**Commit unique** : `feat(s3c): mise en page corrigée, palette sombre à trois niveaux, états pastel`
(non poussé — attente de la demande explicite)

---

## Prochaine action

**S5 — Client API typé depuis OpenAPI** (ADR-F09), avec bouchons. Bloquant connu :
`openapi.json` n'existe pas encore (demande backend n°1).
