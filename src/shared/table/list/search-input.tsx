/**
 * RECHERCHE DE LISTE — une seule boîte, plusieurs clés.
 *
 * ── LA DÉCISION QU'ELLE PORTE ──────────────────────────────────────────────────
 * Arbi, 04/08 : séparer les **clés de recherche** (courriel, téléphone, CIN,
 * matricule fiscal, registre de commerce — des choses qu'on CONNAÎT et qu'on
 * tape) des **facettes** (nature, rôle, ville — des choses qu'on CHOISIT dans une
 * liste). Cette distinction a éliminé environ 80 % des anciens « filtres » du
 * legacy, qui étaient des champs de recherche déguisés.
 *
 * Une seule boîte, donc, qui cherche dans tous les champs identifiants à la fois.
 * Le `placeholder` doit NOMMER ces champs : sans ça, l'agent ne devine pas qu'il
 * peut coller un matricule fiscal.
 *
 * ── LE DÉLAI ───────────────────────────────────────────────────────────────────
 * 300 ms avant de publier. Sans ça, « sahara » déclenche six requêtes, et l'URL
 * change six fois. Le délai n'est pas un confort : c'est ce qui rend la recherche
 * serveur tenable.
 *
 * ── LE PIÈGE DU CHAMP CONTRÔLÉ ─────────────────────────────────────────────────
 * La valeur affichée est LOCALE, la valeur publiée est différée. Il faut donc
 * resynchroniser quand la valeur externe change sans venir de la frappe (bouton
 * « tout effacer », retour arrière du navigateur, vue enregistrée) — mais sans
 * écraser ce que l'agent est en train de taper. D'où la référence au dernier
 * envoi.
 */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Search, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input, InputWrapper } from '@/shared/ui/input'
import { cn } from '@/shared/lib/cn'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  /** Doit nommer les champs cherchés, pas dire « Rechercher… ». */
  placeholder?: string
  delay?: number
  className?: string
}

function SearchInput({
  value,
  onChange,
  placeholder,
  delay = 300,
  className,
}: SearchInputProps) {
  const intl = useIntl()
  const [local, setLocal] = React.useState(value)
  const lastSent = React.useRef(value)

  // La valeur externe a changé SANS venir d'ici : on se resynchronise.
  React.useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value
      setLocal(value)
    }
  }, [value])

  React.useEffect(() => {
    if (local === lastSent.current) return
    const timer = setTimeout(() => {
      lastSent.current = local
      onChange(local)
    }, delay)
    return () => clearTimeout(timer)
  }, [local, delay]) // eslint-disable-line react-hooks/exhaustive-deps

  const clear = () => {
    lastSent.current = ''
    setLocal('')
    onChange('')
  }

  return (
    <InputWrapper className={cn('w-full sm:w-80', className)}>
      <Search />
      <Input
        type="search"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        placeholder={
          placeholder ?? intl.formatMessage({ id: 'ui.list.search' })
        }
        // `type=search` fait apparaître une croix native sur certains
        // navigateurs : on la retire, la nôtre est traduite et cohérente.
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {local && (
        <Button
          mode="icon"
          variant="ghost"
          size="sm"
          onClick={clear}
          aria-label={intl.formatMessage({ id: 'ui.list.clearSearch' })}
          className="-me-1 hover:bg-transparent"
        >
          <X />
        </Button>
      )}
    </InputWrapper>
  )
}

export { SearchInput }
