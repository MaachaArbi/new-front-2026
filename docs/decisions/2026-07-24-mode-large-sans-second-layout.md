# Décision — Mode large sans second layout

**Date** : 2026-07-24
**Vague** : S3b
**Statut** : ✅ Appliqué
**Fondé sur** : ADR-F02 (un layout unique, `layout-21` paramétré)

---

## Contexte

Certains écrans (grilles denses : catalogue, tarification, lettrage) ont besoin
de toute la largeur. ADR-F02 prévoit explicitement un axe de paramétrage
« densité / repli de la barre » **sans** composition d'écran configurable, et
pose une réserve : *« Toute grille dense doit être conçue et testée barre
repliée. »*

La tentation naturelle serait de créer un **second layout** « pleine largeur ».
ADR-F02 l'interdit : chaque variante de layout se croise avec clair/sombre et
LTR/RTL, ce qui **quadruple la surface de test**.

## Décision

Le mode large est **un état du layout unique**, pas un layout distinct.

- Le `LayoutProvider` (`src/shared/layout/components/context.tsx`) expose
  `setPageWide(boolean)`.
- Une page déclare son besoin en **une ligne** via le hook `useWideMode()`
  (`src/shared/layout/hooks/use-wide-mode.ts`).
- L'état effectif de la barre est calculé :
  `isSidebarOpen = préférenceUtilisateur && !pageWide`.
- Quand une page large est active, la barre latérale se replie ; **le rail des
  modules reste visible** (largeur `--sidebar-collapsed-width`).
- En quittant la page large, la **préférence manuelle de l'utilisateur reprend**
  (elle n'a jamais été écrasée).

En S3b, la liste des modules larges tient en une ligne dans `module-page.tsx` :

```ts
const WIDE_MODULES = new Set<string>(['catalogue'])
```

## Conséquences

- **Un seul chemin de code**, un seul jeu de tests clair/sombre × LTR/RTL.
- Le repli **manuel** (bouton `PanelRight`) reste disponible et **mémorisé**
  (localStorage `ostravel-sidebar-open`) — indépendant du mode large.
- Aucune duplication de structure : le mode large n'ajoute qu'un booléen.

## Alternatives rejetées

- **Second layout pleine largeur** : rejeté par ADR-F02 (explosion combinatoire
  des tests).
- **Forcer le repli en écrasant la préférence utilisateur** : rejeté — l'état
  manuel doit survivre à la navigation vers/depuis une page large.

## À revisiter

- Le choix des modules larges (`WIDE_MODULES`) est provisoire : il sera porté par
  la configuration d'écran réelle quand les modules métier arriveront (S9+).
- La densité « compact / confortable » (autre axe ADR-F02) n'est pas traitée en
  S3b.
