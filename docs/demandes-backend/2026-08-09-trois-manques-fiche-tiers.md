# Demande Backend — Trois manques sur la fiche Tiers (lot groupé)

**Date** : 2026-08-09
**Statut** : 🔴 ATTENDU
**Bloque** : l'indicatif téléphonique par défaut, le calendrier localisé, la lisibilité
des portées Finance, la pagination de l'Historique

---

## Pourquoi un lot

Trois manques distincts, découverts séparément, mais qui tiennent en une passe. Aucun
n'est bloquant au sens strict — le front fonctionne avec des replis. Chacun se voit
pourtant à l'écran, et deux d'entre eux affichent aujourd'hui des données techniques à
l'utilisateur.

---

## 1. Le pays du bureau dans `/me`

**Le besoin.** Deux comportements dépendent du **pays du bureau de l'utilisateur**, et
aucun n'a la donnée :

- **L'indicatif téléphonique par défaut.** À la saisie d'un numéro, le champ doit
  présélectionner l'indicatif du pays du bureau (+216 à Tunis, +213 à Alger, +33 à
  Paris). Aujourd'hui, aucun défaut : l'agent choisit son pays à chaque saisie.
- **Le premier jour de la semaine du calendrier.** Lundi en Tunisie, en Algérie et en
  France ; samedi dans le Golfe. Ce n'est **pas** une affaire de langue — un Tunisien
  qui met l'interface en arabe travaille du lundi au vendredi — donc la langue de
  l'interface ne peut pas servir de source. Le front est aujourd'hui **figé sur lundi**,
  ce qui est juste pour les trois pays actuels et faux dès le premier client du Golfe.

**Ce qu'on attend.** Le code pays **alpha-2** du bureau, dans `/me`, sur chaque bureau
de la liste :

```jsonc
{
  "offices": [
    { "accountId": 119751, "publicId": "…", "displayName": "myGO Tunis-Arbi", "country": "TN" }
  ]
}
```

---

## 2. Le nom du bureau sur les objets financiers

**Le besoin.** Les plafonds de crédit, les exonérations de TVA, les règles
d'approbation et les politiques commerciales portent un `officeAccountId` **numérique**,
sans nom. Le front résout ce numéro via la liste des bureaux de `/me`.

**Le trou.** Dès que le bureau **ne fait pas partie de ceux de l'utilisateur connecté**,
la résolution échoue et l'écran affiche l'identifiant brut : `#119751` à la place de
« myGO Tunis-Arbi ». Ce n'est pas un cas théorique — il se produit pour tout
utilisateur d'un groupe multi-agences consultant un tiers d'une autre agence, et il est
visible sur toutes nos captures du 09/08.

Un identifiant interne exposé à l'utilisateur est une fuite technique : il n'a aucun
sens pour lui, et il donne l'impression d'un écran inachevé.

**Ce qu'on attend.** Le nom lisible à côté de l'identifiant, sur chacun de ces objets —
exactement ce que la **liste des tiers** fait déjà pour `offices[]` :

```jsonc
{
  "creditLimits": [
    { "publicId": "…", "officeAccountId": 119751, "officeDisplayName": "myGO Tunis-Arbi", "amountMinor": "10000500" }
  ]
}
```

Même chose pour `taxExemptions[]`, `approvalRules[]` et `commercialPolicies[]`.

---

## 3. `meta.hasMore` sur l'historique

**Le besoin.** L'onglet Historique charge par tranches (« Charger plus »). Pour savoir
s'il reste des entrées, le front applique la règle habituelle « une page pleine ⇒ il en
reste ».

**Le trou.** Cette règle est fausse ici : la réponse renvoie **une entrée de moins que
la limite demandée**. Mesuré le 08/08 — `limit=5` → 4 entrées, `limit=10` → 9,
`limit=20` → 18. Le front croit donc la liste terminée alors qu'elle ne l'est pas, et
masque le bouton à tort.

Le repli actuel — « un chargement qui n'apporte aucune entrée nouvelle = fin » — marche,
au prix d'un aller-retour inutile à chaque fin de liste.

**Ce qu'on attend.** Un booléen explicite dans `meta` :

```jsonc
{ "meta": { "page": 1, "limit": 20, "hasMore": true, "satellitesSince": "2026-08-05" } }
```

Accessoirement, comprendre l'écart de comptage : il est peut-être le symptôme d'autre
chose.

---

## Références

- Inventaire des champs de la fiche Tiers, 09/08/2026 — défaut 7 pour le point 2.
- `docs/backlog/en-attente-donnees.md` — les trois entrées y figurent côté front.
