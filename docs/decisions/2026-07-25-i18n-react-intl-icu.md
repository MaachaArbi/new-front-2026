# Décision — 2026-07-25 i18n : react-intl / ICU remplace le provider maison

**Date** : 2026-07-25
**Décideur** : chat pilote 00-Main DEV Front (vague S-i18n)
**Statut** : ✅ ACCEPTÉE

---

## Contexte

L'i18n avait été bricolée à la main en S2. La fonction de traduction était
exactement :

```ts
const t = (key: string): string => messages[currentLanguage][key] || key
```

Une clé → une chaîne. **Aucune interpolation, aucun pluriel.** La vague S5-UX
l'a heurtée de plein fouet (dérive n°6) : impossible d'afficher « Passer en
{langue} » sans concaténer à la main.

Ce n'est pas cosmétique. **Chaque écran métier** bute dessus :

- messages d'erreur avec valeur (« Solde insuffisant : {montant} disponible »),
- titres avec nom (« Réservations de {client} »),
- compteurs (« {count} factures en retard »).

Et surtout : **l'arabe a six formes de pluriel** (zéro, un, deux, quelques,
beaucoup, autre) contre deux en français. Un `count === 1 ? a : b` est **faux**
en arabe. ADR-F06 prescrivait react-intl précisément pour cette raison ; il était
déjà déclaré dans `package.json` (`^7`) mais inutilisé.

---

## Décision

Remplacer le provider maison par **`IntlProvider` de react-intl (FormatJS)**, et
adopter le format **ICU MessageFormat** pour les catalogues.

### Ce qui change

- Le `t` maison sans interpolation **n'existe plus**. `useI18n().t(key, values)`
  délègue à `intl.formatMessage` : interpolation `{name}` et pluriels
  `{count, plural, …}` corrects dans les six formes CLDR arabes.
- Une clé manquante retombe **silencieusement sur la clé** (via `onError`),
  reproduisant le repli de l'ancien provider — pas de régression de robustesse.

### Ce qui est préservé (intentionnellement)

- L'**API d'appel** `useI18n()` (`t`, `currentLanguage`, `setLanguage`) — pour ne
  casser aucun des 13 appelants, dont `money-input.tsx` qui lit `currentLanguage`
  pour le formatage localisé des montants.
- Bascule de langue + persistance `localStorage`, `dir`/`lang` sur `<html>`,
  langue par défaut `fr`.
- **`RadixDirectionProvider`** monté autour de l'arbre : sans lui les menus Radix
  s'ouvrent du mauvais côté en arabe (piège S3b). **Non retiré.**

### Pourquoi garder `useI18n()` plutôt que migrer 13 fichiers vers `useIntl`

Moins de surface de régression : un seul point d'adaptation (le hook), les
appelants inchangés. `useI18n` enveloppe désormais `useIntl` ; les deux styles
restent possibles pour l'avenir (`<FormattedMessage>` reste disponible).

---

## Ce que ça débloque

Les écrans métier (S6+) peuvent enfin écrire des messages corrects :
montants interpolés, compteurs pluralisés, titres nommés — dans les trois langues,
**sans concaténation manuelle** (anti-patron i18n, faux en arabe RTL). Cohérent
avec le noyau `Money`, qui s'appuie déjà sur `Intl.NumberFormat`.

---

## Conséquences

**Pour**
- Interpolation + six formes arabes, **prouvées par test** (`i18n.test.tsx` :
  `count=2` → duel « فاتورتان », `count=3` → « few », `count=11` → « many »).
- Aucune règle de pluriel réimplémentée à la main (source de bugs silencieux).
- Dette de S5-UX (concaténation dans la palette) résorbée.

**Contre / limites**
- **+~60 ko** de bundle JS (602 → 663 ko : react-intl + parseur ICU). Le
  découpage de bundle reste au backlog (S9+).
- **Chiffres arabo-indiens (٠١٢٣)** : le `#` d'ICU s'affiche dans le système de
  chiffres par défaut d'`Intl` pour la locale (arabo-indien en `ar`). C'est le
  comportement par défaut — le sujet reste **reporté** par ADR-F04, **non
  tranché** ici (comme pour le noyau Money).

---

## Références

- ADR-F06 (i18n react-intl / ICU), ADR-F04 (RTL, chiffres arabo-indiens reportés).
- Révélé par : `docs/journal/2026-07-25-s5ux-socle-interactions.md` (dérive n°6).
- Code : `src/app/providers/i18n-provider.tsx`, `src/shared/i18n/`.
- Journal : `docs/journal/2026-07-25-si18n-consolidation.md`.
