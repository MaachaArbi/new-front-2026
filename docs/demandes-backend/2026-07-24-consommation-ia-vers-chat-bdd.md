# Note pour le chat BDD — Module de consommation IA / crédits

**Émetteur** : chat pilote Front (`00-Main DEV Front`)
**Date** : 24/07/2026
**Urgence** : **aucune.** Ne bloque ni le socle front, ni les premiers écrans
métier, ni le module Contracting hôtelier. À ouvrir quand le sujet viendra.

**Objet** : signalement d'un besoin structurel découvert lors du cadrage front.
Ce document **ne propose aucune structure de tables** — c'est délibéré, la
conception appartient au chat BDD.

---

## 1. D'où vient ce besoin

Décision produit actée le 24/07 : l'IA sera un **module vendu séparément**, avec
une **tarification par famille d'opération** — le coût réel varie d'un facteur
cinquante entre une question d'aide et l'extraction d'un contrat hôtelier de
40 pages.

Cela transforme la notion d'entitlement, telle qu'elle existait dans le cadrage :

| Type | Exemple | Question posée |
|---|---|---|
| **Interrupteur** (connu) | Module Caisse acheté ou non | *Est-ce autorisé ?* |
| **Compteur** (nouveau) | 500 extractions / mois | *Est-ce autorisé, et combien reste-t-il ?* |

---

## 2. Le point le plus important : ça ne va pas dans l'ERP

Un solde de crédits prépayés est un **grand livre** — crédits (rechargements),
débits (consommations), solde qui en découle, corrections par contre-passation.
C'est **exactement le pattern Règlements**, validé sur 2064 pièces et 1675
règlements réels.

**Mais ce n'est pas le même grand livre** :

| Grand livre | Qui doit à qui | Où il vit |
|---|---|---|
| **Règlements** (`reglement_*`) | L'agence ↔ ses clients et fournisseurs | Dans l'ERP, base client |
| **Crédits IA** | **OctaSoft ↔ l'agence** | **Chez OctaSoft**, pas dans la base client |

Le compteur qui sert à facturer ne peut pas vivre sur le serveur de celui qui
paie. Modèle 1 serveur = 1 client (ADR-004).

**Schéma proposé** — celui déjà éprouvé avec OctaSoft Static Data :

- la **source de vérité** vit chez OctaSoft (produit de licences, Project séparé)
- le déploiement client en garde un **miroir en lecture seule**, pour afficher le
  compteur en temps réel sans dépendre de la disponibilité d'OctaSoft
- deux relevés à réconcilier — logique de rapprochement déjà maîtrisée (Cash
  Management)

**Point d'attention** : ne surtout pas rattacher ça à `reglement_*`. Deux
domaines distincts qui partagent un motif structurel, rien de plus. Le risque de
confusion est réel et les conséquences seraient comptables.

---

## 3. Ce qui reste à trancher côté conception

Sans préjuger des réponses :

- **Où vit le module ?** Produit de licences (probable) — mais alors il faut
  décider ce qui est mirroité côté client et sous quelle forme.
- **Le miroir client** est-il un simple instantané de solde, ou un extrait du
  journal ? Le premier suffit sans doute à l'affichage.
- **Granularité de la consommation** : par opération, ou par famille
  d'opération ? Le front n'a besoin que du solde et du restant.
- **Périodes** : quota mensuel glissant, calendaire, ou crédits sans expiration ?
  Choix commercial avant d'être technique.
- **Réservation de crédits.** Décision UX actée : on ne coupe **jamais** au
  milieu d'une opération. Une extraction de 40 pages qui épuiserait le solde à la
  page 30 ne doit pas planter. Implique une notion de crédits *réservés* puis
  *consommés ou libérés* — à confirmer.
- **Append-only** : à reconduire, par cohérence avec Règlements et Cash. Une
  consommation constatée ne se modifie jamais ; une correction est une écriture
  nouvelle.

---

## 4. Ce dont le front a besoin — et c'est peu

Le déploiement client ne fait que **lire** et **afficher**. Aucune écriture,
aucun calcul de facturation.

Impact réel, limité à un point : la **demande backend n°2** (`/me`), encore en
définition, doit prévoir des entitlements capables de porter un état, un quota,
un consommé et une période — et non un simple booléen.

```
état     : actif | épuisé
quota    : nombre | illimité
consommé : nombre
période  : début, fin
```

**Ça ne coûte rien tant qu'aucun quota n'existe.** Ça coûte cher à rajouter
après : il faudrait refaire `/me` et l'interface.

C'est la seule chose réellement urgente dans toute cette note — et elle concerne
le chat Backend, pas le chat BDD.

---

## 5. Contexte complet

`reference/front-cadrage/01-front-architecture-decisions.md`, ADR-F21 (stratégie
IA) et ADR-F08 v2 (trois verrous : non acheté / crédits épuisés / pas la
permission).
