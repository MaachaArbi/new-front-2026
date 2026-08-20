# Restylages envisagés — rien n'est décidé

Arbi, 20/08/2026 : *« Je n'ai rien choisi pour le moment, mais si j'ai la garantie
qu'on pourra changer plus tard, alors on peut avancer tranquillement. »*

Ce fichier existe pour que ces pistes ne se perdent pas, et pour dire **à l'avance
ce que chacune coûtera**. Aucune n'est engagée.

## 1 · Le tiroir décollé des bords, à coins arrondis

Aujourd'hui la feuille latérale (`Sheet`) est collée au bord et pleine hauteur.
L'idée est un panneau **flottant** : marge sur les quatre côtés, rayon, ombre.

**Ce que ça touche** : le bloc `sheetVariants` dans `src/shared/ui/sheet.tsx`.
Aujourd'hui `inset-y-0 end-0 h-full border-s` ; demain quelque chose comme
`end-3 top-3 bottom-3 h-auto rounded-xl border shadow-lg`.

**Coût** : un bloc, dans un fichier. **Aucun écran touché.**

## 2 · Les dialogues en carte, avec flèche de retour

Référence apportée par Arbi : des dialogues en carte blanche arrondie, en-tête avec
une flèche « retour » à gauche du titre et une croix à droite, boutons pleine
largeur en pied, enchaînés en étapes.

**Ce qui se propage seul :**

| Élément | Où | Coût |
|---|---|---|
| Carte, rayon, ombre, fond | `dialogContentVariants` | un bloc |
| Boutons pleine largeur en pied | `DialogFooter` | une ligne |
| Style des boutons | déjà par jetons | zéro |

**Ce qui ne se propage PAS seul : la flèche de retour.** Elle n'existe pas
aujourd'hui — c'est une pièce d'anatomie, pas un style. Il faudra une
sous-partie `DialogBack` (ou une prop `onBack`).

C'est un ajout **additif** : les appels existants continuent de marcher sans rien
changer, seuls ceux qui veulent la flèche s'en servent. C'est la bonne catégorie
de changement d'API — celle qui ne casse rien.

Les enchaînements d'étapes (« Structure », « Résumé », « Mots-clés ») ne sont pas
du ressort du composant : ce sont des écrans qui utilisent le dialogue.

## La règle générale, en une ligne

> Le **style** se change en un endroit et se propage.
> L'**anatomie** se change en un endroit mais peut demander de toucher les appels.
> **Renommer ou retirer** une prop est le seul changement vraiment cher — c'est
> pour ça qu'on corrige les API MAINTENANT (`side`, `indicatorPosition`) pendant
> qu'aucun écran ne les utilise.

## Les trois engagements qui rendent la garantie vraie

Ils tiennent le jour où on écrira les écrans :

1. **Toujours importer depuis `@/shared/ui/*`.** Jamais une copie locale.
2. **Aux appels, on ne règle que la place et le contenu** — largeur, position dans
   la grille, texte. Jamais une couleur, jamais une hauteur de contrôle.
3. **Aucune couleur littérale.** Vérifié par le lint depuis le 20/08 : le build
   refuse `bg-white` ou `border-green-500` hors de `tokens.css`.
