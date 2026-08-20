/**
 * FACETTE — un filtre à choix multiples.
 *
 * ── DEUX RÈGLES D'ARBI, ENCODÉES ICI ───────────────────────────────────────────
 *
 *  1. **Les options viennent des référentiels**, jamais d'un balayage des valeurs
 *     distinctes sur 50 000 lignes. D'où la forme : la facette REÇOIT ses options,
 *     elle ne les découvre pas. L'appelant les tire du référentiel — ou d'une
 *     liste figée quand c'en est une.
 *
 *  2. **La barre du haut est la seule source de filtrage** (« modèle A »). Les
 *     en-têtes de colonne ne font que trier. Le motif était de performance vécue :
 *     l'entonnoir par colonne du legacy chargeait tout côté client, et c'était la
 *     cause des lenteurs.
 *
 * ── DÉTAILS QUI COMPTENT ───────────────────────────────────────────────────────
 *  · Le déclencheur affiche le NOMBRE de valeurs retenues : sans ça, une facette
 *    active ressemble à une facette vide et on cherche pourquoi la liste est courte.
 *  · Le menu ne se ferme PAS à chaque coche (`onSelect` neutralisé) : on en
 *    retient rarement une seule.
 *  · « Effacer » n'apparaît que s'il y a quelque chose à effacer.
 */
import { useIntl } from 'react-intl'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export interface FacetOption {
  value: string
  label: string
}

export interface FacetFilterProps {
  label: string
  options: readonly FacetOption[]
  selected: readonly string[]
  onChange: (values: readonly string[]) => void
}

function FacetFilter({ label, options, selected, onChange }: FacetFilterProps) {
  const intl = useIntl()

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-1.5">
          {label}
          {selected.length > 0 && (
            <Badge variant="primary" appearance="light" size="xs">
              <span dir="ltr" className="tabular-nums [unicode-bidi:isolate]">
                {selected.length}
              </span>
            </Badge>
          )}
          <ChevronDown className="text-ink-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            // Le menu reste ouvert : on retient rarement une seule valeur.
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => toggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])}>
              {intl.formatMessage({ id: 'ui.list.clearFacet' })}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { FacetFilter }
