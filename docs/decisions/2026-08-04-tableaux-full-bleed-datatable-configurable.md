# Décision — 2026-08-04 Tableaux pleine largeur (full-bleed) + DataTable configurable

**Date** : 2026-08-04
**Décideur** : Arbi (Master DEV Front)
**Statut** : ✅ ACCEPTÉE

---

## Contexte

Conception du module de référence **Tiers**. Arbi veut, pour **tout le site**, la
disposition des tableaux du **concept CRM Metronic** : le tableau **touche les bords**
du panneau de contenu (« full-bleed »), tandis que la barre de filtres, le titre et
la pagination gardent leur marge.

Obstacle : le `main` du gabarit portait le **padding horizontal** de toutes les pages
(`px-4 lg:px-7.5`), décision S3c §2 (« marge de respiration portée par l'enveloppe,
sans dépendre de la discipline de chaque page »). Tant que ce padding est sur le
parent commun, **aucun tableau enfant ne peut atteindre le bord**. Deux options :
(A) déplacer le padding dans les éléments de page ; (B) faire « déborder » le seul
tableau par marge négative. B a été jugé bricolage (nombre magique, couplage).

## Décision

**1. Full-bleed partout (concept CRM).** Le padding **horizontal** quitte le `main`
(qui ne garde que la respiration **verticale**, `py-5 lg:py-7.5`) et est désormais
**porté par les éléments de page** (`px-4 lg:px-7.5` sur le titre, la barre de filtres,
la pagination, les pages placeholder/dev). Le **tableau, lui, touche les bords** ; son
**contenu reste aligné** sur les filtres grâce à une **gouttière** sur les colonnes de
bord (`ps-/pe-` sur la 1ʳᵉ et la dernière colonne) — la bande est à ras, le texte en
retrait. **Ceci INVERSE volontairement S3c §2** (voir Conséquences).

**2. `DataTable` = composant partagé configurable (« plugin » maison).** Le look et le
comportement vivent à **un seul endroit** (`shared/ui/data-table`, `shared/ui/card`) —
une modif se propage à toutes les listes. Chaque page **paramètre à l'init** (densité,
lignes/page, colonnes, filtres…). Deux niveaux :
- **Défauts intégrés au composant** : densité **compacte**, **10** lignes/page,
  tailles `[10, 20, 50, 100]` (≤ 100 = limite serveur). Une liste qui ne précise rien
  est déjà correcte.
- **Surcharges par page** : une autre liste pourra demander « confortable + 25 ».

## Conséquences

**Pour** :
- Disposition identique et « pro » pour **toutes** les futures listes, sans y repenser.
- Zéro hack (`-mx`) ; le tableau est full-bleed par construction.
- Défauts cohérents (compact/10) + liberté par page = vraie brique réutilisable.

**Contre / à retenir** :
- **Inverse S3c §2** : le padding horizontal n'est plus porté par l'enveloppe mais par
  **chaque page**. Toute nouvelle page doit donc porter son `px-4 lg:px-7.5` (ou
  utiliser un tableau full-bleed). Discipline de page requise — assumée.
- Couplage léger : la gouttière de bord du `DataTable` reprend la valeur de padding de
  page (`ps-4 lg:ps-7.5`). Si on change la respiration, l'ajuster aux deux endroits.

## Références

- Discussions : conception Tiers 04/08 (Arbi + Front). Concept CRM :
  `vendor-metronic/concepts/vite/src/crm/pages/companies/company-list.tsx`
  (`<Card className="border-none shadow-none">`, `CardTable` sans padding).
- Inverse : **S3c §2** (respiration portée par l'enveloppe).
- Dépend de : **ADR-F01** (Metronic = source), **ADR-F03** (tokens/densité),
  **ADR-F02** (layout unique).
- Impacte : `shared/ui/data-table/*`, `shared/ui/card.tsx`,
  `shared/layout/components/wrapper.tsx`, toutes les pages de liste à venir.
