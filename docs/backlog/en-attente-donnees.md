# En attente — valeurs & fonctionnalités à brancher

Registre des **valeurs statiques / fonctionnalités aspirationnelles** posées dans l'UI
pendant la phase « briques visuelles ». But : ne rien oublier, et **ne pas avoir à
parcourir tous les écrans** pour retrouver les placeholders quand la donnée arrivera.

Convention : `élément d'UI` · où · **statut** · débloqué par.

## Fiche Tiers

### Rail « Détails société »
- **Plafond effectif** — *par portée* (bureau · produit). Calcul : socle actif +
  Σ rallonges actives (`PartyCreditLimit`). **Statut : à implémenter** (donnée dispo,
  calcul + branchement à faire). Aucune dépendance module.
- **Encours** (montant dû par le client) = Σ factures / réservations non réglées.
  **Statut : PLACEHOLDER**. Débloqué par : modules **Factures / Paiements / Réservations**
  (non construits). Le système le *prévoit* (politique « bloquer si solde insuffisant »,
  menu « Soldes »), mais **aucune donnée aujourd'hui**.
- **Crédit disponible** = Plafond effectif − Encours. **Statut : PLACEHOLDER**.
  Débloqué par : l'Encours (ci-dessus).

### Bandeau nom
- **Action « Nouvelle réservation »** — illustrative. Débloqué par : module Réservations.
- **Menu ⋮ (actions d'en-tête)** — contenu à définir (encaisser, changer l'état, exporter…).

### Overview
- **Panneau « À traiter »** (alertes agrégées) — les données sous-jacentes **existent**
  (e-mail non vérifié, exonération sans justificatif, validateur non habilité, rallonge
  qui expire) ; **à câbler** : l'agrégation + le calcul « expire bientôt ». Pas de dépendance module.
- **Fil « Activité récente »** — les **changements de champs** viennent de l'historique
  (`PartyHistory`, existe). Les **événements transactionnels** (réservations, paiements —
  marqués « à venir ») **attendent** les modules Réservations / Paiements.
- **Interlocuteurs — joignabilité inline** (tél/e-mail par interlocuteur) : **donnée ABSENTE**.
  `PartyContactRef` = `publicId` + `displayName` + `functionCode` seulement. Aujourd'hui :
  clic → fiche de l'interlocuteur (ses coordonnées y vivent). Pour l'afficher inline sur
  l'Overview : **demande back** (enrichir le lien contact avec tél/e-mail).
- **« Voir tout » Interlocuteurs / Chargés** → onglet **Contacts & équipe** (lot 6, pas encore
  créé) ; le bouton est volontairement absent pour l'instant. À activer au lot 6, qui
  **consolidera** aussi les interlocuteurs du rail (fin du doublon rail/Overview).

### Onglets
- **Notes** et **Tâches** — **différés** (aucune notion côté back ; on n'ajoute pas d'onglets
  vides). À créer quand les features existeront (annotations internes ; rappels/todos).
- **Réservations / Paiements / Factures** — onglets **retirés** de la fiche (ils débordaient
  sur le rail à 5+ onglets réels). À **rétablir** quand les modules existeront.

- **Documents** (ex-Files) — **RÉEL et COMPLET** (`PartyDocument` : type, n°, dates,
  expiration, `hasFile`). Statut d'expiration **calculé** (valide / expire bientôt à 90 j /
  expiré) + alerte « Sans scan ». ✅ Fait le 09/08/2026.
- **Notes** — **PLACEHOLDER** (aucune notion de notes côté back). Feature à créer si utile :
  annotations internes sur le client (auteur · date · texte).
- **Tâches** — **PLACEHOLDER** (aucune notion de tâches côté back). Feature à créer si utile :
  rappels/todos (titre · échéance · assigné · statut), distincts des alertes système d'Overview.

### Historique — demandes back
- **`meta.hasMore` (ou le total)** : aujourd'hui `meta` ne porte ni total ni indicateur de
  fin, **et l'API renvoie une ligne de moins que le `limit` demandé** (mesuré : 5→4, 10→9,
  20→18). Le front compense par une heuristique + « un chargement sans nouvelle entrée = fin ».
  À remplacer par un vrai `hasMore`.
- **Référentiel des sujets d'audit** : la liste des types du filtre est **recopiée en dur**
  dans le front (`KNOWN_SUBJECTS`, 18 codes de la doc §1.3). Aucun référentiel côté API →
  risque de dérive silencieuse si le back ajoute un sujet.
- **Filtre serveur** (type / action / auteur / période / recherche) : le filtrage est
  **client**, donc limité aux entrées chargées. Indispensable sur un gros historique.
- **Nom du validateur** : l'audit expose `validator` en UUID brut → afficher un nom.

### Socle visuel & vocabulaire (09/08/2026)
- **Sparkline + chip de variation** : construits sur `/_ui`, **pas portés** sur la fiche —
  aucune série temporelle réelle (CA, réservations) n'existe. À porter avec les modules
  Réservations / Factures. Ne jamais afficher une courbe sans sa **période**.
- **Jauge encours/plafond** : posée sur la fiche en état « en attente » ; se remplira le
  jour où l'encours existera (modules Factures / Paiements).
- **Segmented control + toolbar** (Trier / Vue / Filtrer) du layout-21 : construits sur
  `/_ui`, restent à porter sur les onglets de la fiche.
- **Semis interlocuteurs** : le bloc `SEED_ONLY=contacts` échoue encore (panneau de
  recherche de personnes) — cause non identifiée. Le reste du semis fonctionne.
- **Pages jetables** `/_ref` (spec de la fiche) et `/_ui` (socle + vocabulaire) : à
  supprimer une fois le port terminé et validé.
- **Passe composants** : remonter `src/modules/party/party-ui.tsx` dans `shared/` quand la
  2ᵉ utilisation sera certaine, avec le reste de l'inventaire (Avatar, StatusChip,
  RowActions, MoneyText, DateText, EmptyState, SectionHead, ListCard, combobox, radios).
  C'est cette passe qui rendra les **thèmes utilisateur** possibles (tout doit passer par
  des tokens ; une valeur en dur ne répondra jamais à un thème).

---
_À compléter au fil des briques. Toute valeur en dur / « en attente » posée dans l'UI
doit atterrir ici le jour où on la crée._
