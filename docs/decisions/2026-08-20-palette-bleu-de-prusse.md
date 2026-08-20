# Palette « Bleu de Prusse » — décisions du 20/08

## Ce qui change

La palette « Encre » (sarcelle `#0f766e`, neutres chauds stone) est remplacée par la
planche **Direction A · Bleu de Prusse** fournie par Arbi : primaire `--blue-700`
(`#16394F`), neutres teintés bleu à chroma ≈ 0,006.

Le changement important n'est pas la teinte. C'est l'**architecture** : la planche
sépare les primitives (rampes brutes) des rôles (`--fill-primary`, `--text-muted`,
`--border-strong`). Nos jetons écrivaient les hexadécimaux directement dans les
rôles — chaque changement de palette coûtait une relecture complète. Maintenant,
changer le bleu ne touche aucun composant.

## Trois décisions

### A — Le thème vit dans `data-theme`, plus dans `class="dark"`

`next-themes` passe de `attribute="class"` à `attribute="data-theme"`, et les
variantes Tailwind suivent dans `globals.css` :

```css
@custom-variant dark (&:is([data-theme='dark'] *));
@custom-variant light (&:not([data-theme='dark'] *));
```

**Motif.** Les planches du système de design sont écrites sur `[data-theme="dark"]`.
Aligner l'attribut coûte une ligne et permet de coller chaque livraison verbatim ;
l'alternative aurait été de retoucher la planche à chaque fois — c'est-à-dire d'y
introduire des écarts silencieux. `next-themes` garde sa reprise de la préférence
système et son anti-clignotement.

### B — La planche l'emporte sur le bouton Metronic

Le bouton passe de huit variantes à **cinq** : `primary`, `secondary`, `ghost`,
`destructive`, `link`. Disparaissent `mono`, `dashed`, `dim`, `foreground`,
`inverse` — aucune n'avait de rôle défini dans un ERP, et une variante sans rôle
finit par être choisie au hasard. `outline` devient `secondary` (même bouton),
`link` passe de « mode » à variante.

Quatre règles de la planche remplacent celles du template, délibérément :

| | Metronic | Planche | Pourquoi |
|---|---|---|---|
| Survol / appui | `bg-primary/90` | `--blue-800` / `--blue-900` | Une teinte assombrie se lit comme un appui ; la même à 90 % se lit comme un chargement. |
| Désactivé | `opacity-60` | fond neutre | Un bouton bleu délavé se lit « en cours » ou « cassé ». Un bouton neutre se lit « indisponible ». |
| En cours | — | fond inchangé, libellé à 0,85 | Un bouton qui pâlit donne l'impression d'avoir sauté. |
| Focus | anneau composite + `shadow-xs` | `--focus-ring` unique | Un seul anneau pour tout le système, plus sa variante danger. |

Mesuré sur `/design/button` : hauteur 34 px, rayon 6 px, retrait 14 px, texte
13 px / 500 — les valeurs de la planche, au pixel. Le fond du bouton « en cours »
est identique à celui du bouton au repos (`rgb(22, 57, 79)` dans les deux cas).

### C — L'axe « accent » des préférences est retiré

Les préférences passent de trois axes à deux : **barre latérale** et **police**
(le thème reste chez `next-themes`).

**Motif.** La planche est un système *accordé* : ses neutres portent la teinte du
primaire. Proposer un accent ambre ou indigo par-dessus des neutres bleutés ferait
jurer toute l'interface — l'option aurait été une façon de laisser l'utilisateur
casser le produit. Restaurable sans coût : l'axe ne tenait qu'à une cascade CSS.

## Comment la planche est intégrée : trois couches

```
1. Primitives      les rampes de la planche, telles quelles
2. Rôles           les rôles de la planche, tels quels
3. Raccordement    nos noms ReUI (--primary, --foreground, --border…)
                   DÉFINIS À PARTIR des rôles
```

La troisième couche n'est pas un second système. Les composants prélevés du
template consomment `bg-primary`, `text-muted-foreground`, `border-input` : adopter
directement les noms de rôles obligerait à réécrire chaque composant prélevé, et le
« à l'identique » est justement ce qui nous protège des dérives. Un composant
re-cartographié (le bouton l'est) consomme directement les rôles et n'a plus besoin
du raccordement.

## Écarts assumés à la planche

1. **`--text-primary-role` renommé `--text-link`.** Le nom d'origine ne venait que
   de la collision avec `--text-primary`. Même valeur, même usage.
2. **Surfaces de barre latérale ajoutées** (`--sidebar`, `--sidebar-foreground`,
   `--sidebar-muted`, `--sidebar-border`). La planche décrit une page, pas un menu
   sombre posé sur une interface claire. Dérivées de la rampe **bleue** et non des
   neutres : un menu gris à côté d'un primaire bleu fait tache.
3. **`--radius` passe de 10 px à 8 px**, pour que `rounded-md` vaille les 6 px que
   la planche donne aux contrôles.
4. **Icônes des variantes neutres à 60 % d'opacité** — retenu de Metronic, pas dans
   la planche. À pleine densité d'encre elles concurrencent le libellé.

## Trous relevés dans la planche (à combler)

Le bloc sombre n'override pas tout. Ces jetons gardent donc leur valeur claire en
mode sombre, ce qui est faux :

| Jeton | Valeur en sombre aujourd'hui | Problème |
|---|---|---|
| `--fill-success-hover` | `--green-800` | Le survol **assombrit** au lieu d'éclaircir. |
| `--fill-warning-hover` | `--amber-800` | Idem. |
| `--border-success` | `#A9CFBF` | Bordure pâle sur fond sombre : trop forte. |
| `--border-warning` | `#EFCE8C` | Idem. |
| `--border-danger` | `#E6ABA6` | Idem. |
| `--border-info` | `#A3C6E4` | Idem. |

`--border-primary` est bien overridé (`#2E5A75`) — c'est le modèle à suivre pour
les quatre autres. Rien n'est corrigé d'office : les valeurs viennent de la planche.

## Ce qui n'est pas encore fait

- **La barre latérale n'utilise pas encore ses jetons** (`--sidebar*`). Elle écrit
  `bg-background` : l'axe « barre latérale » est donc inerte à l'écran. C'est la
  vague suivante, avec la typographie du menu.
- **Le badge n'est pas re-cartographié.** Il consomme encore
  `--color-success-accent` / `-soft` via le raccordement, et se sert du même jeton
  comme fond plein ET comme couleur de texte. Ça tient en clair, c'est faible en
  sombre. Aucun écran ne l'affiche aujourd'hui.
- **Les teintes de module du menu** (`text-violet-500`, `text-rose-500`,
  `text-lime-500`…) sont hors système. À trancher avec la vague barre latérale.

## Vérifications

- `tsc --noEmit` vert, `eslint` 0 erreur, 103 tests unitaires verts.
- Captures : `e2e/screenshots/palette-{clair,sombre}.png`,
  `palette-roles-{clair,sombre}{,-2}.png`, `bouton-{clair,sombre,arabe,dense,confort}.png`.
- La page `/design/palette` **lit les jetons sur la page**, elle ne les recopie pas :
  un jeton non raccordé s'y voit immédiatement.
