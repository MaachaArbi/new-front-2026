# Décision — 2026-07-25 Raccourcis par position physique, état d'ouverture dans l'URL

**Date** : 2026-07-25
**Décideur** : chat pilote 00-Main DEV Front (vague S5-UX)
**Statut** : ✅ ACCEPTÉE

---

## Contexte

Le socle d'interactions (ADR-F20) pose deux mécanismes transverses dont le mauvais
choix se paie sur chaque écran futur : le **registre de raccourcis** et la
**convention d'ouverture** des panneaux/modales.

---

## Décision 1 — Les raccourcis se basent sur `event.code`, jamais `event.key`

Un raccourci est identifié par la **position physique** de la touche
(`event.code`, ex. `KeyR`), jamais par le caractère produit (`event.key`).

**Pourquoi.** Deux des trois zones cibles sont arabophones (ADR-F20.5). Dès qu'un
utilisateur passe en disposition arabe, `event.key` change (la touche physique R
produit « ق »), mais `event.code` reste `KeyR`. Un raccourci basé sur `event.key`
**casserait silencieusement** pour une large part des utilisateurs — défaut
invisible tant qu'on ne teste pas avec un clavier arabe. `event.code` est stable
quelle que soit la disposition.

Prouvé par test (`match.test.ts`, `shortcut-provider.test.tsx`) : un événement
`{ code: 'KeyR', key: 'ق' }` déclenche un raccourci défini sur `KeyR` ; un
événement `{ code: 'KeyB', key: 'r' }` (même caractère, autre position) ne le
déclenche pas.

### Exception unique et documentée — la touche « ? »

L'aide de découvrabilité (`?`) est liée par **caractère** (`event.key === '?'`),
non par position. C'est une affordance définie par son **glyphe**, pas une
action : l'utilisateur cherche « la touche point d'interrogation », dont la
position varie selon la disposition. Le type `KeyChord` autorise donc un accord
`{ key }` explicite, réservé à ce cas. **Tous les raccourcis d'action** restent
positionnels — la garantie reste prouvable et prouvée.

### Corollaires de conception

- **Registre central** : un seul écouteur `keydown` sur `window`, jamais de
  gestionnaire de touches posé à la main dans un composant (ADR-F20.5).
- **Séquences à deux touches** (`g` puis `r`, façon Gmail/Linear), avec délai
  d'expiration ; pas de conflit avec la saisie (inerte quand le focus est dans un
  champ).
- **Portées** : un raccourci peut être global ou actif seulement dans un contexte
  (liste, modale).
- **Accroche permissions** (`when`) : un raccourci vers une action non autorisée
  est **inerte** — il ne déclenche rien et ne produit **aucune erreur**
  (ADR-F20.5). Déclaré maintenant, câblé en S8.

---

## Décision 2 — L'état d'ouverture des panneaux vit dans l'URL

Ouvrir un panneau/une modale sur une ligne se reflète dans l'adresse
(`?open=<id>`), pas seulement dans un `useState` (ADR-F20.2).

**Pourquoi.** Trois bénéfices concrets, décisifs sur 100+ agences :
- ouvrir dans un second onglet pour comparer deux fiches ;
- le bouton Retour du navigateur se comporte normalement ;
- **le support peut dire « envoyez-moi votre URL »**.

Implémenté par un hook `useUrlPanel(param)` (sur `useSearchParams`) qui expose
`value`/`isOpen`/`open`/`close`/`onOpenChange` (adaptateur pour `Sheet`/`Dialog`).
Prouvé par test : ouvrir écrit le paramètre, fermer le retire, et rendre une URL
portant le paramètre rouvre le panneau.

---

## Conséquences

**Pour**
- RTL/clavier arabe corrects par construction, garantis par test.
- Panneaux adressables, partageables, compatibles Retour navigateur.
- Accroche permissions prête sans dette pour S8.

**Contre / limites**
- `Ctrl+K` (palette) entre en conflit avec un raccourci natif de certains
  navigateurs (barre de recherche Firefox) : neutralisé par `preventDefault`
  quand le raccourci est éligible. Signalé.
- La touche `?` (aide) dépend du glyphe : sur une disposition où `?` n'est pas
  accessible simplement, l'aide devra offrir un autre point d'entrée (bouton).
  Acceptable pour une affordance de découvrabilité.

---

## Références

- ADR-F20.1/.2 (panneaux, URL), ADR-F20.5 (raccourcis, position physique),
  ADR-F20.8 (palette), ADR-F04 (RTL).
- Code : `src/shared/keyboard/`, `src/shared/navigation/use-url-panel.ts`.
- Journal : `docs/journal/2026-07-25-s5ux-socle-interactions.md`.
