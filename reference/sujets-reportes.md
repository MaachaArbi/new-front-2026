# Sujets reportés — OsTravel Front

Ce document liste les sujets importants qui sont délibérément hors périmètre initial
ou reportés à une vague ultérieure.

## Hors périmètre du front

| Sujet                                   | Raison                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------- |
| **Site B2C Next.js** (ADR-012)          | Chantier distinct, non ouvert. Aucun partage de code à anticiper.      |
| **Mobile React Native**                 | Phase ultérieure, non planifiée                                        |
| **CMS / SEO**                           | Migre vers une application CMS séparée (décision BDD)                  |
| **Application de gestion des licences** | Produit séparé, comme OctaSoft Static Data. Mérite son propre Project. |
| **Stock Management**                    | Retiré du périmètre projet (décision 16/07)                            |

## Reportés à une vague future

| Sujet                                                             | Dépend de                                                 | Vague estimée           |
| ----------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| **Chiffres arabo-indiens selon la locale**                        | Décision d'i18n avancée                                   | S4+                     |
| **Calendrier hégirien en affichage secondaire**                   | Décision d'i18n avancée                                   | S4+                     |
| **Couleurs du rail : une par module ou teinte unique**            | Décision de théming                                       | S2/S3                   |
| **Préfixe `kt-` des classes utilitaires : renommer ou conserver** | Décision post-audit Metronic                              | S1 ou S2                |
| **Stockage du jeton (mémoire + refresh, ou cookie httpOnly)**     | Changement CORS backend                                   | S6                      |
| **Redis pour le cache de permissions**                            | Décision d'infrastructure backend                         | S8+                     |
| **Rate limiting**                                                 | Infrastructure transverse, peu prioritaire en back-office | S11+                    |
| **Politique de résiliation (dégradation lecture seule)**          | À écrire avant première vente de module optionnel         | avant commercialisation |
| **Observabilité (Sentry / GlitchTip)**                            | Décision d'infrastructure transverse                      | S10+                    |
| **Lettrage automatique** (Règlements)                             | À reprendre pendant chantier écrans métier                | vague Règlements        |

---

**Références**

- `reference/front-cadrage/00-front-project-overview.md` — § 3 « Périmètre »
- `reference/front-cadrage/02-front-module-index.md` — § 5 « Sujets ouverts »
