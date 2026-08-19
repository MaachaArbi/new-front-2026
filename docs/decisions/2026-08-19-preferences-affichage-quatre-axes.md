# Quatre axes de préférence d'affichage, pas six

**Date** : 2026-08-19
**Statut** : ✅ ACTÉ
**Portée** : `src/styles/tokens.css`, `src/app/providers/display-preferences.tsx`, `src/shared/layout/`

---

## Contexte

La proposition de refonte reçue de Claude Design comporte un panneau de préférences
utilisateur à **six axes** : thème, barre latérale, accent, densité, taille de
l'interface, police. Arbi veut ces réglages « dès le départ ».

## Décision

On ouvre **quatre** axes — thème, barre latérale, accent, police — et on **écarte**
la densité et la taille de l'interface.

## Pourquoi ce partage

Les quatre retenus sont **déjà des jetons** dans `tokens.css`. Les ouvrir revient à
les redéfinir par attribut : aucun code de rendu à toucher, aucune régression possible
ailleurs. Coût réel mesuré : la cascade CSS, un fournisseur de 150 lignes, et la
bascule des composants du menu sur les jetons `--sidebar-*` (4 fichiers).

Les deux écartés supposeraient de faire passer **206 tailles figées** de `shared/ui`
(`h-9`, `size-4`, `text-2sm`) par des variables. Ce n'est pas insurmontable, mais le
vrai obstacle est ailleurs : 2 thèmes × 2 barres × 4 accents × 3 densités × 3 tailles
× 3 polices = **432 combinaisons**. Personne ne peut les vérifier. Promettre un
réglage qu'on ne teste pas, c'est livrer des écrans cassés que l'utilisateur croira
avoir cassés lui-même.

Quatre axes garantis valent mieux que six approximatifs.

## Conséquences

- **Règle absolue** : plus jamais de couleur écrite en dur dans un composant. Au
  19/08 le code de production n'en contient **aucune** (les 56 occurrences relevées
  sont toutes dans `/_ui`, la page jetable). C'est ce qui rend l'accent commutable
  pour rien ; une seule couleur littérale ajoutée casserait l'axe.
- L'accent pilote `--primary` (liens, onglet actif, indicateurs). Il ne touche **ni**
  `--ink` (le bouton principal reste encre) **ni** les couleurs d'état : un accent qui
  repeindrait le rouge d'une erreur détruirait l'information.
- La barre latérale est un axe **indépendant** du thème — les quatre combinaisons
  sont déclarées explicitement, jamais déduites. Défaut : **menu sombre sur interface
  claire**.
- Les polices non-Inter ne se téléchargent **que si** l'utilisateur les choisit.
- Un script dans `index.html` pose les attributs avant la première peinture, comme
  `next-themes` le fait pour le thème.

## Si on revient dessus

Rouvrir densité et taille reste possible : le chemin est d'introduire deux variables
(échelle de corps, hauteur de ligne) dans `shared/ui`, et de ne garantir que **trois
préréglages nommés** plutôt que le produit cartésien.
