# Décision — Palette sombre à trois niveaux de surface

**Date** : 2026-07-24
**Vague** : S3c
**Statut** : ✅ Appliqué
**Fondé sur** : ADR-F03 (théming par tokens), ADR-F20 (UX — outil ouvert toute la journée)

---

## Contexte

La palette sombre livrée en S3a/S3b avait deux défauts mesurés :

1. `--muted-foreground` (`zinc-500`) sur `--background` (`zinc-950`) donnait
   **4,12:1**, sous le seuil WCAG AA de 4,5:1 — tout le texte gris (sous-titres,
   libellés, métadonnées) était non conforme.
2. `--card` et `--background` valaient **la même couleur** → aucun relief, rendu
   plat.

Les opérateurs passent la **journée entière** dans l'outil (ADR-F20). Le confort
visuel prolongé est un critère produit, pas un vernis.

## Décision 1 — Trois niveaux de surface, pas un

```
rail et menu latéral   #18181b   le plus sombre   (--sidebar)
fond de page           #1f1f23   intermédiaire     (--background)
cartes et panneaux     #27272a   le plus clair     (--card / --popover)
```

La hiérarchie de profondeur guide l'œil (le contenu « flotte » au-dessus du fond,
le fond au-dessus du châssis) et **repose** sur une longue session. Un token
dédié **`--sidebar`** (+ `--color-sidebar` exposé) a été ajouté plutôt que
d'écrire la couleur du rail en dur dans un composant (ADR-F03 : jamais de couleur
en dur).

## Décision 2 — Ni noir pur en fond, ni blanc pur en texte

`--background` = `#1f1f23` (pas `#000`), `--foreground` = `#e4e4e7` (pas `#fff`).
Le blanc pur sur fond très sombre crée un **halo** fatigant (irradiation). Le
texte est donc **adouci** — mais **le contraste reste élevé** : le texte principal
tient **12,9:1**. On adoucit la *luminance absolue*, jamais le *contraste*.

### Contrastes mesurés (script oklch/sRGB→WCAG, reportés au journal)

| Paire | Mesuré | Cible |
| --- | --- | --- |
| texte principal / fond | **12,94:1** | ≈12,9 |
| texte principal / carte | **11,74:1** | ≈11,7 |
| texte secondaire / fond | **6,41:1** | ≈6,4 |
| texte secondaire / carte | **5,81:1** | ≈5,8 |

Le texte secondaire passe de 4,12:1 (non conforme) à 6,41:1.

## Décision 3 — Le pastel s'applique aux couleurs, jamais au contraste du texte

Les couleurs d'état (succès, danger, avertissement, info, neutre) sont **pastel** :
teintes douces et désaturées, adaptées à un outil ouvert en continu. Le pattern
est **fond très sourd + texte clair de la même famille** — le pastel joue sur la
*teinte*, pas sur le *contraste*, qui reste entre 6:1 et 11:1 (mesurés :
succès 10,9 · danger 8,8 · warning 10,7 · neutre 6,1 · info 8,6).

Concrètement, ces valeurs alimentent les tokens `--color-success-accent` /
`--color-success-foreground` (et warning/info) que `badge.tsx` consomme déjà.

### Le bouton d'accent reste vif

`--primary` = `blue-600`, texte blanc (5,17:1). C'est le **seul** élément vif de
l'interface : rare, donc non fatigant, et repérable instantanément dans une page
dense. **Piège documenté** : un bouton pastel avec texte blanc tomberait à ~2,5:1
— si un jour un bouton pastel est introduit, son texte devra être **foncé**.

## Décision 4 — Jamais la couleur seule pour porter un sens (ADR-F20 §4.5)

Chaque état porte aussi **un mot ou une icône**, jamais la seule couleur —
exigence WCAG et nécessité pour les ~8 % d'hommes distinguant mal rouge/vert.
En pratique : les badges d'état de la barre latérale sont **écrits**
(« Nouveau », compteur numérique), pas seulement colorés.

## Mode clair

**Inchangé** pour les tokens existants (`--primary` reste `blue-600`, acquis S3a).
S3c n'y **ajoute** que les nouveaux tokens `--sidebar` (gris très pâle) et les
`--color-*` d'état (pastels clairs : fond tendre + texte foncé de la même famille).

## À revisiter

- Les états pastel clairs (mode clair) sont dérivés (Tailwind-ish) et non issus
  d'une mesure formelle comme le sombre ; à affiner au besoin.
- Le catalogue de thèmes fermé (ADR-F03) n'est pas encore défini : ces valeurs en
  constituent le premier thème sombre de référence.
