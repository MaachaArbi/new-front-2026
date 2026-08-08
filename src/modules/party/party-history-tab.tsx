import * as React from 'react'
import { useIntl } from 'react-intl'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { SkeletonRow } from '@/shared/feedback'
import { formatMinor } from '@/shared/lib/money'
import { cn } from '@/shared/lib/cn'
import { usePartyHistory } from './queries'
import type { PartyHistoryEntry } from './api'

// Avatar = nœud de la timeline. Initiales + couleur stable dérivée du nom (acteur inconnu =
// neutre). Palette fixe (fonctionne en clair comme en sombre).
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
]
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (
    ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
  )
}
function colorOf(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? 'bg-blue-500'
}
function TimelineAvatar({ name, muted }: { name: string; muted: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white',
        muted ? 'bg-muted-foreground/50' : colorOf(name)
      )}
    >
      {initialsOf(name)}
    </span>
  )
}

// Regroupe les entrées CONSÉCUTIVES par jour (elles arrivent déjà triées, plus récent
// d'abord). On conserve l'index d'origine pour une clé stable.
function groupByDay(
  entries: readonly PartyHistoryEntry[],
  fmtDay: (iso: string) => string
): { day: string; rows: { entry: PartyHistoryEntry; index: number }[] }[] {
  const groups: {
    day: string
    rows: { entry: PartyHistoryEntry; index: number }[]
  }[] = []
  entries.forEach((entry, index) => {
    const day = fmtDay(entry.at)
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.rows.push({ entry, index })
    else groups.push({ day, rows: [{ entry, index }] })
  })
  return groups
}

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

const HISTORY_LIMIT = 20

/** `subject` connus (§1.3) — code libellé si connu, sinon rendu tel quel (garde-fou). */
export const KNOWN_SUBJECTS = new Set([
  'party',
  'role',
  'address',
  'identity',
  'office',
  'officeRelation',
  'function',
  'group',
  'document',
  'taxExemption',
  'creditLimit',
  'commercialPolicy',
  'approvalRule',
  'manager',
  'salesPoint',
  'franchise',
  'attribute',
])

/** Champs libellés (curés) — les autres s'affichent en code brut (audit technique). */
const KNOWN_FIELDS = new Set([
  'displayName',
  'email',
  'phonePrimary',
  'phoneSecondary',
  'country',
  'roleCode',
  'functionCode',
  'relationType',
  'displayCurrencyCode',
  'billingCurrencyCode',
  'isProspect',
  'isDisputed',
  'isDisabled',
  'officeScope',
  'parentAccountPublicId',
  // Finance (plafonds) — libellés + valeurs mises en forme (voir formatValue).
  'currencyCode',
  'amountMinor',
  'office',
  'serviceTypeCode',
  'validFrom',
  'validTo',
])

/** Réf. de stockage, pas une adresse : on ne montre pas la valeur, juste « fichier modifié ». */
const FILE_FIELDS = new Set(['logo', 'file'])

/** Champs dont la valeur est une date/heure ISO → afficher le **jour** (pas l'ISO brut). */
const DATE_FIELDS = new Set(['validFrom', 'validTo'])

/**
 * Onglet **Historique** d'un tiers. Respecte les quatre gardes du back : `actor: null` →
 * « trace antérieure au {satellitesSince} » (jamais « système ») ; note « tenu depuis le … »
 * pour les éléments liés ; `changes: []` possible ; `logo`/`file` = référence, pas adresse.
 * `meta` ne porte pas de total → pagination « précédent / suivant » (suivant = page pleine).
 */
export function PartyHistoryTab({
  publicId,
  officeNameByPublicId,
  serviceTypeLabel,
  t,
}: {
  publicId: string
  /** UUID de société (valeur d'audit brute) → nom lisible ; à défaut, l'UUID (garde-fou). */
  officeNameByPublicId: (officePublicId: string) => string
  /** Code de service → libellé traduit (`hotel` → « Hébergement ») ; à défaut, le code. */
  serviceTypeLabel: (code: string) => string
  t: Translate
}) {
  const intl = useIntl()
  const [page, setPage] = React.useState(1)
  const query = usePartyHistory(publicId, page, HISTORY_LIMIT)

  const fmtDay = (iso: string) =>
    intl.formatDate(iso, { day: 'numeric', month: 'long', year: 'numeric' })
  const fmtTime = (iso: string) =>
    intl.formatDate(iso, { hour: '2-digit', minute: '2-digit' })

  const subjectLabel = (subject: string) =>
    KNOWN_SUBJECTS.has(subject)
      ? t(`party.history.subject.${subject}`)
      : subject
  const fieldLabel = (field: string) =>
    KNOWN_FIELDS.has(field) ? t(`party.history.field.${field}`) : field

  // Valeur d'audit → forme lisible, selon le champ. `currencyInEntry` = devise sœur du
  // même changement (pour formater le montant en mineures selon ses décimales). `null` → '—'.
  const formatValue = (
    field: string,
    value: string | null,
    currencyInEntry: string | null
  ): string => {
    if (value == null) return '—'
    if (DATE_FIELDS.has(field)) return fmtDay(value)
    if (field === 'office') return officeNameByPublicId(value)
    if (field === 'serviceTypeCode') return serviceTypeLabel(value)
    if (field === 'amountMinor')
      return currencyInEntry ? formatMinor(value, currencyInEntry) : value
    return value
  }

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  }

  if (query.isError) {
    return (
      <p className="text-muted-foreground py-6 text-sm">
        {t('party.history.error')}
      </p>
    )
  }

  const entries = query.data?.data ?? []
  const since = query.data?.meta.satellitesSince ?? null
  const hasPrev = page > 1
  const hasNext = entries.length === HISTORY_LIMIT

  if (entries.length === 0 && page === 1) {
    return (
      <p className="text-muted-foreground py-6 text-sm">
        {t('party.history.empty')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {since ? (
        <p className="text-muted-foreground text-xs">
          {t('party.history.satellitesNote', { date: fmtDay(since) })}
        </p>
      ) : null}

      {/* Timeline SANS cards : un trait vertical, l'avatar = nœud, groupé par jour.
          Ligne « qui · quoi · quand » ; le détail (avant → après) se déplie. */}
      {groupByDay(entries, fmtDay).map((group) => (
        <div key={group.day}>
          <div className="text-muted-foreground mt-2 mb-1 text-[11px] font-semibold tracking-wider uppercase">
            {group.day}
          </div>
          <div className="relative">
            <span
              aria-hidden
              className="bg-border absolute start-3 top-3 bottom-3 w-px"
            />
            {group.rows.map(({ entry, index }) => {
              const currencyInEntry =
                entry.changes.find((change) => change.field === 'currencyCode')
                  ?.after ?? null
              const actorName = entry.actor
                ? entry.actor.displayName
                : t('party.history.priorTrace', {
                    date: since ? fmtDay(since) : '',
                  })
              const hasChanges = entry.changes.length > 0
              return (
                <details
                  key={`${entry.at}-${entry.subject}-${index}`}
                  className="group"
                >
                  <summary className="flex list-none cursor-pointer items-start justify-between gap-3 py-2.5 [&::-webkit-details-marker]:hidden">
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="ring-background relative z-10 inline-flex rounded-full ring-4">
                        <TimelineAvatar
                          name={actorName}
                          muted={!entry.actor}
                        />
                      </span>
                      <span className="min-w-0 pt-0.5 text-sm">
                        <span className="text-foreground font-medium">
                          {actorName}
                        </span>
                        <span className="text-muted-foreground">
                          {' · '}
                          {subjectLabel(entry.subject)}
                          {' · '}
                          {t(`party.history.op.${entry.operation}`)}
                        </span>
                      </span>
                    </span>
                    <span className="text-muted-foreground flex shrink-0 items-center gap-2 pt-0.5 text-xs">
                      {fmtTime(entry.at)}
                      {hasChanges ? (
                        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                      ) : null}
                    </span>
                  </summary>
                  {hasChanges ? (
                    <div className="ms-9 grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-1 pb-3 text-sm">
                      {entry.changes.map((change, changeIndex) => (
                        <React.Fragment key={changeIndex}>
                          <span className="text-muted-foreground">
                            {fieldLabel(change.field)}
                          </span>
                          <span className="text-foreground">
                            {FILE_FIELDS.has(change.field)
                              ? t('party.history.fileChanged')
                              : `${formatValue(change.field, change.before, currencyInEntry)} → ${formatValue(change.field, change.after, currencyInEntry)}`}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : null}
                </details>
              )
            })}
          </div>
        </div>
      ))}

      {hasPrev || hasNext ? (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft />
            {t('party.history.prev')}
          </Button>
          <span className="text-muted-foreground text-xs">
            {t('party.history.page', { page })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            {t('party.history.next')}
            <ChevronRight />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
