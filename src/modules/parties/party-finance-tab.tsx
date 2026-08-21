/**
 * ONGLET FINANCE — les cinq réglages, en LECTURE.
 *
 * ── LA RÈGLE N° 1 D'ARBI, ET ELLE EST ABSOLUE ──────────────────────────────────
 * Aucun de ces réglages ne DÉCLENCHE quoi que ce soit aujourd'hui : les
 * comportements vivront dans Réservations. On ne doit donc JAMAIS écrire
 * « réservations bloquées au-delà », ni « en attente de validation », ni aucune
 * phrase qui promette un effet.
 *
 * **On saisit et on montre, point.** Les libellés de ce fichier décrivent l'ÉTAT
 * du réglage, jamais sa conséquence. C'est une contrainte de rédaction autant que
 * de code — la tentation d'expliquer « à quoi ça sert » est forte, et elle
 * mentirait.
 *
 * ── PRINCIPE E — MONTRER CE QUI MANQUE ─────────────────────────────────────────
 * Une exonération sans justificatif et un validateur parti ressemblent à du
 * complet. Les deux portent donc un badge d'alerte, et le manquant passe DEVANT.
 *
 * ── TROIS PIÈGES MÉTIER ENCODÉS ICI ────────────────────────────────────────────
 *  1. **Socle ≠ rallonge.** `validTo` absent = socle (un seul par société et
 *     devise) ; renseigné = rallonge, qui S'AJOUTE au socle et expire.
 *  2. **Sans société = toutes les sociétés.** Jamais un champ vide.
 *  3. **Politique commune et politique société COEXISTENT.** La plus précise
 *     l'emporte — on ne les additionne jamais, et on montre laquelle s'applique.
 */
import { useIntl } from 'react-intl'
import { AlertTriangle, FileWarning } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { MoneyCell } from '@/shared/table/cells'
import { fromMinorUnits } from '@/shared/money'
import type { PartyDetail } from './party-detail-fixtures'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-ink text-2sm font-semibold">{children}</h3>
}

/** Une ligne de réglage : ce qu'il vaut, pour qui, et ce qui lui manque. */
function Row({
  label,
  scope,
  value,
  warning,
}: {
  label: React.ReactNode
  scope?: React.ReactNode
  value?: React.ReactNode
  warning?: React.ReactNode
}) {
  return (
    <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ink text-2sm">{label}</span>
        {scope && <span className="text-ink-muted text-xs">{scope}</span>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {warning}
        {value}
      </div>
    </div>
  )
}

export function PartyFinanceTab({ party }: { party: PartyDetail }) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  /** « Toutes les sociétés » plutôt qu'un vide — règle explicite du 07/08. */
  const scopeOf = (name?: string | null) =>
    name ?? t('party.finance.allOffices')

  return (
    <div className="flex flex-col gap-7 py-5">
      {/* ── Plafonds ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-1.5">
        <SectionTitle>{t('party.finance.creditLimits')}</SectionTitle>
        <p className="text-ink-muted text-xs">
          {t('party.finance.creditLimitsHint')}
        </p>
        <div className="mt-1.5">
          {party.creditLimits.map((limit) => (
            <Row
              key={limit.publicId}
              label={
                <span className="flex items-center gap-2">
                  <Badge
                    variant={limit.isExtension ? 'info' : 'secondary'}
                    appearance="light"
                    size="xs"
                  >
                    {t(
                      limit.isExtension
                        ? 'party.finance.extension'
                        : 'party.finance.base'
                    )}
                  </Badge>
                  {limit.officeName}
                </span>
              }
              scope={
                limit.validTo
                  ? intl.formatMessage(
                      { id: 'party.finance.until' },
                      { date: limit.validTo }
                    )
                  : t('party.finance.noEnd')
              }
              value={
                <MoneyCell
                  value={fromMinorUnits(limit.amountMinor, limit.currencyCode)}
                  className="text-2sm text-start"
                />
              }
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Chargés de compte ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-1.5">
        <SectionTitle>{t('party.finance.managers')}</SectionTitle>
        <div className="mt-1.5">
          {party.managers.map((manager) => (
            <Row
              key={manager.publicId}
              label={manager.managerDisplayName}
              scope={scopeOf(manager.officeName)}
              value={
                <Badge variant="secondary" appearance="light" size="sm">
                  {t(`party.finance.assignment.${manager.assignmentType}`)}
                </Badge>
              }
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Exonérations ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-1.5">
        <SectionTitle>{t('party.finance.exemptions')}</SectionTitle>
        <div className="mt-1.5">
          {party.taxExemptions.map((exemption) => (
            <Row
              key={exemption.publicId}
              label={t(`party.finance.exemption.${exemption.exemptionType}`)}
              scope={exemption.officeName}
              warning={
                // Le manquant passe DEVANT : c'est lui qu'on doit voir.
                !exemption.hasCertificate && (
                  <Badge variant="warning" appearance="light" size="sm">
                    <FileWarning />
                    {t('party.finance.noCertificate')}
                  </Badge>
                )
              }
              value={
                <span className="text-ink-secondary text-2sm">
                  {exemption.certificateNumber ?? '—'}
                </span>
              }
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Politique commerciale ────────────────────────────────────────── */}
      <section className="flex flex-col gap-1.5">
        <SectionTitle>{t('party.finance.policies')}</SectionTitle>
        <p className="text-ink-muted text-xs">
          {t('party.finance.policiesHint')}
        </p>
        <div className="mt-1.5">
          {party.commercialPolicies.map((policy) => (
            <Row
              key={String(policy.officeAccountId)}
              label={
                policy.officeAccountId === null
                  ? t('party.finance.commonPolicy')
                  : policy.officeName
              }
              scope={
                policy.officeAccountId === null
                  ? t('party.finance.commonPolicyScope')
                  : undefined
              }
              value={
                <span className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={policy.forceOnRequest ? 'primary' : 'secondary'}
                    appearance="light"
                    size="sm"
                  >
                    {t('party.finance.forceOnRequest')} :{' '}
                    {t(policy.forceOnRequest ? 'ui.yes' : 'ui.no')}
                  </Badge>
                  <Badge
                    variant={
                      policy.blockWhenInsufficientBalance
                        ? 'primary'
                        : 'secondary'
                    }
                    appearance="light"
                    size="sm"
                  >
                    {t('party.finance.blockWhenInsufficient')} :{' '}
                    {t(
                      policy.blockWhenInsufficientBalance ? 'ui.yes' : 'ui.no'
                    )}
                  </Badge>
                </span>
              }
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Règles d'approbation ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-1.5">
        <SectionTitle>{t('party.finance.approvals')}</SectionTitle>
        <p className="text-ink-muted text-xs">
          {t('party.finance.approvalsHint')}
        </p>
        <div className="mt-1.5">
          {party.approvalRules.map((rule) => (
            <Row
              key={rule.publicId}
              label={rule.validatorDisplayName}
              scope={`${rule.functionCode} · ${scopeOf(rule.officeName)}`}
              warning={
                !rule.validatorStillQualified && (
                  <Badge variant="warning" appearance="light" size="sm">
                    <AlertTriangle />
                    {t('party.finance.validatorGone')}
                  </Badge>
                )
              }
            />
          ))}
        </div>
      </section>
    </div>
  )
}
