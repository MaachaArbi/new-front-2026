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

| Fichier              | Modifications propres au prélèvement                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `accordion-menu.tsx` | Import `cn`. **Correction stricte** : gardes `noUncheckedIndexedAccess` (ADR-F05) sur l'indexation de `trimmedChain` (2 lignes).                                                                                                                                                     |
| `avatar.tsx`         | Import `cn`. **§9** : statuts `AvatarStatus` (online/offline/busy/away) passés des couleurs brutes (`bg-green-600`…) aux tokens sémantiques (`bg-primary`, `bg-muted-foreground`, `bg-destructive`, `bg-secondary-foreground`) — pas de palette de statut dans nos tokens (ADR-F03). |
| `badge.tsx`          | Import `cn` uniquement.                                                                                                                                                                                                                                                              |
| `breadcrumb.tsx`     | Import `cn` uniquement.                                                                                                                                                                                                                                                              |
| `button.tsx`         | Import `cn`. **§9** : variante `mono` passée de `bg-zinc-950…` à `bg-foreground text-background` (inversion haut-contraste, token).                                                                                                                                                  |
| `dropdown-menu.tsx`  | Import `cn` uniquement. (`slide-in-from-left/right-*` conservés : animations d'entrée pilotées par `data-side`, pas des positions physiques.)                                                                                                                                        |
| `input.tsx`          | Import `cn` uniquement.                                                                                                                                                                                                                                                              |
| `scroll-area.tsx`    | Import `cn`. **Fuite RTL corrigée** : `border-l border-l-transparent` → `border-s border-s-transparent` (propriété logique, ADR-F04).                                                                                                                                                |
| `separator.tsx`      | Import `cn` uniquement.                                                                                                                                                                                                                                                              |
| `sheet.tsx`          | Import `cn`. **Fuite RTL corrigée** : `sm:space-x-2` → `sm:gap-2` (`inset-x-0` conservé — exception autorisée).                                                                                                                                                                      |
| `tabs.tsx`           | Import `cn` uniquement.                                                                                                                                                                                                                                                              |
| `tooltip.tsx`        | Import `cn`. **§9** : variante `dark` passée de `bg-zinc-950…` à `bg-foreground text-background` (token haut-contraste).                                                                                                                                                             |

---

## Layout-21 — `src/shared/layout/` (structure prélevée, contenu adapté)

Source : `starter-kit/src/components/layouts/layout-21/`. Le layout-21 livré est
une **démonstration** (données factices « Thunder AI », « Chris Harris », menus
workspaces/communities/resources, couleurs brutes). Conformément à §4 (contenu
OS-TRAVEL) et §9 (tokens uniquement), on prélève **l'ossature** et on pilote le
contenu depuis notre configuration.

### Ossature conservée (imports/tokens adaptés)

| Fichier cible                | Source                       | Adaptations                                                                                                                               |
| ---------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `index.tsx`                  | `layout-21/index.tsx`        | `react-helmet-async` → hook maison `useDocumentTitle` ; titre traduit depuis la route (§4.3).                                             |
| `components/context.tsx`     | `components/context.tsx`     | Persistance du repli (localStorage `ostravel-sidebar-open`) + mode large `pageWide` (ADR-F02). `TooltipProvider` conservé (légitime ici). |
| `components/wrapper.tsx`     | `components/wrapper.tsx`     | Propriétés logiques conservées ; `role="content"` → `role="main"`.                                                                        |
| `components/sidebar.tsx`     | `components/sidebar.tsx`     | Inchangé (déjà logique).                                                                                                                  |
| `components/header.tsx`      | `components/header.tsx`      | Inchangé (déjà logique).                                                                                                                  |
| `components/header-menu.tsx` | `components/header-menu.tsx` | Tiroir mobile ; libellés i18n.                                                                                                            |
| `components/toolbar.tsx`     | `components/toolbar.tsx`     | Primitives de barre d'outils, sans données démo.                                                                                          |

### Contenu réécrit (démo → domaine OS-TRAVEL, i18n, tokens)

| Fichier cible                         | Source                                | Réécriture                                                                                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/sidebar-primary.tsx`      | `components/sidebar-primary.tsx`      | Rail = nos 8 modules (menu.config), infobulles i18n, menu utilisateur i18n. **Fuite RTL `left-1.75` → `start-1.75`** (§4.1). **`framer-motion` → `motion/react`** (§4.2). Couleurs brutes → tokens (rail à teinte unique `bg-primary`, ADR-F03 laissé « à trancher »). |
| `components/sidebar-header.tsx`       | `components/sidebar-header.tsx`       | Déroulant « équipes » démo → **sélecteur de bureau** (ADR-F02), i18n, tokens.                                                                                                                                                                                          |
| `components/sidebar-secondary.tsx`    | `components/sidebar-secondary.tsx`    | Assemble en-tête + recherche + **nom du module courant** + menu du module. Sections démo retirées (voir ci-dessous).                                                                                                                                                   |
| `components/sidebar-primary-menu.tsx` | `components/sidebar-primary-menu.tsx` | Menu du module courant depuis `MODULE_MENUS`, libellés i18n.                                                                                                                                                                                                           |
| `components/sidebar-search.tsx`       | `components/sidebar-search.tsx`       | Placeholder i18n.                                                                                                                                                                                                                                                      |
| `components/header-breadcrumbs.tsx`   | `components/header-breadcrumbs.tsx`   | Fil d'Ariane calculé depuis la route réelle, i18n.                                                                                                                                                                                                                     |
| `components/header-toolbar.tsx`       | `components/header-toolbar.tsx`       | Actions démo → **sélecteur de langue + bascule de thème** (contrôles globaux réels), i18n.                                                                                                                                                                             |
| `menu.config.ts`                      | `config/layout-21.config.tsx`         | `MenuItem` redéfini (ADR-F19 : `titleKey`, `permission`, `entitlement`, `badgeKey`). Menus métier réalistes par module.                                                                                                                                                |
| `hooks/use-mobile.ts`                 | `hooks/use-mobile.tsx`                | Inchangé hors style.                                                                                                                                                                                                                                                   |

### NON prélevé (délibérément)

| Source                                   | Raison                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `components/sidebar-workspaces-menu.tsx` | Section de démonstration (workspaces) sans équivalent domaine.                           |
| `components/sidebar-communities.tsx`     | Idem (communities, logos de marques démo).                                               |
| `components/sidebar-resources-menu.tsx`  | Idem (resources).                                                                        |
| `components/toolbar-menu.tsx`            | Onglets démo (Overview/Billing…) — relèvent du contenu d'écran (S9).                     |
| `hooks/use-menu.ts`                      | Sur-dimensionné (nesting profond) ; remplacé par `moduleFromPath` dans `menu.config.ts`. |
| `lib/helpers.ts` (`toAbsoluteUrl`)       | Pointait vers des médias de démo absents ; on utilise les initiales d'avatar.            |

---

## Dépendances installées pour ce prélèvement

| Paquet     | Version  | Motif                                        | Drapeau |
| ---------- | -------- | -------------------------------------------- | ------- |
| `radix-ui` | `^1.6.5` | Primitives des 12 composants (paquet unifié) | aucun   |

`@radix-ui/react-direction` (déjà déclaré depuis S2) est désormais **réellement
utilisé** (DirectionProvider dans `i18n-provider.tsx`).

---

## Retouches S3c (finitions, aucun nouveau prélèvement)

Fichiers prélevés retouchés en S3c — aucune dépendance ajoutée :

| Fichier | Retouche S3c |
| --- | --- |
| `components/wrapper.tsx` | Padding `px-4 lg:px-7.5` sur `<main>` + `min-h-0` sur le panneau (mise en page §2/§3). |
| `components/header.tsx` | `container-fluid` → `px-4 lg:px-7.5` (fil d'Ariane). |
| `components/context.tsx` | `flex grow` → `flex h-full min-h-0` (chaîne de hauteur §3). |
| `components/sidebar-primary.tsx` | Rail en `bg-sidebar text-sidebar-foreground` (3 niveaux §4). |
| `components/sidebar-secondary.tsx` | Menu en `bg-sidebar text-sidebar-foreground`. |
| `components/sidebar-primary-menu.tsx` | Rendu des groupes de section + badges (i18n). |

Tokens (`src/styles/tokens.css`, non-vendor) : palette sombre à trois niveaux +
`--sidebar` + états pastel — voir `docs/decisions/2026-07-24-palette-sombre-trois-niveaux.md`.
Contenu factice des menus déplacé dans `src/shared/dev/mock-menus.ts`.

---

## Prélèvement S5-UX — 3 composants ReUI supplémentaires (`src/shared/ui/`)

Source : `starter-kit/src/components/ui/<nom>.tsx` — date : 2026-07-25.

**Contexte** : le prompt S5-UX (§3.3, §3.4, §6) supposait `dialog`, `command` et
`kbd` **déjà présents** dans `ui/`. Ils ne l'étaient pas (S3b n'avait prélevé que
12 composants) — signalé, et prélèvement autorisé comme étape de la vague (voir
journal S5-UX, dérive n°1).

| Fichier         | Modifications propres au prélèvement                                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kbd.tsx`       | Import `cn`. Sinon inchangé (déjà logique, aucune fuite RTL).                                                                                                                                                                                                                                                              |
| `dialog.tsx`    | Import `cn`. **Défaut ADR-F18 corrigé** : `export default DialogContent;` égaré au milieu du fichier **retiré**. **Fuite RTL** : `sm:space-x-2.5` → `sm:gap-2.5`. Centrage `left-[50%]` + `translate-x-[-50%]` conservé (exception symétrique ADR-F04, commenté + `eslint-disable-next-line no-restricted-syntax`).        |
| `command.tsx`   | Import `cn` + `@/shared/ui/dialog`. **Correction paquet** : `import { type DialogProps } from '@radix-ui/react-dialog'` (paquet séparé absent) → type dérivé de notre `Dialog` (`React.ComponentProps<typeof Dialog>`), cohérent avec le `radix-ui` unifié (comme S3b). `LucideIcon` en `type`-import. Déjà logique (RTL). |

## Dépendance installée pour ce prélèvement

| Paquet | Version  | Motif                                   | Drapeau |
| ------ | -------- | --------------------------------------- | ------- |
| `cmdk` | `^1.1.1` | Primitive de la palette (`command.tsx`) | aucun   |

`dialog`/`kbd` n'ont besoin que de `radix-ui` (déjà installé). 0 conflit de pairs
sur `cmdk` (sinon : arrêt et signalement, §1).

---

## Alignement fin S-design (valeur de finition reprise du template)

Comparaison composant par composant `layout/components/` ↔ template layout-21.
**Conclusion mesurée** : le layout est déjà aligné ; les finitions (`size-4`,
chevrons `size-3.5!`, rayons) sont fournies par les composants ReUI, et les écarts
apparents vivent sur des éléments de démo écartés en S3b. Un seul écart réel
reporté :

| Fichier | Valeur reprise du template |
| --- | --- |
| `components/sidebar-primary-menu.tsx` | Espacement inter-groupes du menu `space-y-6` → **`space-y-7.5`** (30px, valeur du template ; vertical → neutre RTL). |

Non repris : icônes multicolores du rail, avatars `toAbsoluteUrl`, `ScrollArea`,
sections de démo — écartés à dessein (ADR-F03/§3.2). Détail : journal S-design.
