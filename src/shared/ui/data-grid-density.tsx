/**
 * DENSITÉ DU TABLEAU — condensé · normal · aéré.
 *
 * Écrit par nous. Le template n'a qu'un booléen `dense`, posé par le
 * développeur : l'utilisateur ne pouvait rien régler.
 *
 * ── POURQUOI TROIS CRANS, ET PAS UN INTERRUPTEUR ───────────────────────────────
 * Dans un ERP, la hauteur de ligne décide **combien de lignes tiennent à
 * l'écran** — donc combien un agent voit sans défiler. Ce n'est pas un goût,
 * c'est un débit de travail, et il n'est pas le même au comptoir (on cherche vite,
 * on veut voir beaucoup) qu'à la compta (on lit ligne à ligne).
 *
 * ── ÇA SE COMBINE, ÇA NE REMPLACE PAS ──────────────────────────────────────────
 * Les trois crans sont des multiples de `--ui-row`, donc du réglage GLOBAL
 * d'affichage. « Condensé » chez quelqu'un qui a déjà choisi l'affichage compact
 * est plus serré que chez un autre. Les deux réglages s'additionnent au lieu de
 * se contredire.
 *
 * ⚠️ Le choix ne SURVIT PAS au rechargement. La persistance en préférences
 * utilisateur est en phase 2 (décision du 04/08, avec la disposition des
 * colonnes et les vues nommées). Inscrit au registre.
 */
import { useIntl } from 'react-intl'
import { Check, Rows2, Rows3, Rows4 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { DataGridDensityValue, useDataGrid } from '@/shared/ui/data-grid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

const LEVELS: readonly {
  value: DataGridDensityValue
  icon: typeof Rows2
}[] = [
  { value: 'compact', icon: Rows4 },
  { value: 'default', icon: Rows3 },
  { value: 'comfortable', icon: Rows2 },
]

function DataGridDensity({ label = true }: { label?: boolean }) {
  const intl = useIntl()
  const { density, setDensity } = useDataGrid()
  const current = LEVELS.find((level) => level.value === density) ?? LEVELS[1]
  const CurrentIcon = current?.icon ?? Rows3

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          mode={label ? 'default' : 'icon'}
          aria-label={intl.formatMessage({ id: 'ui.table.density' })}
        >
          <CurrentIcon />
          {label ? intl.formatMessage({ id: 'ui.table.density' }) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {LEVELS.map((level) => {
          const Icon = level.icon
          return (
            <DropdownMenuItem
              key={level.value}
              onSelect={() => setDensity(level.value)}
            >
              <Icon />
              <span className="grow">
                {intl.formatMessage({ id: `ui.table.density.${level.value}` })}
              </span>
              {level.value === density && (
                <Check className="text-primary size-4" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DataGridDensity }
