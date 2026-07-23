# Architecture Decisions — Front (OctaSoft / OS-TRAVEL)

**Critère de décision** : Performance > Simplicité (solo + IA) > Qualité.
**Version** : 1.0 — 23/07/2026
**Statut** : fondations à valider avant la première session de code. **Aucun code front n'existe.**

Chaque décision porte un statut, comme côté backend :

- ✅ **CONFIRMÉ** — l'argument tient, rien à changer
- 🔁 **REFORMULÉ** — la décision tient, la justification a changé
- 🔴 **REMPLACÉ** — annulée par une décision ou un fait plus récent
- 🟡 **EN ATTENTE** — dépend d'un élément qui n'existe pas encore

---

# PARTIE 1 — ADR hérités, réexaminés

Les ADR-011 à 015 dataient de la réflexion « équipe de 5 », antérieure à React 19, Tailwind v4, ReUI, et aux 293 tables figées. Le chat backend les avait explicitement laissées de côté (*« non réexaminés dans cette session — hors périmètre backend »*). Elles le sont ici.

## ADR-011 : React SPA (Vite) pour le back-office — 🔁 REFORMULÉ

**Décision maintenue**, version corrigée : **React 19.2 + TypeScript + Vite 7**. Le document d'origine disait React 18.

Justification actualisée : utilisateurs internes, sessions longues, aucun besoin de SEO, interactivité maximale. Le périmètre étant limité au back-office (le B2C est hors chantier), aucun argument SSR ne s'applique.

## ADR-012 : Next.js pour le site B2C — 🔴 HORS PÉRIMÈTRE

Non réexaminé, non contredit. Chantier distinct, non ouvert. **Aucun partage de code à anticiper.**

## ADR-013 : TanStack Query obligatoire — ✅ CONFIRMÉ

Aucun rapport avec la taille de l'équipe. TanStack Query v5 est déjà dans le paquet Metronic. Voir ADR-F10 pour la ligne de partage exacte avec Zustand.

## ADR-014 : TanStack Table par défaut, AG-Grid en lazy — 🔴 REMPLACÉ

**AG-Grid est retiré du projet.** Le Data Grid ReUI est bâti sur TanStack Table + TanStack Virtual et fournit nativement la virtualisation, l'épinglage, le redimensionnement, le DnD, les filtres et la visibilité de colonnes.

L'argument d'origine (« AG-Grid lazy si > 1000 lignes ») disparaît : la virtualisation est native, il n'y a plus de seuil.

## ADR-015 : Feature flags — 🟡 EN ATTENTE

Outil disponible, usage à définir au cas par cas. À ne pas confondre avec les **entitlements** (ADR-F08), qui sont un mécanisme commercial, pas technique.

## ADR-017 : Permissions dynamiques opt-in inversé — ✅ CONFIRMÉ (principe) / 🟡 EN ATTENTE (implémentation)

Le principe est conforme au schéma figé (`core_permission` : *« une ligne ici = action fermée par défaut »*). Le front l'implémente selon ADR-F08.

L'implémentation d'origine — application `user_management` séparée appelée en HTTP — est **abandonnée** : le module est interne au monolithe. L'endpoint n'existe pas encore.

## ADR-018 : BIGINT identity + `public_id` UUID — ✅ CONFIRMÉ, contrainte front

Le front ne manipule **jamais** la clé technique. Tous les identifiants en URL, en cache TanStack Query et en payload sont des `publicId` UUID.

---

# PARTIE 2 — ADR front nouvelles

## ADR-F01 : Metronic et ReUI sont des sources, jamais des dépendances — ✅ ACCEPTÉ

**Contexte.** Licence Metronic 9.4 étendue (clients illimités). Audit du paquet : Tailwind v4, Radix, shadcn, React 19, TypeScript `strict`, build bloquant sur `tsc`.

**Découverte structurante** : la couche de composants de Metronic **est ReUI**, édité par KeenThemes, **sous licence MIT, en dépôt public**. Leur propre README le confirme. Le modèle affiché est *« Copy-and-Own — No npm package, no lock-in »*.

**Décision.**

| Couche | Source | Mode |
|---|---|---|
| Composants | **ReUI (MIT)** | `npx shadcn add @reui/…`, à la demande |
| Layout + direction visuelle | **Metronic** (licence) | `layout-21` uniquement, copié et nettoyé |
| Icônes | **lucide** | Keenicons abandonné (ADR-F17) |

**Gouvernance, non négociable :**

1. **Aucun composant importé par défaut.** Il entre quand un écran réel le demande, il est relu, typé, il devient nôtre.
2. **Aucune page de démonstration** dans le dépôt.
3. **Un seul layout.**
4. **Purge des doublons avant le premier écran** (ADR-F18).
5. Le package Metronic reste hors du dépôt (licence : usage, pas redistribution).

**Composants ReUI absents du paquet, à tirer du registre quand nécessaire** : Filters, Autocomplete, Number Field, Phone Input, Timeline, Date Selector, Rating. Ce sont ceux qui portent le plus de valeur métier ici.

**Alternative rejetée** — tout écrire de zéro : détruit de la valeur réelle (direction visuelle cohérente, tokens propres, layout RTL correct, accessibilité Radix) sans supprimer de verrou, puisqu'il n'y en a pas.

## ADR-F02 : Un layout unique — `layout-21` paramétré — ✅ ACCEPTÉ

**Contexte.** Metronic livre 39 layouts hétérogènes. Les proposer au choix du client est ingérable : chaque variante se croise avec LTR/RTL, clair/sombre et chaque thème.

**Décision.** Un seul layout : **`layout-21`** (rail d'icônes + barre latérale + fil d'Ariane + onglets).

**Pourquoi celui-ci** — il correspond au modèle de données :

| Élément du layout | Correspondance projet |
|---|---|
| Rail d'icônes | Un module = une icône. Granularité exacte des **entitlements** |
| « + » en bas du rail | Point d'entrée **unique** du catalogue commercial (ADR-F08) |
| Sélecteur en tête de barre latérale | **Bureau** courant (`party_account_office`) |
| Onglets dans le contenu | Fiche d'entité : un `party_account` a identité, rôles, fonctions, adresses, groupes, solde |
| ⌘K | Palette de commandes (`cmdk`, déjà présent) |

**Audit** : 19 fichiers bien découpés, **aucun CSS dédié** (100 % Tailwind en TSX — mieux que `demo1` qui traîne un fichier CSS), et **une seule fuite RTL** dans tout le layout (`left-1.75` sur l'indicateur de module actif → `start-1.75`).

**Axes de paramétrage exposés** : position de navigation, repli de la barre latérale, densité (compact / confortable). **Pas de composition d'écran configurable par le client** — hors périmètre.

**Réserves actées.**
- Rail + barre latérale ≈ 290 px avant le contenu. **Toute grille dense doit être conçue et testée barre repliée**, pas seulement dépliée.
- Le principe UX du 18/07 (« centraliser et minimiser la navigation ») n'est respecté que si le rail reste à 6-8 domaines stables. À surveiller au plan de navigation.

**Suppressions** : `layout.css` (voir ADR-F18), les 38 autres layouts et leurs pages.

## ADR-F03 : Théming client par tokens CSS, catalogue fermé — ✅ ACCEPTÉ

**Décision.** Le client choisit logo + thème de couleurs dans un **catalogue fermé** (3 à 5 thèmes livrés, dont un sombre). Il n'injecte jamais de CSS.

L'infrastructure existe déjà dans le paquet : variables sémantiques (`--primary`, `--background`, `--foreground`, `--border`, `--radius`…) exposées via `@theme inline`. **Un thème = surcharger une douzaine de variables.**

**Règles.**
- Aucune couleur, espacement ou rayon en dur dans un composant. Jamais.
- Contraste vérifié une fois **par thème** — c'est ce qui rend l'accessibilité tenable.
- Le rail multicolore de la démo est à trancher : une couleur par module, ou une teinte unique dérivée du thème.

🟡 **En attente** : `config_application_setting` n'a aucune colonne pour logo/thème/layout. → demande BDD.

## ADR-F04 : RTL au jour 0, garanti par outillage — ✅ ACCEPTÉ

**Contexte.** Deux des trois zones cibles sont arabophones. Un RTL rétroactif sur des centaines de composants est un chantier de rattrapage brutal.

**Audit du paquet Metronic** (729 fichiers TSX, 9 CSS) :

| | Occurrences |
|---|---|
| Classes **logiques** | **530** |
| Classes **physiques** | **103** (dont une part légitime : centrage symétrique, `inset-x-0`) |
| Variantes `rtl:` explicites | 21 |

**~84 % de discipline logique** — bonne, mais trouée. Les fuites se concentrent dans `components/ui/` (17 fichiers) et `layout-37` (7).

**Décision.** Propriétés logiques **exclusivement**. Garanti par une **règle ESLint** interdisant les classes directionnelles physiques, appliquée en CI. La convention seule ne suffit pas — le document de référence hérité `component_patterns.md` contient lui-même un `text-left`.

**Interdits** : `pl-`/`pr-`, `ml-`/`mr-`, `left-`/`right-`, `border-l`/`border-r`, `rounded-l`/`rounded-r`, `text-left`/`text-right`, `space-x-`.
**Exceptions autorisées** (symétriques, à commenter) : `left-[50%]` + `translate-x-[-50%]` pour centrer, `inset-x-0`.

Chaque écran est testé dans les deux directions.

🟡 **Reportés, à trancher plus tard** : chiffres arabo-indiens selon locale, calendrier hégirien en affichage secondaire.

## ADR-F05 : TypeScript strict, plus `noUncheckedIndexedAccess` — ✅ ACCEPTÉ

Le `tsconfig.app.json` de Metronic est déjà sérieux : `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, alias `@/*`, build bloquant (`tsc && vite build`).

**Ajout obligatoire : `noUncheckedIndexedAccess`.**

Sans elle, `liste[0]` est typé `T` et non `T | undefined`. Sur un ERP qui consomme en permanence des listes paginées venues de l'API, c'est la première source de plantage à l'exécution, et le typage donne une fausse assurance.

`target` relevé de ES2020 à ES2022. **`any` interdit**, sans exception silencieuse.

## ADR-F06 : Internationalisation — FormatJS / react-intl — ✅ ACCEPTÉ

**Contexte.** Trois langues : anglais (pivot), français, arabe. Le paquet Metronic livré **ne contient aucun i18n** — rien à auditer, tout à choisir.

**Décision : FormatJS / `react-intl`**, pour une raison qui dépasse la traduction :

- **ICU MessageFormat** gère nativement les **six formes de pluriel arabe** (contre deux en français). Un système à `count === 1 ? a : b` est faux en arabe.
- Il s'appuie sur les **API `Intl` natives** — dont `Intl.NumberFormat`, qui applique automatiquement les 3 décimales du dinar tunisien à partir du code devise. Le noyau `Money` s'appuie dessus au lieu de réimplémenter les règles d'arrondi.

**Règles.** Aucune chaîne en dur, jamais. Les catalogues sont des fichiers versionnés. Le `Accept-Language` est envoyé sur chaque requête — **le backend traduit ses propres messages d'erreur** (en/fr/ar, fallback `en`).

## ADR-F07 : Noyau Money — ✅ ACCEPTÉ

**Contexte.** La BDD stocke les montants en **BIGINT unités mineures**, avec `ref_currency.minor_unit` variable (2 ou 3 selon la devise). Exception : `pricing_*` est en `NUMERIC(12,4)` — taux et marges, pas des montants transactionnels.

**Décision.** Un noyau `Money` unique, reflet du Value Object backend. Toute lecture, tout affichage, toute saisie de montant y passe.

**Interdits absolus** : `toFixed(2)`, arithmétique en flottant sur de l'argent, division d'un montant sans stratégie d'arrondi explicite.

**Saisie** : composant dédié bâti sur le Number Field de ReUI, conscient de `minor_unit`.

## ADR-F08 : Deux couches de gating — permissions et entitlements — ✅ ACCEPTÉ

**Contexte.** Deux mécanismes distincts, souvent confondus :

| | Entitlements (licences) | Permissions (ADR-017) |
|---|---|---|
| Dépend de | Contrat commercial du **client** | L'**utilisateur** connecté |
| Granularité | Module, fonctionnalité vendable | Bouton, colonne, champ |
| Écran | **Visible et verrouillé** + accroche | **Masqué**, silencieusement |

Deux portes en série : *ce client a-t-il acheté ?* puis *cet utilisateur a-t-il le droit ?* Deux familles de composants distinctes, pas une.

**Composition** : « voir l'offre commerciale » est elle-même une permission.

### Correction d'un bug du document hérité

`16-permissions-system.md` propose :

```tsx
if (!permissions?.includes(code)) return true;   // tableau
return permissions[code] === true;               // objet
```

`permissions` ne peut pas être les deux. Si c'est un tableau, `permissions[code]` avec une clé texte vaut toujours `undefined` → **toute permission existante est systématiquement refusée**. Le code ne fonctionne pas.

La cause est conceptuelle : **l'opt-in inversé exige deux ensembles**, le document n'en manipule qu'un.

```ts
// catalogue : permissions DÉFINIES (leur existence ferme l'action)
// accordées : permissions octroyées à CET utilisateur
can(code) = !catalogue.has(code) || accordées.has(code)
```

→ `/me` doit renvoyer **les deux listes**. Demande backend n°2.

### Conventions

- `data-acl="module.entité.action"` sur tout élément restreignable — jamais un id HTML, jamais une classe CSS
- Un ancrage distinct pour les entitlements
- Composants `<Permission>` (masque) et `<Entitlement>` (verrouille + accroche)
- **Mode « Capture »** (idée héritée, conservée) : survol des éléments ancrés, création de la permission ou de l'entitlement sans code ni redéploiement. **Chargé paresseusement** — coût nul pour les utilisateurs normaux. `ROLE_SUPER_ADMIN` n'existe pas dans le modèle figé : le déclencheur est à redéfinir sur `core_role`.
- **Le RBAC ne fait pas de filtrage de données** — porté par `party_account_function`.
- **Le backend vérifie toujours.** Masquer un bouton n'a jamais sécurisé une action.

## ADR-F09 : Client API typé depuis OpenAPI, avec bouchons — ✅ ACCEPTÉ

**Décision.** Le front ne parle jamais à `fetch` directement, mais à un client typé généré depuis `openapi.json`, à **deux implémentations** : réelle et bouchonnée.

Un endpoint manquant n'arrête pas un écran : il alimente `docs/demandes-backend/` pendant que le développement continue. C'est le motif déjà validé côté backend (`FakePermissionChecker`, `SolvencyCheckerInterface`).

**Règle CI** : aucune bouchonne active hors mode développement. Un test échoue sinon.

**Dérive de contrat** : `openapi.json` versionné dans le dépôt front, comparé en CI à la version publiée par le backend, échec avec diff en cas d'écart (le dépôt étant séparé, c'est la seule parade).

🟡 **Bloquant** : `openapi.json` n'existe pas. Demande backend n°1.

## ADR-F10 : Ligne de partage état serveur / état client — ✅ ACCEPTÉ

Le document hérité recommandait Zustand contre le props drilling, avec `user` comme exemple. **C'est le cas où il ne faut pas le faire** : `user` vient de `/me`, donc du serveur. Le mettre dans Zustand crée deux caches, sans revalidation ni invalidation — et contredit ADR-013.

| Donnée | Où |
|---|---|
| Identité, permissions, entitlements, référentiels, données métier | **TanStack Query** |
| Repli de la barre, module actif, bureau sélectionné, thème, densité | **Zustand** |

Test : *est-ce que ça existerait si le serveur n'existait pas ?* Oui → Zustand. Non → TanStack Query.

## ADR-F11 : Formulaires — React Hook Form + Zod — ✅ ACCEPTÉ

Déjà présent dans le paquet et présupposé par les composants ReUI (Form, Stepper). `formik` est supprimé.

Le schéma Zod est déclaré en tête de fichier, le type inféré (`z.infer`). Les messages de validation passent par l'i18n. Les **violations backend** (`error.violations[]`) sont remontées **sur les champs concernés**, pas dans un toast générique.

## ADR-F12 : Tableaux — ReUI Data Grid, pagination serveur — ✅ ACCEPTÉ

Le patron hérité (`CustomerTable`, 100 lignes de TanStack Table à la main) est remplacé par le Data Grid ReUI.

**Bug du patron hérité à ne pas reproduire** : il utilise `getPaginationRowModel` et `data.length`, donc de la **pagination client**, alors que l'API pagine côté serveur. Il ne paginerait que la page courante.

**Règles** : pagination **serveur** systématique, câblée sur `meta` (`page`, `limit`, `total`, `totalPages`) ; **virtualisation** sur toute grande liste (ADR-017) ; filtres via le composant Filters de ReUI (état dans l'URL) plutôt qu'un `useEffect` maison — le patron hérité a une dépendance non mémoïsée qui boucle.

## ADR-F13 : Tests — Vitest, Testing Library, Playwright — ✅ ACCEPTÉ

Le paquet Metronic ne contient **aucun outillage de test**.

| Niveau | Outil | Cible |
|---|---|---|
| Composants | Vitest + Testing Library | Composants du socle, noyau Money, résolution des permissions |
| Parcours | Playwright | Parcours métier bout en bout |
| Contrat | Diff `openapi.json` en CI | Dérive front/back |
| RTL | Règle ESLint + rendu dans les deux directions | Régression directionnelle |

Le risque principal en solo + IA n'est pas l'absence de tests : ce sont **des tests qui valident un mauvais comportement généré**. Les assertions des cas limites sur Règlements, Facturation et Caisse sont écrites à la main.

## ADR-F14 : Gestion d'erreur alignée sur le backend réel — ✅ ACCEPTÉ

Formes réelles (vérifiées dans le code, elles diffèrent du document hérité) :

```json
{ "error": { "code": "party_account.not_found", "message": "…", "context": {} } }
{ "error": { "code": "validation_failed", "message": "…",
             "violations": [{ "field": "email", "message": "…" }] } }
```

Codes **pointés en minuscules** (pas `CUSTOMER_NOT_FOUND`). Statuts pilotés par trois listes explicites dans `ExceptionListener` : 404 / 409 / 422, défaut 400.

**`X-Request-Id`** est présent sur **toutes** les réponses et exposé en CORS. Il doit être **affiché dans toute erreur montrée à l'utilisateur** — sinon le support est aveugle. Il est aussi joint aux rapports d'erreur.

`Accept-Language` est envoyé systématiquement : le backend traduit.

## ADR-F15 : Mises à jour optimistes interdites sur l'argent — ✅ ACCEPTÉ

Le patron optimiste hérité (`onMutate` / `cancelQueries` / instantané / rollback / `onSettled`) est techniquement correct et conservé — **avec une restriction métier**.

Afficher un règlement comme enregistré avant confirmation du serveur, sur un grand livre **append-only** où toute correction se fait par contre-passation datée, c'est mentir à l'utilisateur sur un fait comptable.

**Autorisé** : basculements d'interface, préférences, réordonnancements.
**Interdit** : Règlements, Facturation, Caisse, et toute écriture portant un montant.

## ADR-F16 : Aucun nom de produit ou de client en dur — ✅ ACCEPTÉ

OctaSoft est l'éditeur, OS-TRAVEL le produit (renommage à venir), MyGo **un client**. Tout nom affiché passe par la configuration ou l'i18n. Un renommage produit ne doit toucher aucun fichier `.tsx`.

## ADR-F17 : Icônes — lucide uniquement — ✅ ACCEPTÉ

Le paquet contient **trois** systèmes : Keenicons (police propriétaire, 1102 définitions, 4931 lignes de CSS), lucide, RemixIcon.

**Décision : lucide seul.** SVG, déjà utilisé par les composants ReUI, tree-shakable, miroitable en RTL.

Keenicons est abandonné : une **police d'icônes** ne se miroite pas automatiquement, pose des problèmes d'accessibilité et de repli, et lie le projet à la licence.

## ADR-F18 : Purge du paquet avant le premier écran — ✅ ACCEPTÉ

L'installation Metronic exige `npm install --force` : conflits de dépendances pairs de l'éditeur. Chaque doublon est une décision à prendre **une fois**, pas à chaque écran.

| Doublon | Gardé | Supprimé |
|---|---|---|
| État serveur | `@tanstack/react-query` v5 | `react-query` v3 (**déprécié**) |
| Formulaires | `react-hook-form` + `zod` | `formik` |
| Head | `react-helmet-async` | `react-helmet` (non maintenu, incompatible React 19) |
| Graphiques | `recharts` (choix ReUI) | `apexcharts`, `react-apexcharts` |
| Toasts | `sonner` (choix ReUI) | `notistack` |
| Primitives | `radix-ui` | `react-aria-components` |
| Icônes | `lucide-react` | `@remixicon/react`, Keenicons |

**Poids mort retiré** : `vite-plugin-windicss` (WindiCSS est archivé, présent à côté de Tailwind v4), `@supabase/supabase-js`, `@auth0/auth0-spa-js` (auth de démonstration — l'auth réelle est JWT Lexik), `@faker-js/faker`.

**Défauts corrigés à l'import** — relevés à l'audit :

- `layout.css` **supprimé** : il définit au niveau `:root` les mêmes concepts que le layout avec d'autres noms et d'autres valeurs (`--sidebar-collapsed-width: 4rem` contre `--sidebar-width-collapse: 80px`), et calcule ses largeurs en `calc(100vw - …)` — `100vw` inclut la barre de défilement, débordement horizontal garanti.
- **Trois variables utilisées mais jamais définies** : `--color-mono` (aliasée vers `--mono`, inexistant), `--box-shadow-sm` (Tailwind v4 expose `--shadow-sm`), `--gray-100` (expose `--color-gray-100`). Les règles concernées ne s'appliquent pas.
- `config.metronic.css` importe `image-input.css` **deux fois** ; `@custom-variant dark` est déclaré deux fois.
- `components.json` porte `"rsc": true` (React Server Components — copié depuis la version Next, faux en Vite).
- `dialog.tsx` a un `export default DialogContent;` égaré au milieu du fichier.
- `vite.config.ts` code en dur `base: '/metronic/tailwind/react/'`.
- **Deux jeux de tokens concurrents** : `globals.css` pose `--primary: zinc-900`, `config_reui.css` pose `--primary: blue-500`. En choisir un, supprimer l'autre — sinon l'ordre d'import décide de l'identité visuelle.
- **~14 composants décoratifs** supprimés : `gradient-background`, `grid-background`, `hover-background`, `marquee`, `shimmering-text`, `typing-text`, `text-reveal`, `video-text`, `word-rotate`, `svg-text`, `github-button`, `counting-number`, `sliding-number`, `skeleton-with-pattern`.

## ADR-F19 : Modèle de menu étendu — ✅ ACCEPTÉ

`config/types.ts` de Metronic définit :

```ts
interface MenuItem { title?: string; icon?: LucideIcon; path?: string; badge?: string; children?: MenuConfig; }
```

Trois manques structurants : `title` est une **chaîne en dur** (aucune clé de traduction), **aucun champ permission**, **aucun champ entitlement**.

**C'est le premier fichier à retravailler dans le socle.** `MenuItem` doit porter `titleKey`, `permission`, `entitlement`. Toute la navigation en découle : le rail n'affiche que les modules sous licence, le « + » ouvre le catalogue, les permissions masquent le reste.

---

# PARTIE 3 — Filtre des documents hérités (janvier 2026)

Trois documents relus. **Bilan : 6 confirmés, 5 reformulés, 11 remplacés, 4 en attente.**

## `component_patterns.md`

| Élément | Statut |
|---|---|
| Structure de composant standard (schéma, types, hooks, handlers, sorties anticipées, rendu) | ✅ |
| Hooks métier par module encapsulant TanStack Query | ✅ |
| Anti-patron #1 — état serveur dans `useState` | ✅ |
| Mises à jour optimistes | ✅ avec restriction ADR-F15 |
| Anti-patron #3 — props drilling → Zustand | 🔁 ADR-F10 (l'exemple choisi est le contre-exemple) |
| `useDebounce` maison | 🔁 conservé pour le local ; filtres serveur via ReUI Filters |
| « patterns pour équipe junior » | 🔁 solo + IA |
| **Anti-patron #2 — fonctions inline → `data-id`** | 🔴 **REMPLACÉ** |
| `CustomerTable` écrit à la main | 🔴 ADR-F12 |
| `CustomerFilters` maison | 🔴 ADR-F12 |

**Sur l'anti-patron #2**, à enterrer explicitement pour qu'il ne ressorte pas : la prémisse est faible (une fonction recréée ne coûte que si l'enfant est mémoïsé **et** la liste longue ; React 19 mémoïse automatiquement avec son compilateur), et le remède est pire — `e.currentTarget.dataset.id` est de type `string | undefined`, ce qui réintroduit du non-typé **sur le bouton qui supprime**, en contradiction directe avec ADR-F05. Il est en outre incompatible avec Radix/ReUI, qui exposent des callbacks typés (`onSelect`, `onCheckedChange`) et non des événements DOM. Pour une liste réellement lourde, la réponse est la **virtualisation**, pas la micro-optimisation d'un callback.

Deux détails révélateurs : `className="text-left"` — une fuite RTL **dans le document de référence** ; et `created_at` en snake_case ici contre `createdAt` ailleurs. Le code réel tranche : **camelCase**.

## `16-permissions-system.md`

| Élément | Statut |
|---|---|
| Opt-in inversé | ✅ conforme au schéma figé |
| Backend seule autorité, front = confort | ✅ |
| Codes pointés `module.entité.action` | ✅ |
| Virtualisation obligatoire | ✅ |
| `data-acl` et ses interdits | 🔁 + ancrage entitlement |
| Mode « Capture » | 🔁 chargé paresseusement, déclencheur redéfini |
| Cache Redis 5-10 min | 🟡 Redis non tranché côté backend |
| **Tout le SQL** (`permissions`, `roles`, `user_roles`, PK UUID, `granted`, `active`) | 🔴 le schéma figé est `core_permission`, `core_role`, `core_role_permission`, `core_account_role`, `core_permission_grant`, `core_permission_category` — BIGINT + `public_id`, **l'octroi est l'existence de la ligne** |
| `HttpPermissionChecker` vers `user_management` | 🔴 module interne au monolithe |
| Hook `usePermissions` | 🔴 **cassé** — voir ADR-F08 |
| AG-Grid | 🔴 ADR-F14 hérité |

Le schéma figé apporte ce que le document ignore : octroi direct à un compte, plafond de délégation (`is_delegable`), arbre de catégories, traductions, historisation `valid_from`/`valid_to`, rôles propres à une franchise (`owner_account_id`). Et une règle absente : **le RBAC ne filtre pas les données**.

## `06-api-contracts.md`

| Élément | Statut |
|---|---|
| Versioning `/api/v1`, méthodes HTTP | ✅ |
| JWT Bearer | ✅ |
| Enveloppe `{data, meta}` sur les listes | ✅ implémentée |
| Politique de dépréciation (`Deprecation`, `Sunset`, 12 mois) | ✅ à garder pour v2 |
| Pagination défaut 50 | 🔁 défaut réel **20**, max 100 ; `hasNext`/`hasPrevious` inexistants |
| `id` UUID en payload | 🔴 **`publicId`** (ADR-018) |
| Ressources `snake_case` | 🔴 **kebab-case** réel |
| `CUSTOMER_NOT_FOUND` | 🔴 **`party_account.not_found`** |
| `details` + `timestamp` + `path` | 🔴 **`context`** ; corrélation par `X-Request-Id` |
| `details.fields{}` | 🔴 **`violations: [{field, message}]`** |
| JWT portant `roles: [...]` | 🔴 ne porte que `public_id` ; `getRoles()` renvoie `['ROLE_USER']` en dur |
| OpenAPI / NelmioApiDoc | 🟡 prescrit, absent → demande n°1 |
| Refresh token | 🟡 spécifié, absent → demande n°3 |
| `sort=-createdAt`, `filter[champ][gte]` | 🟡 bonne convention cible, non implémentée |
| Rate limiting | 🟡 non implémenté, peu prioritaire pour un back-office |

**Incohérence trouvée dans le code** (pas dans le document) : les **listes** renvoient `{data, meta}`, les **GET unitaires** renvoient l'objet **nu**. → demande n°5.

**Section à supprimer, pas à migrer** : « État d'avancement — 19 endpoints CRM opérationnels » (Accounts, Contacts, Contact Phones, Contact Emails, Addresses). Vestige de l'implémentation abandonnée : le module CRM n'existe plus (c'est Party), ces tables ne sont pas dans le schéma figé. Laissé tel quel, c'est exactement le mensonge documentaire qui envoie un agent construire dans le vide.

## Checklist « composant production-ready » — complétée

Conservé : TypeScript strict sans `any` · interface de props explicite · TanStack Query pour l'état serveur · RHF + Zod · composant < 200 lignes · hooks extraits au-delà de 50 lignes · états de chargement · error boundaries · tests.

**Ajouté, spécifique au projet :**

- [ ] **RTL** — aucune classe directionnelle physique
- [ ] **i18n** — aucune chaîne en dur
- [ ] **Permissions / entitlements** — tout élément restreignable porte son ancrage
- [ ] **Montants** — jamais de formatage manuel, toujours le noyau `Money`
- [ ] **`X-Request-Id`** — remonté dans l'affichage d'erreur

**Ajusté** : avec Radix, ARIA et navigation clavier sont largement acquis. La règle devient *« ne pas casser ce que Radix fournit »* — ne pas remplacer une primitive par un `div`, ne pas écraser les `aria-*` en diffusant des props.

---

**Suite** : ADR-F20 (UX), ADR-F21 (IA) et l'amendement ADR-F08 v2
vivent dans `03-front-adr-ux-ia.md`.

---

**Dépend de** : `00-front-project-overview.md` · `01-architecture_decisions.md` (BDD) · `reference/backend-cadrage/01-backend-architecture-decisions.md`
