import { useIntl } from 'react-intl'
import { Search } from 'lucide-react'
import { Kbd } from '@/shared/ui/kbd'

/**
 * Recherche globale — dans l'en-tête, plus dans la barre latérale.
 *
 * Elle cherche dans TOUTE l'application, pas dans le module courant : sa place est
 * donc au-dessus du contenu, pas dans la colonne qui liste les écrans. C'est aussi là
 * que l'œil la cherche, et là qu'elle reste visible quand la barre est repliée.
 */
export function HeaderSearch() {
  const intl = useIntl()

  return (
    <button
      type="button"
      className="border-input text-muted-foreground hover:border-ring hover:text-foreground text-2sm flex h-8 items-center gap-2 rounded-lg border px-3 transition-colors"
    >
      <Search className="size-3.5" />
      <span>{intl.formatMessage({ id: 'layout.search' })}</span>
      <Kbd className="ms-6">⌘K</Kbd>
    </button>
  )
}
