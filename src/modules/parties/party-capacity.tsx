/**
 * CAPACITÉ — le bloc qui répond à la question qu'un agent se pose en premier :
 * **« est-ce que je peux vendre à ce client, maintenant ? »**
 *
 * ── LA FORMULE, TELLE QUE LA RÉFÉRENCE MÉTIER L'ÉNONCE ─────────────────────────
 *
 *      capacité = solde du grand livre + plafond + rallonges valides
 *
 * Le plafond est une **autorisation de découvert**, pas un quota de consommation :
 * un client qui réserve puis paie retrouve sa marge. C'est pour ça qu'on montre le
 * solde ET la capacité, pas un « consommé » cumulé.
 *
 * ── POURQUOI PLUSIEURS CARTES, ET PAS UN CHIFFRE ───────────────────────────────
 * **Un livre = (tiers, rôle, bureau, devise).** Rien ne traverse cette frontière.
 * Un plafond en euros accordé par Sousse se compare au solde en euros de Sousse —
 * jamais converti, jamais additionné à celui de Tunis.
 *
 * Un écran qui afficherait « crédit disponible : X » **mentirait**. C'est
 * précisément l'erreur que faisait l'ancienne fiche, et la raison pour laquelle
 * ce bloc montre une carte PAR LIVRE.
 *
 * ── CE QUE LA JAUGE DIT, ET CE QU'ELLE NE DIT PAS ──────────────────────────────
 * Elle montre la part de l'autorisation déjà utilisée. Elle ne prédit rien : la
 * décision de bloquer ou de mettre en demande appartient à Réservations, pas à
 * cette fiche (règle n° 1 du 06/08).
 */
import { useIntl } from 'react-intl'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { format, fromMinorUnits } from '@/shared/money'
import { cn } from '@/shared/lib/cn'
import type { PartyLedger } from './party-detail-fixtures'

/** Tout se calcule en `bigint` — jamais en `number` (ADR-F07). */
function computeLedger(ledger: PartyLedger) {
  const balance = BigInt(ledger.balanceMinor)
  const base = BigInt(ledger.baseLimitMinor)
  const extensions = ledger.extensions.reduce(
    (total, extension) => total + BigInt(extension.amountMinor),
    0n
  )
  const authorised = base + extensions
  const capacity = balance + authorised
  // Le solde est négatif quand le client doit : la part utilisée est son opposé.
  const used = balance < 0n ? -balance : 0n
  const ratio = authorised > 0n ? Number((used * 1000n) / authorised) / 10 : 0
  return { balance, authorised, capacity, ratio }
}

function Amount({
  minor,
  currency,
  className,
}: {
  minor: bigint
  currency: string
  className?: string
}) {
  const intl = useIntl()
  return (
    <span
      dir="ltr"
      className={cn('tabular-nums [unicode-bidi:isolate]', className)}
    >
      {format(fromMinorUnits(minor.toString(), currency), intl.locale)}
    </span>
  )
}

function Line({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-ink-muted text-xs">{label}</span>
      <span className="text-ink-secondary text-2sm">{children}</span>
    </div>
  )
}

export function PartyCapacity({
  ledgers,
}: {
  ledgers: readonly PartyLedger[]
}) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ledgers.map((ledger) => {
        const { balance, authorised, capacity, ratio } = computeLedger(ledger)
        const tight = ratio >= 75

        return (
          <div
            key={`${ledger.officeName}-${ledger.currencyCode}`}
            className="border-border flex flex-col gap-3 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-ink text-2sm font-medium">
                {ledger.officeName}
                <span className="text-ink-muted ms-2 font-normal">
                  {ledger.currencyCode}
                </span>
              </span>
              {tight && (
                <Badge variant="warning" appearance="light" size="sm">
                  <AlertTriangle />
                  {intl.formatMessage(
                    { id: 'party.capacity.tight' },
                    { pct: Math.round(ratio) }
                  )}
                </Badge>
              )}
            </div>

            {/* Le chiffre qu'on vient chercher, en gros. */}
            <div className="flex flex-col gap-1">
              <span className="text-ink-muted text-xs">
                {t('party.capacity.available')}
              </span>
              <Amount
                minor={capacity}
                currency={ledger.currencyCode}
                className={cn(
                  'text-2xl font-semibold',
                  capacity <= 0n ? 'text-text-danger' : 'text-ink'
                )}
              />
            </div>

            {/* La jauge : part de l'autorisation déjà utilisée. */}
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-[width]',
                  tight ? 'bg-fill-warning' : 'bg-fill-primary'
                )}
                style={{ width: `${Math.min(ratio, 100)}%` }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Line label={t('party.capacity.balance')}>
                <Amount minor={balance} currency={ledger.currencyCode} />
              </Line>
              <Line label={t('party.capacity.base')}>
                <Amount
                  minor={BigInt(ledger.baseLimitMinor)}
                  currency={ledger.currencyCode}
                />
              </Line>
              {ledger.extensions.map((extension) => (
                <Line
                  key={extension.validTo}
                  label={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help items-center gap-1">
                          <TrendingUp className="size-3" />
                          {intl.formatMessage(
                            { id: 'party.capacity.extension' },
                            { date: extension.validTo }
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('party.capacity.extensionHint')}
                      </TooltipContent>
                    </Tooltip>
                  }
                >
                  +{' '}
                  <Amount
                    minor={BigInt(extension.amountMinor)}
                    currency={ledger.currencyCode}
                  />
                </Line>
              ))}
              <div className="border-border mt-0.5 border-t pt-1.5">
                <Line label={t('party.capacity.authorised')}>
                  <Amount minor={authorised} currency={ledger.currencyCode} />
                </Line>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
