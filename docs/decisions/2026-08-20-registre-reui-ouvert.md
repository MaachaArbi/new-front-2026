# La voie du registre ReUI est ouverte — 20/08

## Ce qui a été vérifié

`npx shadcn@latest add @reui/date-selector` fonctionne de bout en bout. La chaîne
est réelle, gratuite, et elle apporte du code **plus récent** que notre paquet
Metronic local.

## L'empilement, établi par mesure

| Éditeur | Ce qu'il publie |
|---|---|
| **shadcn** | les primitives de base — bouton, champ, sélecteur, case à cocher |
| **ReUI** | ce que shadcn n'a **pas** : 73 primitives avancées, 1 590 blocs, 4 hooks |
| **Metronic** | tout ça, **habillé** par KeenThemes |

Metronic n'a pas écrit ces composants : il les a habillés. Nous faisons le même
geste avec notre palette. C'est exactement ce que l'ADR-F01 décrivait.

**Correction d'une erreur de lecture.** Les `HTTP 401` du registre portaient sur des
noms qui **n'existent pas** chez ReUI (`button`, `input`, `file-upload`) — parce que
ReUI ne republie pas ce que shadcn publie déjà. Le serveur répond 401 au lieu de
404. Tout ce que l'ADR nommait répond **200** : `phone-input`, `number-field`,
`date-selector`, `rating`, `autocomplete`, `filters`, `timeline`, plus `stepper`,
`data-grid`, `tree`, `kanban`, `gantt`, `event-calendar`, `cascader`.

## Deux réglages qu'il a fallu poser

1. **`components.json`** — n'existait pas. Registre déclaré :
   `{"@reui": "https://reui.io/r/{name}.json"}`, alias pointés sur `@/shared/ui`,
   `@/shared/lib/cn`, `@/shared/hooks`.
2. **`tsconfig.json` porte désormais `baseUrl` + `paths`.** Il ne contenait que des
   références ; le CLI n'a donc pas su résoudre `@` et a créé un dossier
   **littéralement nommé `@`**. Aucun de nos fichiers n'a été écrasé — l'arbre git
   était propre avant l'appel, c'est ce qui a permis de le voir immédiatement.

## Défaut d'outillage découvert au passage

`npx tsc --noEmit` **ne vérifiait rien**. `tsconfig.json` déclare `"files": []` et
ne fait que référencer `tsconfig.app.json` ; sans `-b`, le compilateur n'a aucun
fichier à lire et sort en succès. Le contrôle réel est `tsc -b`, exécuté par
`npm run build` — c'est lui qui a attrapé l'erreur de type du calendrier.

**Règle : la vérification de types passe par `npm run build`, jamais par
`npx tsc --noEmit`.**

## Premier composant tiré : le calendrier

Gardé **seul** — `date-selector` (1 360 l.), `tabs` et `use-mobile` ont été écartés,
conformément à la gouvernance ADR-F01 : *aucun composant importé par défaut*. Ils
sont à une commande de distance le jour où un écran les demande.

Dépendances ajoutées : `react-day-picker` 10.0.1, `date-fns` 4.4.0.

### Ce que le registre apportait déjà, et que le paquet local n'a pas

- `rtl:**:[.rdp-button_next>svg]:rotate-180` — les flèches suivent le sens de
  lecture. La version 9 du paquet Metronic ne le fait pas.
- L'API `getDefaultClassNames()` de react-day-picker 10.
- Le branchement sur **notre** bouton (`buttonVariant="ghost"`).

### Ce qu'il a fallu corriger quand même

1. **Coins de plage en RTL.** `rounded-l-md` / `rounded-r-md` sur `range_start` et
   `range_end`, `pr-1 pl-2` sur l'en-tête déroulant — huit occurrences, toutes
   relevées par notre règle de lint. En arabe, une plage sélectionnée aurait eu ses
   coins arrondis inversés : elle paraîtrait commencer là où elle finit.
2. **Mois du menu déroulant.** `toLocaleString('default')` suit la locale du
   **navigateur**, pas celle du calendrier — le mois restait « août » sur une
   interface arabe. C'est le défaut exact du contrôle de date natif qu'on cherche à
   remplacer. Corrigé en lisant le code de la locale reçue.
3. **API du bouton.** `size="icon"` n'existe pas chez nous : le carré s'exprime par
   `mode="icon"`, pour que la largeur suive `--ui-row` et donc la densité.

**Aucune retouche de couleur.** Le calendrier consomme `bg-primary`,
`text-muted-foreground`, `bg-accent` — que la couche de raccordement alimente déjà
en Bleu de Prusse. C'est la démonstration que cette couche paie.

## Conséquence sur la méthode

Ce n'est plus « prélever depuis le paquet local », c'est :

- **paquet Metronic local** pour les primitives de base (il les tient figées, à la
  version auditée, cohérentes avec layout-21) ;
- **registre ReUI** pour ce qu'il apporte en propre — et il est souvent plus récent.

Dans les deux cas, même discipline : re-cartographié, audité RTL, écarts documentés,
montré avant validation. L'audit RTL reste irréductible : les deux sources livrent
du code cassé pour nous, et c'est notre lint qui l'attrape.

## Vérifications

- `npm run build` (`tsc -b` + vite) vert · `eslint` 0 erreur · 103 tests verts.
- Captures : `e2e/screenshots/calendrier-{clair,sombre,arabe}.png`.
