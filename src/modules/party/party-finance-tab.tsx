import * as React from 'react'
import { AlertTriangle, FileCheck, Pencil, Plus, X } from 'lucide-react'
import { Badge, BadgeDot } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { formatMinor } from '@/shared/lib/money'
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

function FinanceSection({
  title,
  hint,
  empty,
  action,
  count,
  children,
}: {
  title: string
  hint?: string
  empty: string
  action?: React.ReactNode
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="border-border rounded-xl border p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-foreground text-sm font-semibold">{title}</h3>
          {hint ? (
            <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>
          ) : null}
        </div>
        {action}
      </div>
      {count > 0 ? (
        children
      ) : (
        <p className="text-muted-foreground py-1 text-sm">{empty}</p>
      )}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/60 flex flex-wrap items-center gap-x-3 gap-y-1 border-b py-2 text-sm last:border-0">
      {children}
    </div>
  )
}

const scopeTag = (label: string) => (
  <Badge variant="outline" size="sm">
    {label}
  </Badge>
)

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
  const { creditLimit, manager, taxExemption, approvalRule } =
    usePartyFinanceMutations(publicId)
  const serviceTypeLabel = codeLabel(serviceTypes)
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

  const addButton = (label: string, onClick: () => void) => (
    <Button size="sm" variant="outline" onClick={onClick}>
      <Plus />
      {label}
    </Button>
  )
  const removeButton = (label: string, onClick: () => void, busy: boolean) => (
    <Button
      size="sm"
      mode="icon"
      variant="ghost"
      className="text-muted-foreground ms-auto shrink-0"
      aria-label={label}
      disabled={busy}
      onClick={onClick}
    >
      <X />
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      <FinanceSection
        title={t('party.finance.creditLimits')}
        count={creditGroups.length}
        empty={t('party.finance.creditLimits.empty')}
        action={
          editable
            ? addButton(t('party.finance.addCreditLimit'), () =>
                setCreditOpen(true)
              )
            : undefined
        }
      >
        {creditGroups.map((g) => {
          const cur = g.currencyCode ?? ''
          const socle = g.socle
          return (
            <div
              key={`${g.officeAccountId}|${cur}|${g.serviceTypeCode ?? ''}`}
              className="border-border/60 flex flex-col gap-2 border-b py-3 last:border-0"
            >
              {/* Ligne de tête : portée à gauche, PLAFOND EFFECTIF (la réponse) à droite. */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {scopeTag(officeName(g.officeAccountId))}
                  {g.serviceTypeCode ? (
                    <span className="text-muted-foreground text-sm">
                      {serviceTypeLabel(g.serviceTypeCode)}
                    </span>
                  ) : null}
                </div>
                <div className="text-end">
                  <div className="text-muted-foreground text-[11px] tracking-wide uppercase">
                    {t('party.finance.effective')}
                  </div>
                  <div className="text-foreground text-base font-semibold tabular-nums">
                    {formatMinor(g.effectiveMinor, cur)} {cur}
                  </div>
                </div>
              </div>
              {/* Décomposition : socle + rallonges (grisées si expirées). */}
              <div className="flex flex-col gap-1">
                {socle ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {t('party.finance.base')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="tabular-nums">
                        {formatMinor(socle.amountMinor, cur)} {cur}
                      </span>
                      {editable
                        ? removeButton(
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
                        'flex items-center justify-between gap-2 text-sm',
                        expired && 'opacity-50'
                      )}
                    >
                      <span className="text-muted-foreground">
                        {t('party.finance.extension')}
                        {e.validTo
                          ? ' · ' +
                            (expired
                              ? t('party.finance.expired')
                              : t('party.finance.until', { date: e.validTo }))
                          : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="tabular-nums">
                          +{formatMinor(e.amountMinor, cur)} {cur}
                        </span>
                        {editable
                          ? removeButton(
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
      </FinanceSection>

      <FinanceSection
        title={t('party.finance.managers')}
        count={managers.length}
        empty={t('party.finance.managers.empty')}
        action={
          editable
            ? addButton(t('party.finance.addManager'), () =>
                setManagerOpen(true)
              )
            : undefined
        }
      >
        {managers.map((entry) => (
          <Row key={entry.publicId}>
            <span className="text-foreground font-medium">
              {entry.managerDisplayName}
            </span>
            <span className="text-muted-foreground">
              {t(`party.finance.assignment.${entry.assignmentType}`, {})}
            </span>
            {scopeTag(officeName(entry.officeAccountId))}
            {editable
              ? removeButton(
                  t('party.finance.remove'),
                  () => manager.remove.mutate(entry.publicId),
                  manager.remove.isPending
                )
              : null}
          </Row>
        ))}
      </FinanceSection>

      <FinanceSection
        title={t('party.finance.taxExemptions')}
        count={taxExemptions.length}
        empty={t('party.finance.taxExemptions.empty')}
        action={
          editable
            ? addButton(t('party.finance.addExemption'), () => {
                setEditingExemption(null)
                setExemptionOpen(true)
              })
            : undefined
        }
      >
        {taxExemptions.map((exemption) => (
          <Row key={exemption.publicId}>
            {scopeTag(officeName(exemption.officeAccountId))}
            {exemption.exemptionType ? (
              <span className="text-foreground">
                {t(`party.finance.exemption.${exemption.exemptionType}`, {})}
              </span>
            ) : null}
            {exemption.validFrom || exemption.validTo ? (
              <span className="text-muted-foreground tabular-nums">
                {exemption.validFrom ?? '…'} → {exemption.validTo ?? '…'}
              </span>
            ) : null}
            {exemption.hasCertificate ? (
              exemption.certificateNumber ? (
                <span className="text-muted-foreground">
                  {t('party.finance.certificateN', {
                    n: exemption.certificateNumber,
                  })}
                </span>
              ) : null
            ) : (
              <Badge variant="warning" appearance="light" size="sm">
                {t('party.finance.noCertificate')}
              </Badge>
            )}
            {editable ? (
              <span className="ms-auto flex items-center gap-1">
                {!exemption.hasCertificate ? (
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
                <Button
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className="text-muted-foreground shrink-0"
                  aria-label={t('party.finance.remove')}
                  disabled={taxExemption.remove.isPending}
                  onClick={() => taxExemption.remove.mutate(exemption.publicId)}
                >
                  <X />
                </Button>
              </span>
            ) : null}
          </Row>
        ))}
      </FinanceSection>

      <FinanceSection
        title={t('party.finance.commercialPolicy')}
        hint={t('party.finance.commercialPolicy.hint')}
        count={commercialPolicies.length}
        empty={t('party.finance.commercialPolicy.empty')}
        action={
          editable
            ? addButton(t('party.finance.setPolicy'), () => {
                setEditingPolicy(null)
                setPolicyOpen(true)
              })
            : undefined
        }
      >
        {commercialPolicies.map((policyItem) => (
          <Row key={policyItem.officeAccountId ?? 'common'}>
            {scopeTag(
              policyItem.officeAccountId == null
                ? t('party.finance.commonPolicy')
                : officeName(policyItem.officeAccountId)
            )}
            <Badge
              variant={policyItem.forceOnRequest ? 'success' : 'secondary'}
              appearance="light"
              size="sm"
            >
              <BadgeDot />
              {t('party.finance.forceOnRequest')} ·{' '}
              {t(policyItem.forceOnRequest ? 'common.on' : 'common.off')}
            </Badge>
            <Badge
              variant={
                policyItem.blockWhenInsufficientBalance ? 'success' : 'secondary'
              }
              appearance="light"
              size="sm"
            >
              <BadgeDot />
              {t('party.finance.blockInsufficient')} ·{' '}
              {t(
                policyItem.blockWhenInsufficientBalance
                  ? 'common.on'
                  : 'common.off'
              )}
            </Badge>
            {editable ? (
              <Button
                size="sm"
                mode="icon"
                variant="ghost"
                className="text-muted-foreground ms-auto shrink-0"
                aria-label={t('party.finance.setPolicy')}
                onClick={() => {
                  setEditingPolicy(policyItem)
                  setPolicyOpen(true)
                }}
              >
                <Pencil />
              </Button>
            ) : null}
          </Row>
        ))}
      </FinanceSection>

      <FinanceSection
        title={t('party.finance.approvalRules')}
        hint={t('party.finance.approvalRules.hint')}
        count={approvalRules.length}
        empty={t('party.finance.approvalRules.empty')}
        action={
          editable
            ? addButton(t('party.finance.addApprovalRule'), () =>
                setApprovalOpen(true)
              )
            : undefined
        }
      >
        {approvalRules.map((rule) => (
          <Row key={rule.publicId}>
            {scopeTag(functionLabel(rule.functionCode))}
            <span className="text-foreground font-medium">
              {rule.validatorDisplayName}
            </span>
            {scopeTag(officeName(rule.officeAccountId))}
            {rule.validatorStillQualified ? null : (
              <Badge variant="destructive" size="sm" className="gap-1">
                <AlertTriangle className="size-3" />
                {t('party.finance.validatorLeft')}
              </Badge>
            )}
            {editable
              ? removeButton(
                  t('party.finance.remove'),
                  () => approvalRule.remove.mutate(rule.publicId),
                  approvalRule.remove.isPending
                )
              : null}
          </Row>
        ))}
      </FinanceSection>

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
