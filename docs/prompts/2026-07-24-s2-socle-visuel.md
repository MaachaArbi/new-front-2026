# Prompt — Vague S2 — Socle visuel (tokens + layout + thème + i18n/RTL)

> À archiver dans `docs/prompts/2026-07-24-s2-socle-visuel.md` — **avant la clôture**.

---

Tu interviens sur le projet **front OS-TRAVEL** (éditeur : OctaSoft), back-office
React/Vite. C'est la **vague S2 : socle visuel**.

Elle fusionne trois vagues initialement séparées (tokens, layout, i18n/RTL) parce
que prises isolément elles ne produisent **rien de vérifiable à l'écran**.
L'objectif de S2 est simple et unique :

> **Ouvrir un navigateur, voir le layout réel, basculer clair/sombre, basculer
> français/anglais/arabe, et constater que tout tient — y compris en RTL.**

## 0. AVANT TOUTE CHOSE

Lis intégralement, dans cet ordre :

1. `reference/front-cadrage/00-front-project-overview.md`
2. `reference/front-cadrage/01-front-architecture-decisions.md`
3. `reference/front-cadrage/02-front-module-index.md`
4. `docs/journal/2026-07-24-s1bis-corrections.md`

**Règle absolue** : aucune décision technique ou métier déduite, supposée ou
« améliorée » si elle n'est pas dans ces documents. En cas de doute :
**arrête-toi et demande**. Tu ne modifies jamais `reference/`.

---

## 1. GARDE-FOUS — VPS partagé

Ce VPS héberge d'autres projets en production, dont un projet React qui tourne.

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend Symfony)
- ❌ Jamais `npm install --force` : un conflit se **signale**, ne se force pas
- ❌ Ne casse pas `reference/` — `npm run check:reference` doit rester vert

---

## 2. LES SOURCES — lecture seule, jamais copiées en bloc

Deux paquets Metronic sont dépaquetés sur le VPS, **hors du dépôt** :

```
/home/ubuntu/vendor-metronic/starter-kit/    ← contient layout-21 (39 layouts)
/home/ubuntu/vendor-metronic/full/           ← contient i18n, providers, tokens
```

**Tu les LIS. Tu ne les copies jamais en bloc. Tu ne les ajoutes jamais au dépôt.**
Chaque fichier prélevé est relu, adapté, et devient nôtre (ADR-F01).

Pour chaque fichier prélevé, consigne l'origine dans `docs/vendor-imports.md`
(à créer) : chemin source, paquet d'origine, date, modifications apportées.

---

## 3. CE QU'IL FAUT PRÉLEVER — liste exacte

### 3.1 Tokens et thème — depuis `full/`

| Source                                        | Destination                            |
| --------------------------------------------- | -------------------------------------- |
| `src/css/config.reui.css`                     | `src/styles/tokens.css`                |
| le bloc `@layer base` de `src/css/styles.css` | `src/styles/globals.css`               |
| `src/providers/theme-provider.tsx`            | `src/app/providers/theme-provider.tsx` |

**N'importe PAS** `apexcharts.css`, `leaflet.css`, `rating.css`,
`image-input.css` : ils référencent trois variables qui n'existent nulle part
(`--color-mono`, `--box-shadow-sm`, `--gray-100`) et aucun n'est utile en S2.
Ne pas les importer supprime le problème au lieu de le corriger.

**Deux corrections obligatoires :**

1. **`--primary` en mode clair passe de `blue-500` à `blue-600`.**
   Vérifié : texte blanc sur `blue-500` donne **3,68:1**, sous le seuil WCAG AA
   de 4,5:1. `blue-600` donne **5,17:1**. Le mode sombre est déjà correct.
2. `theme-provider.tsx` embarque un `TooltipProvider` — **sépare-les**. Un
   fournisseur de thème ne fournit pas des infobulles.

### 3.2 i18n et RTL — depuis `full/`

| Source                            | Destination                           |
| --------------------------------- | ------------------------------------- |
| `src/i18n/config.ts` · `types.ts` | `src/shared/i18n/`                    |
| `src/providers/i18n-provider.tsx` | `src/app/providers/i18n-provider.tsx` |

Ce fournisseur fait déjà l'essentiel — **garde ce mécanisme** :

```tsx
document.documentElement.setAttribute('dir', currenLanguage.direction);
<RadixDirectionProvider dir={currenLanguage.direction}>
```

`RadixDirectionProvider` est indispensable : sans lui, un menu déroulant s'ouvre
du mauvais côté en arabe même avec des classes logiques parfaites.

**Adaptations :**

- **Trois langues seulement : `en`, `fr`, `ar`.** Supprime le chinois.
- **Jette les catalogues de démo.** Crée `en.json`, `fr.json`, `ar.json` neufs,
  ne contenant que les clés de S2 (navigation, modules, menu utilisateur).
- Langue par défaut : **`fr`** (`VITE_DEFAULT_LOCALE`).
- L'arabe doit contenir **du vrai texte arabe**, pas des marqueurs — c'est le
  seul moyen de tester le RTL sérieusement.

### 3.3 Layout — depuis `starter-kit/`

Prélève `src/components/layouts/layout-21/` (19 fichiers) →
`src/shared/layout/`.

**Dépendances exactes, relevées à l'audit :**

- **Externes** : `lucide-react`, `next-themes`, `react-helmet-async`,
  `react-router-dom`, et un import d'animation (voir ci-dessous)
- **Composants `ui/` (12)** : `accordion-menu`, `avatar`, `badge`,
  `breadcrumb`, `button`, `dropdown-menu`, `input`, `scroll-area`, `separator`,
  `sheet`, `tabs`, `tooltip`
- **Hooks/lib** : `use-menu`, `use-mobile`, `lib/utils` (déjà présent :
  `src/shared/lib/cn.ts`), `lib/helpers`

**Prends les 12 composants `ui/` depuis le registre ReUI en priorité**
(`npx shadcn add @reui/…`), qui est MIT et à jour. Ne recopie depuis
`vendor-metronic/` que ce que le registre ne fournit pas.

**Bug à corriger au prélèvement** : `sidebar-primary.tsx` ligne 40 importe
`framer-motion`, alors que le paquet déclaré est `motion` (le successeur
renommé). Installe `motion` et change l'import en `motion/react`. Si ça ne
résout pas, déclare `framer-motion` explicitement et **signale-le**.

**Fuite RTL à corriger** : `sidebar-primary.tsx` contient
`className="absolute left-1.75 …"` → `start-1.75`.

Le layout expose déjà ses variables (`--sidebar-width: 300px`,
`--sidebar-collapsed-width: 60px`, `--header-height: 60px`…) — **garde ce
mécanisme**, c'est le paramétrage prévu par ADR-F02.

Bonne nouvelle : le bouton de bascule clair/sombre est **déjà** dans le rail
(`useTheme` de `next-themes`, icônes `Sun`/`Moon`). Câble-le, ne le réécris pas.

---

## 4. LA NAVIGATION

### 4.1 Le rail = les modules

**Huit entrées, validées.** Chacune avec son icône lucide et sa clé de traduction :

| #   | Clé                      | fr            | en          | ar        |
| --- | ------------------------ | ------------- | ----------- | --------- |
| 1   | `nav.module.parties`     | Tiers         | Parties     | الأطراف   |
| 2   | `nav.module.bookings`    | Réservations  | Bookings    | الحجوزات  |
| 3   | `nav.module.settlements` | Règlements    | Settlements | التسويات  |
| 4   | `nav.module.cash`        | Caisse        | Cash        | الصندوق   |
| 5   | `nav.module.invoicing`   | Facturation   | Invoicing   | الفوترة   |
| 6   | `nav.module.catalogue`   | Catalogue     | Catalogue   | الكتالوج  |
| 7   | `nav.module.pricing`     | Tarification  | Pricing     | التسعير   |
| 8   | `nav.module.settings`    | Configuration | Settings    | الإعدادات |

Le **« + » en bas du rail** est conservé : c'est le futur point d'entrée du
catalogue des modules non achetés (ADR-F08). En S2 il n'ouvre rien — pose juste
le bouton avec son infobulle.

### 4.2 La barre latérale = le menu du module courant

Changer de module dans le rail change le menu de la barre latérale. Chaque
module a **son propre menu**, ce qui évite un menu unique interminable.

En S2, un menu factice de 3 à 6 entrées par module suffit — mais avec des
**libellés métier réalistes**, pas ceux de Metronic (« Business Concepts »,
« KeenThemes Studio » n'apprennent rien).

### 4.3 En tête de barre latérale — deux informations distinctes

Le menu déroulant en tête sert au **bureau** (`party_account_office` :
Tunisie, Algérie, France…), **pas** au module. Deux concepts différents ne
partagent pas un contrôle :

- le **module** = _où je suis_ → le rail
- le **bureau** = _pour qui je travaille_ → le déroulant

Sous le sélecteur de bureau, affiche le **nom du module courant** en clair. Une
icône seule est ambiguë. L'utilisateur doit lire en permanence :
_Bureau Tunisie · Réservations_.

### 4.4 Le type de menu — étendu dès maintenant (ADR-F19)

`MenuItem` de Metronic n'a ni clé de traduction, ni permission, ni entitlement.
Définis dès S2 :

```ts
interface MenuItem {
  titleKey: string // clé i18n, jamais une chaîne en dur
  icon?: LucideIcon
  path?: string
  permission?: string // ADR-017 — déclaré, pas encore câblé
  entitlement?: string // ADR-F08 — déclaré, pas encore câblé
  badgeKey?: string
  children?: MenuConfig
}
```

`permission` et `entitlement` sont **déclarés mais non exploités** en S2. Le
câblage arrive en S8. Les définir maintenant évite de retoucher toute la
navigation plus tard.

---

## 5. LE MODE LARGE — un seul layout

Certaines pages (grand livre, liste de réservations à 15 colonnes) ont besoin de
toute la largeur. Rail + barre latérale mangent ~290 px.

**On ne crée PAS un second layout** — il faudrait le croiser avec clair/sombre et
LTR/RTL, doubler les tests, et reporter chaque correction deux fois. C'est
exactement ce qu'ADR-F02 interdit.

À la place : **une page peut déclarer qu'elle a besoin d'espace**, et le layout
replie la barre latérale en conséquence. Le rail reste visible.

```
page normale  →  rail + barre latérale + contenu
page large    →  rail + contenu pleine largeur
```

Une seule ligne de configuration par page, un seul chemin de code. L'utilisateur
peut toujours redéployer la barre manuellement ; son choix est mémorisé.

Crée **deux pages de démonstration** pour le prouver : une normale, une large.

---

## 6. LE CONTENU FACTICE — encadré strictement

Oui, on remplit : un menu à trois entrées ne révèle aucun défaut. Trois règles :

1. **Tout dans `src/shared/dev/`**, fichiers préfixés `mock-`. Jamais dispersé
   dans les composants.
2. **Rien de factice dans `src/modules/`** — ce dossier ne reçoit que du réel.
3. **Ajoute au backlog** une ligne « supprimer les données factices de
   `src/shared/dev/` », qui restera ouverte jusqu'à son retrait effectif.

Contenu attendu : les 8 modules, un menu par module, 2-3 bureaux, un utilisateur
pour le menu de profil.

---

## 7. LA RÈGLE ESLint RTL — obligatoire

Ajoute une règle qui **interdit les classes directionnelles physiques** dans
`src/` :

`pl-` `pr-` `ml-` `mr-` `left-` `right-` `border-l` `border-r` `rounded-l`
`rounded-r` `rounded-tl` `rounded-tr` `rounded-bl` `rounded-br` `text-left`
`text-right` `space-x-` `inset-x-` (hors `inset-x-0`)

**Exceptions autorisées, à commenter dans le code** : centrage symétrique
(`left-[50%]` + `translate-x-[-50%]`), `inset-x-0`.

Utilise `no-restricted-syntax` sur les littéraux de chaîne, ou un plugin de
règles personnalisées — au choix, du moment que `npm run lint` **échoue** si une
classe physique est introduite.

Vérifie que la règle mord : introduis volontairement `ml-4` quelque part,
constate l'échec du lint, retire-le.

---

## 8. HORS PÉRIMÈTRE — ne l'anticipe pas

❌ Aucun appel réseau, aucun client API → **S5**
❌ Aucune authentification, aucune page de connexion → **S6**
❌ Aucun `Money`, aucun formatage de montant → **S7**
❌ Aucune logique de permission ni d'entitlement (déclarées seulement) → **S8**
❌ Aucun tableau de données, aucun formulaire métier → **S9**
❌ Aucun test Vitest ni Playwright → **S11**
❌ Aucune page métier réelle → après le socle
❌ Ne prélève **aucun** composant `ui/` au-delà des 12 listés
❌ Ne prends **rien** de `full/src/auth/`, `full/src/pages/`, Supabase, Keenicons

---

## 9. CRITÈRES D'ACCEPTATION

### Technique — à exécuter réellement

- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] Règle RTL vérifiée : un `ml-4` volontaire fait échouer le lint
- [ ] Aucune classe directionnelle physique dans `src/`
- [ ] Aucune chaîne d'interface en dur — tout passe par l'i18n
- [ ] `--primary` en clair vaut bien `blue-600`
- [ ] Aucun paquet interdit d'ADR-F18 introduit

### Visuel — à vérifier au navigateur et à décrire dans le journal

- [ ] Le layout s'affiche, rail + barre latérale + fil d'Ariane + contenu
- [ ] Les 8 modules sont dans le rail, avec infobulles traduites
- [ ] Cliquer un module change le menu de la barre latérale
- [ ] Le nom du module courant est lisible sous le sélecteur de bureau
- [ ] La bascule clair/sombre fonctionne, le choix survit à un rechargement
- [ ] La bascule de langue fonctionne pour `fr`, `en`, `ar`
- [ ] **En arabe, l'interface passe entièrement en RTL** : rail à droite, menus
      ouverts du bon côté, icônes directionnelles miroitées
- [ ] Le repli de la barre latérale fonctionne, le choix est mémorisé
- [ ] La page « large » occupe toute la largeur, la page normale non
- [ ] Le menu utilisateur s'ouvre et est rempli

Décris dans le journal ce que tu as **réellement observé**, pas ce que tu penses
qui devrait se produire. Si un point ne fonctionne pas, dis-le : un défaut connu
vaut infiniment mieux qu'une case cochée à tort.

---

## 10. LIVRABLES DOCUMENTAIRES

- `docs/prompts/2026-07-24-s2-socle-visuel.md` — ce prompt, tel quel.
  **Discipline permanente : chaque vague archive son prompt avant clôture.**
- `docs/journal/2026-07-24-s2-socle-visuel.md` — gabarit habituel, section
  **« Dérives & corrections » obligatoire** (un livrable oublié est une dérive).
- `docs/vendor-imports.md` — le manifeste : chaque fichier prélevé, son origine,
  ses modifications.
- `docs/decisions/2026-07-24-mode-large-sans-second-layout.md` — pourquoi une
  page large replie la barre plutôt que d'introduire un second layout.
- `docs/STATUS.md` — S2 ✅, prochaine action.
- `docs/backlog/todo.md` — cocher S2, ajouter « supprimer les données factices ».

**Bloc de clôture chiffré** :

```
tsc          exit —
eslint       — erreur(s)  (dont — classe(s) physique(s))
bundle       — ko initial / — ko total
langues      fr / en / ar        RTL vérifié : oui / non
thèmes       clair / sombre      persistance : oui / non
```

**Commit unique** : `feat(s2): socle visuel — tokens, layout-21, thème sombre, i18n RTL`
**Ne pousse pas** sans que je te le demande.

---

## 11. EN CAS DE BLOCAGE

Arrête-toi et signale si : un composant ReUI du registre est incompatible ·
`motion/react` ne résout pas · le RTL casse un élément que tu ne sais pas
corriger · une décision t'est nécessaire et n'est pas dans `reference/`.

**Ne force jamais.** Et surtout : **ne coche aucun critère sans l'avoir
exécuté.** S1 avait coché huit cases dont deux étaient fausses — c'est ce qui a
coûté la vague S1-bis.
