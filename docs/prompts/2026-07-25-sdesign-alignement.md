# Prompt — Vague S-design — Alignement fin sur le template + page raccourcis

> **Destinataire : agent Claude Code n'ayant aucun contexte préalable sur ce projet.**
> À archiver dans `docs/prompts/2026-07-25-sdesign-alignement.md` — **avant la clôture**.

> **Numérotation** : vague nommée **S-design**. Purement visuelle et documentaire.
> Ne renumérote rien.

---

## 0. OÙ TU ES, ET COMMENT TE SITUER

### 0.1 Emplacement

```
/home/ubuntu/ostravel-front       ← le projet. Place-toi dedans avant toute action.
/home/ubuntu/vendor-metronic/starter-kit/   ← template Metronic de référence, LECTURE SEULE
```

Vérifie : `git remote -v` doit pointer vers `new-front-2026`.

Le layout-21 de référence est dans :
`/home/ubuntu/vendor-metronic/starter-kit/src/components/layouts/layout-21/`

### 0.2 Le projet en trois phrases

Back-office React 19 / Vite 7 d'un ERP tourisme, édité par **OctaSoft**, produit
**OS-TRAVEL**. Développement solo assisté par IA, par vagues documentées. Marchés :
Afrique du Nord, Moyen-Orient, Europe — **arabe RTL de premier plan.**

### 0.3 Lis ceci avant d'écrire une ligne

| Fichier | Contenu |
|---|---|
| `docs/STATUS.md` | État présent |
| `reference/README.md` | Règle de lecture seule |
| `reference/front-cadrage/01-front-architecture-decisions.md` | **ADR-F01** (Metronic = source), **ADR-F02** (layout unique), **ADR-F03** (tokens), **ADR-F04** (RTL) |
| `reference/front-cadrage/03-front-adr-ux-ia.md` | **ADR-F20.5** (raccourcis clavier) |
| `docs/journal/2026-07-25-s5ux-socle-interactions.md` | Le socle clavier que la page va documenter |

### 0.4 Deux règles absolues

**Tu ne modifies JAMAIS `reference/`** (intégrité SHA-256 en CI). Un document faux
se **signale**.

**Aucune règle métier inventée.** Doute → arrête-toi et demande.

### 0.5 Ce que l'historique enseigne

Incidents documentés, pour prévenir : une vague a **coché des critères faux**, une
autre a **contourné avec un drapeau sans le dire**, une autre a **produit un plan
au lieu du travail**. Les vagues récentes signalent au lieu de cocher. C'est le
niveau attendu.

---

## 1. GARDE-FOUS — VPS partagé, avec production

- ❌ Uniquement dans `/home/ubuntu/ostravel-front`
- ❌ Jamais `sudo`, jamais `npm install -g`
- ❌ Ne touche pas à nginx/systemd/pm2/docker/crontab/`~/.bashrc`/`~/.npmrc`/nvm
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ **Jamais `--force`, jamais `--legacy-peer-deps`**
- ❌ **Aucune nouvelle dépendance** — cette vague ne touche que du style et une page

Serveur de dev sur le port **5180**.

---

## 2. OBJECTIF

Deux livrables, tous deux autonomes (aucun backend) :

1. **Aligner finement** le layout sur le template Metronic — combler les petits
   écarts de finition relevés ci-dessous.
2. **Créer une page pédagogique des raccourcis clavier**, pour qu'Arbi comprenne
   ce que le socle interactions (vague S5-UX) a construit.

---

## 3. ALIGNEMENT SUR LE TEMPLATE

### 3.1 Constat mesuré — pas de grande dérive

Bonne nouvelle établie par comparaison directe : les **dimensions structurelles
sont déjà identiques** au template :

```
--sidebar-width: 300px   --sidebar-collapsed-width: 60px   --sidebar-header-height: 54px
```

Le rail utilise déjà les bonnes tailles (`size-7` pour l'icône active, `text-xs`,
`gap`, rayons identiques). **Ne casse pas ce qui est déjà bon.**

### 3.2 Les écarts réels à combler

La comparaison `sidebar-primary.tsx` projet vs template montre que le projet a
**perdu quelques classes de finition** présentes dans l'original :

- `size-3`, `size-4` — tailles d'icônes sur des éléments secondaires (chevrons,
  badges, icônes de menu)
- `rounded-md` — un rayon sur un élément que le projet a rendu autrement

**Méthode** : ouvre côte à côte, pour chaque composant du layout, la version
projet (`src/shared/layout/components/`) et la version template
(`/home/ubuntu/vendor-metronic/starter-kit/src/components/layouts/layout-21/components/`).
Reporte dans le projet les **valeurs de finition** du template : tailles d'icônes,
espacements internes, tailles de police, rayons, épaisseurs de trait — pour le
**rail**, la **sidebar**, l'**en-tête**, le **fil d'Ariane**.

**Contraintes impératives :**

- **Tokens uniquement** pour les couleurs (ADR-F03). **Aucune couleur Tailwind
  brute** (`slate-`, `zinc-`, `blue-`…). Le template utilise parfois des couleurs
  directes : tu les traduis en tokens (`text-muted-foreground`, `bg-accent`,
  `text-primary`…). C'est une transposition, pas une copie.
- **Propriétés logiques uniquement** (RTL) — `ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`,
  jamais `pl-`/`ml-`/`left-`. La règle ESLint refusera le reste.
- **i18n** — aucune chaîne en dur.
- Ne porte **pas** les 3 sections de démo du template (Workspaces / Communities /
  Resources) ni la `toolbar-menu` : elles ont été écartées à dessein en S3b
  (contenu de démo). La sidebar reste pilotée par notre configuration.

### 3.3 Les couleurs d'icônes du rail

Sur ta maquette de référence (capture Metronic), les icônes de modules dans le
rail sont **monochromes** — même teinte, l'icône active se distingue par un fond
coloré (le carré `bg-primary`), pas par une couleur d'icône différente.

**Décision déjà prise (ADR-F03, théming à identité unique)** : garde les icônes du
rail **monochromes** (`text-muted-foreground` au repos, fond `bg-primary` +
`text-primary-foreground` pour l'actif). **Ne réintroduis pas** les icônes
multicolores de certaines démos Metronic — elles contrediraient l'identité
visuelle unique.

Si tu as un doute sur une couleur précise, **signale-le** plutôt que de trancher.

---

## 4. LA PAGE DES RACCOURCIS CLAVIER

Objectif : une page **claire et pédagogique** qui montre à Arbi tout ce que le
socle clavier (vague S5-UX, `src/shared/keyboard/`) permet. C'est un outil de
compréhension, pas une fonctionnalité métier.

### 4.1 Emplacement

Route `/_dev/shortcuts` (préfixe `_dev` = temporaire, comme `/_dev/ux`). Inscris
au backlog « retirer /_dev/shortcuts et /_dev/ux quand les écrans métier
existent ».

### 4.2 Contenu

Lis d'abord `src/shared/keyboard/` pour lister les raccourcis **réellement**
implémentés — ne les invente pas, extrais-les du code.

La page présente, en sections lisibles :

- **Les raccourcis globaux** — `Ctrl+K` / `Cmd+K` (palette), `?` (aide), etc.
- **Les séquences à deux touches** — `g` puis `r`… avec explication du principe
  (deux touches successives, façon Gmail/Linear)
- **Chaque raccourci** affiché avec le composant `kbd` (déjà dans `src/shared/ui/`),
  son libellé traduit, et ce qu'il déclenche
- **Une zone d'essai en direct** : un encadré où Arbi peut appuyer sur une touche
  et voir s'afficher ce que le système a capté — **le `event.code` (position
  physique) ET le `event.key` (caractère)** côte à côte. C'est ce qui rend visible
  et compréhensible **pourquoi** les raccourcis se basent sur la position :
  Arbi pourra changer sa disposition clavier (français ↔ arabe) et constater que
  le `code` ne bouge pas alors que la `key` change.
- **Une note pédagogique courte** expliquant, en français simple, pourquoi la
  position physique et pas le caractère (robustesse au clavier arabe).

### 4.3 Contraintes

- Tokens uniquement, aucune couleur brute
- i18n (au moins fr, idéalement les 3) — mais les libellés de touches restent
  neutres
- RTL correct
- Accessible : la zone d'essai ne piège pas le focus, `Échap` en sort
- N'utilise **que** des composants existants de `src/shared/ui/`

---

## 5. HORS PÉRIMÈTRE

❌ Client API, backend, authentification, permissions réelles, écrans métier
❌ Nouvelles dépendances · ❌ Nouveaux composants dans `src/shared/ui/`
❌ Modification du noyau Money, du socle clavier lui-même, de l'i18n
❌ Réintroduction des sections de démo Metronic ou d'icônes multicolores
❌ Découpage de bundle · ❌ Chiffres arabo-indiens (reporté ADR-F04)

**Si un élément hors périmètre paraît nécessaire, tu te trompes de périmètre.**
Signale-le.

---

## 6. CRITÈRES D'ACCEPTATION

**Chaque case EXÉCUTÉE.** Non vérifiable → **signalé, pas coché.**

- [ ] `rm -rf node_modules && npm ci` passe **sans drapeau**
- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur
- [ ] `npm run test` → tous verts, nombre reporté
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] `grep -rE "(bg|text|border)-(slate|zinc|gray|blue|red|green)-[0-9]" src/ --include="*.tsx"` → **aucun résultat**
- [ ] Aucune classe directionnelle physique
- [ ] Aucune chaîne d'interface en dur
- [ ] Aucune dépendance ajoutée
- [ ] Les dimensions `--sidebar-width` etc. restent `300/60/54`
- [ ] La page `/_dev/shortcuts` liste des raccourcis **extraits du code**, pas inventés

### Visuel — à décrire dans le journal

- [ ] Le rail, la sidebar, l'en-tête sont visuellement proches du template
- [ ] Icônes du rail monochromes, actif distingué par le fond
- [ ] La page raccourcis s'affiche ; la zone d'essai montre `code` et `key`
- [ ] Clair/sombre et RTL arabe sans régression

Port non joignable → signale, laisse Arbi trancher le perceptuel.

---

## 7. LIVRABLES

- `docs/prompts/2026-07-25-sdesign-alignement.md` — ce prompt, tel quel
- `docs/journal/2026-07-25-sdesign-alignement.md` — section **« Dérives &
  corrections » obligatoire**. Liste précisément quelles classes de finition ont
  été reportées du template, composant par composant.
- `docs/STATUS.md` — S-design, prochaine action
- `docs/backlog/todo.md` — ajouter « retirer /_dev/shortcuts et /_dev/ux »
- `docs/vendor-imports.md` — mis à jour si des valeurs sont reprises du template

**Bloc de clôture chiffré** :

```
npm ci       sans drapeau : oui / non
tsc          exit —
eslint       — erreur(s), — avertissement(s)
vitest       — tests
bundle       — ko initial / — ko total
couleurs     brutes dans src/*.tsx : —
page         /_dev/shortcuts : raccourcis listés = —
```

**Commit unique** : `feat(sdesign): alignement fin sur template + page raccourcis clavier`
**Ne pousse pas** sans qu'on te le demande.

---

## 8. EN CAS DE BLOCAGE

Arrête-toi et signale si : une couleur du template n'a pas de token évident · un
report de finition casse le RTL · une décision manque dans `reference/`.

**Ne force jamais. Ne contourne jamais. Ne remplace jamais le travail par un
plan.**
