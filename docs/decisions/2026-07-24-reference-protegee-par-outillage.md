# Décision — 2026-07-24 — `reference/` protégée par outillage, jamais par consigne

**Date** : 2026-07-24  
**Décideur** : Vague S1-bis, correction suite à dérive S1  
**Statut** : ✅ ACCEPTÉE

---

## Contexte

S1 a posé une règle documentée : _« Tu ne modifies **jamais** le contenu de
`reference/`. »_ Prettier l'a violée dès la première vague, reformatant les
trois documents de `front-cadrage/` et réécrivant les blocs de code d'ADR-F08 et
ADR-F19 (suppression de 7 points-virgules critiques, transformant des extraits
corrects en code syntaxiquement invalide).

**La consigne seule ne suffit pas.** Un projet solo assisté par IA ne peut pas
compter sur la discipline : il doit placer des garde-fous qui ne peuvent pas
être contournés par erreur.

---

## Décision

`reference/` est protégé par **outillage cryptographique**, jamais par consigne :

1. **Contrôle d'intégrité SHA-256** : empreintes digitales des fichiers `.md`
   stockées dans `reference/.checksums`, vérifiées en CI via
   `tools/check-reference-integrity.sh`

2. **Geste explicite pour mise à jour** : tout changement légitime passe par
   `--update`, action délibérée tracée en git, jamais automatique

3. **Exclusions au niveau des outils** :
   - `.prettierignore` protège du reformatage
   - `eslint.config.js` exclut `reference/` du linting (qui aurait pu le
     reformater indirectement)
   - `.gitignore` contient les artefacts de build

4. **Documentation explicite** : `reference/README.md` énonce l'interdiction et
   le mécanisme, sans ambiguïté

5. **Intégration CI** : `npm run check:reference` bloque tout push qui aurait
   modifié `reference/`

---

## Conséquences

**Avantages** :

- Aucune modification de `reference/` ne peut passer silencieusement
- Les trois documents de cadrage restent la source de vérité unique
- La chaîne CI détecte toute dérive avant qu'elle ne soit propagée
- L'outillage fonctionne sans intervention humaine

**Inconvénients** :

- Mise à jour légitime de `reference/` exige l'étape `--update`
- Cette étape doit être consciente et tracée en git (non automatique)
- Le coût machine pour SHA-256 est négligeable

---

## Impact

- **S1** : retro-corrigée (note ajoutée au journal)
- **S1-bis** : implémentation
- **S2+** : tout prompt peut citer `reference/` en confiance
- **CI** : nouvelle étape pour chaque merge

---

## Références

- Journal S1 : correction ajoutée
- Journal S1-bis : dérive documentée
- Script : `tools/check-reference-integrity.sh`
- Checksum : `reference/.checksums`
- Workflow : `.github/workflows/ci.yml`
