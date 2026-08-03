# Demande Backend — Le refresh token hors de portée du JavaScript

**Date** : 2026-08-03
**Statut** : 🟡 ENVOYÉE (par Arbi, 03/08) — en attente
**Bloque** : la **persistance de session** et la **boucle de refresh** du front (pas le reste de V1)

---

## Le besoin (pas la solution — règle R1)

Le *refresh token* ne doit **jamais** être accessible au JavaScript du front, pour qu'un XSS ne
puisse pas voler ce **secret de longue durée**.

Aujourd'hui (vérifié dans `tests/Integration/.../AuthLoginTest` et `SessionLifecycleTest`),
`login` et `refresh` rendent `{token, refreshToken}` **dans le corps de la réponse**. Le front
doit donc le stocker côté client — exactement ce que le `front-jetable` signalait comme « à ne
pas reproduire » (localStorage).

**Demandé** : que le refresh token soit **livré et attendu hors de portée du JS** (le moyen
standard étant un cookie `httpOnly` + `Secure` + `SameSite`, avec protection CSRF côté serveur).
L'*access token* court peut, lui, rester en Bearer dans le JS. **Le front ne prescrit pas la
solution technique — le back la choisit.**

## Impact

- **Sans** : le front devrait persister le refresh token en JS (localStorage/sessionStorage) →
  exposé à un vol par XSS. Posture « zéro risque » d'Arbi refusée.
- **Avec** : le refresh token n'est jamais touché par le JS ; le risque résiduel (CSRF) est du
  ressort du back (`SameSite` + CSRF), bien maîtrisé.

## En attendant

V1 avance sur tout le reste (client API, login, `/me`, tiers en lecture) ; la **persistance +
refresh** sont différés jusqu'à la livraison. En dev, session en mémoire (perdue au reload) —
aucune persistance non sûre livrée.

## Références

- Contrat d'API §1.6 (session, rotation), §2.5.
- Cadrage `docs/cadrage/2026-08-03-v1-auth-party-lecture.md`.
