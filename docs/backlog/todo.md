# Backlog — TODO

## Socle

- [x] **S1** — Squelette & purge (2026-07-23)
- [x] **S1-bis** — Corrections & protection `reference/` (2026-07-24)
- [x] **S2** — Socle visuel (infrastructure i18n/thème, layout jetable) (2026-07-24)
- [x] **S3a** — Tokens ReUI, thème next-themes, `npm ci` réparé (2026-07-24)
- [x] **S3b** — Layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint (2026-07-24)
- [x] **S3c** — Mise en page, palette sombre à trois niveaux, états pastel (2026-07-24)
- [x] **S4** — Noyau Money (bigint/unités mineures), Vitest, règle ESLint toFixed (2026-07-25)
  ⚠️ Le prompt de vague a renuméroté « Noyau Money » (planifié S7) en S4. La
  **consolidation i18n FormatJS/react-intl** (l'ancienne S4, ci-dessous) reste à
  faire. Numérotation à réconcilier avec le chat pilote (voir journal S4, dérive n°1).
- [x] **S5-UX** — Socle d'interactions : raccourcis (event.code), squelettes, panneaux↔URL, palette Ctrl+K ; prélèvement dialog/command/kbd + cmdk (2026-07-25)
- [x] **S-i18n** — consolidation FormatJS/react-intl : ICU, interpolation + pluriels arabes (6 formes) (2026-07-25)
- [x] **S-design** — alignement fin template (déjà aligné ; 1 écart réel `space-y`) + page pédagogique `/_dev/shortcuts` (2026-07-25)
- [ ] **S5** — Client API
- [ ] **S6** — Authentification
- [ ] ~~**S7** — Noyau Money~~ → livré en S4 (voir ci-dessus)
- [ ] **S8** — Permissions & entitlements
- [ ] **S9** — Patterns liste & formulaire
- [ ] **S10** — Erreur & observabilité
- [ ] **S11** — Tests & CI

## Dette technique / à traiter

- [ ] **Découpage de bundle / chargement paresseux des routes** — bundle à **~663 ko**
  après S-i18n (radix-ui + motion + router + cmdk + react-intl). react-intl a ajouté
  ~60 ko. Lazy-load par module quand les écrans métier arriveront (S9+).
- [ ] **Supprimer les données factices** `src/shared/dev/mock-*` quand l'API réelle
  alimente navigation, bureaux et utilisateur (S5/S6).
- [ ] **Retirer les pages `_dev`** quand les écrans métier existent :
  `src/app/pages/dev-ux.tsx` (route `/_dev/ux`, S5-UX) **et**
  `src/app/pages/dev-shortcuts.tsx` (route `/_dev/shortcuts`, S-design). Retirer
  aussi les routes correspondantes dans `src/app/router.tsx` et leurs clés i18n
  (`dev.ux.*`, `dev.shortcuts.*`).
- [ ] **Câbler l'estompage des listes** `StaleContent` sur TanStack Query
  (`placeholderData`/`keepPreviousData`) quand les vraies listes arrivent (S9).
- [ ] **Câbler l'accroche permissions** des raccourcis (`when`) sur le vrai RBAC
  (S8) : un raccourci vers une action non autorisée doit rester inerte.
- [ ] **Remplacer le registre local de devises par le référentiel API** (S4). Le
  registre `src/shared/money/currency-registry.ts` est **provisoire** ; brancher
  `loadCurrencyRegistry(...)` sur la réponse `ref_currency` de l'API (demande
  backend n°4, Référentiels) au démarrage. Aucun appelant à changer.
- [ ] **Montants transactionnels sérialisés en string côté backend** (S4). Demande
  backend n°7 (`docs/demandes-backend/2026-07-25-montants-json-string.md`) : les
  BIGINT émis en nombre JSON perdent leur précision au-delà de 2^53 dans
  `JSON.parse`, avant le noyau Money.
- [ ] **Vulnérabilités npm `react-router` (2 high, RSC CSRF)** — préexistantes
  (S3b) ; app SPA sans mode RSC. Vérifié en S-i18n : `npm audit fix --dry-run`
  **ne résout pas** dans le semver courant — le correctif exige **react-router 8**
  (montée **majeure**). Non appliqué (hors périmètre). À traiter dans une montée
  de version contrôlée dédiée (installé : `react-router-dom@7.18.1`).
- [ ] **12 avertissements `react-refresh/only-export-components`** — évalués en
  S-i18n : concentrés sur les composants **vendor `ui/`** (`cva` + composant) et le
  **socle clavier** (provider + hooks, hors périmètre). Bénins (confort HMR, sans
  effet sur build/correction). À traiter si un fichier concerné est de toute façon
  retouché ; ne pas forcer un éclatement de fichiers pour ce seul motif.

## Écrans métier (après socle)

- [ ] Module Party (tiers)
- [ ] Module Core (authentification avancée)
- [ ] Module Booking (lecture)
- [ ] Module Règlements
- [ ] Module Cash Management
- [ ] Facturation
- [ ] Product/Catalogue
- [ ] Pricing
- [ ] Point de vente
- [ ] Permissions (administration)
- [ ] Provider Integration
