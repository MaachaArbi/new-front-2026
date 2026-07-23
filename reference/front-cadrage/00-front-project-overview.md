# Front — Vue d'ensemble du projet (OctaSoft / OS-TRAVEL)

**Statut** : document de cadrage. **Aucun code front n'existe encore.**
**Rôle** : contexte pour Cursor / Claude Code / toute session de génération de code front. À relire avant d'ouvrir une session sur un module.
**Version** : 1.0 — 23/07/2026
**Symétrique de** : `reference/backend-cadrage/00-backend-project-overview.md`

---

## 1. Nommage — à respecter strictement

| Terme | Signification |
|---|---|
| **OctaSoft** | L'éditeur. La société. |
| **OS-TRAVEL** | Le produit (nom du legacy, **renommage prévu, non tranché**) |
| **MyGo** | **Un client**, pas un produit. Ne doit apparaître nulle part dans le code. |
| **OctaSoft Static Data** | Produit séparé, référentiel mutualisé multi-clients, hors périmètre de ce chantier |

**Règle absolue** : aucun nom de produit, de société ou de client en dur dans le code front. Tout passe par la configuration ou l'internationalisation.

> **Dette connue héritée** : `config_application_setting.mfa_issuer_name` a pour valeur par défaut `'MyGo'` dans un schéma figé, et les documents `reference/backend-cadrage/*.md` sont titrés « OS-TRAVEL / MyGo ». Signalé au chat BDD, non corrigé côté front (lecture seule).

---

## 2. Contexte

Refonte complète d'un ERP tourisme legacy (Symfony 2.8, 10+ ans) destiné aux agences de voyages. Développement **solo, assisté par IA** — pas d'équipe à coordonner.

La question de conception n'est jamais « est-ce compréhensible par un développeur junior », mais **« est-ce que ça reste cohérent session après session, y compris quand c'est un agent IA qui écrit le code »**.

### État des chantiers amont

| Chantier | Piloté dans | État |
|---|---|---|
| Conception BDD | `00-Main DB architect` | **14 modules figés, 293 tables.** Reste : Contracting hôtelier avancé |
| Backend Symfony | `00-Main DEV Backend` | Party, Core, Booking, Règlements avec HTTP. Cash partiel. Le reste : aucun endpoint |
| **Front (ce chantier)** | `00-Main DEV Front` | **Démarrage** |

Le front **ne contredit jamais** la conception BDD ni le backend. En cas de doute ou d'absence d'information : **on s'arrête et on demande**. Jamais de règle métier plausible inventée.

---

## 3. Périmètre

### Dans le périmètre

**Le back-office React/Vite, et rien d'autre.**

### Hors périmètre — explicitement

| Exclu | Raison |
|---|---|
| **Site B2C Next.js** (ADR-012) | Chantier distinct, non ouvert. Aucun partage de code à anticiper. |
| **Mobile React Native** | Phase ultérieure, non planifiée |
| **CMS / SEO** | Migre vers une application CMS séparée (décision BDD) |
| **Application de gestion des licences** | Produit séparé, comme OctaSoft Static Data. Mérite son propre Project. |
| **Stock Management** | Retiré du périmètre projet (décision 16/07) |

**Conséquence directe du périmètre unique** : aucun package partagé, aucun monorepo multi-applications, aucune abstraction préventive « au cas où le B2C en aurait besoin ». Un seul consommateur.

---

## 4. Marchés visés — contraintes structurantes

**Afrique du Nord, Afrique centrale (éventuel), Moyen-Orient, Europe.** 100+ agences au démarrage.

Trois conséquences non négociables :

### 4.1 L'arabe RTL est un marché principal

Deux des trois zones sont arabophones. Le RTL n'est pas une option de phase 2 : il est posé **au jour 0**.

- Propriétés logiques CSS uniquement (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`, `text-start`)
- `dir` piloté par la locale
- Miroir des icônes directionnelles
- Garantie par une règle ESLint + contrôle CI, **pas par la discipline**

À trancher plus tard, pas maintenant : chiffres arabo-indiens (٠١٢٣) selon la locale, calendrier hégirien en affichage secondaire.

### 4.2 Les devises à 3 décimales sont la norme, pas l'exception

Dinar tunisien, libyen, jordanien, koweïtien, bahreïni, rial omanais — un cluster dense sur les zones cibles, à côté de l'euro et du dirham à 2 décimales.

**Aucun `toFixed(2)` nulle part, jamais.** Tout montant passe par le noyau `Money`, qui lit `ref_currency.minor_unit`.

### 4.3 L'Europe ajoute une exigence d'accessibilité

Accessibilité numérique et RGPD. L'exposition juridique exacte d'un back-office B2B est à confirmer par un juriste — ce n'est pas un sujet technique. Mais viser **WCAG 2.1 AA testé en CI** coûte peu et évite un rattrapage.

---

## 5. Variabilité par client

Le déploiement est **1 serveur = 1 client**, mais l'application et le déploiement sont **identiques** pour tous.

### 5.1 Apparence — théming contraint

Le client peut choisir : **logo**, **thème de couleurs** (catalogue fermé, 3 à 5 thèmes livrés dont un sombre), et le paramétrage du layout unique.

Ce n'est **pas** du white-label libre : le client choisit dans un catalogue maîtrisé, il n'injecte jamais de CSS. Les contrastes sont donc validés une fois par thème.

> **Trou identifié** : `config_application_setting` (singleton, anti-EAV) ne contient aujourd'hui que `mfa_issuer_name`. Aucune structure pour logo / thème / layout. → demande à formuler au chat BDD.

### 5.2 Fonctionnel — deux couches distinctes

| | Décidé par | Granularité | Comportement écran |
|---|---|---|---|
| **Entitlements** (licences) | Le contrat commercial du client | **Grosse** — module, fonctionnalité vendable, plan | **Visible et verrouillé**, avec accroche |
| **Permissions** (RBAC, ADR-017) | L'administrateur de l'agence, par utilisateur | **Fine** — bouton, colonne, champ | **Masqué**, silencieusement |

Règle de démarcation : **si ça ne peut pas être vendu séparément, ce n'est pas une licence.**

Les deux se composent : les entitlements décident **ce qui est verrouillé**, les permissions décident **qui voit le verrou**. « Voir l'offre commerciale » est elle-même une permission — un opérateur de comptoir n'a aucun pouvoir d'achat.

**Emplacement de l'accroche commerciale** — trois seulement :
1. Le « + » en bas du rail de modules → catalogue complet
2. Le verrou contextuel, au moment où l'utilisateur touche naturellement la limite
3. Rien ailleurs. L'interface quotidienne reste propre.

### 5.3 Modèle de licence — décisions actées

- L'application de gestion des licences est un **produit séparé** (type marketplace : thèmes → fonctionnalités → plans → commande → paiement → licence).
- **Jamais de vérification synchrone.** Un fichier de licence **signé cryptographiquement** (clé privée chez OctaSoft, clé publique dans le déploiement) est vérifié **localement, hors ligne**. Renouvellement périodique avec large fenêtre de grâce. **Jamais dans le chemin critique d'une requête** — sinon la disponibilité d'OctaSoft devient une dépendance dure pour 100+ agences.
- **Après résiliation** : dégradation en **lecture seule**, jamais de disparition des données. Politique à écrire avant de vendre le premier module optionnel.
- **Le backend vérifie les entitlements comme il vérifie les permissions.** Un module non acheté dont l'API reste ouverte est contournable depuis une console navigateur.

---

## 6. Volumétrie (héritée, inchangée)

- 100+ clients (agences + hôtels), ~20 utilisateurs par agence
- Gros clients : jusqu'à 12 M requêtes API/jour (~139 req/s, pics 500-1000 req/s)
- Bases pouvant atteindre ~1 M réservations

**Impact front** : virtualisation obligatoire sur toute grande liste (déjà exigé par ADR-017), pagination serveur systématique, code splitting par module, budget de bundle mesuré en CI.

---

## 7. Stack

| Couche | Choix | Origine |
|---|---|---|
| Framework | **React 19.2** | Metronic 9.4 (ADR-011 disait React 18 — obsolète) |
| Build | **Vite 7** | ADR-011 |
| Langage | **TypeScript 5.9**, `strict` + `noUncheckedIndexedAccess` | |
| CSS | **Tailwind v4** (CSS-first, pas de `tailwind.config.js`) | Metronic |
| Primitives | **Radix UI** | via shadcn/ReUI |
| Composants | **ReUI** (MIT, registre public, `npx shadcn add @reui/…`) | |
| Layout + direction visuelle | **Metronic 9.4** (licence étendue illimitée) — `layout-21` uniquement | |
| État serveur | **TanStack Query v5** | ADR-013 |
| État client | **Zustand** | |
| Tableaux | **ReUI Data Grid** (TanStack Table + virtualisation) | ADR-014 révisé |
| Formulaires | **React Hook Form + Zod** | |
| Routage | **React Router v7** | |
| i18n | **FormatJS / react-intl** (ICU) | |
| Icônes | **lucide-react** — Keenicons abandonné | |
| Tests | **Vitest + Testing Library + Playwright** | |

Détail et justification de chaque choix : `01-front-architecture-decisions.md`.

---

## 8. Circuit de travail

### 8.1 Dépôt

**Dépôt Git séparé**, indépendant du dépôt backend Symfony.

Deux trous que ce choix crée, et leur parade :

| Trou | Parade |
|---|---|
| Le dépôt front n'a aucune mémoire du métier | Un `reference/` propre au front, **en lecture seule** (§8.3) |
| La dérive de contrat API n'est plus détectée automatiquement | `openapi.json` versionné dans le front + job CI qui compare à la version publiée par le backend, et **échoue avec le diff** en cas d'écart |

**Symétrie à retenir** : `openapi.json` est au front ce que `schema-*.sql` est au backend — la seule source de vérité sur la structure. Jamais déduite, jamais supposée.

> Ne jamais committer le package Metronic dans le dépôt. La licence couvre l'usage, pas la redistribution.

### 8.2 Boucle de développement

```
Discussion (chat pilote 00-Main DEV Front)
   ↓
Prompt de vague  →  docs/prompts/AAAA-MM-JJ-<sujet>.md
   ↓
Cursor / Claude Code exécute sur le poste
   ↓
Push Git
   ↓
Vérification par le chat pilote
   ↓  (si écart) retour pour correction, nouveau push
   ↓
Journal de vague + clôture chiffrée  →  docs/journal/
   ↓
Mise à jour STATUS.md + backlog + reference/  ← étape de clôture explicite
```

### 8.3 Structure documentaire

```
docs/STATUS.md                          état vivant, à jour en permanence
docs/journal/AAAA-MM-JJ-<sujet>.md      livraison, puis clôture
docs/decisions/AAAA-MM-JJ-<sujet>.md    décisions ponctuelles
docs/backlog/todo.md · in-progress.md
docs/prompts/AAAA-MM-JJ-<sujet>.md      ← nouveau (absent côté backend)
docs/demandes-backend/<sujet>.md        ← nouveau, une par sujet, avec statut
reference/                              ← LECTURE SEULE, jamais modifié par un agent
  ├── front-cadrage/       ces 3 documents
  ├── conceptual-models/   le « pourquoi » métier (copie)
  ├── adr/                 ADR BDD + backend (copie)
  ├── sujets-reportes.md   ce qui est hors périmètre
  └── api/openapi.json     le contrat
```

**Ce qu'on ne copie pas dans `reference/`** : les schémas SQL. Le front ne voit jamais une colonne.

### 8.4 Deux ajouts par rapport au backend

**`docs/prompts/`** — le prompt exact envoyé, tel quel. Quand un résultat part de travers, la première question est toujours « qu'est-ce qui a été demandé, précisément ». Côté backend, l'information est perdue.

**Section « Dérives & corrections » obligatoire dans chaque journal** — ce que l'agent a inventé, mal compris, ou fait hors périmètre. L'intérêt n'est pas l'archivage mais la **détection de motif** : si la même dérive revient trois fois, ce n'est pas l'agent qui est fautif, c'est `reference/` qui a un trou. La dérive devient un signal de correction documentaire.

### 8.5 Bloc de clôture chiffré

Chaque clôture reporte les mêmes indicateurs, comme les 4 outils du backend :

```
tsc          exit 0
eslint       0 erreur  (dont 0 classe directionnelle physique)
vitest       N tests, N assertions
playwright   N parcours
bundle       N ko (initial) / N ko (total)
```

Dérive visible immédiatement, sans avoir à lire le code.

### 8.6 Garde-fou documentaire

Le `reference/` du dépôt backend annonce des fichiers absents et déclare « aucun module n'a de code » alors que trois modules ont du HTTP.

**Un `reference/` qui ment est pire que pas de `reference/`.** Sa mise à jour est une **étape de clôture explicite**, jamais une intention.

---

## 9. Séquencement

L'ordre a été arbitré : **le socle d'abord, les écrans ensuite.**

Justification : le socle (design system, tokens, layout, navigation, routage, RTL, patterns de tableau et de formulaire, noyau Money) **ne dépend d'aucun endpoint**. Le seul point de contact est l'authentification, qui existe déjà.

Un **composant** n'impose rien au backend. C'est un **écran** qui en a besoin. Toute la phase socle se fait donc sans solliciter le backend.

### Chaîne de demande

```
Écran front → manque identifié → chat Backend
                                    ↓ (si structurel)
                                 chat BDD
```

Cette chaîne se résout souvent au premier niveau. Exemple vérifié : une page 2FA nécessiterait des endpoints MFA — or `core_mfa_totp` et `core_mfa_recovery_code` **existent déjà en base** depuis le 20/07. Le backend n'aurait pas à remonter au chat BDD.

### Condition impérative : la chaîne ne doit jamais bloquer

Le front ne parle jamais à l'API directement, mais à un **client typé à deux implémentations** — la vraie et une bouchonnée. Un endpoint manquant n'arrête pas l'écran : il alimente la file de demandes pendant que le développement continue.

C'est le motif déjà validé deux fois côté backend : `FakePermissionChecker` (ADR-017) et `SolvencyCheckerInterface` (Booking).

**Règle CI** : aucune bouchonne ne part en production. Un test échoue s'il en reste une active hors mode développement.

---

## 10. Principes directeurs

1. **Le backend est la seule autorité.** Le front ne fait que de l'UX. Masquer un bouton n'a jamais sécurisé une action.
2. **Aucune règle métier inventée.** Si elle n'est pas dans `reference/`, on s'arrête et on demande.
3. **Performance mesurée, pas affirmée.** Budgets chiffrés en CI.
4. **RTL et i18n par construction**, garantis par outillage, jamais par discipline.
5. **Cohérence inter-sessions** — une règle unique et non ambiguë vaut mieux qu'une règle optimale mais interprétable.
6. **Metronic et ReUI sont des sources, jamais des dépendances.** Rien n'entre dans le dépôt sans être relu, typé, et adopté.
7. **Ne rien construire avant qu'un besoin réel soit confirmé.**

---

**Dépend de** : `01-architecture_decisions.md` (BDD, 18 ADR) · `reference/backend-cadrage/*` · `00-INDEX.md` (BDD) · `sujets-reportes.md`
