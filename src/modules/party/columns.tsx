import { Building2, User } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import type { PartyAccountListItem, PartyState } from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

/** Variantes de badge par état orthogonal. */
const STATE_BADGE: Record<
  Exclude<PartyState, 'active'>,
  'info' | 'secondary' | 'destructive'
> = {
  prospect: 'info',
  disabled: 'secondary',
  disputed: 'destructive',
}

/**
 * Colonnes de la liste Tiers. `name` est collée et non masquable ; le reste est
 * masquable via le bouton « Colonnes ». Rôles/pays sont résolus en libellés par
 * des fonctions code→libellé (référentiels). Les cellules **tiennent le vide**
 * (tél/pays/rôles souvent vides aujourd'hui).
 */
export function buildPartyColumns(
  t: Translate,
  roleLabel: (code: string) => string,
  countryLabel: (code: string) => string
): ColumnDef<PartyAccountListItem>[] {
  return [
    {
      id: 'name',
      accessorKey: 'displayName',
      header: t('party.column.name'),
      enableHiding: false,
      meta: { sticky: true, headerTitle: t('party.column.name') },
      cell: ({ row }) => {
        const item = row.original
        const Icon = item.nature === 'organization' ? Building2 : User
        return (
          <div className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-foreground truncate font-medium">
                {item.displayName}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {item.email ?? '—'}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'roles',
      header: t('party.column.roles'),
      meta: { headerTitle: t('party.column.roles') },
      cell: ({ row }) => {
        const roles = row.original.roles
        if (roles.length === 0)
          return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((code) => (
              <Badge key={code} variant="secondary" size="sm">
                {roleLabel(code)}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'state',
      header: t('party.column.state'),
      meta: { headerTitle: t('party.column.state') },
      cell: ({ row }) => {
        const item = row.original
        const states: Exclude<PartyState, 'active'>[] = []
        if (item.isProspect) states.push('prospect')
        if (item.isDisputed) states.push('disputed')
        if (item.isDisabled) states.push('disabled')
        if (states.length === 0)
          return (
            <Badge variant="success" size="sm">
              {t('party.state.active')}
            </Badge>
          )
        return (
          <div className="flex flex-wrap gap-1">
            {states.map((state) => (
              <Badge key={state} variant={STATE_BADGE[state]} size="sm">
                {t(`party.state.${state}`)}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'offices',
      header: t('party.column.offices'),
      meta: { headerTitle: t('party.column.offices') },
      cell: ({ row }) => {
        const { officeScope, offices } = row.original
        // Trois affichages distincts (contrat back) : `all_offices` = le tiers
        // traite avec tous (aucun bureau à nommer) ; `restricted` = la liste ;
        // `undeclared` = rien (cas anormal, invisible de tous).
        if (officeScope === 'all_offices')
          return (
            <span className="text-muted-foreground italic">
              {t('party.offices.all')}
            </span>
          )
        if (offices.length === 0)
          return <span className="text-muted-foreground">—</span>
        return (
          <span className="text-foreground">
            {offices.map((office) => office.displayName).join(', ')}
          </span>
        )
      },
    },
    {
      id: 'phone',
      accessorKey: 'phonePrimary',
      header: t('party.column.phone'),
      meta: { headerTitle: t('party.column.phone') },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.phonePrimary ?? '—'}
        </span>
      ),
    },
    {
      id: 'country',
      accessorKey: 'country',
      header: t('party.column.country'),
      meta: { headerTitle: t('party.column.country') },
      cell: ({ row }) => {
        const code = row.original.country
        return (
          <span className="text-muted-foreground">
            {code ? countryLabel(code) : '—'}
          </span>
        )
      },
    },
  ]
}

/** Colonnes cachées par défaut (données vides aujourd'hui, dispo via « Colonnes »). */
export const PARTY_HIDDEN_BY_DEFAULT = { phone: false, country: false }
