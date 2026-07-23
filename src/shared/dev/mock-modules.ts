// Données de démonstration du socle. Les modules (rail) et leurs menus vivent
// désormais dans `src/shared/layout/menu.config.ts` (ADR-F19). Ici ne restent
// que le bureau courant et l'utilisateur, en attendant l'API (S5) et l'auth (S6).

export const OFFICES = [
  { id: '1', name: 'Bureau Tunisie' },
  { id: '2', name: 'Bureau Algérie' },
  { id: '3', name: 'Bureau France' },
]

export const CURRENT_USER = {
  id: '1',
  name: 'Ahmed Ben Ali',
  email: 'ahmed@example.com',
}
