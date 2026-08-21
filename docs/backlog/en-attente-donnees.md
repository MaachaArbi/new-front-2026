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
- **Lot de demandes au back du 09/08** — parti dans
  `docs/demandes-backend/2026-08-09-trois-manques-fiche-tiers.md` :
  (1) pays du bureau dans `/me` (bloque l'indicatif par défaut et le premier jour de la
  semaine, aujourd'hui lundi en dur) ; (2) nom du bureau sur plafonds / exonérations /
  règles / politiques — sans lui, l'écran affiche `#119751` ; (3) `meta.hasMore` sur
  l'historique.
- **Champs vides** : depuis le 09/08, un champ nul s'affiche avec « — » et n'est plus
  masqué. Un champ caché parce que vide est indiscernable d'un champ que l'API n'expose
  pas — c'est ce qui avait laissé passer quatre champs invisibles sur la fiche.
- ~~**Champs de date natifs**~~ : **FAIT le 09/08** — `DateField` + `Calendar` maison
  (aucune dépendance ; `Intl` comme unique source de langue). Ancien constat conservé
  pour mémoire : (`<input type="date">`) : affichent `mm/dd/yyyy` — le format
  vient de la langue du **système**, pas de celle de l'application ; ni option ni CSS ne
  le changent. À remplacer par un `DateField` partagé + calendrier à nous (thème sombre
  et arabe/RTL corrects, que le natif ne sait pas faire). Affichage via `useDateFormat`,
  valeur toujours ISO vers l'API. ~7 champs (documents, plafonds, exonérations).
  Bénéfice second : bloquer les dates impossibles à la saisie (expiration < émission).
  **Décidé le 09/08 — à faire juste après la revue en cours.**
- ~~**Passe composants**~~ : **FAITE le 09/08** (8 incréments). Dans `shared/ui/` :
  InitialsAvatar, StatusChip, panel (Card/CardHead/Gauge/StatValue/RailRow), RowActions,
  MoneyText, EmptyState, SelectField, timeline, Segmented, RadioField, Checkbox,
  RecordShell ; `useDateFormat` dans `shared/lib/`. Reste le `DateField` (ci-dessus).
  C'est cette passe qui rend les **thèmes utilisateur** possibles (tout passe par des
  tokens ; une valeur en dur ne répondrait jamais à un thème).

## Valeurs statiques à l'écran (règle du 19/08)

Depuis le 19/08 on conçoit chaque page COMPLÈTE sans attendre l'API. Toute valeur
inventée porte un **soulignement pointillé** (`<MockValue>`) et se déclare : le
compteur de l'en-tête totalise ce qui reste à brancher sur l'écran courant. Sur un
écran entièrement branché, le compteur disparaît — c'est l'indicateur qu'on vise.

**Fiche Tiers — 26 valeurs**, toutes dans le bloc « Voyages en cours ».

| Ce qui est statique | D'où ça viendra | Bloquant |
|---|---|---|
| Numéro de dossier, destination, dates du séjour | `GET /booking-folders/{id}` | `/booking-folders` ne rend **aucun** dossier ; un `folderPublicId` valide répond 404 |
| Services du dossier (hôtel, vol, transfert) et leur statut | `bookings[]` du dossier | idem |
| Nombre de voyageurs | `travelers` du service | idem |
| Montants (total vendu, solde dû, option) | totaux par service | idem — et la **forme des montants reste à trancher** : le module Réservations rend `{amount: number}` là où Tiers rend `amountMinor: string` |
| Compteurs du menu (Tiers 128, Clients 96, …) et vues enregistrées | décompte serveur, pas un chargement de la liste | à demander |

**Ce qui n'est PAS statique et ne doit pas le devenir** : tout ce que l'API rend déjà
— identité, rattachements, coordonnées, adresses, plafonds, activité, interlocuteurs.
Un champ vide s'affiche « — » ; il ne se remplace jamais par une valeur inventée.

### À traiter AVANT la mise en production (pas urgent en dev)
- **Jauge « Encours »** : aujourd'hui une barre grise vide + « EN ATTENTE ». Acceptable en
  développement (aucun utilisateur), mais à revoir avant la prod : barre hachurée, ou pas
  de barre du tout tant que la donnée n'existe pas.
- **Historique de la fiche Sahara pollué** par les scripts de semis (ajouts/retraits
  d'interlocuteurs en rafale). Sans effet en dev ; l'audit n'est volontairement pas
  éditable depuis le front. À nettoyer côté base si on garde ce tiers pour des démos.
- **Libellés arabes** : ~35 clés écrites par Claude, **jamais relues par Arbi**. Prévoir
  une relecture en une passe (tableau fr → ar).

---
_À compléter au fil des briques. Toute valeur en dur / « en attente » posée dans l'UI
doit atterrir ici le jour où on la crée._

## Page-liste (composant partagé, 20/08)

### Vues enregistrées
- **Vue ad hoc = l'URL** — **FAIT**, aucune dépendance : filtres, recherche, tri et
  page vivent dans la barre d'adresse, la vue se partage par lien.
- **Vues NOMMÉES** (en base, suivent l'utilisateur, partageables équipe) —
  **Statut : COQUILLE VISIBLE**. Le menu « Vues » les annonce comme en attente et
  « Enregistrer cette vue » est désactivé. Débloqué par : **endpoint préférences
  utilisateur + vues nommées** (différé en phase 2 par la décision du 04/08).
  ⚠️ Rappel de cette décision : **pas de `localStorage` comme source de vérité** —
  il ne suit pas l'agent d'un poste à l'autre.

### Export
- **Export Excel / PDF** — **Statut : COQUILLE VISIBLE**. Le bouton existe, annonce
  la portée (« emporte N lignes, filtres courants compris ») et ses deux entrées
  sont désactivées. Débloqué par : **endpoint d'export généré côté SERVEUR**
  (phase 2). Motif de la décision : un export client suppose d'avoir toutes les
  lignes en mémoire — c'est ce qu'on fuit.

### Options des facettes
- Aujourd'hui alimentées par des **fixtures de vitrine**. En production elles
  viennent des **référentiels** (`shared/referentials`), **jamais** d'un balayage
  des valeurs distinctes sur 50 000 lignes (décision du 04/08).

### Tri des colonnes — écart signalé
- La décision verrouillée n° 1 du 04/08 disait **« tri fixe sur le nom en V1,
  en-têtes non triables »**, faute de `sort=` côté back. Les en-têtes livrés sont
  **triables** : c'est cohérent avec la règle du 19/08 (concevoir l'UI
  indépendamment des API), mais **ça mordra au branchement**. Débloqué par :
  `sort=` dans le contrat de liste (phase 2).

## Liste Tiers — premier écran réel (20/08)

L'écran `/parties` est **entièrement statique** : fixtures en mémoire, source
d'essai avec délai simulé. Aucune API n'est appelée.

### Champs renseignés dans les fixtures mais VIDES dans la base
Le scan du 04/08 : `logoUrl`, `phonePrimary` et `country` sont vides sur
**0 / 106 000** lignes. Les fixtures les renseignent — règle du 19/08, on conçoit
l'écran complet — mais **l'écran doit tenir le vide**, et deux lignes le
vérifient exprès (Slim Ferchichi, Nour Travel : ni téléphone, ni pays, ni bureau).
- **Statut : À ALIMENTER côté données**, pas côté écran. Les colonnes restent
  affichées, le vide s'écrit « — » ([[afficher-les-champs-vides]]).

### Colonnes absentes, et c'est voulu
- **Pas de solde ni d'encours.** Le solde existe par (tiers × rôle × bureau ×
  devise) et n'est jamais un chiffre unique. Un total dans la liste serait FAUX,
  pas approximatif. Vit dans l'écran **Règlements**.
- **Pas de compteurs réseau/affiliés** — écran **Réseau** (décision back 04/08).

### Filtres
- **V1 livrés** : recherche (une boîte → nom, courriel, téléphone), nature, rôle,
  état, bureau, pays. C'est exactement le contrat figé.
- **Phase 2** : forme juridique, « créé entre ». Non affichés.
- Les options de `bureau` viendront de `/me` (entier `officeAccountId`), celles de
  `pays` du référentiel fermé `countries`. Aujourd'hui : déduites des fixtures.

### Tri — écart déjà signalé, ici concret
Les en-têtes sont triables ; le contrat fige `display_name ASC` sans `sort=`
(choix de performance, ~51 ms sur 50k). Le défaut de l'écran EST `display_name`
croissant, donc le comportement au branchement sera correct **tant qu'on ne
clique pas un en-tête**. Débloqué par : `sort=` dans le contrat (phase 2).

### Compteur
Il dit « **N que vous pouvez voir** », jamais « N tiers ». Le cloisonnement RLS
est par bureau : la liste n'est jamais complète, et un compteur muet mentirait à
l'agent qui ne voit que son périmètre.

### Densité et disposition des colonnes — non persistées (21/08)
Le tableau offre trois crans (condensé · normal · aéré) et le redimensionnement
des colonnes. **Rien ne survit au rechargement.**
- **Statut : COMPORTEMENT COMPLET, PERSISTANCE MANQUANTE.** Débloqué par le même
  endpoint que les vues nommées — préférences utilisateur (phase 2 du 04/08, qui
  disait déjà « idem disposition colonnes + densité »).
- ⚠️ Rappel : **pas le `localStorage`**, il ne suit pas l'agent d'un poste à
  l'autre. C'est la même décision que pour les vues.

## Liste Tiers — ce qu'Arbi laisse ouvert (21/08)

Arbi : *« la page liste tiers pour moi n'est pas finalisée à 100 % »*. Trois
points, volontairement différés — il passe à la fiche pour pouvoir juger.

### 0 · Composants de filtre à référentiel — UNE SEULE SOURCE
Le filtre **pays** est aujourd'hui une facette générique : une liste de cases à
cocher, sans recherche. Ça ne tient pas à 250 pays.

Arbi : *« ça devra être un composant unique dans toute l'application pour
toujours avoir une seule source »*. Donc **pas** une facette de plus, mais un
`CountrySelect` partagé — celui qui existait dans l'ancien UI, avec drapeaux,
recherche, mono et multi-sélection, et son drapeau mutualisé avec le champ
téléphone ([[front-country-components]], [[front-phone-input-partage]]).

Même besoin à venir pour **devise**, **bureau**, **hôtel**, **forme juridique** :
tout référentiel long ou ouvert. La facette générique reste bonne pour les
listes courtes et fermées (nature, rôle, état).
- **Statut : À CONSTRUIRE.** Ni bloquant ni urgent — la liste marche.

### 1 · Colonnes manquantes
Plusieurs données ne figurent pas encore. Arbi : *« ce n'est pas un travail
énorme d'ajouter des colonnes, c'est pour cette raison que je ne m'arrête pas
là-dessus maintenant »*.
- **Statut : À DISCUTER**, après la fiche. Le contrat de liste du 04/08 est la
  borne : ce qu'il ne rend pas demandera une évolution back.

### 2 · L'aspect du tableau lui-même
Arbi attend **la page détail** pour juger s'il garde le tableau tel quel ou s'il
demande des retouches. Il ne faut donc PAS considérer l'UI de la liste comme
validée — seulement comme posée.
- **Statut : EN ATTENTE DE JUGEMENT**, après la fiche.

## Fiche Tiers — premier gabarit de fiche (21/08)

Écran `/parties/{publicId}`, **entièrement statique** : une fixture calquée sur le
contrat back du 07/08 (33 champs, six listes bornées). Aucune API.

### Onglet Historique — vide
Prévu, présent, **désactivé**. Débloqué par : l'incrément 2 de la livraison du
05/08 (traçabilité), non construit.

### Aucune action ne fait quoi que ce soit
« Modifier », « Ajouter une pièce », le menu ⋯ de l'en-tête : coquilles. Débloqué
par l'écran d'édition, qui demandera formulaire, notification et sélecteurs
partagés (pays, téléphone, devise).

### Rappel des deux règles respectées, à ne pas relâcher
- **Règle n° 1 (06/08)** : aucun réglage de la fiche ne DÉCLENCHE quoi que ce
  soit — les comportements vivront dans Réservations. Ne jamais écrire
  « réservations bloquées au-delà » ni « en attente de validation ». Un test e2e
  refuse ces formulations dans le texte de la page.
- **Principe E** : montrer ce qui MANQUE (`hasFile`, `hasCertificate`,
  `validatorStillQualified`). Un test e2e exige la présence des trois badges.

### Enums sans libellé
`functionCode` des règles d'approbation est affiché en **code brut**
(`booking_override`) — le référentiel des fonctions existe côté back mais n'est
pas branché. Idem `serviceTypeCode` des plafonds, non proposé (référentiel
absent, petite demande back si voulu).
