/**
 * Raccourcis de navigation globaux (ADR-F20.5) : séquences `g` puis une touche,
 * façon Gmail/Linear. Montés **au niveau de l'app** (et non d'un écran), pour
 * fonctionner depuis n'importe quelle page — sinon un raccourci qui navigue
 * démonte la page qui l'a enregistré, et le suivant ne se déclenche plus.
 *
 * Basés sur la **position physique** (`event.code`) via le socle clavier. La
 * liste est volontairement minimale (les deux modules démontrés) et extensible :
 * ajouter une entrée suffit.
 */

import { useNavigate } from 'react-router-dom'
import { useShortcut } from '@/shared/keyboard'

interface NavSequence {
  id: string
  /** `event.code` de la seconde touche (la première est toujours `KeyG`). */
  code: string
  /** Libellé de la seconde touche pour l'affichage `Kbd`. */
  display: string
  path: string
  /** Clé i18n de la description. */
  descriptionKey: string
}

const NAV_SEQUENCES: readonly NavSequence[] = [
  {
    id: 'nav.parties',
    code: 'KeyP',
    display: 'P',
    path: '/parties',
    descriptionKey: 'shortcut.demo.gotoParties',
  },
  {
    id: 'nav.bookings',
    code: 'KeyB',
    display: 'B',
    path: '/bookings',
    descriptionKey: 'shortcut.demo.gotoBookings',
  },
]

/** Enregistre une séquence via le socle (un hook par instance — ordre stable). */
function RegisterNavSequence({ sequence }: { sequence: NavSequence }) {
  const navigate = useNavigate()
  useShortcut({
    id: sequence.id,
    sequence: [{ code: 'KeyG' }, { code: sequence.code }],
    descriptionKey: sequence.descriptionKey,
    displayKeys: ['G', sequence.display],
    handler: () => navigate(sequence.path),
  })
  return null
}

/** À monter une fois, globalement, à l'intérieur du routeur. */
export function NavigationShortcuts() {
  return (
    <>
      {NAV_SEQUENCES.map((sequence) => (
        <RegisterNavSequence key={sequence.id} sequence={sequence} />
      ))}
    </>
  )
}
