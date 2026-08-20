/**
 * CELLULES PROPRES AU MODULE TIERS.
 *
 * Elles ne montent pas dans `shared/table/cells` : `RolesCell` sait ce qu'est un
 * fournisseur, `StateCell` sait qu'un tiers peut être prospect ET en litige.
 * C'est du domaine, pas du système de design.
 */
import { useIntl } from 'react-intl'
import { Building2, User } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { PartyRow } from './fixtures'

/**
 * La NATURE — personne ou organisation. Une icône seule, avec son infobulle :
 * la colonne est étroite et le mot n'apporterait rien qu'on ne voie déjà au nom.
 */
export function NatureCell({ nature }: { nature: PartyRow['nature'] }) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: `parties.nature.${nature}` })
  const Icon = nature === 'organization' ? Building2 : User

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-ink-muted inline-flex" aria-label={label}>
          <Icon className="size-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * LES RÔLES — cumulables, jamais une colonne unique.
 *
 * Un tiers peut être client ET fournisseur : ce sont **deux grands livres, jamais
 * compensés**. Afficher un seul rôle serait un contresens comptable, pas un
 * raccourci d'affichage.
 */
export function RolesCell({ roles }: { roles: PartyRow['roles'] }) {
  const intl = useIntl()
  if (roles.length === 0) return <span className="text-ink-muted">—</span>

  return (
    <span className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge
          key={role}
          variant={role === 'customer' ? 'primary' : 'secondary'}
          appearance="light"
          size="sm"
        >
          {intl.formatMessage({ id: `parties.role.${role}` })}
        </Badge>
      ))}
    </span>
  )
}

/**
 * L'ÉTAT — trois drapeaux INDÉPENDANTS (`isDisabled`, `isProspect`,
 * `isDisputed`). Le contrat les dit « non partitionnants » : un tiers peut être
 * prospect et en litige à la fois. On les affiche donc tous, et « Actif » n'est
 * que l'absence des trois.
 */
export function StateCell({ party }: { party: PartyRow }) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const flags: { key: string; tone: 'destructive' | 'warning' | 'info' }[] = []

  if (party.isDisabled) flags.push({ key: 'disabled', tone: 'destructive' })
  if (party.isDisputed) flags.push({ key: 'disputed', tone: 'warning' })
  if (party.isProspect) flags.push({ key: 'prospect', tone: 'info' })

  if (flags.length === 0) {
    return (
      <Badge variant="success" appearance="light" size="sm">
        {t('parties.state.active')}
      </Badge>
    )
  }

  return (
    <span className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <Badge key={flag.key} variant={flag.tone} appearance="light" size="sm">
          {t(`parties.state.${flag.key}`)}
        </Badge>
      ))}
    </span>
  )
}

/**
 * LES BUREAUX — souvent un, parfois plusieurs, parfois aucun.
 *
 * On montre le premier et on COMPTE les autres plutôt que d'élargir la colonne :
 * la liste se lit en balayant, pas en lisant. Le détail est dans l'infobulle.
 */
export function OfficesCell({ offices }: { offices: PartyRow['offices'] }) {
  const intl = useIntl()
  const [first, ...rest] = offices
  if (!first) return <span className="text-ink-muted">—</span>

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="text-ink-secondary truncate">{first.displayName}</span>
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Badge variant="secondary" appearance="light" size="xs">
                <span dir="ltr" className="tabular-nums [unicode-bidi:isolate]">
                  +{rest.length}
                </span>
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {rest.map((office) => office.displayName).join(' · ')}
          </TooltipContent>
        </Tooltip>
      )}
      <span className="sr-only">
        {intl.formatMessage(
          { id: 'parties.offices.count' },
          { count: offices.length }
        )}
      </span>
    </span>
  )
}

/**
 * Une valeur qui n'existe PAS encore dans les données réelles.
 *
 * Le scan du 04/08 : `logoUrl`, `phonePrimary` et `country` sont vides sur les
 * 106 000 lignes. La colonne reste donc affichée — un champ masqué parce que nul
 * est indiscernable d'un champ inexistant — et le vide s'écrit « — ».
 */
export function PlainCell({ value }: { value?: string }) {
  if (!value) return <span className="text-ink-muted">—</span>
  return <span className="text-ink-secondary truncate">{value}</span>
}
