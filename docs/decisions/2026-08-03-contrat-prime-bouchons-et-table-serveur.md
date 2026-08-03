# Décision — V1 : le contrat prime sur les bouchons ; table serveur avant Data Grid

**Date** : 2026-08-03
**Décideur** : Master DEV Front (V1), validé par Arbi (cadrage)
**Statut** : ✅ ACCEPTÉE

---

## 1. Le contrat d'API prime sur ADR-F09 (bouchons)

ADR-F09 prévoyait un client « à deux implémentations » (réelle + **bouchonnée**),
pour qu'un endpoint manquant n'arrête pas un écran. Le **contrat d'API** (§4) est
plus strict : *« ne le cherche pas, et surtout ne le simule pas »*.

**Décision** : on ne **bouchonne jamais** un endpoint absent pour faire tourner un
écran. Ce qui manque (référentiels, création de sous-ressources…) se **signale**
et se **scope autour**, jamais ne se simule. Les `fakes`/mocks restent légitimes
en **tests unitaires** (on mocke `authedRequest`/`apiRequest`), pas en runtime.

Conséquence V1 : Party **en lecture** seulement — création/édition attend les
endpoints référentiels (§5, à venir). Le drapeau `VITE_USE_API_STUBS` est retiré.

## 2. Liste paginée serveur → table simple, pas (encore) le Data Grid ReUI

Le cadrage V1 disait « liste via ReUI Data Grid » (ADR-F12). À l'implémentation,
**dérive assumée** : la liste des tiers est une **table sémantique tokenisée**, pas
le Data Grid ReUI complet.

**Pourquoi** : la pagination est **serveur** (20/page) → le front ne tient **jamais**
une grande liste en mémoire. Or la valeur première du Data Grid ReUI est la
**virtualisation** (grandes listes client) + des fonctions de colonnes avancées
(épinglage, DnD, redimensionnement). Aucune n'est nécessaire pour une liste
**paginée serveur** de 4 colonnes. Une table propre est ici l'outil **juste**, pas
un raccourci.

**Quand tirer le Data Grid ReUI** : dès qu'un écran a besoin de ses fonctions
avancées (colonnes configurables, sélection multiple, tri multi-colonnes riche).
À ce moment, on le prélève (copy-and-own, ADR-F01). Inscrit au backlog.

---

## Conséquences

**Pour** : on ne livre que du réel (aucune donnée simulée), et on n'alourdit pas
V1 d'un composant lourd non nécessaire.

**Contre** : ADR-F09 (bouchons) et ADR-F12 (Data Grid) sont **amendés** — à relire
avec cette décision. Le Data Grid reste la cible pour les écrans qui l'exigent.

## Références

- Contrat d'API §4, §5. ADR-F09, ADR-F12, ADR-F01.
- Cadrage : `docs/cadrage/2026-08-03-v1-auth-party-lecture.md`.
