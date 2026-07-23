# Addendum — ADR front : UX et IA

**Date** : 24/07/2026
**À ajouter à** : `reference/front-cadrage/01-front-architecture-decisions.md`
**Contient** : ADR-F20 (UX), ADR-F21 (IA), et l'amendement ADR-F08 v2

> Après ajout, régénérer les empreintes :
> `bash tools/check-reference-integrity.sh --update`

---

# ADR-F20 : Principes UX — ✅ ACCEPTÉ

**Contexte.** Les utilisateurs sont des opérateurs d'agence qui passent leur
journée entière dans l'outil, souvent en volume (dizaines de réservations par
jour). Beaucoup **préfèrent le clavier à la souris**. Le produit doit se battre
contre des acteurs internationaux établis : l'ergonomie est un argument de vente,
pas un vernis.

Ces principes sont **transverses**. Ils ne se redécident pas à chaque module.

## F20.1 — Le CRUD ne change jamais de page

Le motif « bouton → nouvelle page → enregistrer → retour » est proscrit.

| Cas | Conteneur |
|---|---|
| Consulter / modifier une ligne | **Panneau latéral** — la liste reste visible derrière |
| Création rapide | **Modale** |
| Formulaire vraiment complexe (réservation multi-services) | **Page dédiée**, en mode assistant (Stepper ReUI) |

## F20.2 — Tout est adressable par URL, panneaux compris

Même ouvert dans un panneau, l'état se reflète dans l'adresse :
`/bookings?open=<publicId>`.

Trois bénéfices concrets :

- ouvrir dans un second onglet pour comparer deux fiches
- le bouton Retour du navigateur se comporte normalement
- **le support peut dire « envoyez-moi votre URL »** — décisif sur 100+ agences

Corollaire : les **filtres vivent aussi dans l'URL** (composant Filters de ReUI),
ce qui rend toute vue partageable par simple copie du lien.

## F20.3 — Squelettes, jamais de spinners

Un spinner dit « attends ». Un squelette montre la **forme** de ce qui arrive :
l'attente paraît plus courte et la mise en page ne saute pas à l'arrivée des
données.

## F20.4 — Les listes ne clignotent jamais

Au changement de page ou de filtre, les données précédentes **restent affichées**,
légèrement estompées, pendant le chargement. Natif dans TanStack Query
(`placeholderData` / `keepPreviousData`).

## F20.5 — Le clavier, à trois niveaux

| Niveau | Mécanisme |
|---|---|
| **Global** | Palette de commandes `Ctrl+K` (voir F20.8) |
| **Navigation** | Séquences à deux touches — `g` puis `r` → Réservations. Modèle Gmail/Linear, aucun conflit avec la saisie |
| **Contextuel** | Dans une liste : flèches pour se déplacer, `Entrée` ouvrir, `Espace` sélectionner, `Ctrl+Entrée` enregistrer, `Échap` fermer |

**Registre central** des raccourcis — jamais de gestionnaire de touches posé
localement dans un composant.

### Deux pièges spécifiques à ce projet

**Clavier arabe.** Les raccourcis doivent se baser sur la **position physique de
la touche** (`event.code`), jamais sur le caractère produit (`event.key`). Sinon
ils cassent dès qu'un utilisateur passe en disposition arabe — soit une large
part des utilisateurs sur les marchés visés. Invisible tant qu'on ne teste pas.

**Flèches en RTL.** En arabe, « flèche droite » doit aller vers l'élément
**précédent**. Radix le gère via `DirectionProvider` (posé en S2) — à condition
de ne pas écrire de gestionnaires de flèches à la main par-dessus.

### Découvrabilité

Un raccourci que personne ne connaît n'existe pas.

- `?` ouvre la liste complète des raccourcis
- Chaque raccourci s'affiche dans le menu et l'infobulle correspondants
  (composant `kbd` disponible)

### Interaction avec les droits

Un raccourci vers une action non autorisée est **inerte** — il ne déclenche rien
et ne produit **pas** de message d'erreur.

## F20.6 — L'aide est dans le produit

- **Aide contextuelle** — un panneau explique l'écran courant.
  **Synergie** : les ancres `data-acl` posées pour les permissions peuvent porter
  l'aide. **Un seul ancrage, trois usages** : permission, licence, aide. Et le
  mode « Capture » (ADR-F08), prévu pour créer une permission sans code, sert
  aussi à annoter un élément avec son texte d'aide — toujours sans code.
- **États vides qui enseignent** — pas « Aucun résultat », mais « Aucune
  réservation ce mois-ci » + le bouton pour en créer une.
- **Erreurs qui expliquent** — pas « Opération impossible », mais « Solde client
  insuffisant : 1 200 DT disponibles, 1 500 DT requis ».

## F20.7 — « Annuler » plutôt que « Êtes-vous sûr ? »

Une boîte de confirmation ralentit tout le monde et **n'empêche rien** : au bout
de trois jours, on clique « Oui » sans lire.

L'action s'exécute immédiatement, un bandeau propose **« Annuler »** pendant
quelques secondes. Plus rapide au quotidien, et réellement plus sûr.

**Exception non négociable — l'argent.** Règlements, Facturation, Caisse : grand
livre append-only, correction par contre-passation datée. La confirmation reste,
et elle est justifiée. Cohérent avec ADR-F15 (pas de mise à jour optimiste sur
l'argent).

## F20.8 — La palette de commandes comme navigation principale

`Ctrl+K` n'est pas une recherche : c'est le mode de navigation des utilisateurs
expérimentés.

```
12345                 → saute à la réservation
Dupont                → saute au client
nouvelle réservation  → lance l'action
caisse                → change de module
```

**On ne navigue plus, on saute.** C'est aussi la réponse au risque de menus trop
longs : la profondeur du menu importe peu si les utilisateurs rapides ne s'en
servent pas. Seul élément d'interface qui devient *plus* utile à mesure que
l'application grossit. Extensible par module.

## F20.9 — Motifs à décliner module par module

| Motif | Valeur |
|---|---|
| **Vues enregistrées** | Filtres nommés et réutilisables (« Mes réservations à confirmer », « Impayés > 30 jours »). Presque gratuit puisque les filtres sont dans l'URL |
| **Dupliquer** | Une agence saisit vingt fois la même réservation à des dates différentes |
| **Actions en masse** | Sélection multiple + action. Sur le lettrage : dix minutes au lieu d'une matinée |
| **Indicateur de bureau permanent** | Agir dans le mauvais bureau produit des écritures fausses. Repère discret mais impossible à ignorer — élimine une classe entière d'erreurs |

## F20.10 — Brouillon local

Le formulaire s'enregistre localement pendant la frappe et propose de reprendre
au retour.

**Priorité revue à la baisse** : la connexion des agences est stable (confirmé
24/07). Reste un confort utile (fermeture d'onglet accidentelle) — prévu en S9,
pas en socle.

## Échéancier

| Décision | Quand |
|---|---|
| URL adressable, panneaux compris | **Socle** (routage) |
| Registre de raccourcis, position physique des touches | **Socle** |
| Convention panneau / modale / page | **Socle** |
| Squelettes + données estompées | **Socle** |
| Ancre unique permission + licence + aide | **Socle** |
| Palette de commandes | S9, enrichie par module |
| Brouillon local | S9 |
| Vues enregistrées, duplicata, actions en masse, « Annuler » | Par module |

Les cinq premières lignes sont **structurelles** : peu coûteuses maintenant,
chantier de reprise sur chaque écran si différées.

---

# ADR-F21 : Intelligence artificielle — 🟡 CADRAGE ACTÉ, RIEN À CONSTRUIRE

**Statut** : orientation arrêtée. **Aucune implémentation avant que le socle et
les premiers modules métier existent.** Consigné pour ne pas fermer de portes.

## F21.1 — La règle d'or

> **L'IA ne prononce jamais un chiffre. Elle navigue, filtre, extrait, rédige.
> Les montants viennent toujours du système.**

Une IA qui affirme « le solde de Dupont est de 4 200 DT » alors qu'il est de
4 700, sur un grand livre append-only, est pire que pas d'IA : une seule erreur
de ce type et les utilisateurs cessent définitivement de faire confiance.

## F21.2 — Jamais de SQL généré. Des outils = des endpoints.

Sur 293 tables et de la donnée financière, une jointure inventée ou une
agrégation approximative produit un chiffre **faux qui a l'air juste**. C'est la
démo qui marche toujours et la fonctionnalité qui trahit en production.

```
« factures du client Dupont de juin 2026 »
        ↓
rechercherFactures(tiers: "Dupont", du: 2026-06-01, au: 2026-06-30)
        ↓
la liste réelle, filtrée, dans l'écran habituel
```

L'IA appelle **exactement l'endpoint que l'interface appelle déjà** — testé,
indexé, filtré par les permissions. Aucun chemin d'accès nouveau à sécuriser.

Le résultat n'est **pas un texte** : c'est l'écran réel filtré. L'utilisateur
voit ce qui a été compris et peut corriger le filtre à la main.

## F21.3 — L'infrastructure existe déjà à ~70 %

| Décision déjà prise | Rôle pour l'IA |
|---|---|
| **OpenAPI** (demande #1) | **Le catalogue d'outils**, littéralement. Un artefact, deux usages |
| **RBAC opt-in inversé** | **La barrière de sécurité.** L'IA ne peut appeler que ce que l'utilisateur peut appeler. Rien à construire |
| **Palette `Ctrl+K`** (F20.8) | Le point d'entrée. Aucune interface nouvelle |
| **Filtres dans l'URL** (F20.2) | Le résultat est un lien partageable |
| **Entitlements** (ADR-F08) | L'IA est un module vendable, facturé à l'usage |

**Une seule contrainte à appliquer dès maintenant, à coût nul** : toute
description OpenAPI doit être **lisible par une machine autant que par un
humain** — verbe clair, paramètres nommés, description utile. C'est la différence
entre une IA qui comprend l'API et une qui devine. → ajouté à la demande n°1.

## F21.4 — Cas d'usage, par valeur décroissante

**1. Extraction de documents — le meilleur retour.**
Les fournisseurs envoient grilles tarifaires, contrats hôteliers et
confirmations en PDF ou Excel, chacun dans son format ; quelqu'un les ressaisit
à la main. L'IA extrait, **propose**, un humain valide, puis on importe. **Jamais
d'écriture automatique.** Touche directement le **Contracting hôtelier**, dernier
module et le plus risqué : retire une part du travail pénible sans toucher aux
règles métier.

**2. Multilingue — vrai différenciateur.**
Un agent tape en arabe, en français, ou en mélangeant. Les concurrents
internationaux livrent de l'anglais. Sur ces marchés, c'est une raison d'acheter.

**3. Assistance au lettrage.**
Le lettrage automatique a été explicitement différé (23/07, backend). L'IA
propose des rapprochements, l'humain confirme d'un clic — les règles métier n'ont
plus besoin d'être parfaites du premier coup.

**4. Rédaction.**
Le schéma figé contient **déjà** un moteur de documents et d'emails
(`document_context_type`, templates). L'IA rédige confirmation ou relance
d'impayé, en trois langues, dans le gabarit maison. Risque faible : relecture
humaine avant envoi.

**5. Aide conversationnelle.**
« Comment annuler une réservation déjà facturée ? », répondu depuis la
documentation maison. Se branche sur le panneau d'aide (F20.6), allège le
support.

## F21.5 — Architecture

**Passerelle hébergée chez OctaSoft.** Le modèle 1 serveur = 1 client
imposerait sinon de gérer 100+ clés d'API. La passerelle détient les clés et
**compte naturellement la consommation**.

**Non bloquante par conception.** Différence essentielle avec les licences : si
l'IA tombe, une fonctionnalité se dégrade ; si les licences tombent, l'ERP
s'arrête. L'IA ne doit jamais se trouver dans le chemin critique.

**Confidentialité.** Transmettre des données clients à un tiers, en Europe,
demande une base contractuelle. Traité par **activation explicite, par client**,
et probablement par choix de région. À ne pas découvrir au premier appel d'offres
européen.

## F21.6 — Modèle économique

**Module vendu séparément**, avec **tarification par famille d'opération** — le
coût réel varie d'un facteur cinquante entre une question d'aide et l'extraction
d'un contrat de 40 pages.

| Famille | Unité vendue | Coût |
|---|---|---|
| Aide, recherche en langage naturel | forfait mensuel | faible — produit d'appel |
| Rédaction | par document | moyen |
| **Extraction** | **par document ou par page** | élevé — **la marge est ici** |
| Assistance au lettrage | par lot traité | moyen |

**Facturer en unités métier, jamais en jetons.** La consommation réelle (modèle,
jetons, coût) est enregistrée en interne ; le client achète des unités qu'il
comprend. Sinon le prix public bouge à chaque changement de tarif fournisseur.

L'extraction a aussi la **valeur perçue la plus forte** : elle remplace de la
ressaisie. « 2 DT par contrat » contre « vingt minutes d'un employé » se compare
facilement. Sur l'aide, la comparaison est impossible — d'où le forfait.

## F21.7 — Crédits prépayés, jamais de dépassement

Modèle retenu, identique à celui de Claude ou Cursor : **plan supérieur, ou
recharge à la demande**. Pas de dépassement facturé a posteriori.

- Aucun impayé à recouvrer, aucune créance douteuse
- Aucune facture surprise, donc aucun litige
- Le client contrôle sa dépense — ce qui rassure à l'achat

**Recharge automatique** proposée (« sous 100 crédits, recharger de 500 ») :
supprime la friction sans supprimer le contrôle.

**Un solde de crédits est un grand livre** — crédits, débits, solde, correction
par contre-passation. C'est **exactement le pattern Règlements**, validé sur 2064
pièces réelles. Ce n'est pas un système nouveau, c'est un motif maîtrisé appliqué
à un autre couple d'acteurs.

| Grand livre | Qui doit à qui | Où il vit |
|---|---|---|
| **Règlements** | L'agence ↔ ses clients et fournisseurs | Dans l'ERP |
| **Crédits IA** | OctaSoft ↔ l'agence | **Chez OctaSoft** ; miroir en lecture seule côté client |

Le compteur ne peut pas vivre chez celui qui paie. Même logique de miroir que
OctaSoft Static Data. Deux relevés à réconcilier — logique de rapprochement déjà
maîtrisée.

**Réservation des crédits au démarrage.** On ne coupe jamais au milieu d'une
opération : une extraction de 40 pages qui épuise le solde à la page 30 ne plante
pas. C'est aussi ce qui rend possible l'annonce préalable.

## F21.8 — Trois règles d'interface

1. **Annoncer avant** — « cette extraction consommera 40 unités, il vous en reste
   312. Continuer ? » Personne ne découvre la facture après.
2. **Compteur toujours visible** dans le module IA : consommé, restant, date de
   réinitialisation.
3. **Distinguer l'échec de l'insatisfaction** — un traitement qui plante n'est
   pas facturé. Un traitement réussi jugé mauvais est facturé, mais **dit à
   l'avance**, jamais découvert.

## F21.9 — À faire maintenant : presque rien

Ne pas construire. Ne pas fermer de portes :

- OpenAPI complet, propre et **descriptif** (demande #1)
- Permissions vérifiées côté backend (S8)
- Palette de commandes extensible (S9)
- État dans l'URL (F20.2)

La structure de données (journal de consommation, quotas, périodes, plans)
**n'est pas conçue ici** et son module de rattachement n'est pas décidé —
question pour le chat BDD. Voir `note-chat-bdd-consommation-ia.md`.

---

# ADR-F08 v2 — amendement : trois verrous, pas deux

**Motif** : l'IA introduit des entitlements **à compteur**, là où le modèle
initial ne connaissait que des interrupteurs.

## Un entitlement n'est plus un booléen

| Type | Exemple | Question posée |
|---|---|---|
| **Interrupteur** | Module Caisse | *Est-ce autorisé ?* |
| **Compteur** | 500 extractions / mois | *Est-ce autorisé, et combien reste-t-il ?* |

## Trois verrous distincts, trois affichages distincts

| Situation | Affichage | Action proposée |
|---|---|---|
| Module **non acheté** | Visible, verrouillé | « Découvrir » |
| Acheté, **crédits épuisés** | Visible, verrouillé | « Recharger » / « Passer au plan supérieur » |
| **Pas la permission** | **Masqué** — rien du tout | aucune |

Quatrième état, **non bloquant** : crédits bas → avertissement, jamais un blocage.

« Recharger » n'est visible que pour qui a le droit d'acheter — même permission
« voir l'offre commerciale ». Un opérateur de comptoir n'a aucun pouvoir de
dépense.

## Correction à la demande backend n°2

`/me` doit renvoyer des entitlements capables de porter :

```
état     : actif | épuisé
quota    : nombre | illimité
consommé : nombre
période  : début, fin
```

Ne coûte rien tant qu'aucun quota n'existe. Coûte cher à rajouter après — il
faudrait refaire `/me` **et** l'interface.
