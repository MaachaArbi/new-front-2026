import * as React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, User } from 'lucide-react'
import { useI18n } from '@/app/providers/i18n-provider'
import { useReferentials, codeLabel } from '@/shared/referentials'
import { usePartyAccount } from './queries'
import type {
  PartyAccountListItem,
  PartyOrganizationIdentity,
  PartyPersonIdentity,
  PartyState,
} from './api'
import { ApiError } from '@/shared/api/errors'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { SkeletonRow } from '@/shared/feedback'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const STATE_BADGE: Record<
  Exclude<PartyState, 'active'>,
  'info' | 'secondary' | 'destructive'
> = { prospect: 'info', disabled: 'secondary', disputed: 'destructive' }

type FieldItem = { label: string; value: React.ReactNode }

/** Conserve les champs réellement renseignés (le vide n'est jamais affiché). */
function filled(items: FieldItem[]): FieldItem[] {
  return items.filter((i) => i.value != null && i.value !== '')
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-muted-foreground shrink-0 text-sm">{label}</span>
      <span className="text-foreground min-w-0 text-end text-sm break-words">
        {children}
      </span>
    </div>
  )
}

function FieldList({ items }: { items: FieldItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <Field key={item.label} label={item.label}>
          {item.value}
        </Field>
      ))}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border border-b py-4 last:border-0">
      <h3 className="text-foreground mb-1 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {children}
    </a>
  )
}

/**
 * Page dossier d'un tiers — **hub 360°** (scaffoldé), branchée sur la **fiche
 * enrichie** du back (identité, adresses, groupes, agence mère en 1 appel). Le vide
 * est un **état de design** : champs/sections sans donnée **masqués**. Robuste par
 * URL ; en venant de la liste, la ligne est passée pour un en-tête riche immédiat.
 */
export function PartyDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { publicId } = useParams<{ publicId: string }>()

  const summary = (location.state as { summary?: PartyAccountListItem } | null)
    ?.summary
  const detailQuery = usePartyAccount(publicId ?? null)
  const detail = detailQuery.data
  const addresses = detail?.addresses ?? []
  const addressesLoading = detailQuery.isLoading

  const referentials = useReferentials().data
  const roleLabel = React.useMemo(
    () => codeLabel(referentials?.roles),
    [referentials]
  )
  const countryLabel = React.useMemo(
    () => codeLabel(referentials?.countries),
    [referentials]
  )
  const legalFormLabel = React.useMemo(
    () => codeLabel(referentials?.legalForms),
    [referentials]
  )
  const addressTypeLabel = React.useMemo(
    () => codeLabel(referentials?.addressTypes),
    [referentials]
  )

  const view = {
    nature: detail?.nature ?? summary?.nature,
    displayName: detail?.displayName ?? summary?.displayName ?? '',
    email: detail?.email ?? summary?.email ?? null,
    logoUrl: detail?.logoUrl ?? summary?.logoUrl ?? null,
    phonePrimary: detail?.phonePrimary ?? summary?.phonePrimary ?? null,
    phoneSecondary: detail?.phoneSecondary ?? summary?.phoneSecondary ?? null,
    country: detail?.country ?? summary?.country ?? null,
    roles: detail?.roles ?? summary?.roles ?? [],
    officeScope: detail?.officeScope ?? summary?.officeScope ?? 'undeclared',
    offices: detail?.offices ?? summary?.offices ?? [],
    isDisabled: detail?.isDisabled ?? summary?.isDisabled ?? false,
    isProspect: detail?.isProspect ?? summary?.isProspect ?? false,
    isDisputed: detail?.isDisputed ?? summary?.isDisputed ?? false,
    identity: detail?.identity ?? null,
    parentAccount: detail?.parentAccount ?? null,
    groups: detail?.groups ?? [],
  }

  const notFound =
    detailQuery.error instanceof ApiError && detailQuery.error.isNotFound
  const requestId =
    detailQuery.error instanceof ApiError ? detailQuery.error.requestId : null

  const backButton = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
      <ArrowLeft />
      {t('party.detail.back')}
    </Button>
  )

  if (detailQuery.isLoading && !summary) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-7.5">
        {backButton}
        <div className="border-border flex flex-col gap-3 rounded-xl border p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRow key={index} columns={2} />
          ))}
        </div>
      </div>
    )
  }

  if (detailQuery.isError && !summary) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-7.5">
        {backButton}
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 rounded-xl border p-6"
        >
          <p className="text-destructive text-sm">
            {notFound ? t('party.detail.notFound') : t('party.error')}
          </p>
          {requestId && !notFound ? (
            <p className="text-muted-foreground mt-1 text-xs">
              {t('error.requestId')} {requestId}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  const Icon = view.nature === 'organization' ? Building2 : User
  const person =
    view.nature === 'person'
      ? (view.identity as PartyPersonIdentity | null)
      : null
  const organization =
    view.nature === 'organization'
      ? (view.identity as PartyOrganizationIdentity | null)
      : null

  const states: Exclude<PartyState, 'active'>[] = []
  if (view.isProspect) states.push('prospect')
  if (view.isDisputed) states.push('disputed')
  if (view.isDisabled) states.push('disabled')

  const stateBadges =
    states.length === 0 ? (
      <Badge variant="success" size="sm">
        {t('party.state.active')}
      </Badge>
    ) : (
      states.map((s) => (
        <Badge key={s} variant={STATE_BADGE[s]} size="sm">
          {t(`party.state.${s}`)}
        </Badge>
      ))
    )

  const officesText =
    view.officeScope === 'all_offices'
      ? t('party.offices.all')
      : view.offices.length > 0
        ? view.offices.map((o) => o.displayName).join(', ')
        : null

  // Sections Détails — construites en données, vides masqués.
  const identityItems = filled(
    view.nature === 'person'
      ? [
          {
            label: t('party.detail.field.firstName'),
            value: person?.firstName,
          },
          { label: t('party.detail.field.lastName'), value: person?.lastName },
          {
            label: t('party.detail.field.employeeRef'),
            value: person?.employeeReference,
          },
        ]
      : [
          { label: t('party.detail.field.taxId'), value: organization?.taxId },
          {
            label: t('party.detail.field.tradeRegister'),
            value: organization?.tradeRegister,
          },
          {
            label: t('party.detail.field.legalForm'),
            value: organization?.legalFormCode
              ? legalFormLabel(organization.legalFormCode)
              : null,
          },
          {
            label: t('party.detail.field.website'),
            value: organization?.website ? (
              <Ext href={organization.website}>
                {organization.website.replace(/^https?:\/\//, '')}
              </Ext>
            ) : null,
          },
        ]
  )

  const contactItems = filled([
    {
      label: t('party.detail.email'),
      value: view.email ? (
        <Ext href={`mailto:${view.email}`}>{view.email}</Ext>
      ) : null,
    },
    { label: t('party.column.phone'), value: view.phonePrimary },
    {
      label: t('party.detail.field.phoneSecondary'),
      value: view.phoneSecondary,
    },
    {
      label: t('party.column.country'),
      value: view.country ? countryLabel(view.country) : null,
    },
  ])

  const parent = view.parentAccount
  const networkItems = filled([
    { label: t('party.column.offices'), value: officesText },
    {
      label: t('party.detail.field.parent'),
      value: parent ? (
        <button
          type="button"
          onClick={() => navigate(`/parties/${parent.publicId}`)}
          className="text-primary hover:underline"
        >
          {parent.displayName}
        </button>
      ) : null,
    },
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 px-4 lg:px-7.5">
        {backButton}
        <div className="flex flex-wrap items-center gap-4">
          {view.logoUrl ? (
            <img
              src={view.logoUrl}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full">
              <Icon className="size-6" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-foreground truncate text-xl font-medium">
              {view.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {view.nature ? (
                <Badge variant="outline" size="sm">
                  {t(`party.nature.${view.nature}`)}
                </Badge>
              ) : null}
              {view.roles.map((code) => (
                <Badge key={code} variant="secondary" size="sm">
                  {roleLabel(code)}
                </Badge>
              ))}
              {stateBadges}
            </div>
          </div>
          <div className="ms-auto">
            <Button
              variant="outline"
              size="sm"
              disabled
              title={t('party.detail.editSoon')}
            >
              {t('party.detail.edit')}
            </Button>
          </div>
        </div>
      </div>

      {/* Corps : 360° (gauche) + Détails (droite) */}
      <div className="flex flex-col gap-6 px-4 lg:flex-row lg:items-start lg:px-7.5">
        <main className="min-w-0 grow">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">
                {t('party.detail.tab.overview')}
              </TabsTrigger>
              <TabsTrigger value="bookings" disabled>
                {t('party.detail.tab.bookings')}
              </TabsTrigger>
              <TabsTrigger value="payments" disabled>
                {t('party.detail.tab.payments')}
              </TabsTrigger>
              <TabsTrigger value="invoices" disabled>
                {t('party.detail.tab.invoices')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-4 pt-4">
              {/* Adresses */}
              <div className="border-border rounded-xl border p-4">
                <h3 className="text-foreground mb-3 text-sm font-semibold">
                  {t('party.detail.addresses')}
                </h3>
                {addressesLoading ? (
                  <SkeletonRow columns={2} />
                ) : addresses.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {addresses.map((address) => (
                      <li
                        key={address.publicId}
                        className="border-border/60 flex flex-col gap-0.5 border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">
                            {addressTypeLabel(address.addressType)}
                          </span>
                          {address.isPrimary ? (
                            <Badge variant="secondary" size="xs">
                              {t('party.address.primary')}
                            </Badge>
                          ) : null}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {[
                            address.line1,
                            address.line2,
                            [address.postalCode, address.city]
                              .filter(Boolean)
                              .join(' '),
                            address.countryAlpha2
                              ? countryLabel(address.countryAlpha2)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t('party.detail.noAddresses')}
                  </p>
                )}
              </div>

              {/* Placeholder 360° */}
              <div className="border-border bg-muted/20 rounded-xl border border-dashed p-6">
                <h3 className="text-foreground text-sm font-semibold">
                  {t('party.detail.soon.title')}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('party.detail.soon.body')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Colonne Détails — sections vides masquées */}
        <aside className="w-full lg:w-[360px] lg:shrink-0">
          <div className="border-border rounded-xl border px-4">
            <Section title={t('party.detail.section.identity')}>
              {identityItems.length > 0 ? (
                <FieldList items={identityItems} />
              ) : (
                <p className="text-muted-foreground py-1.5 text-sm">
                  {t('party.detail.identityPending')}
                </p>
              )}
            </Section>

            {contactItems.length > 0 ? (
              <Section title={t('party.detail.section.contacts')}>
                <FieldList items={contactItems} />
              </Section>
            ) : null}

            {view.roles.length > 0 ? (
              <Section title={t('party.column.roles')}>
                <div className="flex flex-wrap gap-1 py-1.5">
                  {view.roles.map((code) => (
                    <Badge key={code} variant="secondary" size="sm">
                      {roleLabel(code)}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            {networkItems.length > 0 ? (
              <Section title={t('party.column.offices')}>
                <FieldList items={networkItems} />
              </Section>
            ) : null}

            {view.groups.length > 0 ? (
              <Section title={t('party.detail.section.groups')}>
                <div className="flex flex-wrap gap-1 py-1.5">
                  {view.groups.map((group) => (
                    <Badge key={group.publicId} variant="secondary" size="sm">
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section title={t('party.column.state')}>
              <div className="flex flex-wrap gap-1 py-1.5">{stateBadges}</div>
            </Section>
          </div>
        </aside>
      </div>
    </div>
  )
}
