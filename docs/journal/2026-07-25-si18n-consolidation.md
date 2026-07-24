# Journal — Vague S-i18n — Consolidation FormatJS / react-intl

**Date** : 2026-07-25
**État** : ✅ COMPLET côté technique (tout exécuté) ; **bascule perceptuelle
fr/en/ar au navigateur laissée à l'utilisateur** (port 5180 non joignable)
**Résultat visé** : remplacer le provider i18n maison (sans interpolation ni
pluriel) par react-intl / ICU, prérequis aux écrans métier.

---

## Résumé

Le provider maison de S2 (`t = messages[lang][key] || key`, ni interpolation ni
pluriel) est remplacé par **`IntlProvider` de react-intl** (déjà déclaré,
`^7.1.14`). L'API `useI18n()` est **préservée** (`t`, `currentLanguage`,
`setLanguage`) — `t(key, values)` délègue désormais à `intl.formatMessage`. Les
13 appelants sont inchangés ; seul le contournement de la palette (S5-UX, dérive
n°6) est corrigé en interpolation réelle. Deux clés de démonstration ICU ajoutées
(interpolation + pluriel), l'arabe avec ses **six formes**. Catalogues à **124
clés**, synchronisés. **91 tests / 191 assertions**, tous verts.

Aucune dépendance ajoutée (react-intl était déjà là). `npm ci` sans drapeau,
`tsc -b` → `dist` vide, lint 0 erreur, `check:reference` vert.

---

## Ce qui a été fait

### Provider (§4.1)

`src/app/providers/i18n-provider.tsx` réécrit : `IntlProvider` (locale courante,
`defaultLocale='fr'`, messages du catalogue, `onError` qui fait retomber une
traduction manquante **silencieusement sur la clé**). **Préservés** : bascule +
persistance `localStorage('i18n-language')`, `dir`/`lang` sur `<html>`, langue
par défaut `fr`, et **`RadixDirectionProvider`** (piège RTL S3b — non retiré).

### API d'appel (§4.2) — option « wrapper compatible »

Choix : garder `useI18n()` (moins de surface de régression) plutôt que migrer 13
fichiers vers `useIntl`. `useI18n` enveloppe `useIntl` : `t(key, values?)` =
`intl.formatMessage({ id: key }, values)`. `currentLanguage`/`setLanguage`
inchangés (sélecteur de langue **et** `money-input.tsx`). Les 13 appelants
compilent sans modification.

### Catalogues ICU (§4.3)

Les 122 clés simples migrent telles quelles (ICU les traite comme littéraux).
Ajout de 2 clés de démonstration (→ 124) :

- `greeting` — interpolation : « Hello {name} » / « Bonjour {name} » / « مرحبا {name} ».
- `invoices.count` — pluriel : en/fr (=0, one, other), **ar six formes** (zero,
  one, two, few, many, other).

Les trois catalogues restent **synchronisés** (124 = 124 = 124).

### Correction du contournement S5-UX (§4.4)

`command-palette.tsx` faisait `` `${t('palette.action.language')} · ${lang.name}` ``
(concaténation, faute d'interpolation). Remplacé par un appel ICU réel :
`t('palette.action.language', { language: lang.name })`, et la clé passe à
« Passer en {language} » / « Switch to {language} » / « التبديل إلى {language} ».

### Tests (§7)

`src/shared/i18n/i18n.test.tsx` (9 tests) :
- **interpolation** dans les trois langues ;
- **pluriel arabe, six formes** : `count=0`→« لا فواتير », `1`→« فاتورة واحدة »,
  **`2`→« فاتورتان » (duel — la preuve clé)**, `3`→forme « few » (« فواتير »),
  `11`→forme « many » (« فاتورة », distincte de « few ») ;
- pluriel français (0/1/2) ;
- `useI18n` : défaut `fr`, interpolation via `t()`, bascule fr→en→ar avec
  persistance ; clé absente → repli silencieux sur la clé (pas de crash).

---

## Dérives & corrections

**Obligatoire, même vide.**

### 1. Nettoyage react-refresh (§4.5) — partiellement hors de portée, SIGNALÉ

Les 12 avertissements `react-refresh/only-export-components` subsistent (aucun
ajouté par cette vague). Répartition :
- **Fichiers vendor `ui/`** (`avatar`, `badge`, `button`, `input`, `kbd`) : ils
  exportent une variante `cva` à côté du composant. Non touchés (prélèvements
  ReUI, on ne les diverge pas pour un avertissement HMR bénin).
- **Socle clavier** (`shortcut-provider.tsx` : provider + hooks, + un
  `react-hooks/exhaustive-deps` « complex expression ») : **§6 interdit de
  modifier le socle clavier**. Laissés tels quels.
- **`i18n-provider.tsx`** (provider + `useI18n`) : pattern context+hook idiomatique.
  Le « corriger » imposerait de déplacer `useI18n` et de retoucher 14 imports
  d'appelants — churn disproportionné pour un avertissement HMR, contraire à
  « ne force pas » (§4.5).

Décision : **signaler, ne pas forcer.** Ce sont des avertissements de confort de
rechargement à chaud, sans effet sur le build ni la correction. État reporté au
backlog.

### 2. Vulnérabilités `react-router` — correctif = montée MAJEURE, SIGNALÉ, non appliqué

`npm audit` : 2 « high » sur `react-router` (installé `react-router-dom@7.18.1`).
`npm audit fix --dry-run` : la vulnérabilité **persiste après le fix semver** — le
correctif exige **react-router 8.x** (montée de version **majeure**). Conformément
à §4.5, **je n'applique pas** `npm audit fix` (ni `--force`) : hors périmètre
S-i18n, risque de casse du routeur. À traiter dans une montée de version contrôlée
dédiée. Le dry-run n'a **rien écrit** (`--dry-run`).

### 3. Bundle +~60 ko — attendu, noté

react-intl + le parseur ICU pèsent : 602 → **663 ko** JS initial. Le découpage de
bundle est déjà au backlog (dette S3b) ; cette vague ne le traite pas (§6).

### 4. Chiffres arabo-indiens — non tranché (ADR-F04)

Le `#` d'ICU s'affiche dans le système de chiffres par défaut d'`Intl` (arabo-
indien en locale `ar`, ex. « ٣ فواتير »). C'est le **comportement par défaut**, non
une décision : ADR-F04 reporte le sujet, je ne tranche pas. Les tests de forme de
pluriel évitent d'asserter les glyphes de chiffres (ils vérifient le **mot**
sélectionné), pour rester robustes à ce choix futur.

---

## Vérification comportementale (§7)

**Contrainte** : pas de pilotage navigateur (port 5180 non joignable, comme
S3b/S3c/S5-UX). `npm run build` transforme les modules sans erreur → l'arbre
complet (IntlProvider + 13 appelants + Money + socle) compile et résout.

| Point | État |
| --- | --- |
| Bascule fr/en/ar fonctionne | **prouvé par test** (jsdom) ; rendu à confirmer |
| Phrase avec variable dans les 3 langues | **prouvé par test** ; rendu à confirmer |
| RTL arabe non régressé (menus, palette) | `RadixDirectionProvider` préservé ; **à confirmer à l'œil** |

Les points « prouvés par test » le sont au niveau logique (interpolation, pluriel,
bascule, persistance). Le perceptuel (RTL, rendu des glyphes) revient à
l'utilisateur.

---

## Bloc de clôture chiffré

```
npm ci       sans drapeau : oui  (exit 0, node_modules supprimé au préalable)
tsc          exit 0        (rm -rf dist && npx tsc -b → dist reste vide)
eslint       0 erreur, 12 avertissements  (était 12 ; aucun ajouté — voir dérive n°1)
vitest       91 tests, 191 assertions, 12 fichiers — tous verts
bundle       663,35 ko JS initial (206,30 ko gzip) / 66,89 ko CSS (10,93 ko gzip)
             (+~60 ko JS vs S5-UX : react-intl + parseur ICU)
i18n         interpolation : oui   pluriel arabe (6 formes) testé : oui
audit        react-router : 2 high — correctif = montée MAJEURE (react-router 8),
             NON appliqué (hors périmètre, §4.5) ; état rapporté
```

---

## Critères d'acceptation — état réel

- [x] `rm -rf node_modules && npm ci` **sans drapeau** (exit 0)
- [x] `npm run build` → succès
- [x] `npm run lint` → 0 erreur
- [x] `npm run test` → 91 tests, tous verts
- [x] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [x] `npm run check:reference` → succès
- [x] `react-intl` réellement importé et monté (`IntlProvider`)
- [x] Le provider maison `t()` sans interpolation **n'existe plus**
- [x] Les 3 catalogues ont le **même nombre de clés** (124)
- [x] `currentLanguage` / `setLanguage` fonctionnent encore (test + Money intact)
- [x] Interpolation `{name}` **et** pluriel arabe **prouvés par test**
- [x] Aucune chaîne d'interface en dur introduite
- [x] Aucune dépendance ajoutée (react-intl déjà déclaré)

Comportemental : logique prouvée par test ; jugement perceptuel laissé à
l'utilisateur (port non joignable).

---

## Livrables

- ✅ `docs/prompts/2026-07-25-si18n-consolidation.md`
- ✅ `docs/journal/2026-07-25-si18n-consolidation.md` (ce fichier)
- ✅ `docs/decisions/2026-07-25-i18n-react-intl-icu.md`
- ✅ `docs/STATUS.md` + `docs/backlog/todo.md` mis à jour

**Commit unique prévu** : `feat(si18n): migration react-intl, interpolation + pluriels ICU`
(non poussé — attente de la demande explicite).

---

## Prochaine action

Validation perceptuelle fr/en/ar au navigateur (interpolation, RTL). Puis, selon
priorité : S6 (authentification, `core_mfa_*` existent) ou S5 client API (bloqué :
`openapi.json`). Dette : découpage de bundle (663 ko), react-refresh, react-router 8.
