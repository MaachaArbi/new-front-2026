# Prompt — Vague S3c — Finitions : mise en page & palette sombre

> À archiver dans `docs/prompts/2026-07-24-s3c-finitions.md` — **avant la clôture**.

---

Tu interviens sur le projet **front OS-TRAVEL** (éditeur : OctaSoft). C'est la
**vague S3c**, petite et purement visuelle, avec **un seul résultat** :

> **Le layout est correctement espacé, occupe toute la hauteur, et le thème
> sombre est reposant pour une journée de travail.**

S3b a livré le vrai layout-21 et il fonctionne. Deux défauts de mise en page ont
été relevés à l'usage, et la palette sombre doit être ajustée.

## 0. AVANT TOUTE CHOSE

Lis intégralement :

1. `reference/front-cadrage/01-front-architecture-decisions.md` — **ADR-F03**
   (tokens), **ADR-F02** (layout unique), **ADR-F04** (RTL)
2. `reference/front-cadrage/03-front-adr-ux-ia.md` — **ADR-F20**
3. `docs/journal/2026-07-24-s3b-layout-composants.md`
4. `docs/vendor-imports.md`

**Règle absolue** : aucune décision déduite ou supposée si elle n'est pas dans
`reference/`. En cas de doute : **arrête-toi et demande**. Tu ne modifies jamais
`reference/`.

## 1. GARDE-FOUS — VPS partagé

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend)
- ❌ **Jamais `--force`, jamais `--legacy-peer-deps`** — `npm ci` doit rester vert
- ❌ **Aucune nouvelle dépendance.** Cette vague ne touche que du CSS et de la
  mise en page. Si tu penses en avoir besoin, **arrête-toi et signale**.

---

## 2. DÉFAUT 1 — Le contenu colle au menu latéral

**Constaté à l'écran** : le fil d'Ariane et le titre de page commencent
immédiatement au bord de la barre latérale, sans respiration.

**Cause identifiée dans la source d'origine** : l'enveloppe principale du
layout-21 n'a **aucun padding horizontal**. L'espacement vient d'ailleurs — le
`bodyClassName` du `LayoutProvider` pose :

```
lg:[&_.container-fluid]:px-7.5
```

Chaque page doit donc envelopper son contenu dans une `container-fluid` pour
obtenir ses 30 px de marge. Sans cette enveloppe, le contenu se colle au bord.

**Correction demandée** : ne dépends pas de la discipline de chaque page.
**Porte le padding horizontal sur l'enveloppe principale elle-même**, une fois
pour toutes.

Contraintes :

- **Propriétés logiques uniquement** — `ps-`/`pe-` ou `px-` (symétrique, donc
  neutre en RTL). Jamais `pl-`/`pr-`. La règle ESLint le refusera de toute façon.
- Le padding doit être **plus faible sur mobile** que sur grand écran.
- Vérifie que le rendu reste correct en RTL.

---

## 3. DÉFAUT 2 — Le panneau ne descend pas jusqu'en bas

**Constaté à l'écran** : le panneau blanc de contenu s'arrête à mi-hauteur, une
bande vide apparaît en dessous.

**Cause probable** : l'enveloppe utilise `grow` avec `lg:overflow-y-auto`. Pour
que `grow` produise un effet, **toute la chaîne parente doit établir une hauteur
pleine** — racine React et `body` en colonne flexible sur toute la hauteur. Le
coin arrondi et la marge droite s'appliquent déjà, donc `--page-margin` est bien
en place : c'est la chaîne de hauteur qui est incomplète.

**Correction demandée** : rétablis la chaîne de hauteur (`h-screen`,
`flex flex-col`, `min-h-0` là où c'est nécessaire) pour que le panneau occupe
tout l'espace restant, marge basse comprise.

Vérifie les deux cas :

- **page courte** (contenu minimal) → le panneau descend quand même jusqu'en bas
- **page longue** (contenu qui dépasse) → le panneau défile **à l'intérieur**,
  la page entière ne défile pas

---

## 4. LA PALETTE SOMBRE

### 4.1 Ce qui ne va pas aujourd'hui

Deux défauts mesurés sur la palette actuelle (`tokens.css`, bloc `.dark`) :

| Constat                                                           | Mesure                                      |
| ----------------------------------------------------------------- | ------------------------------------------- |
| `--muted-foreground` (`zinc-500`) sur `--background` (`zinc-950`) | **4,12:1** — sous le seuil WCAG AA de 4,5:1 |
| `--card` et `--background` valent **la même couleur**             | aucun relief, rendu plat                    |

Le premier point concerne tout le texte gris : sous-titres, libellés, en-têtes de
colonnes, métadonnées. Le second explique la sensation de platitude.

### 4.2 Principe retenu

Trois niveaux de surface, pas un — c'est ce qui repose l'œil sur une journée :

```
rail et menu latéral   le plus sombre
fond de page           intermédiaire
cartes et panneaux     le plus clair
```

Plus : **pas de noir pur en fond, pas de blanc pur en texte**. Le blanc pur sur
fond très sombre crée un halo fatigant.

### 4.3 Valeurs cibles (mode sombre uniquement)

| Token                               | Valeur    | Rôle                    |
| ----------------------------------- | --------- | ----------------------- |
| `--background`                      | `#1f1f23` | fond de page            |
| `--card`, `--popover`               | `#27272a` | panneaux, cartes, menus |
| `--sidebar` (rail et menu)          | `#18181b` | le plus sombre          |
| `--foreground`, `--card-foreground` | `#e4e4e7` | texte principal, adouci |
| `--muted-foreground`                | `#a1a1aa` | texte secondaire        |
| `--border`, `--input`               | `#3f3f46` | traits                  |

Si le layout-21 n'utilise pas de token dédié pour le rail et le menu, **ajoute-le**
plutôt que d'écrire la couleur en dur dans un composant.

Contrastes attendus, **à mesurer et reporter dans le journal** :

```
texte principal / fond      ≈ 12,9:1
texte principal / carte     ≈ 11,7:1
texte secondaire / fond     ≈  6,4:1
texte secondaire / carte    ≈  5,8:1
```

**Le mode clair n'est pas modifié.** `--primary` y reste `blue-600` (acquis S3a).

### 4.4 Couleurs d'état — pastel

Préférence produit actée : teintes douces et désaturées, sur un outil ouvert toute
la journée. **Le pastel s'applique aux couleurs, jamais au contraste du texte.**

Pattern : fond très sourd + texte clair de la même famille.

| État                       | Fond      | Texte     |
| -------------------------- | --------- | --------- |
| Succès / payé              | `#16291f` | `#86efac` |
| Danger / en retard         | `#2a1a1c` | `#fca5a5` |
| Avertissement / en attente | `#2a2415` | `#fcd34d` |
| Neutre / brouillon         | `#232326` | `#a1a1aa` |
| Information                | `#1b2436` | `#93c5fd` |

Tous vérifiés entre 6:1 et 11:1 — largement conformes.

**Le bouton d'accent reste `blue-600` avec texte blanc** (5,17:1). C'est le seul
élément vif de l'interface ; il est rare, donc il ne fatigue pas, et il doit se
repérer instantanément dans une page dense.

> ⚠️ **Piège** : un bouton en bleu pastel avec texte blanc donne 2,5:1 et devient
> illisible. Si un bouton pastel est introduit un jour, son texte doit être
> **foncé**, pas blanc.

### 4.5 Règle transverse

**Jamais la couleur seule pour porter un sens.** Chaque état porte aussi un mot
ou une icône — exigence WCAG, et indispensable pour les 8 % d'hommes qui
distinguent mal rouges et verts.

En pratique pour cette vague : si tu ajoutes des pastilles d'état, elles sont
**écrites**, pas seulement colorées.

---

## 5. DENSITÉ DE LA BARRE LATÉRALE

À l'usage, la barre latérale paraît vide. Enrichis le contenu factice de
`src/shared/dev/` :

- **5 à 8 entrées par module**, avec des libellés métier réalistes tirés des
  modèles conceptuels (`reference/conceptual-models/` s'il est rempli, sinon
  reste générique mais crédible)
- Un ou deux **groupes de section** dans le menu (un intitulé au-dessus d'un
  bloc d'entrées) pour donner du rythme
- Un ou deux **badges** (compteur, mention « nouveau ») pour vérifier leur rendu

**Contraintes** : tout reste dans `src/shared/dev/`, préfixé `mock-`. Toutes les
étiquettes passent par l'i18n, dans les **trois langues**, arabe compris avec du
vrai texte arabe. La ligne « supprimer les données factices » reste ouverte au
backlog.

---

## 6. HORS PÉRIMÈTRE

❌ Client API, appels réseau → S5 · ❌ Authentification → S6 · ❌ `Money` → S7
❌ Permissions et entitlements → S8 · ❌ Data Grid, formulaires → S9
❌ Tests → S11 · ❌ Aucune page métier réelle
❌ Aucun composant `ui/` supplémentaire
❌ Aucun découpage de bundle / chargement paresseux — noté au backlog, pas ici
❌ Aucune nouvelle dépendance

**Si tu penses qu'un élément hors périmètre est nécessaire, c'est que tu te
trompes sur le périmètre.** Signale-le.

---

## 7. CRITÈRES D'ACCEPTATION

**Chaque case doit être EXÉCUTÉE.** Ce qui ne peut pas l'être est **signalé, pas
coché** — c'est ce que tu as bien fait en S3a et S3b, continue.

### Technique

- [ ] `rm -rf node_modules && npm ci` passe **sans drapeau**
- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] `grep -rE "(bg|text|border)-(slate|zinc|gray|blue|red|green)-[0-9]" src/ --include="*.tsx"` → **aucun résultat**
- [ ] Aucune classe directionnelle physique (la règle ESLint le garantit)
- [ ] Aucune chaîne d'interface en dur
- [ ] Aucune dépendance ajoutée à `package.json`
- [ ] Les 4 contrastes du §4.3 mesurés et reportés

### Visuel — **5 points**

À vérifier au navigateur si tu le peux ; sinon **signale-le** et laisse
l'utilisateur trancher.

1. Le contenu ne colle plus au menu, en LTR **et** en RTL
2. Le panneau descend jusqu'en bas — testé sur page courte **et** page longue
3. En sombre : trois niveaux distincts visibles (rail, fond, cartes)
4. En sombre : aucun texte difficile à lire, nulle part
5. La barre latérale paraît remplie, dans les trois langues

---

## 8. LIVRABLES

- `docs/prompts/2026-07-24-s3c-finitions.md` — ce prompt, tel quel
- `docs/journal/2026-07-24-s3c-finitions.md` — section **« Dérives &
  corrections » obligatoire**
- `docs/decisions/2026-07-24-palette-sombre-trois-niveaux.md` — pourquoi trois
  niveaux de surface, pourquoi le texte n'est pas adouci en contraste, pourquoi
  le pastel s'applique aux couleurs et pas au texte
- `docs/vendor-imports.md` — mis à jour si un fichier est retouché
- `docs/STATUS.md` — S3c, prochaine action : **S5 — client API**
- `docs/backlog/todo.md` — ajouter : « découpage de bundle / chargement paresseux
  des routes (bundle à 559 ko après S3b) »

**Bloc de clôture chiffré** :

```
npm ci       sans drapeau : oui / non
tsc          exit —
eslint       — erreur(s), — avertissement(s)
bundle       — ko initial / — ko total
contrastes   principal/fond —:1   secondaire/fond —:1   secondaire/carte —:1
couleurs     brutes dans src/*.tsx : —
visuel       vérifié par l'agent : oui / non (si non, dire pourquoi)
```

**Commit unique** : `feat(s3c): mise en page corrigée, palette sombre à trois niveaux, états pastel`
**Ne pousse pas** sans que je te le demande.

---

## 9. EN CAS DE BLOCAGE

Arrête-toi et signale si : la chaîne de hauteur casse le défilement interne · un
token attendu n'existe pas dans le layout · un contraste mesuré est sous 4,5:1 ·
une décision t'est nécessaire et n'est pas dans `reference/`.

**Ne force jamais, ne contourne jamais, ne remplace jamais le travail par un
plan.**
