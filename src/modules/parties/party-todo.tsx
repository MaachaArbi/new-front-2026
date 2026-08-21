/**
 * « À TRAITER » — les alertes du tiers, AGRÉGÉES.
 *
 * ── POURQUOI CE PANNEAU EXISTE ─────────────────────────────────────────────────
 * C'est le principe E d'Arbi : **montrer ce qui manque**. Une exonération sans
 * attestation, un validateur parti, une pièce sans scan ressemblent à du complet
 * à l'écran. Si personne ne les voit, personne ne relance, et l'agence paie.
 *
 * Le point qui compte : **agrégées**. Dispersées dans quatre onglets, ces alertes
 * n'existent pas — il faudrait aller les chercher une par une en sachant déjà
 * qu'elles sont là. Ici elles remontent d'elles-mêmes, dès l'ouverture.
 *
 * ── CE QU'ON N'ÉCRIT PAS ───────────────────────────────────────────────────────
 * Aucune alerte ne dit ce qui VA se passer. « Attestation manquante » — pas
 * « la TVA sera facturée ». C'est la règle n° 1 du 06/08 : la fiche montre l'état,
 * les comportements vivent dans Réservations.
 */
import { useIntl } from 'react-intl'
import {
  CalendarClock,
  FileWarning,
  MailWarning,
  ScanLine,
  UserX,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { PartyDetail } from './party-detail-fixtures'

type Severity = 'warning' | 'info'

interface TodoItem {
  id: string
  icon: typeof MailWarning
  severity: Severity
  title: string
  detail?: string
  action: string
}

/** Trente jours : au-delà, une rallonge qui expire n'est pas encore un sujet. */
const SOON_DAYS = 45

function daysUntil(date: string, today: Date) {
  return Math.round((new Date(date).getTime() - today.getTime()) / 86_400_000)
}

export function PartyTodo({
  party,
  today,
}: {
  party: PartyDetail
  /** Injecté pour que les captures soient stables d'un jour à l'autre. */
  today: Date
}) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const items: TodoItem[] = []

  if (!party.emailVerified) {
    items.push({
      id: 'email',
      icon: MailWarning,
      severity: 'warning',
      title: t('party.todo.emailUnverified'),
      detail: party.email,
      action: t('party.todo.resend'),
    })
  }

  for (const exemption of party.exemptions) {
    if (!exemption.hasCertificate) {
      items.push({
        id: `exemption-${exemption.publicId}`,
        icon: FileWarning,
        severity: 'warning',
        title: intl.formatMessage(
          { id: 'party.todo.noCertificate' },
          { kind: t(`party.exemption.${exemption.kind}`) }
        ),
        detail: exemption.officeName,
        action: t('party.todo.attach'),
      })
    }
  }

  for (const approval of party.approvals) {
    if (!approval.validatorStillQualified) {
      items.push({
        id: `approval-${approval.publicId}`,
        icon: UserX,
        severity: 'warning',
        title: intl.formatMessage(
          { id: 'party.todo.validatorGone' },
          { name: approval.validatorName }
        ),
        detail: `${approval.functionLabel} · ${approval.officeName ?? t('party.allOffices')}`,
        action: t('party.todo.replace'),
      })
    }
  }

  for (const ledger of party.ledgers) {
    for (const extension of ledger.extensions) {
      const days = daysUntil(extension.validTo, today)
      if (days >= 0 && days <= SOON_DAYS) {
        items.push({
          id: `ext-${ledger.officeName}`,
          icon: CalendarClock,
          severity: 'info',
          title: intl.formatMessage(
            { id: 'party.todo.extensionExpires' },
            { days }
          ),
          detail: `${ledger.officeName} · ${extension.validTo}`,
          action: t('party.todo.extend'),
        })
      }
    }
  }

  const missingScan = party.documents.filter((d) => !d.hasFile)
  for (const document of missingScan) {
    items.push({
      id: `doc-${document.publicId}`,
      icon: ScanLine,
      severity: 'info',
      title: intl.formatMessage(
        { id: 'party.todo.noScan' },
        { label: document.label }
      ),
      action: t('party.todo.upload'),
    })
  }

  if (items.length === 0) {
    return (
      <div className="border-border text-ink-muted text-2sm rounded-lg border border-dashed px-4 py-6 text-center">
        {t('party.todo.empty')}
      </div>
    )
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <div className="border-border bg-muted flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <span className="text-ink text-2sm font-semibold">
          {t('party.todo.title')}
        </span>
        <span
          dir="ltr"
          className="text-ink-muted text-2sm tabular-nums [unicode-bidi:isolate]"
        >
          {items.length}
        </span>
      </div>
      <ul>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li
              key={item.id}
              className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 last:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Icon
                  className={
                    item.severity === 'warning'
                      ? 'text-text-warning size-4 shrink-0'
                      : 'text-text-info size-4 shrink-0'
                  }
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-ink text-2sm">{item.title}</span>
                  {item.detail && (
                    <span
                      dir="auto"
                      className="text-ink-muted text-xs [unicode-bidi:isolate]"
                    >
                      {item.detail}
                    </span>
                  )}
                </span>
              </span>
              <Button variant="link" size="sm">
                {item.action}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
