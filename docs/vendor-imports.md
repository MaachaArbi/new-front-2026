# Manifeste des prélèvements Metronic / ReUI

Traçabilité des fichiers **prélevés** (copy-and-own, ADR-F01) depuis le paquet
Metronic/ReUI, sans redistribution du paquet. Permet de savoir quoi revérifier
le jour où ReUI publie une correction.

- **Source (lecture seule)** : `/home/ubuntu/vendor-metronic/starter-kit/`
- **Licence** : ReUI (MIT) pour les composants `ui/` ; Metronic (licence d'usage)
  pour le layout-21.
- **Règle** : le paquet vendor n'est jamais ajouté au dépôt ; seuls les fichiers
  nécessaires sont copiés, relus, typés, adaptés — ils deviennent nôtres.

---

## Adaptation commune à tous les fichiers

- Import `@/lib/utils` → `@/shared/lib/cn` (notre utilitaire `cn`).
- Import `@/components/ui/*` → `@/shared/ui/*`.
- Style reformaté selon notre Prettier (pas de point-virgule, guillemets simples).
- Les composants importent la primitive **`radix-ui`** (paquet unifié `^1.6.5`),
  et non les paquets `@radix-ui/react-*` séparés — c'est la structure réelle du
  starter-kit (le prompt supposait `@radix-ui/react-*` ; corrigé, voir journal).

---

## Composants ReUI — `src/shared/ui/` (12 / 12)

Source : `starter-kit/src/components/ui/<nom>.tsx` — date : 2026-07-24.

| Fichier | Modifications propres au prélèvement |
| --- | --- |
| `accordion-menu.tsx` | Import `cn`. **Correction stricte** : gardes `noUncheckedIndexedAccess` (ADR-F05) sur l'indexation de `trimmedChain` (2 lignes). |
| `avatar.tsx` | Import `cn`. **§9** : statuts `AvatarStatus` (online/offline/busy/away) passés des couleurs brutes (`bg-green-600`…) aux tokens sémantiques (`bg-primary`, `bg-muted-foreground`, `bg-destructive`, `bg-secondary-foreground`) — pas de palette de statut dans nos tokens (ADR-F03). |
| `badge.tsx` | Import `cn` uniquement. |
| `breadcrumb.tsx` | Import `cn` uniquement. |
| `button.tsx` | Import `cn`. **§9** : variante `mono` passée de `bg-zinc-950…` à `bg-foreground text-background` (inversion haut-contraste, token). |
| `dropdown-menu.tsx` | Import `cn` uniquement. (`slide-in-from-left/right-*` conservés : animations d'entrée pilotées par `data-side`, pas des positions physiques.) |
| `input.tsx` | Import `cn` uniquement. |
| `scroll-area.tsx` | Import `cn`. **Fuite RTL corrigée** : `border-l border-l-transparent` → `border-s border-s-transparent` (propriété logique, ADR-F04). |
| `separator.tsx` | Import `cn` uniquement. |
| `sheet.tsx` | Import `cn`. **Fuite RTL corrigée** : `sm:space-x-2` → `sm:gap-2` (`inset-x-0` conservé — exception autorisée). |
| `tabs.tsx` | Import `cn` uniquement. |
| `tooltip.tsx` | Import `cn`. **§9** : variante `dark` passée de `bg-zinc-950…` à `bg-foreground text-background` (token haut-contraste). |

---

## Layout-21 — `src/shared/layout/` (structure prélevée, contenu adapté)

Source : `starter-kit/src/components/layouts/layout-21/`. Le layout-21 livré est
une **démonstration** (données factices « Thunder AI », « Chris Harris », menus
workspaces/communities/resources, couleurs brutes). Conformément à §4 (contenu
OS-TRAVEL) et §9 (tokens uniquement), on prélève **l'ossature** et on pilote le
contenu depuis notre configuration.

### Ossature conservée (imports/tokens adaptés)

| Fichier cible | Source | Adaptations |
| --- | --- | --- |
| `index.tsx` | `layout-21/index.tsx` | `react-helmet-async` → hook maison `useDocumentTitle` ; titre traduit depuis la route (§4.3). |
| `components/context.tsx` | `components/context.tsx` | Persistance du repli (localStorage `ostravel-sidebar-open`) + mode large `pageWide` (ADR-F02). `TooltipProvider` conservé (légitime ici). |
| `components/wrapper.tsx` | `components/wrapper.tsx` | Propriétés logiques conservées ; `role="content"` → `role="main"`. |
| `components/sidebar.tsx` | `components/sidebar.tsx` | Inchangé (déjà logique). |
| `components/header.tsx` | `components/header.tsx` | Inchangé (déjà logique). |
| `components/header-menu.tsx` | `components/header-menu.tsx` | Tiroir mobile ; libellés i18n. |
| `components/toolbar.tsx` | `components/toolbar.tsx` | Primitives de barre d'outils, sans données démo. |

### Contenu réécrit (démo → domaine OS-TRAVEL, i18n, tokens)

| Fichier cible | Source | Réécriture |
| --- | --- | --- |
| `components/sidebar-primary.tsx` | `components/sidebar-primary.tsx` | Rail = nos 8 modules (menu.config), infobulles i18n, menu utilisateur i18n. **Fuite RTL `left-1.75` → `start-1.75`** (§4.1). **`framer-motion` → `motion/react`** (§4.2). Couleurs brutes → tokens (rail à teinte unique `bg-primary`, ADR-F03 laissé « à trancher »). |
| `components/sidebar-header.tsx` | `components/sidebar-header.tsx` | Déroulant « équipes » démo → **sélecteur de bureau** (ADR-F02), i18n, tokens. |
| `components/sidebar-secondary.tsx` | `components/sidebar-secondary.tsx` | Assemble en-tête + recherche + **nom du module courant** + menu du module. Sections démo retirées (voir ci-dessous). |
| `components/sidebar-primary-menu.tsx` | `components/sidebar-primary-menu.tsx` | Menu du module courant depuis `MODULE_MENUS`, libellés i18n. |
| `components/sidebar-search.tsx` | `components/sidebar-search.tsx` | Placeholder i18n. |
| `components/header-breadcrumbs.tsx` | `components/header-breadcrumbs.tsx` | Fil d'Ariane calculé depuis la route réelle, i18n. |
| `components/header-toolbar.tsx` | `components/header-toolbar.tsx` | Actions démo → **sélecteur de langue + bascule de thème** (contrôles globaux réels), i18n. |
| `menu.config.ts` | `config/layout-21.config.tsx` | `MenuItem` redéfini (ADR-F19 : `titleKey`, `permission`, `entitlement`, `badgeKey`). Menus métier réalistes par module. |
| `hooks/use-mobile.ts` | `hooks/use-mobile.tsx` | Inchangé hors style. |

### NON prélevé (délibérément)

| Source | Raison |
| --- | --- |
| `components/sidebar-workspaces-menu.tsx` | Section de démonstration (workspaces) sans équivalent domaine. |
| `components/sidebar-communities.tsx` | Idem (communities, logos de marques démo). |
| `components/sidebar-resources-menu.tsx` | Idem (resources). |
| `components/toolbar-menu.tsx` | Onglets démo (Overview/Billing…) — relèvent du contenu d'écran (S9). |
| `hooks/use-menu.ts` | Sur-dimensionné (nesting profond) ; remplacé par `moduleFromPath` dans `menu.config.ts`. |
| `lib/helpers.ts` (`toAbsoluteUrl`) | Pointait vers des médias de démo absents ; on utilise les initiales d'avatar. |

---

## Dépendances installées pour ce prélèvement

| Paquet | Version | Motif | Drapeau |
| --- | --- | --- | --- |
| `radix-ui` | `^1.6.5` | Primitives des 12 composants (paquet unifié) | aucun |

`@radix-ui/react-direction` (déjà déclaré depuis S2) est désormais **réellement
utilisé** (DirectionProvider dans `i18n-provider.tsx`).
