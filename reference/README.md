# Reference — À lire en premier

Ce dossier contient la documentation de cadrage du projet front OsTravel. **C'est
du matériel de lecture, jamais de modification.**

## Ordre de lecture obligatoire

1. **`front-cadrage/00-front-project-overview.md`** — contexte, périmètre, stack
2. **`front-cadrage/01-front-architecture-decisions.md`** — ADR-F01 à F19, choix
   architecturaux fondamentaux
3. **`front-cadrage/02-front-module-index.md`** — état backend, séquencement des
   vagues, demandes backend

## Règle absolue

**Aucune règle métier ne doit être déduite, supposée ou « améliorée » si elle
n'est pas explicitement dans ces documents.**

En cas de doute ou d'absence d'information : **arrête-toi et demande**. Ne propose
jamais une règle plausible à la place. C'est le seul rempart contre la divergence
d'un projet solo assisté par IA.

## Interdit

- ✋ Aucun linting, aucun reformatage des fichiers de ce dossier
- ✋ Aucune modification du contenu (même cosmétique)
- ✋ Aucune copie de fichiers de configuration depuis ce dossier
- ✋ Les trois documents de `front-cadrage/` ne changent qu'après vérification
  du master dev front

## Mise à jour

Toute mise à jour de ce dossier est une **étape de clôture explicite**, jamais
un artefact de développement. La synchronisation passe par un contrôle
d'intégrité SHA-256 (`npm run check:reference`) exécuté en CI.

## Contenu

| Dossier | Rôle | État |
|---|---|---|
| **front-cadrage/** | Docs de cadrage projet | ✅ figé |
| **meta/** | Sujets reportés, architecture décisions | ⏳ |
| **adr/** | ADR backend et BDD (copies) | ⏳ |
| **conceptual-models/** | Modèles conceptuels (copies) | ⏳ |
| **api/** | `openapi.json` du backend, contrats | ⏳ |

---

**À relire avant chaque session de développement.** C'est ton seul repère de
vérité sur le métier.
