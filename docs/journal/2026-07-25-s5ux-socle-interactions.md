# Journal — Vague S5-UX — Socle d'interactions

**Date** : 2026-07-25
**État** : ✅ COMPLET côté technique (tout exécuté) ; **vérification comportementale
au navigateur laissée à l'utilisateur** (port 5180 non joignable — voir §Visuel)
**Résultat visé** : poser les fondations d'interaction d'ADR-F20 avant les écrans
métier.

---

## Résumé

Quatre fondations réutilisables sont posées, plus une page de démonstration
temporaire (`/_dev/ux`) qui les exerce :

1. **Registre de raccourcis clavier** (`src/shared/keyboard/`) — basé sur la
   **position physique** (`event.code`), séquences à deux touches, portées,
   découvrabilité `?`, accroche permissions (`when`, inerte). Cœur pur testable.
2. **Squelettes & estompage** (`src/shared/feedback/`) — `Skeleton*` (ADR-F20.3)
   et `StaleContent` (ADR-F20.4).
3. **Panneau ↔ URL + modale** (`src/shared/navigation/use-url-panel.ts`) —
   l'état d'ouverture vit dans l'URL (ADR-F20.2).
4. **Coquille de palette `Ctrl+K`** (`src/shared/command-palette/`) — ADR-F20.8,
   actions statiques de démo, i18n trilingue, RTL via `DirectionProvider`.

Prérequis manquants prélevés (ADR-F01) : composants `dialog`, `command`, `kbd`
depuis le vendor + dépendance `cmdk` (sans drapeau). Le `ShortcutProvider`, la
palette et l'aide `?` sont montés **globalement** dans `App.tsx`.

Outillage : **82 tests / 171 assertions** (15 nouveaux), tous verts. `npm ci`
sans drapeau, `tsc -b` → `dist` vide, lint 0 erreur, `check:reference` vert.

---

## Ce qui a été fait

### Fondation 1 — Raccourcis (ADR-F20.5)

`src/shared/keyboard/` : `types.ts`, `match.ts` (cœur **pur**, sans React ni
temps), `shortcut-provider.tsx` (un **unique** écouteur `keydown` sur `window`,
`useShortcut`/`useShortcutScope`/`useActiveShortcuts`), `shortcut-help.tsx`
(overlay `?`), `index.ts`.

- **Position physique `event.code`** — le point cardinal. Prouvé : `{code:'KeyR',
  key:'ق'}` déclenche un raccourci sur `KeyR` ; `{code:'KeyB', key:'r'}` ne le
  déclenche pas.
- **Séquences** `g` puis `r` avec délai d'expiration (1200 ms).
- **Inerte dans un champ** (input/textarea/select/contenteditable), sauf
  `allowInInput`.
- **Portées** : `global` par défaut, ou un id de contexte actif via
  `useShortcutScope`. La démo montre une portée `demo-panel` active seulement
  quand le panneau est ouvert.
- **Découvrabilité `?`** : liste les raccourcis actifs (Dialog + Kbd).
- **Accroche permissions** `when` : inerte si faux, **sans erreur** (S8).

### Fondation 2 — Squelettes & estompage (ADR-F20.3/.4)

`src/shared/feedback/` : `Skeleton`, `SkeletonText/Row/Card/Field` (formes grises
`animate-pulse`, tokens), et `StaleContent` (opacité réduite + `aria-busy`
pendant un rechargement). Placés **hors** de `ui/` (réservé aux prélèvements
ReUI, §6). Le câblage TanStack Query (`placeholderData`) viendra avec les listes.

### Fondation 3 — Panneau ↔ URL + modale (ADR-F20.1/.2)

`use-url-panel.ts` : hook sur `useSearchParams`, `?open=<id>`. La démo lie un
`Sheet` (panneau) à l'URL et un `Dialog` (modale, création rapide) à un état
local. Prouvé : ouvrir écrit le paramètre, fermer le retire, rendre `/?open=abc`
rouvre le panneau.

### Fondation 4 — Palette `Ctrl+K` (ADR-F20.8)

`command-palette.tsx` : `CommandDialog` + primitives cmdk. Ouverture par
**`Ctrl+K` / `Cmd+K` via le registre central** (position `KeyK`), pas un écouteur
local. Actions statiques de démo : aller à un module, basculer le thème, changer
de langue. Toutes étiquettes i18n (en/fr/ar). `preventDefault` neutralise le
`Ctrl+K` natif du navigateur.

### Page de démonstration

`src/app/pages/dev-ux.tsx`, route **`/_dev/ux`** (statique, placée avant le
catch-all `:module`). Marquée temporaire ; backlog « retirer la page de
démonstration UX ». i18n intégral. Aucune donnée factice hors `src/shared/dev/`.

### Intégration

`App.tsx` enveloppe le routeur de `ShortcutProvider` + `CommandPalette` +
`ShortcutHelp` (global, à l'intérieur du routeur car ils naviguent). Le
`src/shared/layout/` n'est **pas** modifié.

---

## Dérives & corrections

**Obligatoire, même vide.**

### 1. §6 du prompt inexact : `dialog`/`command`/`kbd` n'existaient pas — SIGNALÉ

Le prompt affirmait (§3.3, §3.4, §6) que `dialog`, `command`, `kbd` étaient
**déjà** dans `ui/` et interdisait d'ajouter des composants. **Faux** : S3b n'en
avait prélevé que 12 (sans ceux-là), et `cmdk` était absent. Deux des quatre
fondations en dépendent. J'ai **arrêté et signalé** avant d'écrire, plutôt que
contourner. Décision utilisateur : **prélever les 3 + `cmdk`** (copy-and-own,
ADR-F01), comme étape de la vague. Consigné dans `docs/vendor-imports.md`.
→ Pour le prochain prompt : ne pas présumer l'état de `ui/` ; le vérifier.

### 2. Dépendance `cmdk` ajoutée — signalée, sans drapeau

`cmdk@^1.1.1` installé pour `command.tsx`. `npm ci` reste vert **sans drapeau**,
0 conflit de pairs. `dialog`/`kbd` n'ont ajouté aucune dépendance (radix-ui déjà
là). Autorisé explicitement par l'utilisateur (dérive n°1).

### 3. Défaut ADR-F18 corrigé dans `dialog.tsx`

Le `dialog.tsx` du vendor portait le `export default DialogContent;` égaré
signalé par ADR-F18 — **retiré** au prélèvement. Deux fuites RTL corrigées :
`sm:space-x-2.5` → `sm:gap-2.5` ; centrage `left-[50%]`+translate conservé
(exception symétrique ADR-F04, commenté + `eslint-disable-next-line`).

### 4. `command.tsx` importait un paquet Radix absent — corrigé

Il importait `DialogProps` de `@radix-ui/react-dialog` (paquet séparé, non
installé — le projet utilise `radix-ui` unifié, comme noté en S3b). Type dérivé
de notre `Dialog`. Signalé, non contourné.

### 5. `App.tsx` modifié pour monter le socle globalement — dans le périmètre

§6 interdit de modifier **le layout** (`src/shared/layout/`), la palette, les
tokens, le noyau Money. `App.tsx` (composition racine) n'en fait pas partie :
c'est là que se montent des providers. Le socle d'interaction **doit** être
global (Ctrl+K, navigation g-r partout) — c'est l'intention d'ADR-F20. Aucun
fichier de `layout/` touché.

### 6. Interpolation i18n indisponible — évitée

Le `t` du provider i18n **ignore** l'argument `values` (pas d'interpolation
ICU — react-intl est en dépendance mais non branché). J'ai donc évité toute
interpolation (l'action « langue » affiche le nom natif de la langue). À
consolider quand react-intl sera réellement branché (ancienne « S4 » i18n).

### 7. `Ctrl+K` en conflit avec un raccourci navigateur — géré, signalé

`Ctrl+K` ouvre la barre de recherche de certains navigateurs. `preventDefault`
sur déclenchement éligible neutralise le conflit. Signalé (§9 du prompt).

### 8. Vulnérabilités npm préexistantes — NON traitées (hors périmètre)

`npm ci` signale 2 « high » sur **`react-router`** (préexistant, S3b ; SPA sans
mode RSC). `cmdk` n'en a ajouté aucune. `npm audit fix` non lancé (bump hors
périmètre, risque de non-déterminisme). Déjà au backlog (S4).

---

## Vérification visuelle / comportementale (§7)

**Contrainte de session** : je ne peux pas piloter un navigateur (port 5180 non
joignable, comme S3b/S3c). `npm run build` transforme 2081 modules sans erreur →
l'arbre complet (socle + 3 composants prélevés + cmdk) compile et résout. Je ne
coche pas ce que je n'ai pas vu à l'écran.

| Point comportemental | État |
| --- | --- |
| `Ctrl+K` ouvre la palette ; flèches + Entrée ; `Échap` ferme | logique + cmdk en place, à confirmer à l'œil |
| `g` puis `r` déclenche ; inerte dans un champ | **prouvé par test** (jsdom) ; rendu à confirmer |
| `?` ouvre la liste des raccourcis | en place, à confirmer |
| Ouvrir un panneau change l'URL ; coller l'URL rouvre | **prouvé par test** ; rendu à confirmer |
| Squelettes pendant un chargement simulé | en place, à confirmer |
| Arabe : palette et panneaux du bon côté | `DirectionProvider` monté + props logiques ; **à confirmer à l'œil** |

Les deux points « prouvés par test » le sont au niveau logique (jsdom, `event.code`,
URL). Le jugement **perceptuel** (côté RTL, animations, focus) revient à
l'utilisateur.

---

## Bloc de clôture chiffré

```
npm ci       sans drapeau : oui  (exit 0, node_modules supprimé au préalable)
tsc          exit 0        (rm -rf dist && npx tsc -b → dist reste vide)
eslint       0 erreur, 12 avertissements (react-refresh, bénins)
vitest       82 tests, 171 assertions, 11 fichiers — tous verts
bundle       602,34 ko JS initial (188,74 ko gzip) / 66,63 ko CSS (10,91 ko gzip)
             (+37 ko JS vs S4 : cmdk + dialog/command/kbd + socle monté globalement)
raccourcis   basés sur event.code : oui (prouvé)   testé RTL : partiel — code arabe
             prouvé en test (jsdom) ; rendu directionnel à confirmer au navigateur
```

---

## Critères d'acceptation — état réel

### Technique (tous exécutés)

- [x] `rm -rf node_modules && npm ci` **sans drapeau** (exit 0)
- [x] `npm run build` → succès
- [x] `npm run lint` → 0 erreur
- [x] `npm run test` → 82 tests, tous verts
- [x] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [x] `npm run check:reference` → succès
- [x] Aucune classe directionnelle physique dans le code S5-UX (règle ESLint ;
      seule exception : centrage `left-[50%]` dans `dialog.tsx`, commenté)
- [x] Aucune chaîne d'interface en dur (i18n en/fr/ar)
- [x] Raccourcis basés sur `event.code` — **prouvé par test**

### Comportemental

- [~] 6 points : logique en place/compilée ; **jugement perceptuel laissé à
  l'utilisateur** (port 5180 non joignable).

---

## Livrables

- ✅ `docs/prompts/2026-07-25-s5ux-socle-interactions.md`
- ✅ `docs/journal/2026-07-25-s5ux-socle-interactions.md` (ce fichier)
- ✅ `docs/decisions/2026-07-25-raccourcis-position-physique.md`
- ✅ `docs/vendor-imports.md` (section S5-UX : dialog/command/kbd + cmdk)
- ✅ `docs/STATUS.md` + `docs/backlog/todo.md` mis à jour

**Commit unique prévu** : `feat(s5ux): socle interactions — raccourcis clavier, squelettes, panneaux URL, palette`
(non poussé — attente de la demande explicite).

---

## Prochaine action

Validation visuelle de `/_dev/ux` (raccourcis, palette RTL) dès que le port est
joignable. Puis, selon priorité : consolidation i18n react-intl (ancienne « S4 »)
ou S5 client API (bloqué : `openapi.json`).
