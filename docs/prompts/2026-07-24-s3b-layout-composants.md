# Prompt — Vague S3b — Layout-21 & composants

> À archiver dans `docs/prompts/2026-07-24-s3b-layout-composants.md` — **avant la clôture**.

---

Tu interviens sur le projet **front OS-TRAVEL** (éditeur : OctaSoft). C'est la
**vague S3b**, avec **un seul résultat vérifiable** :

> **Le vrai layout-21 de Metronic s'affiche — en clair, en sombre, et en arabe RTL.**

S3a a posé les tokens et réparé le thème. Il reste à remplacer le layout provisoire
écrit à la main par le vrai.

## 0. AVANT TOUTE CHOSE

Lis intégralement :

1. `reference/front-cadrage/01-front-architecture-decisions.md` — **ADR-F01**
   (Metronic = source), **ADR-F02** (layout unique), **ADR-F04** (RTL),
   **ADR-F19** (modèle de menu)
2. `reference/front-cadrage/03-front-adr-ux-ia.md` — **ADR-F20**
3. `docs/journal/2026-07-24-s3a-tokens-theme.md`

**Règle absolue** : aucune décision déduite ou supposée si elle n'est pas dans
`reference/`. En cas de doute : **arrête-toi et demande**. Tu ne modifies jamais
`reference/`.

## 1. GARDE-FOUS — VPS partagé

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend)
- ❌ **Jamais `--force`, jamais `--legacy-peer-deps`.** `npm ci` doit rester
  vert sans drapeau — c'est un acquis de S3a, ne le perds pas.

---

## 2. LA SOURCE — et une correction importante

```
/home/ubuntu/vendor-metronic/starter-kit/    ← layout-21 ET les composants
```

Lecture seule. Jamais copiée en bloc, jamais ajoutée au dépôt (ADR-F01).

> ⚠️ **Correction par rapport à une consigne antérieure.** Le prompt S2 disait de
> privilégier le registre ReUI (`npx shadcn add`) pour les composants. **Pas pour
> cette vague.** Le layout-21 a été écrit contre les versions exactes livrées
> dans le starter-kit ; les versions du registre ont pu évoluer (props, variantes)
> et casseraient le layout de façon difficile à diagnostiquer.
>
> **Prélève les 12 composants depuis `starter-kit/src/components/ui/`.**
> Le registre ReUI reste la source pour les composants **futurs** dont le
> layout-21 n'a pas besoin (Data Grid, Filters, Autocomplete…) — c'est-à-dire à
> partir de S9.

---

## 3. LES 12 COMPOSANTS

Depuis `starter-kit/src/components/ui/` → `src/shared/ui/` :

```
accordion-menu   avatar   badge      breadcrumb
button           dropdown-menu       input
scroll-area      separator           sheet
tabs             tooltip
```

Ce sont **exactement** les dépendances relevées à l'audit du layout-21, ni plus
ni moins. Chacun importe `@/lib/utils` pour `cn` — **adapte l'import vers
`@/shared/lib/cn`**, qui existe déjà.

Ces composants tirent des paquets Radix (`@radix-ui/react-*`). Installe ce qui
manque, **un par un**, sans drapeau. Si un conflit de pairs apparaît :
**arrête-toi et signale**.

---

## 4. LE LAYOUT-21

Depuis `starter-kit/src/components/layouts/layout-21/` (19 fichiers) →
`src/shared/layout/`.

Il faut aussi prélever ses dépendances internes :
`hooks/use-menu`, `hooks/use-mobile`, `lib/helpers` (seulement ce qui est
réellement utilisé), et `config/layout-21.config.tsx` → `src/shared/layout/menu.config.ts`.

### Cinq adaptations obligatoires

**4.1 — Fuite RTL.** `sidebar-primary.tsx` contient
`className="absolute left-1.75 …"` → **`start-1.75`**. C'est la seule fuite
physique de tout le layout (vérifié à l'audit).

**4.2 — Import d'animation.** Même fichier, ligne ~40 :
`import { motion } from 'framer-motion'` → **`from 'motion/react'`**.
`motion` est déjà déclaré dans `package.json`. Si `motion/react` ne résout pas,
**arrête-toi et signale** — n'installe pas `framer-motion` en plus.

**4.3 — Titre de page.** `index.tsx` utilise `react-helmet-async`, retiré en S3a
parce qu'incompatible React 19. Remplace par un hook maison de quelques lignes,
`src/shared/hooks/use-document-title.ts`, qui pose `document.title`.
**Ne réinstalle pas `react-helmet-async`.**

**4.4 — Internationalisation.** Tous les libellés du layout passent par l'i18n
existant (`src/shared/i18n`). **Aucune chaîne d'interface en dur, nulle part.**
Complète `en.json`, `fr.json`, `ar.json` avec les clés nécessaires — l'arabe
avec du **vrai texte arabe**, pas des marqueurs.

**4.5 — Modèle de menu (ADR-F19).** Le `MenuItem` de Metronic n'a ni clé de
traduction, ni permission, ni entitlement. Redéfinis-le :

```ts
interface MenuItem {
  titleKey: string // clé i18n, jamais une chaîne en dur
  icon?: LucideIcon
  path?: string
  permission?: string // déclaré, PAS câblé (S8)
  entitlement?: string // déclaré, PAS câblé (S8)
  badgeKey?: string
  children?: MenuConfig
}
```

`permission` et `entitlement` sont **déclarés et non exploités**. Les définir
maintenant évite de retoucher toute la navigation plus tard.

### Contenu de navigation

Reprends `src/shared/dev/mock-modules.ts` (existant, 8 modules).

- **Le rail** : les 8 modules, chacun avec son icône et son infobulle traduite
- **Le « + » en bas du rail** : conservé, avec infobulle. Il n'ouvre rien en S3b
  (futur catalogue des modules non achetés, ADR-F08)
- **La barre latérale** : le menu du module courant. 3 à 6 entrées par module,
  avec des **libellés métier réalistes** — pas « Menu Item 1 », pas
  « Business Concepts »
- **En tête de barre latérale** : le déroulant sert au **bureau**
  (Bureau Tunisie…), **pas** au module. Sous lui, le **nom du module courant**
  en clair — une icône seule est ambiguë

---

## 5. LE PIÈGE RTL À NE PAS MANQUER

`@radix-ui/react-direction` est déclaré dans `package.json` mais **utilisé dans
0 fichier**. Le RTL fonctionne aujourd'hui uniquement parce qu'aucun composant
Radix n'est affiché.

**Dès que les 12 composants arrivent, les menus déroulants s'ouvriront du mauvais
côté en arabe** si rien n'est fait.

Branche `RadixDirectionProvider` dans `src/app/providers/i18n-provider.tsx`,
comme le fait Metronic :

```tsx
<RadixDirectionProvider dir={currentLanguage.direction}>
  {children}
</RadixDirectionProvider>
```

Source de référence : `/home/ubuntu/vendor-metronic/full/src/providers/i18n-provider.tsx`

**À tester explicitement** : ouvrir un menu déroulant en arabe et vérifier de
quel côté il s'aligne.

---

## 6. ROUTAGE MINIMAL

Le layout-21 utilise `useLocation` de `react-router-dom` (déjà déclaré, non
utilisé). Pose un routeur minimal :

- une route par module (8), chacune affichant une page vide avec le nom du module
- une page **normale** et une page **large** pour démontrer le mode large (§7)

Rien de plus. Pas de route protégée, pas de chargement paresseux — vagues
ultérieures.

---

## 7. LE MODE LARGE (ADR-F02)

Une page peut déclarer qu'elle a besoin de toute la largeur ; le layout replie
alors la barre latérale, le rail reste visible.

**On ne crée pas un second layout** — il faudrait le croiser avec clair/sombre et
LTR/RTL et doubler les tests.

Une ligne de configuration par page, un seul chemin de code. Le repli manuel de
l'utilisateur reste possible et son choix est mémorisé.

---

## 8. LA RÈGLE ESLint RTL

Ajoute une règle qui **interdit les classes directionnelles physiques** dans
`src/` :

`pl-` `pr-` `ml-` `mr-` `left-` `right-` `border-l` `border-r` `rounded-l`
`rounded-r` `rounded-tl` `rounded-tr` `rounded-bl` `rounded-br` `text-left`
`text-right` `space-x-` `inset-x-`

**Exceptions, à commenter dans le code** : centrage symétrique (`left-[50%]` +
`translate-x-[-50%]`), `inset-x-0`.

`no-restricted-syntax` sur les littéraux de chaîne suffit.

**Vérifie que la règle mord** : introduis volontairement `ml-4`, constate
l'échec du lint, retire-le. Reporte ce test dans le journal.

---

## 9. SUPPRESSION DU LAYOUT PROVISOIRE

`src/App.tsx` (169 lignes) est **entièrement remplacé**. Il contient 51 couleurs
Tailwind en dur (`bg-slate-*`) et des chaînes anglaises en dur
(« Welcome to OsTravel », « Menu Item 1 »…) — tout disparaît.

**Le nouveau code n'utilise que des tokens sémantiques** (`bg-background`,
`text-foreground`, `border-border`, `bg-primary`…). **Aucune couleur Tailwind
brute** (`slate-`, `zinc-`, `blue-`…) dans `src/`, hors `tokens.css`.

C'est vérifiable par `grep` — mets-le dans tes critères.

---

## 10. LE MANIFESTE

Crée `docs/vendor-imports.md`. Pour chaque fichier prélevé : chemin source,
paquet d'origine, date, et **modifications apportées**.

Ça donne la traçabilité sans la redistribution, et permet de savoir quoi
revérifier le jour où ReUI publie une correction.

---

## 11. HORS PÉRIMÈTRE

❌ Client API, appels réseau → S5 · ❌ Authentification → S6 · ❌ `Money` → S7
❌ Logique de permission/entitlement (déclarées seulement) → S8
❌ Data Grid, Filters, formulaires métier → S9 · ❌ Tests → S11
❌ Aucune page métier réelle
❌ Aucun composant `ui/` au-delà des 12 listés
❌ Rien de `full/src/auth/`, `full/src/pages/`, Supabase, Keenicons
❌ Aucun autre layout que le 21

---

## 12. SI LA VAGUE EST TROP GROSSE — dis-le

C'est le point le plus important de ce prompt.

En S2, une vague trop large a produit un **plan** de prélèvement au lieu du
prélèvement, sans que ce soit annoncé. Résultat : une vague perdue.

**Si tu constates en cours de route que tu ne peux pas tout finir :**

1. **Arrête-toi** à un état cohérent et compilable
2. Livre ce qui est fait — de préférence §3 (les 12 composants) + §5
   (`RadixDirectionProvider`) + §8 (règle ESLint), qui forment un tout utile
3. **Dis-le explicitement** dans le journal et dans ton rapport final
4. Ne produis **jamais** un document de plan à la place du travail

Une vague livrée à moitié et annoncée comme telle est un **bon** résultat.
Une vague annoncée complète et livrée à moitié coûte une vague de rattrapage.

---

## 13. CRITÈRES D'ACCEPTATION

**Chaque case doit être EXÉCUTÉE.** Ce qui ne peut pas l'être est **signalé, pas
coché** — c'est ce que tu as bien fait en S3a, continue.

### Technique

- [ ] `rm -rf node_modules && npm ci` passe **sans drapeau**
- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] Règle RTL vérifiée : un `ml-4` volontaire fait échouer le lint
- [ ] `grep -rE "(bg|text|border)-(slate|zinc|gray|blue)-[0-9]" src/ --include="*.tsx"` → **aucun résultat**
- [ ] Aucune chaîne d'interface en dur — tout passe par l'i18n
- [ ] `RadixDirectionProvider` réellement importé et monté
- [ ] `react-helmet-async` toujours absent de `package.json`
- [ ] `src/App.tsx` provisoire supprimé

### Visuel — **6 points**, pas 37

À vérifier au navigateur si tu le peux ; sinon **signale-le** et laisse
l'utilisateur trancher.

1. Le layout-21 s'affiche : rail + barre latérale + fil d'Ariane + contenu
2. Les 8 modules sont dans le rail ; cliquer change le menu de la barre latérale
3. La bascule clair/sombre fonctionne, sans zone illisible
4. En arabe : rail à droite, texte traduit, **menus déroulants ouverts du bon côté**
5. Le repli de la barre latérale fonctionne ; la page « large » occupe tout l'espace
6. Le menu utilisateur s'ouvre et est rempli

---

## 14. LIVRABLES

- `docs/prompts/2026-07-24-s3b-layout-composants.md` — ce prompt, tel quel
- `docs/journal/2026-07-24-s3b-layout-composants.md` — section **« Dérives &
  corrections » obligatoire**
- `docs/vendor-imports.md` — le manifeste
- `docs/decisions/2026-07-24-mode-large-sans-second-layout.md`
- `docs/STATUS.md` — S3b, prochaine action
- `docs/backlog/todo.md` — mis à jour

**Bloc de clôture chiffré** :

```
npm ci       sans drapeau : oui / non
tsc          exit —
eslint       — erreur(s)   règle RTL testée : oui / non
bundle       — ko initial / — ko total
couleurs     brutes restantes dans src/ : —
composants   — / 12 prélevés
layout-21    — / 19 fichiers
visuel       vérifié par l'agent : oui / non (si non, dire pourquoi)
```

**Commit unique** : `feat(s3b): layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint`
**Ne pousse pas** sans que je te le demande.

---

## 15. EN CAS DE BLOCAGE

Arrête-toi et signale si : `motion/react` ne résout pas · un composant prélevé
casse le build · un conflit de pairs apparaît · le RTL casse un élément que tu ne
sais pas corriger · une décision t'est nécessaire et n'est pas dans `reference/`.

**Ne force jamais, ne contourne jamais, ne remplace jamais le travail par un
plan.** Un blocage signalé coûte cinq minutes.
