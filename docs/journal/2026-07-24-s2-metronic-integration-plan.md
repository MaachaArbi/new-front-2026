# Plan d'intégration Metronic — Phase S2-ext (post socle visuel)

**Date** : 2026-07-24  
**Étape** : Préparation pour intégration layout-21  
**Source** : `/home/ubuntu/vendor-metronic/starter-kit/src/components/layouts/layout-21/`

---

## Fichiers à prélever (18 fichiers)

### Index
- `index.tsx` — Export racine du layout

### Components (17 fichiers)
1. `context.tsx` — Layout context + hook
2. `header.tsx` — Composant header principal
3. `header-breadcrumbs.tsx` — Breadcrumbs
4. `header-menu.tsx` — Menu header
5. `header-toolbar.tsx` — Toolbar (theme toggle, etc.)
6. `sidebar.tsx` — Wrapper sidebar
7. `sidebar-primary.tsx` — Rail principal (sélecteur modules)
8. `sidebar-primary-menu.tsx` — Menu sous rail
9. `sidebar-secondary.tsx` — Barre latérale secondaire
10. `sidebar-header.tsx` — En-tête sidebar
11. `sidebar-search.tsx` — Barre de recherche
12. `sidebar-communities.tsx` — Liste communautés
13. `sidebar-workspaces-menu.tsx` — Menu workspaces
14. `sidebar-resources-menu.tsx` — Menu ressources
15. `toolbar.tsx` — Toolbar bas de page
16. `toolbar-menu.tsx` — Menu toolbar
17. `wrapper.tsx` — Wrapper HTML

---

## Stratégie de prélèvement

### Phase 1 : Extraction brute (pas de modifications)
```
src/app/layouts/
├── layout-21/
│   ├── components/
│   │   ├── [17 fichiers copiés bruts]
│   ├── index.tsx
│   └── context.tsx
```

### Phase 2 : Adaptation au contexte OsTravel
- ✅ Garder structure Metronic (flexibilité future)
- ✅ Intégrer i18n (useI18n hook)
- ✅ Intégrer thème (useTheme hook)
- ✅ RTL : remplacer left-* par start-*, right-* par end-*
- ✅ Remplacer icônes Metronic par lucide-react
- ✅ Remplacer données mock Metronic par nos données (MODULES, OFFICES, etc.)
- ✅ Remplacer routing Metronic par notre contexte
- ✅ Supprimer dépendances Metronic propriétaires (clés API, etc.)

### Phase 3 : Intégration dans App.tsx
- ✅ Importer Layout21 au lieu de AppLayout actuel
- ✅ Wrapper dans les mêmes providers (ThemeProvider → I18nProvider)
- ✅ Tester au navigateur

---

## Composants ReUI à prélever (shadcn) — Phase S2-ext-bis

Après layout-21, prélever depuis shadcn registry :

1. **Button** — Boutons stylisés
2. **Card** — Conteneurs
3. **Dropdown Menu** — Menus déroulants
4. **Select** — Sélecteurs
5. **Input** — Champs texte
6. **Badge** — Labels
7. **Avatar** — Avatars
8. **Tooltip** — Infobulles
9. **Dialog** — Modales
10. **Tabs** — Onglets
11. **Breadcrumb** — Fil d'ariane
12. **Scroll Area** — Zone scrollable

```bash
# Après validation de layout-21, exécuter :
for component in button card dropdown-menu select input badge avatar tooltip dialog tabs breadcrumb scroll-area; do
  npx shadcn-ui@latest add $component --yes
done
```

---

## Dépendances Metronic à compléter

Vérifier si layout-21 utilise :
- Icônes Metronic propriétaires → remplacer par lucide-react
- Assets CSS Metronic → adapter à Tailwind v4
- Utilitaires Metronic → réimplémenter si nécessaire
- Classes CSS → dépendre de Tailwind (via @apply ou inline)

---

## Checklist avant prélèvement

- [ ] Vérifier que npm run dev tourne correctement (S2 validation visuelle)
- [ ] Créer branche feature : `git checkout -b feat/metronic-layout-21`
- [ ] Audit de `sidebar-primary.tsx` pour RTL (left-1.75 → start-1.75)
- [ ] Audit des icônes utilisées (remplacer par lucide-react si Metronic)
- [ ] Documenter chaque fichier copié dans `docs/vendor-imports.md`

---

## Structure finale (après S2-ext)

```
src/
├── app/
│   ├── layouts/
│   │   ├── layout-21/
│   │   │   ├── components/  [17 fichiers adaptés]
│   │   │   ├── index.tsx
│   │   │   └── context.tsx
│   ├── providers/
│   │   ├── theme-provider.tsx  [existant S2]
│   │   └── i18n-provider.tsx   [existant S2]
├── App.tsx  [modifié pour utiliser Layout21]
```

---

## Références

- **Source Metronic** : `/home/ubuntu/vendor-metronic/starter-kit/src/components/layouts/layout-21/`
- **Manifeste prélèvement** : `docs/vendor-imports.md` (à compléter)
- **Décisions** : ADR-F01 (Metronic), ADR-F02 (layout unique), ADR-F19 (menu)
- **Architecture** : `reference/front-cadrage/01-front-architecture-decisions.md`

---

## Timing

- **S2** (current) : Validation visuelle du socle
- **S2-ext** : Prélèvement + adaptation layout-21 (1-2h estimées)
- **S2-ext-bis** : Prélèvement + adaptation composants ReUI (1h)
- **S3** : Tests visuels complets + itérations

