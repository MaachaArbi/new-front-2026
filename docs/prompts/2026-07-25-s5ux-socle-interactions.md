# Prompt — Vague S5-UX — Socle d'interactions

> **Destinataire : agent Claude Code n'ayant aucun contexte préalable sur ce projet.**
> À archiver dans `docs/prompts/2026-07-25-s5ux-socle-interactions.md` — **avant la clôture**.

> **Note de numérotation** : le backlog réserve « S5 » au client API (bloqué : pas
> d'`openapi.json`). Cette vague est un **socle UX autonome**, insérée avant S5.
> Elle est nommée **S5-UX** pour ne pas percuter la numérotation existante. Ne
> renumérote rien d'autre.

---

## 0. OÙ TU ES, ET COMMENT TE SITUER

### 0.1 Emplacement

```
/home/ubuntu/ostravel-front       ← le projet. Place-toi dedans avant toute action.
/home/ubuntu/ostravel             ← le backend Symfony. LECTURE SEULE, hors sujet ici.
/home/ubuntu/vendor-metronic/     ← sources d'un template sous licence. Hors sujet ici.
```

Vérifie : `git remote -v` doit pointer vers `new-front-2026`.

### 0.2 Le projet en trois phrases

Back-office React/Vite d'un ERP pour agences de voyages, édité par **OctaSoft**,
produit **OS-TRAVEL**. Développement **solo, assisté par IA**, par vagues
successives, chacune documentée. Marchés visés : Afrique du Nord, Moyen-Orient,
Europe — **l'arabe RTL est une contrainte de premier plan.**

### 0.3 Lis ceci avant d'écrire une ligne

| Fichier | Ce que tu y trouves |
|---|---|
| `docs/STATUS.md` | L'état à l'instant présent |
| `reference/README.md` | La règle de lecture seule |
| `reference/front-cadrage/00-front-project-overview.md` | Périmètre, circuit de travail |
| `reference/front-cadrage/01-front-architecture-decisions.md` | Décisions ADR-F01 à F19 |
| `reference/front-cadrage/03-front-adr-ux-ia.md` | **ADR-F20 (UX) — le cœur de cette vague** |
| `docs/journal/` — les 4 derniers | Ce qui vient d'être fait, et pourquoi |

**L'ADR décisive ici est ADR-F20.** Lis-la en entier : cette vague en implémente
les fondations.

### 0.4 Deux règles absolues

**Tu ne modifies JAMAIS `reference/`.** Intégrité vérifiée par empreintes SHA-256
en CI (`npm run check:reference`). Un document faux se **signale**, ne se corrige
pas.

**Aucune règle métier n'est déduite, supposée ou inventée.** Information
manquante → tu t'arrêtes et tu demandes.

### 0.5 Ce que l'historique enseigne — lis-le vraiment

Ce projet a connu des incidents documentés, non pour blâmer mais pour prévenir :

1. **Une vague a coché des critères d'acceptation faux** (`tsc` polluait `dist/`,
   `reference/` avait été reformaté). Coût : deux vagues de rattrapage.
2. **Une vague a installé avec un drapeau de contournement sans le signaler** :
   `npm ci` échouait ensuite sur toute machine neuve.
3. **Une vague a produit un *plan* à la place du travail**, sans le dire.

Les vagues récentes ont inversé la tendance en **signalant** ce qui ne pouvait
pas être vérifié, au lieu de le cocher. C'est le comportement attendu. La dernière
vague (Money) a même détecté un vrai bug de contrat et l'a remonté — c'est le
niveau visé.

---

## 1. GARDE-FOUS — VPS partagé, avec de la production

- ❌ Travaille **uniquement** dans `/home/ubuntu/ostravel-front`
- ❌ Jamais de `sudo`, jamais de `npm install -g`
- ❌ Ne touche pas à nginx, systemd, pm2, docker, crontab, `~/.bashrc`, `~/.npmrc`, nvm/fnm/volta
- ❌ Ne tue aucun processus, ne redémarre aucun service
- ❌ Ne modifie pas `/home/ubuntu/ostravel` (backend) — lecture seule
- ❌ **Jamais `--force`, jamais `--legacy-peer-deps`.** `npm ci` doit rester vert
  sans drapeau. Un conflit de pairs se **signale**.

Serveur de dev sur le port **5180**, ne le change pas.

---

## 2. L'OBJECTIF

> **Poser les fondations d'interaction qui rendront tous les futurs écrans
> cohérents, rapides et pilotables au clavier — sans toucher au backend.**

Cette vague est **entièrement autonome** : aucun appel réseau, aucune donnée
serveur. Elle construit des mécanismes réutilisables, pas des écrans métier.

**Pourquoi maintenant** : ces fondations doivent exister *avant* les écrans
métier, sinon il faut repasser sur chacun pour les ajouter. C'est le principe
d'ADR-F20 : les décisions structurelles se posent tôt.

---

## 3. CE QU'IL FAUT CONSTRUIRE

Quatre fondations. Chacune est un mécanisme réutilisable, démontré sur une page
de démonstration temporaire.

### 3.1 Registre de raccourcis clavier (ADR-F20.5)

Un système **central** de raccourcis. Jamais de gestionnaire de touches posé à la
main dans un composant isolé.

**Le piège à traiter — c'est le point le plus important de cette fondation :**

Les raccourcis doivent se baser sur la **position physique de la touche**
(`event.code`, ex. `KeyR`), **jamais** sur le caractère produit (`event.key`).
Sinon ils cassent dès qu'un utilisateur passe en disposition arabe — soit une
large part des utilisateurs cibles. Ce défaut est invisible tant qu'on ne teste
pas avec un clavier arabe.

Fonctions attendues :

- Enregistrer/désenregistrer un raccourci depuis n'importe quel composant
- **Séquences à deux touches** façon Gmail/Linear : `g` puis `r`. Sans conflit
  avec la saisie (un raccourci ne se déclenche pas quand le focus est dans un
  champ)
- **Portée** : certains raccourcis sont globaux, d'autres actifs seulement dans un
  contexte donné (une liste, une modale)
- **Découvrabilité** : la touche `?` ouvre une liste de tous les raccourcis actifs
- **Interaction avec les droits (ADR-F20.5)** : un raccourci vers une action non
  autorisée est **inerte** — il ne déclenche rien et ne produit **pas** d'erreur.
  Les permissions n'existent pas encore (vague S8) : prévois le point d'accroche
  (un raccourci peut porter une condition d'activation), sans le câbler.

Le composant `kbd` existe déjà dans `src/shared/ui/` pour afficher les touches.

### 3.2 Squelettes de chargement (ADR-F20.3 et F20.4)

- Un jeu de composants **squelette** (formes grises animées) pour les états de
  chargement : ligne de tableau, carte, bloc de texte, champ.
- Le principe ADR-F20.3 : **un squelette, jamais un spinner**. Un squelette montre
  la forme de ce qui arrive ; la mise en page ne saute pas à l'arrivée des données.
- Prépare aussi le principe ADR-F20.4 (listes qui ne clignotent pas : les données
  précédentes restent affichées, estompées, pendant un rechargement). Ce
  comportement est natif dans TanStack Query — ici, pose juste le **composant
  visuel d'estompage**, le câblage viendra avec les vraies listes.

### 3.3 Convention panneau / modale / page (ADR-F20.1 et F20.2)

Trois conteneurs pour les futurs formulaires, à standardiser **maintenant** pour
que tous les écrans les utilisent de la même façon :

| Cas | Conteneur | Base |
|---|---|---|
| Consulter/modifier une ligne | **Panneau latéral** | `sheet` (déjà dans `ui/`) |
| Création rapide | **Modale** | `dialog` (déjà dans `ui/`) |
| Formulaire complexe | **Page dédiée** | route |

**Le point structurant (ADR-F20.2)** : l'état d'ouverture doit vivre dans l'URL,
pas seulement dans un état React. Ouvrir un panneau sur une ligne donne une URL du
type `?open=<id>`. Bénéfices : second onglet pour comparer, bouton Retour
fonctionnel, et le support peut demander « envoyez-moi votre URL ».

Construis un **petit hook ou utilitaire** qui synchronise l'ouverture d'un
panneau/modale avec un paramètre d'URL, et démontre-le sur la page de démo (ouvrir
un panneau factice change l'URL ; coller l'URL rouvre le panneau).

### 3.4 Coquille de la palette de commandes (ADR-F20.8)

`Ctrl+K` (et `Cmd+K`) ouvre une palette de commandes. Le composant `command`
(basé sur `cmdk`) existe déjà dans `ui/`.

En S5-UX, la palette est une **coquille** : elle s'ouvre, se ferme, se navigue au
clavier, et propose des **actions statiques de démonstration** (aller à un module,
basculer le thème, changer de langue). Le remplissage réel (sauter à une
réservation, à un client) viendra avec les écrans métier et l'API.

Contraintes :
- Ouverture/fermeture au clavier, navigation flèches + Entrée
- **Direction correcte en RTL** (le `DirectionProvider` est déjà monté)
- Toutes les étiquettes via l'i18n, dans les trois langues (`en`, `fr`, `ar`)

---

## 4. LA PAGE DE DÉMONSTRATION

Crée **une** page de démonstration temporaire qui exerce les quatre fondations :
des raccourcis actifs, des squelettes visibles, un panneau et une modale
synchronisés à l'URL, la palette `Ctrl+K`.

Elle est **temporaire** : marque-la clairement (route `/_dev/ux` ou similaire) et
inscris au backlog « retirer la page de démonstration UX quand les écrans métier
existent ». Aucune donnée factice hors `src/shared/dev/`.

---

## 5. CONTRAINTES TRANSVERSES — déjà en vigueur

- **RTL** : aucune classe directionnelle physique (`ml-`, `pl-`, `left-`,
  `text-left`…). Une règle ESLint les refuse. Raccourcis basés sur `event.code`,
  palette et panneaux corrects en RTL.
- **i18n** : aucune chaîne d'interface en dur. Tout via `src/shared/i18n`, dans les
  trois langues.
- **Montants** : sans objet ici, mais si un montant apparaît sur la démo, il passe
  par le noyau `src/shared/money/` (jamais de `toFixed` — une règle ESLint le
  refuse).
- **TypeScript strict** : pas de `any`. `noUncheckedIndexedAccess` est actif.
- **Accessibilité** : les composants `ui/` sont sur Radix — ne casse pas ce qu'ils
  fournissent (focus, ARIA, clavier). Ne remplace pas une primitive par un `div`.

---

## 6. HORS PÉRIMÈTRE

❌ Client API, appels réseau, `openapi.json` → S5 (bloqué)
❌ Authentification → S6 · ❌ Permissions/entitlements réels → S8 (prévoir
l'accroche, ne pas câbler) · ❌ Data Grid, formulaires métier → S9
❌ Playwright → S11 · ❌ Aucun écran métier réel
❌ Aucun composant ajouté à `src/shared/ui/` (les 4 nécessaires — `sheet`,
`dialog`, `command`, `kbd` — existent déjà)
❌ Aucune modification du layout, de la palette, des tokens, du noyau Money
❌ Découpage de bundle → au backlog

**Si un élément hors périmètre te paraît nécessaire pour finir, c'est que tu te
trompes sur le périmètre.** Signale-le.

---

## 7. CRITÈRES D'ACCEPTATION

**Chaque case doit être EXÉCUTÉE.** Ce qui ne peut l'être est **signalé, pas
coché**.

### Technique

- [ ] `rm -rf node_modules && npm ci` passe **sans drapeau**
- [ ] `npm run build` → succès
- [ ] `npm run lint` → 0 erreur
- [ ] `npm run test` → tous verts, **nombre reporté** (ajoute des tests pour le
      registre de raccourcis et l'utilitaire URL↔panneau)
- [ ] `rm -rf dist && npx tsc -b` → `dist/` reste vide
- [ ] `npm run check:reference` → succès
- [ ] Aucune classe directionnelle physique (règle ESLint)
- [ ] Aucune chaîne d'interface en dur
- [ ] Les raccourcis utilisent `event.code`, **prouvé par un test** (une touche
      simulée à la même position physique déclenche, quelle que soit la « valeur »)

### Comportemental — à décrire dans le journal

- [ ] `Ctrl+K` ouvre la palette ; flèches + Entrée naviguent ; `Échap` ferme
- [ ] `g` puis `r` déclenche un raccourci de séquence ; ne se déclenche pas quand
      le focus est dans un champ de saisie
- [ ] `?` ouvre la liste des raccourcis
- [ ] Ouvrir un panneau change l'URL ; coller l'URL rouvre le panneau
- [ ] Les squelettes s'affichent pendant un chargement simulé
- [ ] En arabe : palette et panneaux s'ouvrent du bon côté

Si tu ne peux pas vérifier visuellement (port non joignable), **signale-le** et
laisse l'utilisateur trancher les points comportementaux.

---

## 8. LIVRABLES

- `docs/prompts/2026-07-25-s5ux-socle-interactions.md` — ce prompt, tel quel
- `docs/journal/2026-07-25-s5ux-socle-interactions.md` — gabarit habituel, section
  **« Dérives & corrections » obligatoire** (un livrable oublié en est une)
- `docs/decisions/2026-07-25-raccourcis-position-physique.md` — pourquoi les
  raccourcis se basent sur la position de touche et non le caractère (enjeu clavier
  arabe), et pourquoi l'état d'ouverture des panneaux vit dans l'URL
- `docs/STATUS.md` — S5-UX, dernière et prochaine action
- `docs/backlog/todo.md` — ajouter « retirer la page de démonstration UX »

**Bloc de clôture chiffré** :

```
npm ci       sans drapeau : oui / non
tsc          exit —
eslint       — erreur(s), — avertissement(s)
vitest       — tests, — assertions
bundle       — ko initial / — ko total
raccourcis   basés sur event.code : oui/non   testé RTL : oui/non
```

**Commit unique** : `feat(s5ux): socle interactions — raccourcis clavier, squelettes, panneaux URL, palette`
**Ne pousse pas** sans qu'on te le demande.

---

## 9. EN CAS DE BLOCAGE

Arrête-toi et signale si : un raccourci entre en conflit avec un raccourci
navigateur natif · `cmdk` ne se comporte pas correctement en RTL · une décision
t'est nécessaire et n'est pas dans `reference/`.

**Ne force jamais. Ne contourne jamais. Ne remplace jamais le travail par un
plan.** Un blocage signalé coûte cinq minutes ; un contournement silencieux a déjà
coûté deux vagues à ce projet.
