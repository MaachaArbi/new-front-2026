import * as React from 'react'
import { AlertTriangle, FileCheck, Pencil, Plus, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { InitialsAvatar } from '@/shared/ui/initials-avatar'
import { StatusChip } from '@/shared/ui/status-chip'
import { formatMinor } from '@/shared/lib/money'
import { MoneyText } from '@/shared/ui/money-text'
import { useDateFormat } from '@/shared/lib/use-date-format'
import { cn } from '@/shared/lib/cn'
import { codeLabel, type ReferentialItem } from '@/shared/referentials'
import { usePartyFinanceMutations } from './queries'
import {
  PartyCreditLimitSheet,
  type OfficeChoice,
} from './party-credit-limit-sheet'
import { PartyManagerSheet } from './party-manager-sheet'
import { PartyTaxExemptionSheet } from './party-tax-exemption-sheet'
import { PartyPolicySheet } from './party-policy-sheet'
import { PartyApprovalRuleSheet } from './party-approval-rule-sheet'
import type {
  PartyApprovalRule,
  PartyCommercialPolicy,
  PartyCreditLimit,
  PartyManager,
  PartyTaxExemption,
} from './api'

type Translate = (
  id: string,
  values?: Record<string, string | number>
) => string

// En-tête de section façon /_ref : titre (+ sous-titre) à gauche, action-lien à droite.
function FinanceHead({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string
  subtitle?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        {subtitle ? (
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
        ) : null}
      </div>
      {action && onAction ? (
        <Button
          size="sm"
          variant="outline"
          onClick={onAction}
          className="shrink-0"
        >
          <Plus />
          {action}
        </Button>
      ) : null}
    </div>
  )
}

// Interrupteur FONCTIONNEL (vert = actif, comme le /_ref). Le clic bascule le réglage.
function SwitchPill({
  on,
  onToggle,
  disabled,
}: {
  on: boolean
  onToggle?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled || !onToggle}
      onClick={onToggle}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors',
        on ? 'justify-end bg-emerald-500' : 'bg-muted justify-start',
        disabled || !onToggle ? 'cursor-default' : 'cursor-pointer'
      )}
    >
      <span className="size-4 rounded-full bg-white shadow-sm" />
    </button>
  )
}

/**
 * Onglet **Finance** — plafonds, chargés de compte, exonérations, politique, approbations.
 * ⚠️ **Aucun réglage ne déclenche rien** : on montre le réglage saisi, jamais « bloqué » ni
 * « en attente ». On met en avant ce qui MANQUE. Incr. 3 : gestion **plafonds + managers** ;
 * les 3 autres restent en lecture (incr. 4).
 */
export function PartyFinanceTab({
  publicId,
  editable,
  offices,
  currencies,
  serviceTypes,
  functions,
  creditLimits,
  managers,
  taxExemptions,
  commercialPolicies,
  approvalRules,
  officeName,
  functionLabel,
  t,
}: {
  publicId: string
  editable: boolean
  offices: readonly OfficeChoice[]
  currencies: readonly ReferentialItem[]
  serviceTypes: readonly ReferentialItem[]
  functions: readonly ReferentialItem[]
  creditLimits: readonly PartyCreditLimit[]
  managers: readonly PartyManager[]
  taxExemptions: readonly PartyTaxExemption[]
  commercialPolicies: readonly PartyCommercialPolicy[]
  approvalRules: readonly PartyApprovalRule[]
  officeName: (accountId: number | null) => string
  functionLabel: (code: string) => string
  t: Translate
}) {
  const { creditLimit, manager, taxExemption, policy, approvalRule } =
    usePartyFinanceMutations(publicId)
  const serviceTypeLabel = codeLabel(serviceTypes)
  const date = useDateFormat()
  const [creditOpen, setCreditOpen] = React.useState(false)
  const [managerOpen, setManagerOpen] = React.useState(false)
  const [exemptionOpen, setExemptionOpen] = React.useState(false)
  const [editingExemption, setEditingExemption] =
    React.useState<PartyTaxExemption | null>(null)
  const [policyOpen, setPolicyOpen] = React.useState(false)
  const [editingPolicy, setEditingPolicy] =
    React.useState<PartyCommercialPolicy | null>(null)
  const [approvalOpen, setApprovalOpen] = React.useState(false)

  // Plafond EFFECTIF par portée (société · devise · service) = socle + Σ rallonges ACTIVES
  // (validTo ≥ aujourd'hui). amountMinor est une CHAÎNE → somme en BigInt, jamais en Number
  // (précision monétaire). Une rallonge expirée est listée grisée mais ne compte plus.
  const todayIso = new Date().toISOString().slice(0, 10)
  const creditGroups = React.useMemo(() => {
    const map = new Map<
      string,
      {
        officeAccountId: number
        currencyCode: string | null
        serviceTypeCode: string | null
        socle: PartyCreditLimit | null
        extensions: PartyCreditLimit[]
      }
    >()
    for (const limit of creditLimits) {
      const key = `${limit.officeAccountId}|${limit.currencyCode ?? ''}|${limit.serviceTypeCode ?? ''}`
      let g = map.get(key)
      if (!g) {
        g = {
          officeAccountId: limit.officeAccountId,
          currencyCode: limit.currencyCode,
          serviceTypeCode: limit.serviceTypeCode,
          socle: null,
          extensions: [],
        }
        map.set(key, g)
      }
      if (limit.isExtension) g.extensions.push(limit)
      else g.socle = limit
    }
    return Array.from(map.values()).map((g) => {
      let effective = g.socle ? BigInt(g.socle.amountMinor) : 0n
      for (const e of g.extensions) {
        if (!e.validTo || e.validTo >= todayIso) effective += BigInt(e.amountMinor)
      }
      return { ...g, effectiveMinor: effective.toString() }
    })
  }, [creditLimits, todayIso])

  const removeBtn = (label: string, onClick: () => void, busy: boolean) => (
    <Button
      size="sm"
      mode="icon"
      variant="ghost"
      className="text-muted-foreground shrink-0"
      aria-label={label}
      disabled={busy}
      onClick={onClick}
    >
      <X />
    </Button>
  )

  return (
    <div>
      {/* 1) PLAFONDS — cartes de portée (style /_ref) : total EFFECTIF en gros +
          décomposition socle/rallonges (point coloré ; rallonge expirée grisée). */}
      <section className="mb-9">
        <FinanceHead
          title={t('party.finance.creditLimits')}
          subtitle={t('party.finance.creditLimits.hint')}
          action={editable ? t('party.finance.addCreditLimit') : undefined}
          onAction={() => setCreditOpen(true)}
        />
        {creditGroups.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {creditGroups.map((g) => {
              const cur = g.currencyCode ?? ''
              const socle = g.socle
              return (
                <div
                  key={`${g.officeAccountId}|${cur}|${g.serviceTypeCode ?? ''}`}
                  className="border-border rounded-xl border p-4"
                >
                  <div className="text-muted-foreground text-xs">
                    {officeName(g.officeAccountId)}
                    {g.serviceTypeCode
                      ? ` · ${serviceTypeLabel(g.serviceTypeCode)}`
                      : ''}
                  </div>
                  <div className="text-foreground mt-0.5 text-2xl font-semibold tabular-nums">
                    {formatMinor(g.effectiveMinor, cur)}{' '}
                    <span className="text-muted-foreground text-base font-normal">
                      {cur}
                    </span>
                  </div>
                  <div className="border-border/60 mt-3 flex flex-col gap-2 border-t pt-3 text-sm">
                    {socle ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground/80 inline-flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          {t('party.finance.base')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MoneyText
                            minor={socle.amountMinor}
                            currency={cur}
                            className="text-muted-foreground"
                          />
                          {editable
                            ? removeBtn(
                                t('party.finance.remove'),
                                () => creditLimit.remove.mutate(socle.publicId),
                                creditLimit.remove.isPending
                              )
                            : null}
                        </span>
                      </div>
                    ) : null}
                    {g.extensions.map((e) => {
                      const expired = !!e.validTo && e.validTo < todayIso
                      return (
                        <div
                          key={e.publicId}
                          className={cn(
                            'flex items-center justify-between gap-2',
                            expired && 'opacity-50'
                          )}
                        >
                          <span className="text-foreground/80 inline-flex items-center gap-2">
                            <span className="size-2 rounded-full bg-amber-500" />
                            {t('party.finance.extension')}
                            {e.validTo ? (
                              <span className="text-muted-foreground">
                                ·{' '}
                                {expired
                                  ? t('party.finance.expired')
                                  : t('party.finance.until', {
                                      date: date.day(e.validTo),
                                    })}
                              </span>
                            ) : null}
                          </span>
                          <span className="flex items-center gap-1">
                            <MoneyText
                              minor={e.amountMinor}
                              currency={cur}
                              signed
                              className="text-emerald-600"
                            />
                            {editable
                              ? removeBtn(
                                  t('party.finance.remove'),
                                  () => creditLimit.remove.mutate(e.publicId),
                                  creditLimit.remove.isPending
                                )
                              : null}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('party.finance.creditLimits.empty')}
          </p>
        )}
      </section>

      {/* CHARGÉS DE COMPTE — style /_ref (avatar). (À déplacer vers Contacts & équipe ?) */}
      <section className="mb-9">
        <FinanceHead
          title={t('party.finance.managers')}
          action={editable ? t('party.finance.addManager') : undefined}
          onAction={() => setManagerOpen(true)}
        />
        {managers.length > 0 ? (
          <div className="border-border rounded-xl border">
            {managers.map((entry) => (
              <div
                key={entry.publicId}
                className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-3">
                  <InitialsAvatar name={entry.managerDisplayName} />
                  <span className="text-foreground font-medium">
                    {entry.managerDisplayName}
                  </span>
                  <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                    {t(`party.finance.assignment.${entry.assignmentType}`)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {officeName(entry.officeAccountId)}
                  </span>
                </span>
                {editable
                  ? removeBtn(
                      t('party.finance.remove'),
                      () => manager.remove.mutate(entry.publicId),
                      manager.remove.isPending
                    )
                  : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('party.finance.managers.empty')}
          </p>
        )}
      </section>

      {/* EXONÉRATIONS — style /_ref : « Justificatif manquant » = alerte ambre + Ajouter. */}
      <section className="mb-9">
        <FinanceHead
          title={t('party.finance.taxExemptions')}
          action={editable ? t('party.finance.addExemption') : undefined}
          onAction={() => {
            setEditingExemption(null)
            setExemptionOpen(true)
          }}
        />
        {taxExemptions.length > 0 ? (
          <div className="border-border rounded-xl border">
            {taxExemptions.map((exemption) => (
              <div
                key={exemption.publicId}
                className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-3">
                  {exemption.exemptionType ? (
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
                      {t(`party.finance.exemption.${exemption.exemptionType}`)}
                    </span>
                  ) : null}
                  <span className="text-foreground font-medium">
                    {officeName(exemption.officeAccountId)}
                  </span>
                  {exemption.validFrom || exemption.validTo ? (
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {date.day(exemption.validFrom) || '…'} →{' '}
                      {date.day(exemption.validTo) || '…'}
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {!exemption.hasCertificate ? (
                    <StatusChip tone="warning" icon={<AlertTriangle />}>
                      {t('party.finance.noCertificate')}
                    </StatusChip>
                  ) : exemption.certificateNumber ? (
                    <span className="text-muted-foreground text-sm">
                      {t('party.finance.certificateN', {
                        n: exemption.certificateNumber,
                      })}
                    </span>
                  ) : null}
                  {editable && !exemption.hasCertificate ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingExemption(exemption)
                        setExemptionOpen(true)
                      }}
                    >
                      <FileCheck />
                      {t('party.finance.certificate')}
                    </Button>
                  ) : null}
                  {editable
                    ? removeBtn(
                        t('party.finance.remove'),
                        () => taxExemption.remove.mutate(exemption.publicId),
                        taxExemption.remove.isPending
                      )
                    : null}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('party.finance.taxExemptions.empty')}
          </p>
        )}
      </section>

      {/* POLITIQUE COMMERCIALE — style /_ref : une carte par société, réglages en
          INTERRUPTEURS d'état (édition via le crayon → sheet). */}
      <section className="mb-9">
        <FinanceHead
          title={t('party.finance.commercialPolicy')}
          subtitle={t('party.finance.commercialPolicy.hint')}
          action={editable ? t('party.finance.setPolicy') : undefined}
          onAction={() => {
            setEditingPolicy(null)
            setPolicyOpen(true)
          }}
        />
        {commercialPolicies.length > 0 ? (
          <div className="flex flex-col gap-4">
            {commercialPolicies.map((policyItem) => (
              <div
                key={policyItem.officeAccountId ?? 'common'}
                className="border-border rounded-xl border p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    {policyItem.officeAccountId == null
                      ? t('party.finance.commonPolicy')
                      : officeName(policyItem.officeAccountId)}
                  </span>
                  {editable ? (
                    <Button
                      size="sm"
                      mode="icon"
                      variant="ghost"
                      className="text-muted-foreground shrink-0"
                      aria-label={t('party.finance.setPolicy')}
                      onClick={() => {
                        setEditingPolicy(policyItem)
                        setPolicyOpen(true)
                      }}
                    >
                      <Pencil />
                    </Button>
                  ) : null}
                </div>
                <div className="divide-border/60 flex flex-col divide-y">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-foreground text-sm">
                      {t('party.finance.forceOnRequest')}
                    </span>
                    <SwitchPill
                      on={policyItem.forceOnRequest}
                      disabled={!editable || policy.put.isPending}
                      onToggle={
                        editable
                          ? () =>
                              policy.put.mutate({
                                officeAccountId: policyItem.officeAccountId,
                                forceOnRequest: !policyItem.forceOnRequest,
                                blockWhenInsufficientBalance:
                                  policyItem.blockWhenInsufficientBalance,
                              })
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-foreground text-sm">
                      {t('party.finance.blockInsufficient')}
                    </span>
                    <SwitchPill
                      on={policyItem.blockWhenInsufficientBalance}
                      disabled={!editable || policy.put.isPending}
                      onToggle={
                        editable
                          ? () =>
                              policy.put.mutate({
                                officeAccountId: policyItem.officeAccountId,
                                forceOnRequest: policyItem.forceOnRequest,
                                blockWhenInsufficientBalance:
                                  !policyItem.blockWhenInsufficientBalance,
                              })
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('party.finance.commercialPolicy.empty')}
          </p>
        )}
      </section>

      {/* APPROBATIONS — style /_ref : avatar + validateur + fonction ; alerte ambre
          si le validateur n'est plus habilité (pas de seuil de montant). */}
      <section>
        <FinanceHead
          title={t('party.finance.approvalRules')}
          subtitle={t('party.finance.approvalRules.hint')}
          action={editable ? t('party.finance.addApprovalRule') : undefined}
          onAction={() => setApprovalOpen(true)}
        />
        {approvalRules.length > 0 ? (
          <div className="border-border rounded-xl border">
            {approvalRules.map((rule) => (
              <div
                key={rule.publicId}
                className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-3">
                  <InitialsAvatar name={rule.validatorDisplayName} />
                  <span className="text-foreground font-medium">
                    {rule.validatorDisplayName}
                  </span>
                  <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                    {functionLabel(rule.functionCode)}
                  </span>
                  {!rule.validatorStillQualified ? (
                    <StatusChip tone="warning" icon={<AlertTriangle />}>
                      {t('party.finance.validatorLeft')}
                    </StatusChip>
                  ) : null}
                </span>
                {editable
                  ? removeBtn(
                      t('party.finance.remove'),
                      () => approvalRule.remove.mutate(rule.publicId),
                      approvalRule.remove.isPending
                    )
                  : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('party.finance.approvalRules.empty')}
          </p>
        )}
      </section>

      <PartyCreditLimitSheet
        open={creditOpen}
        onOpenChange={setCreditOpen}
        publicId={publicId}
        offices={offices}
        currencies={currencies}
        serviceTypes={serviceTypes}
        t={t}
      />
      <PartyManagerSheet
        open={managerOpen}
        onOpenChange={setManagerOpen}
        publicId={publicId}
        offices={offices}
        t={t}
      />
      <PartyTaxExemptionSheet
        open={exemptionOpen}
        onOpenChange={setExemptionOpen}
        publicId={publicId}
        offices={offices}
        exemption={editingExemption}
        officeName={officeName}
        t={t}
      />
      <PartyPolicySheet
        open={policyOpen}
        onOpenChange={setPolicyOpen}
        publicId={publicId}
        offices={offices}
        policy={editingPolicy}
        t={t}
      />
      <PartyApprovalRuleSheet
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        publicId={publicId}
        offices={offices}
        functions={functions}
        t={t}
      />
    </div>
  )
}
