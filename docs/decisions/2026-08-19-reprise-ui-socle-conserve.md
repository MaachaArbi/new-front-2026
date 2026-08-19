# Reprise de la couche visuelle, socle conservé

**Date** : 2026-08-19
**Statut** : ✅ ACTÉ
**Portée** : tout `src/` — voir la branche `archive/ui-v1` pour l'état précédent

---

## Le problème

La fiche Tiers a été redessinée **trois fois** en trois semaines : maquette `/_ref`,
passe « effet WAW », puis alignement sur la refonte externe. À chaque fois du code a
été écrit, puis le visuel a changé, puis le code a été repris.

La cause n'est pas la qualité du code. C'est **l'ordre de travail** : on validait des
écrans avant d'avoir arrêté la coquille et le système de composants. Tant que la
référence bouge, tout ce qui s'appuie dessus bouge aussi.

Arbi l'a formulé ainsi : « ça m'évitera de changer à chaque fois sans savoir pourquoi
ni ce que je veux. »

## La décision

On **reprend la couche visuelle à zéro** et on **conserve le socle**.

### Ce qui reste, et pourquoi

| Conservé | Raison |
|---|---|
| `shared/api`, `shared/auth` | Jeton en mémoire, rafraîchissement en cookie `httpOnly`, **verrou anti-refresh-parallèle entre onglets** — sans lui, deux onglets ferment toutes les sessions. Enveloppe d'erreur, `X-Request-Id`, RLS où « vide ≠ erreur ». |
| `shared/money` | Dinar à **3 décimales**, `bigint`, devise indissociable, règle ESLint interdisant `toFixed` (ADR-F07). |
| `shared/i18n` + les 3 langues | Pluriels arabes ICU. **L'arabe n'est pas une traduction, c'est une contrainte de mise en page** : les nombres se réordonnent (`524 568 521` → `521 568 524`). Découvrir ça après avoir tout construit coûte cinquante écrans. |
| `shared/keyboard`, `shared/navigation` | Raccourcis par **position physique** — fonctionnent sur clavier arabe (ADR-F20.5). Panneaux adressables par URL (ADR-F20.2). |
| Configuration ESLint | Règles RTL (propriétés physiques interdites) et Money. C'est l'outillage qui **empêche** la régression, pas la consigne. |
| `reference/`, `docs/` | Les ADR-F01 à F21 et les décisions datées. Elles restent la loi du projet. |

**Aucune de ces règles n'est visible dans une maquette.** Toutes ont été apprises en
se cognant dedans. Les réécrire, c'est les réapprendre.

### Ce qui repart

`shared/ui` (44 composants), `shared/layout`, `modules/party`, les pages, les specs
d'écran. Environ **16 000 lignes**, toutes visuelles ou liées aux écrans actuels.

### Le vocabulaire

Les catalogues passent de **584 clés à 12**. Chaque terme d'interface naîtra **avec**
son écran, dans les trois langues simultanément. On ne traîne pas les mots d'écrans
qui n'existent plus, et on ne retrofite pas l'i18n après coup.

## L'ordre de travail retenu

```
1. Socle              conservé, vérifié — fait
2. Coquille           layout, sombre, RTL — gelée AVANT tout écran
3. Catalogue d'états  composants dans TOUS leurs états, pas une vitrine
4. Écran brouillon    esquisse → confrontation à la BASE → validation
5. Module Tiers       UI/UX seule, chaque valeur avec sa source nommée
6. Branchement        une seule fois, sur une cible qui ne bouge plus
```

**Deux règles d'ordre, apprises de l'échec précédent :**

- La confrontation à la base se fait **à l'esquisse**, pas après validation — sinon on
  invalide un écran qu'on vient d'approuver.
- Aucun écran n'est validé tant que **chacune de ses valeurs n'a pas une source
  nommée** : existe / à construire / n'existera pas. Sans cette règle, un projet
  visuel avance des mois en paraissant fini.

## Ce que ça coûte

**Deux à trois semaines sans fonctionnalité livrée**, et le module Tiers — le seul qui
parle au serveur — à l'arrêt pendant ce temps.

C'est un investissement, pas une perte : on paie une fois ce qui a déjà été payé trois
fois sur une seule fiche.

## La confrontation qu'on aura

> « Pourquoi jeter ce qui marche ? »

On ne jette pas ce qui marche : on jette ce qui **a déjà été refait trois fois** et on
garde ce qui n'a jamais bougé. Le socle conservé porte l'intégralité des règles
apprises ; c'est la couche qui n'a pas de référence stable qui repart.

## Réversibilité

Tout l'état précédent vit sur la branche **`archive/ui-v1`**, avec son historique
complet. N'importe quel composant peut être récupéré nommément.
