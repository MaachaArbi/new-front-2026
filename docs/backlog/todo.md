# Backlog — TODO

## Socle

- [x] **S1** — Squelette & purge (2026-07-23)
- [x] **S1-bis** — Corrections & protection `reference/` (2026-07-24)
- [x] **S2** — Socle visuel (infrastructure i18n/thème, layout jetable) (2026-07-24)
- [x] **S3a** — Tokens ReUI, thème next-themes, `npm ci` réparé (2026-07-24)
- [x] **S3b** — Layout-21 réel, 12 composants ReUI, RTL Radix, règle ESLint (2026-07-24)
- [x] **S3c** — Mise en page, palette sombre à trois niveaux, états pastel (2026-07-24)
- [ ] **S4** — i18n & RTL (consolidation FormatJS/react-intl)
- [ ] **S5** — Client API
- [ ] **S6** — Authentification
- [ ] **S7** — Noyau Money
- [ ] **S8** — Permissions & entitlements
- [ ] **S9** — Patterns liste & formulaire
- [ ] **S10** — Erreur & observabilité
- [ ] **S11** — Tests & CI

## Dette technique / à traiter

- [ ] **Découpage de bundle / chargement paresseux des routes** — bundle à ~565 ko
  après S3b/S3c (radix-ui + motion + router). Lazy-load par module quand les
  écrans métier arriveront (S9+).
- [ ] **Supprimer les données factices** `src/shared/dev/mock-*` quand l'API réelle
  alimente navigation, bureaux et utilisateur (S5/S6).

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
