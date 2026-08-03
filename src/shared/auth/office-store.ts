import { create } from 'zustand'

/**
 * Bureau courant sélectionné (état client — ADR-F10). Le choix se fait parmi les
 * `organizations` de `/me` où `isOffice` est vrai. `officeAccountId` est renvoyé
 * aux points d'entrée qui l'exigent (contrat §2.2).
 */
interface OfficeState {
  selectedOfficeId: number | null
  setSelectedOffice: (id: number | null) => void
}

export const useOfficeStore = create<OfficeState>()((set) => ({
  selectedOfficeId: null,
  setSelectedOffice: (id) => set({ selectedOfficeId: id }),
}))
