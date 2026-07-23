# Test Checklist S2 — Tests visuels du socle

**URL à tester** : http://localhost:5180

**Prérequis** : `npm run dev` doit être en cours d'exécution

---

## Tests de base (infrastructure)

- [ ] **Page charge** : Aucune erreur JS dans console (F12)
- [ ] **Hydratation React** : Pas de warnings "React has not been hydrated yet"
- [ ] **Layout se dessine** : Rail à gauche + barre latérale (largeur 256px) + contenu principal

---

## Tests du Rail (navigation)

- [ ] **Rail visible** : Colonne grise à gauche
- [ ] **8 boutons d'icônes** : Parties, Bookings, Settlements, Cash, Invoicing, Catalogue, Pricing, Settings
- [ ] **Icônes chargées** : Via lucide-react (pas de souris cassée)
- [ ] **Bouton actif** : Le module sélectionné a un fond bleu (`bg-blue-500`)
- [ ] **Clic module** : Clic sur un module change la couleur d'actif
- [ ] **Tooltip** : Survol du bouton affiche le titre du module (en français par défaut)

---

## Tests du Sélecteur de thème

- [ ] **Icône Moon** : Visible en bas du rail (mode clair par défaut)
- [ ] **Clic → Icône Sun** : Cliquer le bouton Moon bascule à l'icône Sun
- [ ] **Mode sombre activé** : Fond passe de blanc/gris à noir/gris foncé
- [ ] **Persistance** : Rafraîchir la page (F5) → le thème sombre reste actif
- [ ] **Clic Sun → Icône Moon** : Bascule du mode sombre au clair
- [ ] **Texte visible** : En mode sombre, le texte blanc/clair doit rester lisible

---

## Tests du Sélecteur de langue

- [ ] **Dropdown visible** : En bas de la barre latérale
- [ ] **Options** : Affiche `🇬🇧 English`, `🇫🇷 Français`, `🇸🇦 العربية`
- [ ] **Défaut** : `🇫🇷 Français` sélectionné par défaut
- [ ] **Clic → English** : Les textes se mettent à jour en anglais (ex. "Welcome to OsTravel", "Select a module from the rail")
- [ ] **Clic → Français** : Retour au français
- [ ] **Clic → العربية** : Bascule à l'arabe

---

## Tests RTL (Direction Right-to-Left) — Langue arabe

Quand le sélecteur de langue passe en **عربية (ar)** :

- [ ] **Rail à droite** : Le rail passe de gauche à droite (pas juste `dir="rtl"` sur root)
- [ ] **Barre latérale à gauche** : Inverse du rail
- [ ] **Textes RTL** : Les textes arabes s'alignent de droite à gauche
- [ ] **Icônes cohérentes** : Icônes de module restent visuellement correctes
- [ ] **Dropdown directionnel** : Le sélecteur de langue s'affiche en RTL
- [ ] **F5 + arabe sélectionné** : RTL persiste après rafraîchissement (localStorage)

---

## Tests de la barre latérale

- [ ] **Sélecteur de bureau** : Dropdown avec `Tunisie`, `Algérie`, `France`
- [ ] **Défaut** : Premier bureau sélectionné
- [ ] **Nom du module** : Sous le sélecteur, affiche le nom du module actif (traduit)
- [ ] **Menu mock** : 5 items "Menu Item 1" à "5" cliquables (pas de redirection, juste visuel)
- [ ] **Profil utilisateur** : Avatar (carré bleu) + nom `Ahmed Maacha` + email `m.arbi.maacha@gmail.com`
- [ ] **Scroll** : Si le menu est long, scroll interne à la barre latérale

---

## Tests du contenu principal

- [ ] **Header** : Titre "OsTravel Back Office" visible
- [ ] **Bienvenue** : Carte avec titre "Welcome to OsTravel" (ou traduction si autre langue)
- [ ] **Instructions** : Texte "Select a module from the rail..." (traduit si autre langue)
- [ ] **Deux cartes info** : "Light/Dark Mode" et "Multilingual (RTL Ready)"

---

## Tests d'interaction combinée

- [ ] **Bascule module + langue** : Clic module → bascule langue → nom module s'affiche traduit
- [ ] **Bascule module + thème** : Clic module → bascule thème sombre → couleur active reste visible
- [ ] **Bascule langue + thème** : Clic sur arabe → bascule sombre → RTL + couleurs sombres
- [ ] **Tous les modules visible en arabe** : Les 8 modules ont chacun un nom arabe (via i18n)

---

## Tests du navigateur (DevTools)

- [ ] **Console** : Zéro erreur
- [ ] **Warnings** : Aucun warning lié à React Hydration mismatch
- [ ] **localStorage** : Clés `theme` et `i18n-language` présentes
- [ ] **HTML root** : Attribut `dir` passe à `"rtl"` quand arabe sélectionné, `"ltr"` sinon
- [ ] **classe `dark`** : Présente sur `<html>` en mode sombre, absente en mode clair

---

## Défauts connus à ignorer

- ⚠️ ESLint warnings (4 non-bloquants) → Build réussit, dev fonctionne
- ⚠️ `react-helmet-async@^2` peer conflict → Code fonctionne malgré le warning

---

## Résultat

✅ Si tous les tests passent → S2 est visuellement prêt pour itération Metronic  
❌ Si des tests échouent → Documenter dans `docs/issues/` + créer une issue

---

## Prochaine étape

Après validation visuelle :

1. Intégrer layout-21 depuis `vendor-metronic/starter-kit/`
2. Prélever 12 composants ReUI (shadcn)
3. Corriger fuites RTL (left-1.75 → start-1.75)
4. Tests visuels complets à répéter
