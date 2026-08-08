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
- **Documents** (ex-Files) — **RÉEL** (`PartyDocument` : type, n°, dates, expiration,
  `hasFile`). À brancher : le calcul du statut d'expiration (valide/expire bientôt/expiré).
- **Notes** — **PLACEHOLDER** (aucune notion de notes côté back). Feature à créer si utile :
  annotations internes sur le client (auteur · date · texte).
- **Tâches** — **PLACEHOLDER** (aucune notion de tâches côté back). Feature à créer si utile :
  rappels/todos (titre · échéance · assigné · statut), distincts des alertes système d'Overview.

---
_À compléter au fil des briques. Toute valeur en dur / « en attente » posée dans l'UI
doit atterrir ici le jour où on la crée._
