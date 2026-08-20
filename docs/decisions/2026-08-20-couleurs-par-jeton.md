# Toute couleur passe par un jeton — 20/08

## Le problème, mesuré

Arbi a demandé une garantie : si on change le design d'un composant plus tard,
est-ce que ça se propage partout ? La réponse structurelle est oui — mais avant
de la donner, j'ai compté. **16 couleurs littérales** dormaient dans le code, dont
cinq vraies fuites :

| Fuite | Où | Effet |
|---|---|---|
| `bg-white` sur le curseur | `switch.tsx` | ne suivrait aucun changement de palette |
| `border-green-500` sur l'avatar | `header.tsx`, `user-dropdown-menu.tsx` | idem, deux fois |
| 4 jetons **consommés sans être définis** | `badge.tsx` | retombait en silence sur le bleu et le rouge bruts de Tailwind |
| 10 teintes de module | `nav.config.ts` | dispersées, donc inaccordables en une passe |

Le cas du badge est le plus instructif : il écrivait
`var(--color-primary-accent, var(--color-blue-700))`. Le jeton n'ayant jamais été
défini, le repli s'appliquait **toujours**. Rien ne le signalait : ni erreur, ni
avertissement, ni différence visible tant qu'on ne changeait pas la palette.

## Décision

Une règle de lint interdit désormais les couleurs littérales dans les chaînes de
classes, partout sauf `tokens.css` : noms de la palette Tailwind, hexadécimaux,
`rgb()` en dur. Elle rejoint la règle RTL (ADR-F04) et la règle Money (ADR-F07)
dans `no-restricted-syntax`.

Passent : nos jetons (`bg-primary`, `text-ink-muted`, `bg-fill-danger`), les
mots-clés CSS (`transparent`, `current`, `inherit`), et `var(--…)`.

**Motif.** Le système de design ne vaut que si un changement se propage seul. Une
convention qu'on peut oublier n'est pas une garantie ; une règle que le build
applique en est une.

## Jetons ajoutés

Trois rôles hors planche, chacun remplaçant une couleur qui était en dur :

- `--scrim` — le voile des surfaces flottantes. Ce n'est pas une teinte de la
  palette, c'est de l'obscurcissement : noir dans les deux thèmes, seule
  l'opacité change (30 % en clair, 50 % en sombre).
- `--shade` — la teinte des ombres portées. En sombre, une ombre à 5 % est
  invisible : elle passe à 40 %.
- `--fill-thumb` — le curseur de l'interrupteur, clair sur les deux thèmes parce
  qu'il doit trancher sur la piste, coché comme décoché.

Plus les quatre jetons que le badge réclamait sans les avoir
(`--color-primary-accent`, `--color-primary-soft`, `--color-destructive-accent`,
`--color-destructive-soft`), et les **dix teintes de module** (`--module-*`),
sorties de `nav.config.ts`.

## Ce qui reste en suspens

Les teintes de module sont **provisoires**. Elles viennent du rail Metronic et
n'ont pas été accordées au Bleu de Prusse : dix teintes vives à côté d'un primaire
sourd, ça peut jurer. Elles vivent maintenant dans `tokens.css` précisément pour
qu'on puisse les accorder en une passe, avec la vague « barre latérale ».

## Vérifications

`npm run build` vert · `eslint` 0 erreur · 103 tests verts · les trois vagues de
captures rejouées, aucune régression visuelle.
