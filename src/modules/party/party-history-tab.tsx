import * as React from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { SkeletonRow } from '@/shared/feedback'
import { formatMinor } from '@/shared/lib/money'
import { useDateFormat } from '@/shared/lib/use-date-format'
import { InitialsAvatar } from '@/shared/ui/initials-avatar'
import { usePartyHistory } from './queries'
import type { PartyHistoryEntry } from './api'

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
  // Adresse.
  'addressType',
  'line1',
  'line2',
  'city',
  'postalCode',
  'countryAlpha2',
  'isPrimary',
  // Exonération / politique.
  'exemptionType',
  'hasCertificate',
  'assignmentType',
  'forceOnRequest',
  'blockWhenInsufficientBalance',
])

/** Champs booléens → « Oui / Non » (au lieu de `true`/`false` bruts). */
const BOOL_FIELDS = new Set([
  'isPrimary',
  'hasCertificate',
  'forceOnRequest',
  'blockWhenInsufficientBalance',
  'isProspect',
  'isDisputed',
  'isDisabled',
])

/** Réf. de stockage, pas une adresse : on ne montre pas la valeur, juste « fichier modifié ». */
const FILE_FIELDS = new Set(['logo', 'file'])

/** Champs dont la valeur est une date/heure ISO → afficher le **jour** (pas l'ISO brut). */
const DATE_FIELDS = new Set(['validFrom', 'validTo'])

/**
 * Onglet **Historique** d'un tiers. Respecte les quatre gardes du back : `actor: null` →
 * « trace antérieure au {satellitesSince} » (jamais « système ») ; note « tenu depuis le … »
 * pour les éléments liés ; `changes: []` possible ; `logo`/`file` = référence, pas adresse.
 * Chargement par tranches (« Charger plus ») : on ne ramène jamais tout l'historique.
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
  // « Charger plus » : on ne ramène PAS tout — on charge par tranches de HISTORY_LIMIT
  // (20, 40, 60…). `keepPreviousData` évite le clignotement pendant l'agrandissement.
  const [loaded, setLoaded] = React.useState(HISTORY_LIMIT)
  const [end, setEnd] = React.useState(false)
  const query = usePartyHistory(publicId, 1, loaded)
  // Filtres — appliqués EN CLIENT sur la page chargée (l'API pagine sans filtre serveur ;
  // vrai filtre = demande back). '' = pas de filtre.
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('')
  const [actionFilter, setActionFilter] = React.useState('')
  const [authorFilter, setAuthorFilter] = React.useState('')

  const { day: fmtDay, time: fmtTime } = useDateFormat()

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
    if (BOOL_FIELDS.has(field)) {
      // La valeur d'audit peut arriver en booléen brut → coercition avant comparaison.
      const bool = String(value)
      return bool === 'true'
        ? t('party.history.yes')
        : bool === 'false'
          ? t('party.history.no')
          : bool
    }
    if (DATE_FIELDS.has(field)) return fmtDay(value)
    if (field === 'office') return officeNameByPublicId(value)
    if (field === 'serviceTypeCode') return serviceTypeLabel(value)
    if (field === 'amountMinor')
      return currencyInEntry ? formatMinor(value, currencyInEntry) : value
    return value
  }

  const entries = query.data?.data ?? []
  const since = query.data?.meta.satellitesSince ?? null

  // Fin de liste : `meta` ne porte NI total NI `hasMore`, et l'API renvoie parfois moins
  // de lignes que le `limit` demandé (mesuré : 5→4, 10→9, 20→18). On ne peut donc pas
  // déduire la fin d'une « tranche non pleine » — sinon le bouton disparaît à tort.
  // Règle robuste : un « Charger plus » qui n'apporte AUCUNE nouvelle entrée = fin.
  // → demande back : exposer `hasMore` (ou le total) dans `meta`.
  const lastCountRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (query.isFetching) return
    const count = entries.length
    if (
      lastCountRef.current !== null &&
      count === lastCountRef.current &&
      loaded > HISTORY_LIMIT
    ) {
      setEnd(true)
    }
    lastCountRef.current = count
  }, [entries.length, query.isFetching, loaded])

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

  const hasMore = !end && entries.length >= loaded - 1

  // Types : liste COMPLÈTE des sujets d'audit connus (pas seulement ceux présents sur
  // la page — sinon le filtre ment sur ce qu'on peut chercher). Triée par libellé.
  // ⚠️ `KNOWN_SUBJECTS` est recopié de la doc back : il n'existe pas de référentiel
  // `historySubjects` côté API → demande back (voir docs/backlog).
  const distinctTypes = Array.from(KNOWN_SUBJECTS).sort((a, b) =>
    subjectLabel(a).localeCompare(subjectLabel(b))
  )
  const distinctAuthors = Array.from(
    new Set(
      entries
        .map((e) => e.actor?.displayName)
        .filter((n): n is string => !!n)
    )
  )
  const searchLower = search.trim().toLowerCase()
  const filtered = entries.filter((entry) => {
    if (typeFilter && entry.subject !== typeFilter) return false
    if (actionFilter && entry.operation !== actionFilter) return false
    if (authorFilter && (entry.actor?.displayName ?? '') !== authorFilter)
      return false
    if (searchLower) {
      const hay = [
        entry.actor?.displayName ?? '',
        subjectLabel(entry.subject),
        t(`party.history.op.${entry.operation}`),
        ...entry.changes.flatMap((c) => [
          fieldLabel(c.field),
          c.before ?? '',
          c.after ?? '',
        ]),
      ]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(searchLower)) return false
    }
    return true
  })
  const filtersActive = !!(
    search ||
    typeFilter ||
    actionFilter ||
    authorFilter
  )
  const selectCls =
    'border-border bg-background text-foreground rounded-md border px-2 py-1.5 text-sm'

  if (entries.length === 0) {
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

      {/* Barre de filtres — Recherche · Type · Action · Auteur. Filtrage CLIENT sur la
          page chargée (voir note). */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('party.history.searchPlaceholder')}
            className="border-border bg-background text-foreground w-full rounded-md border py-1.5 pe-2 ps-8 text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectCls}
          aria-label={t('party.history.filterTypeLabel')}
        >
          <option value="">{t('party.history.allTypes')}</option>
          {distinctTypes.map((s) => (
            <option key={s} value={s}>
              {subjectLabel(s)}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={selectCls}
          aria-label={t('party.history.filterActionLabel')}
        >
          <option value="">{t('party.history.allActions')}</option>
          {['INSERT', 'UPDATE', 'DELETE'].map((op) => (
            <option key={op} value={op}>
              {t(`party.history.op.${op}`)}
            </option>
          ))}
        </select>
        {distinctAuthors.length > 0 ? (
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className={selectCls}
            aria-label={t('party.history.filterAuthorLabel')}
          >
            <option value="">{t('party.history.allAuthors')}</option>
            {distinctAuthors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {filtersActive ? (
        <p className="text-muted-foreground text-xs">
          {t('party.history.filterPageNote')}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-6 text-sm">
          {t('party.history.noMatch')}
        </p>
      ) : null}

      {/* Timeline SANS cards : un trait vertical, l'avatar = nœud, groupé par jour.
          Ligne « qui · quoi · quand » ; le détail (avant → après) se déplie. */}
      {groupByDay(filtered, fmtDay).map((group) => (
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
                        <InitialsAvatar
                          name={actorName}
                          size="sm"
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

      {hasMore ? (
        <div className="flex flex-col items-center gap-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => setLoaded((n) => n + HISTORY_LIMIT)}
          >
            <ChevronDown />
            {t('party.history.loadMore')}
          </Button>
          <span className="text-muted-foreground text-xs">
            {t('party.history.loadedCount', { count: entries.length })}
          </span>
        </div>
      ) : entries.length > HISTORY_LIMIT ? (
        <p className="text-muted-foreground pt-2 text-center text-xs">
          {t('party.history.loadedAll', { count: entries.length })}
        </p>
      ) : null}
    </div>
  )
}
