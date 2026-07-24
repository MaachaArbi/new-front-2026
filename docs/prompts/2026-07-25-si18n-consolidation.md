# Prompt — Vague S-i18n — Consolidation FormatJS / react-intl

> **Destinataire : agent Claude Code n'ayant aucun contexte préalable sur ce projet.**
> À archiver dans `docs/prompts/2026-07-25-si18n-consolidation.md` — **avant la clôture**.

> **Numérotation** : vague nommée **S-i18n**. Elle réalise la « consolidation i18n »
> inscrite au backlog. Ne renumérote rien d'autre.

---

## 0. OÙ TU ES, ET COMMENT TE SITUER

### 0.1 Emplacement

```
/home/ubuntu/ostravel-front       ← le projet. Place-toi dedans avant toute action.
/home/ubuntu/ostravel             ← le backend Symfony. LECTURE SEULE, hors sujet ici.
/home/ubuntu/vendor-metronic/     ← template sous licence. Hors sujet ici.
```

Vérifie : `git remote -v` doit pointer vers `new-front-2026`.

### 0.2 Le projet en trois phrases

Back-office React/Vite d'un ERP pour agences de voyages, édité par **OctaSoft**,
produit **OS-TRAVEL**. Développement **solo, assisté par IA**, par vagues
documentées. Marchés : Afrique du Nord, Moyen-Orient, Europe — **l'arabe est une
langue de premier plan, avec ses six formes de pluriel.**

### 0.3 Lis ceci avant d'écrire une ligne

| Fichier | Ce que tu y trouves |
|---|---|
| `docs/STATUS.md` | L'état à l'instant présent |
| `reference/README.md` | La règle de lecture seule |
| `reference/front-cadrage/01-front-architecture-decisions.md` | **ADR-F06 (i18n) — le cœur de cette vague**, et ADR-F04 (RTL) |
| `docs/journal/2026-07-25-s5ux-socle-interactions.md` | La vague précédente, qui a **révélé le besoin** (dérive n°6) |

### 0.4 Deux règles absolues

**Tu ne modifies JAMAIS `reference/`.** Intégrité vérifiée par SHA-256 en CI
(`npm run check:reference`). Un document faux se **signale**, ne se corrige pas.

**Aucune règle métier déduite, supposée ou inventée.** Doute → tu t'arrêtes et
tu demandes.

### 0.5 Ce que l'historique enseigne

Incidents documentés, pour prévenir :

1. Une vague a **coché des critères faux** → deux vagues de rattrapage.
2. Une vague a **contourné avec un drapeau sans le signaler** → `npm ci` cassé
   sur machine neuve.
3. Une vague a **produit un plan à la place du travail**.

Les vagues récentes signalent au lieu de cocher, et détectent les vrais
problèmes. C'est le niveau attendu.

---

## 1. GARDE-FOUS — VPS partagé, avec de la production

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend) — lecture seule
- ❌ **Jamais `--force`, jamais `--legacy-peer-deps`.** `npm ci` doit rester vert
  sans drapeau. Conflit de pairs → **signale**.

Serveur de dev sur le port **5180**.

---

## 2. LE PROBLÈME

L'internationalisation a été bricolée à la main en vague S2. La fonction de
traduction actuelle, dans `src/app/providers/i18n-provider.tsx`, est **exactement** :

```ts
const t = (key: string): string => {
  return messages[currentLanguage][key] || key
}
```

Elle prend une clé, rend une chaîne. **Aucune interpolation, aucun pluriel.**

Conséquences, révélées par la vague S5-UX (dérive n°6) :

- **Impossible d'insérer une variable** : « Bonjour {nom} », « {count} factures
  en retard », « Solde insuffisant : {montant} » — tout cela est hors de portée.
- **Impossible de gérer les pluriels arabes** : l'arabe a **six formes** (zéro,
  un, deux, quelques, beaucoup, autre), le français en a deux. Un simple
  `count === 1 ? a : b` est faux en arabe.

Ce n'est pas un défaut cosmétique : **chaque futur écran métier** butera dessus
(messages d'erreur avec montant, titres avec nom de client, compteurs). C'est un
**prérequis** aux écrans métier, pas du nettoyage optionnel.

---

## 3. LA SOLUTION — react-intl (déjà prévue par ADR-F06)

**`react-intl` (FormatJS) est déjà déclaré dans `package.json` (`^7`)** mais
n'est pas utilisé. Il apporte nativement :

- **ICU MessageFormat** : interpolation `{name}` et pluriels `{count, plural, ...}`
  corrects dans les six formes arabes
- Les API `Intl` natives (formatage de dates, nombres) — cohérent avec le noyau
  `Money` qui s'appuie déjà sur `Intl.NumberFormat`

### État actuel mesuré

- **122 clés** par catalogue, identiques en `en` / `fr` / `ar`
- **13 fichiers** appellent `t()` via `useI18n()`
- Catalogues dans `src/shared/i18n/messages/{en,fr,ar}.json`

C'est une migration nette, pas un chantier : périmètre connu et borné.

---

## 4. CE QU'IL FAUT FAIRE

### 4.1 Remplacer le provider

Remplace le provider maison par `IntlProvider` de react-intl, **en préservant ce
qui fonctionne déjà** :

- la bascule de langue et sa persistance (localStorage)
- l'application de `dir` et `lang` sur `<html>`
- **`RadixDirectionProvider`** monté autour de l'arbre (piège RTL de S3b — sans
  lui, les menus Radix s'ouvrent du mauvais côté en arabe). **Ne le retire pas.**
- la langue par défaut (`fr`)

### 4.2 Préserver l'API d'appel, ou la migrer proprement

13 fichiers utilisent `useI18n()` avec `const { t } = useI18n()` et
`const { currentLanguage, setLanguage } = useI18n()`.

Deux options, à toi de choisir la plus propre :

- **soit** garder un hook `useI18n()` compatible qui enveloppe `useIntl()` — moins
  de fichiers touchés
- **soit** migrer les 13 fichiers vers l'API react-intl standard
  (`useIntl().formatMessage`, `<FormattedMessage>`)

Dans les deux cas : **`currentLanguage` et `setLanguage` doivent continuer de
fonctionner** — ils sont utilisés par le sélecteur de langue et par le noyau
`Money` (`money-input.tsx`) pour le formatage localisé. Ne casse pas ces
appelants.

### 4.3 Migrer les catalogues au format ICU

Les 122 clés existantes sont des chaînes simples : elles migrent telles quelles.

**Ajoute des clés de démonstration ICU** — au moins :

- une avec **interpolation** : `"greeting": "Bonjour {name}"` / `"مرحبا {name}"`
- une avec **pluriel**, dans les trois langues, **l'arabe avec ses vraies formes** :

```json
// en
"invoices.count": "{count, plural, =0 {No invoices} one {# invoice} other {# invoices}}"
// fr
"invoices.count": "{count, plural, =0 {Aucune facture} one {# facture} other {# factures}}"
// ar — six formes
"invoices.count": "{count, plural, zero {لا فواتير} one {فاتورة واحدة} two {فاتورتان} few {# فواتير} many {# فاتورة} other {# فاتورة}}"
```

Les trois catalogues restent **synchronisés** : mêmes clés partout.

### 4.4 Corriger le contournement de S5-UX

La palette de commandes (`src/shared/command-palette/`) a contourné l'absence
d'interpolation (dérive n°6 de S5-UX). Repère ce contournement et remplace-le par
un appel react-intl propre.

### 4.5 Nettoyage — pendant qu'on y est

Deux dettes signalées, à traiter **seulement si c'est sans risque** :

- **12 avertissements `react-refresh/only-export-components`** (bénins, accumulés).
  Si un fichier exporte à la fois un composant et une constante/hook, sépare-les.
  **Ne force pas** si ça complique — signale ce qui reste.
- **Vulnérabilités `react-router`** (2 high, signalées en S3b) : lance
  `npm audit`, rapporte l'état, **n'applique pas** `npm audit fix` sans vérifier
  que ça ne casse rien. Si le correctif exige une montée de version majeure,
  **arrête-toi et signale** — ce n'est pas le sujet de cette vague.

---

## 5. CONTRAINTES TRANSVERSES

- **Aucune chaîne d'interface en dur** — tout via react-intl.
- **RTL** : aucune classe directionnelle physique (règle ESLint active).
- **Les trois catalogues restent synchronisés** — mêmes clés.
- **TypeScript strict**, pas de `any`.
- **Ne casse pas `money-input.tsx`** — il consomme `currentLanguage`.

---

## 6. HORS PÉRIMÈTRE

❌ Client API → S5 (bloqué : pas d'`openapi.json`)
❌ Authentification → S6 · ❌ Permissions → S8 · ❌ Écrans métier
❌ Chiffres arabo-indiens (٠١٢٣) — reporté par ADR-F04, **ne tranche pas**
❌ Calendrier hégirien — reporté, ne traite pas
❌ Découpage de bundle → backlog
❌ Aucune modification du layout, de la palette, du noyau Money, du socle clavier

**Si un élément hors périmètre paraît nécessaire, tu te trompes sur le
périmètre.** Signale-le.

---

## 7. CRITÈRES D'ACCEPTATION

**Chaque case EXÉCUTÉE.** Non vérifiable → **signalé, pas coché.**

- [ ] `rm -rf node_modules && npm ci` passe **sans drapeau**
- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur
- [ ] `npm run test` → tous verts, **nombre reporté** (ajoute un test qui prouve
      le pluriel arabe : `count=2` rend la forme duel, `count=3` la forme « few »)
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] `react-intl` réellement importé et monté
- [ ] Le provider maison `t()` sans interpolation n'existe plus
- [ ] Les 3 catalogues ont le **même nombre de clés**
- [ ] `currentLanguage` / `setLanguage` fonctionnent encore (sélecteur + Money)
- [ ] Interpolation démontrée (`{name}`) et pluriel arabe démontré par test
- [ ] Aucune chaîne d'interface en dur introduite
- [ ] Aucune dépendance ajoutée hors react-intl (déjà déclaré)

### Comportemental — à décrire dans le journal

- [ ] Bascule fr/en/ar fonctionne toujours
- [ ] Une phrase avec variable s'affiche correctement dans les trois langues
- [ ] Le RTL arabe n'a pas régressé (menus, palette du bon côté)

Port non joignable → signale et laisse l'utilisateur trancher le perceptuel.

---

## 8. LIVRABLES

- `docs/prompts/2026-07-25-si18n-consolidation.md` — ce prompt, tel quel
- `docs/journal/2026-07-25-si18n-consolidation.md` — section **« Dérives &
  corrections » obligatoire**
- `docs/decisions/2026-07-25-i18n-react-intl-icu.md` — pourquoi react-intl remplace
  le provider maison, pourquoi ICU est nécessaire (interpolation + six formes
  arabes), ce que ça débloque pour les écrans métier
- `docs/STATUS.md` — S-i18n, prochaine action
- `docs/backlog/todo.md` — cocher la consolidation i18n ; mettre à jour l'état des
  warnings react-refresh et de l'audit react-router

**Bloc de clôture chiffré** :

```
npm ci       sans drapeau : oui / non
tsc          exit —
eslint       — erreur(s), — avertissement(s)  (était 12)
vitest       — tests, — assertions
bundle       — ko initial / — ko total
i18n         interpolation : oui/non   pluriel arabe (6 formes) testé : oui/non
audit        react-router : état rapporté
```

**Commit unique** : `feat(si18n): migration react-intl, interpolation + pluriels ICU`
**Ne pousse pas** sans qu'on te le demande.

---

## 9. EN CAS DE BLOCAGE

Arrête-toi et signale si : react-intl v7 entre en conflit avec React 19 · la
migration d'un des 13 fichiers casse un comportement · le correctif react-router
exige une montée majeure · une décision manque dans `reference/`.

**Ne force jamais. Ne contourne jamais. Ne remplace jamais le travail par un
plan.** Un blocage signalé coûte cinq minutes ; un contournement silencieux a déjà
coûté deux vagues à ce projet.
