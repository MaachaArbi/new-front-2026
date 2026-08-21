import * as React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import {
  Building2,
  CalendarPlus,
  ExternalLink,
  FileCheck2,
  FileWarning,
  Globe,
  Mail,
  MailWarning,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Separator } from '@/shared/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { DateCell } from '@/shared/table/cells'
import { format, fromMinorUnits } from '@/shared/money'
import { PartyCapacity } from './party-capacity'
import { PartyTodo } from './party-todo'
import { PARTY_DETAIL, type PartyDetail } from './party-detail-fixtures'

/**
 * FICHE TIERS — maquette STATIQUE, conçue indépendamment des API.
 *
 * ── CE QUI A CHANGÉ PAR RAPPORT À L'ESSAI PRÉCÉDENT ────────────────────────────
 * Le précédent partait du **contrat d'API** : huit champs, deux tiers de page
 * vides. C'était l'erreur exacte que la règle du 19/08 corrige — on conçoit la
 * page complète, on marque ce qui reste à alimenter.
 *
 * Celui-ci part de la **référence métier** (`reference/business/party.md`,
 * `settlement.md`, `booking.md`) et répond aux quatre questions qu'un agent se
 * pose en ouvrant une fiche client :
 *
 *   1. **Puis-je vendre, maintenant ?** → le bloc CAPACITÉ, en haut, en premier.
 *   2. **Qu'est-ce qui cloche ?**       → le panneau À TRAITER, agrégé.
 *   3. **Que s'est-il passé ?**         → réservations, factures, activité.
 *   4. **À qui je parle ?**             → les interlocuteurs.
 *
 * Le matricule fiscal et le registre de commerce sont de la RÉFÉRENCE : ils se
 * consultent rarement et vivent dans la colonne de droite. Les mettre au centre
 * était l'autre moitié de l'erreur.
 *
 * ── LA STRUCTURE, VALIDÉE PAR ARBI LE 07/08 ────────────────────────────────────
 * La page se pense comme un TABLEAU : bande nom en colspan, puis deux colonnes
 * ~62/38, une seule ligne horizontale sous les onglets et sous le titre des
 * détails, un trait vertical continu au milieu, aucune card arrondie à droite.
 */

/** Date de référence, figée : sans elle les captures changeraient chaque jour. */
const TODAY = new Date('2026-08-21T09:00:00Z')

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon?: typeof Mail
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-2.5">
      <span className="text-ink-muted flex items-center gap-1.5 text-xs">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className="text-ink text-2sm">{children}</span>
    </div>
  )
}

/** Le vide s'écrit, il ne se masque pas. */
function Value({ children }: { children?: React.ReactNode }) {
  if (children === undefined || children === null || children === '')
    return <span className="text-ink-muted">—</span>
  return <>{children}</>
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-ink text-2sm font-semibold">{children}</h3>
      {action}
    </div>
  )
}

function Money({ minor, currency }: { minor: string; currency: string }) {
  const intl = useIntl()
  return (
    <span dir="ltr" className="tabular-nums [unicode-bidi:isolate]">
      {format(fromMinorUnits(minor, currency), intl.locale)}
    </span>
  )
}

const BOOKING_TONE = {
  confirmed: 'success',
  on_request: 'warning',
  cancelled: 'destructive',
} as const

export function PartyDetailPage() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const party: PartyDetail = PARTY_DETAIL

  const alerts =
    (party.emailVerified ? 0 : 1) +
    party.exemptions.filter((e) => !e.hasCertificate).length +
    party.approvals.filter((a) => !a.validatorStillQualified).length +
    party.documents.filter((d) => !d.hasFile).length +
    party.ledgers.flatMap((l) => l.extensions).length

  const currentManagers = party.managers.filter((m) => !m.until)
  const pastManagers = party.managers.filter((m) => m.until)

  return (
    <div className="flex flex-col">
      <div className="px-4 pb-4 lg:px-7.5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/parties">{t('parties.title')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{party.displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── LIGNE 1 : la bande nom, pleine largeur ─────────────────────────── */}
      <div className="border-border flex flex-wrap items-start justify-between gap-4 border-y px-4 py-5 lg:px-7.5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-base font-semibold">
              {party.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1
                dir="auto"
                className="text-ink truncate text-xl font-semibold [unicode-bidi:isolate]"
              >
                {party.displayName}
              </h1>
              <Badge variant="success" appearance="light" size="sm">
                {t('parties.state.active')}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {party.roles.map((role) => (
                <Badge
                  key={role}
                  variant={role === 'customer' ? 'primary' : 'secondary'}
                  appearance="light"
                  size="sm"
                >
                  {t(`parties.role.${role}`)}
                </Badge>
              ))}
              <span className="text-ink-muted ms-1 text-xs">
                {party.offices.join(' · ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* L'action qu'on vient faire le plus souvent est la PRINCIPALE. */}
          <Button variant="primary" size="sm">
            <CalendarPlus />
            {t('party.newBooking')}
          </Button>
          <Button variant="secondary" size="sm">
            <Wallet />
            {t('party.collect')}
          </Button>
          <Button variant="secondary" size="sm">
            <Pencil />
            {t('party.edit')}
          </Button>
          <Button
            mode="icon"
            variant="ghost"
            size="sm"
            aria-label={t('ui.table.actions')}
          >
            <MoreHorizontal />
          </Button>
        </div>
      </div>

      {/* ── LIGNE 2 : deux colonnes, dessinées par les bordures de grille ──── */}
      <Tabs
        defaultValue="overview"
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_38%]"
      >
        <div className="border-border border-b px-4 lg:border-e lg:px-7.5">
          <TabsList variant="line" size="sm" className="border-b-0">
            <TabsTrigger value="overview">
              {t('party.tab.overview')}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              {t('party.tab.bookings')}
            </TabsTrigger>
            <TabsTrigger value="finance">{t('party.tab.finance')}</TabsTrigger>
            <TabsTrigger value="contacts">
              {t('party.tab.contacts')}
            </TabsTrigger>
            <TabsTrigger value="network">{t('party.tab.network')}</TabsTrigger>
            <TabsTrigger value="documents">
              {t('party.tab.documents')}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="border-border hidden items-center border-b px-4 lg:flex lg:px-7.5">
          <h2 className="text-ink text-2sm font-semibold">
            {t('party.details.organization')}
          </h2>
        </div>

        {/* ── Colonne gauche ─────────────────────────────────────────────── */}
        <div className="border-border px-4 lg:border-e lg:px-7.5">
          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="mt-0">
            <div className="flex flex-col gap-7 py-5">
              <section className="flex flex-col gap-3">
                <SectionTitle>{t('party.capacity.title')}</SectionTitle>
                <PartyCapacity ledgers={party.ledgers} />
                <div className="flex flex-wrap items-center gap-1.5">
                  <ShieldCheck className="text-ink-muted size-3.5" />
                  <span className="text-ink-muted text-xs">
                    {t('party.capacity.policies')} :
                  </span>
                  {party.policies.map((policy) => (
                    <Tooltip key={String(policy.officeName)}>
                      <TooltipTrigger asChild>
                        <span>
                          <Badge
                            variant="secondary"
                            appearance="light"
                            size="sm"
                          >
                            {policy.officeName ?? t('party.commonScope')}
                            {policy.alwaysOnRequest &&
                              ` · ${t('party.policy.onRequest')}`}
                            {policy.blockWhenInsufficient &&
                              ` · ${t('party.policy.block')}`}
                          </Badge>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t('party.policy.hint')}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <PartyTodo party={party} today={TODAY} />
              </section>

              <section className="flex flex-col gap-2">
                <SectionTitle
                  action={
                    <Button variant="link" size="sm">
                      {t('party.seeAll')}
                    </Button>
                  }
                >
                  {t('party.recentBookings')}
                </SectionTitle>
                <div>
                  {party.bookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.reference}
                      className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-ink text-2sm flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="text-ink-muted tabular-nums [unicode-bidi:isolate]"
                          >
                            {booking.reference}
                          </span>
                          <span
                            dir="auto"
                            className="truncate [unicode-bidi:isolate]"
                          >
                            {booking.label}
                          </span>
                        </span>
                        <span className="text-ink-muted text-xs">
                          {booking.serviceLabel} · {booking.officeName} ·{' '}
                          <DateCell value={booking.travelDate} />
                          {booking.splitWith && ` · ${booking.splitWith}`}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <Badge
                          variant={BOOKING_TONE[booking.status]}
                          appearance="light"
                          size="sm"
                        >
                          {t(`party.booking.${booking.status}`)}
                        </Badge>
                        <span className="text-ink text-2sm">
                          <Money
                            minor={booking.amountMinor}
                            currency={booking.currencyCode}
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <SectionTitle>{t('party.activity')}</SectionTitle>
                <ul className="flex flex-col">
                  {party.activity.map((entry) => (
                    <li
                      key={`${entry.at}-${entry.text}`}
                      className="border-border flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 border-b py-2 last:border-b-0"
                    >
                      <span className="text-ink-muted text-xs tabular-nums">
                        <DateCell value={entry.at} />
                      </span>
                      <span
                        dir="auto"
                        className="text-ink text-2sm [unicode-bidi:isolate]"
                      >
                        {entry.text}
                      </span>
                      <span className="text-ink-muted text-xs">
                        — {entry.actor}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </TabsContent>

          {/* Réservations */}
          <TabsContent value="bookings" className="mt-0">
            <div className="flex flex-col gap-2 py-5">
              <SectionTitle>{t('party.tab.bookings')}</SectionTitle>
              <div>
                {party.bookings.map((booking) => (
                  <div
                    key={booking.reference}
                    className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span
                        dir="auto"
                        className="text-ink text-2sm truncate [unicode-bidi:isolate]"
                      >
                        {booking.label}
                      </span>
                      <span className="text-ink-muted text-xs">
                        <span
                          dir="ltr"
                          className="tabular-nums [unicode-bidi:isolate]"
                        >
                          {booking.reference}
                        </span>
                        {' · '}
                        {booking.serviceLabel} · {booking.officeName} ·{' '}
                        <DateCell value={booking.travelDate} />
                        {booking.splitWith && ` · ${booking.splitWith}`}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <Badge
                        variant={BOOKING_TONE[booking.status]}
                        appearance="light"
                        size="sm"
                      >
                        {t(`party.booking.${booking.status}`)}
                      </Badge>
                      <span className="text-ink text-2sm">
                        <Money
                          minor={booking.amountMinor}
                          currency={booking.currencyCode}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Finance */}
          <TabsContent value="finance" className="mt-0">
            <div className="flex flex-col gap-7 py-5">
              <section className="flex flex-col gap-2">
                <SectionTitle>{t('party.invoices')}</SectionTitle>
                <div>
                  {party.invoices.map((invoice) => {
                    const remaining =
                      BigInt(invoice.totalMinor) - BigInt(invoice.settledMinor)
                    return (
                      <div
                        key={invoice.number}
                        className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span
                            dir="ltr"
                            className="text-ink text-2sm [unicode-bidi:isolate]"
                          >
                            {invoice.number}
                          </span>
                          <span className="text-ink-muted text-xs">
                            {invoice.officeName} · {t('party.invoice.due')}{' '}
                            <DateCell value={invoice.dueOn} />
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2.5">
                          <Badge
                            variant={remaining === 0n ? 'success' : 'warning'}
                            appearance="light"
                            size="sm"
                          >
                            {remaining === 0n
                              ? t('party.invoice.settled')
                              : t('party.invoice.open')}
                          </Badge>
                          <span className="text-ink text-2sm">
                            <Money
                              minor={invoice.totalMinor}
                              currency={invoice.currencyCode}
                            />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <Separator />

              <section className="flex flex-col gap-2">
                <SectionTitle>{t('party.exemptions')}</SectionTitle>
                <div>
                  {party.exemptions.map((exemption) => (
                    <div
                      key={exemption.publicId}
                      className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-ink text-2sm">
                          {t(`party.exemption.${exemption.kind}`)}
                        </span>
                        <span className="text-ink-muted text-xs">
                          {exemption.officeName}
                          {exemption.validTo && (
                            <>
                              {' · '}
                              {t('party.until')}{' '}
                              <DateCell value={exemption.validTo} />
                            </>
                          )}
                        </span>
                      </div>
                      {exemption.hasCertificate ? (
                        <span
                          dir="ltr"
                          className="text-ink-secondary text-2sm [unicode-bidi:isolate]"
                        >
                          {exemption.certificateNumber}
                        </span>
                      ) : (
                        <Badge variant="warning" appearance="light" size="sm">
                          <FileWarning />
                          {t('party.noCertificate')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              <section className="flex flex-col gap-2">
                <SectionTitle>{t('party.approvals')}</SectionTitle>
                <p className="text-ink-muted text-xs">
                  {t('party.approvalsHint')}
                </p>
                <div>
                  {party.approvals.map((approval) => (
                    <div
                      key={approval.publicId}
                      className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          dir="auto"
                          className="text-ink text-2sm [unicode-bidi:isolate]"
                        >
                          {approval.validatorName}
                        </span>
                        <span className="text-ink-muted text-xs">
                          {approval.functionLabel} ·{' '}
                          {approval.officeName ?? t('party.allOffices')}
                        </span>
                      </div>
                      {!approval.validatorStillQualified && (
                        <Badge variant="warning" appearance="light" size="sm">
                          {t('party.validatorGone')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </TabsContent>

          {/* Interlocuteurs */}
          <TabsContent value="contacts" className="mt-0">
            <div className="flex flex-col gap-2 py-5">
              <SectionTitle
                action={
                  <Button variant="secondary" size="sm">
                    <Plus />
                    {t('party.addContact')}
                  </Button>
                }
              >
                {t('party.tab.contacts')}
              </SectionTitle>
              <p className="text-ink-muted text-xs">
                {t('party.contactsHint')}
              </p>
              <div className="mt-1">
                {party.contacts.map((contact) => (
                  <div
                    key={contact.publicId}
                    className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs">
                          {contact.displayName
                            .split(' ')
                            .map((w) => w.charAt(0))
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span
                          dir="auto"
                          className="text-ink text-2sm font-medium [unicode-bidi:isolate]"
                        >
                          {contact.displayName}
                        </span>
                        <span className="text-ink-muted text-xs">
                          {contact.functionLabel}
                          {contact.email && (
                            <>
                              {' · '}
                              <span
                                dir="ltr"
                                className="[unicode-bidi:isolate]"
                              >
                                {contact.email}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {contact.canAct && (
                        <Badge variant="primary" appearance="light" size="sm">
                          {t('party.contact.canAct')}
                        </Badge>
                      )}
                      {contact.needsApprovalBy && (
                        <Badge variant="info" appearance="light" size="sm">
                          {intl.formatMessage(
                            { id: 'party.contact.approvedBy' },
                            { name: contact.needsApprovalBy }
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Réseau */}
          <TabsContent value="network" className="mt-0">
            <div className="flex flex-col gap-2 py-5">
              <SectionTitle>{t('party.tab.network')}</SectionTitle>
              <p className="text-ink-muted text-xs">{t('party.networkHint')}</p>
              <div className="mt-1">
                {party.subAgencies.map((agency) => (
                  <div
                    key={agency.publicId}
                    className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        dir="auto"
                        className="text-ink text-2sm [unicode-bidi:isolate]"
                      >
                        {agency.displayName}
                      </span>
                      <span className="text-ink-muted text-xs">
                        {agency.city}
                      </span>
                    </div>
                    <span className="text-ink-secondary text-2sm">
                      {intl.formatMessage(
                        { id: 'party.network.bookings' },
                        {
                          n: (
                            <span
                              dir="ltr"
                              className="tabular-nums [unicode-bidi:isolate]"
                            >
                              {agency.bookingsThisYear}
                            </span>
                          ),
                        }
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-0">
            <div className="flex flex-col gap-2 py-5">
              <SectionTitle
                action={
                  <Button variant="secondary" size="sm">
                    <Plus />
                    {t('party.documents.add')}
                  </Button>
                }
              >
                {t('party.tab.documents')}
              </SectionTitle>
              <div className="mt-1">
                {party.documents.map((document) => (
                  <div
                    key={document.publicId}
                    className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span
                        dir="auto"
                        className="text-ink text-2sm [unicode-bidi:isolate]"
                      >
                        {document.label}
                        {document.number && (
                          <span
                            dir="ltr"
                            className="text-ink-muted ms-2 [unicode-bidi:isolate]"
                          >
                            {document.number}
                          </span>
                        )}
                      </span>
                      <span className="text-ink-muted text-xs">
                        {document.expiryDate ? (
                          <>
                            {t('party.document.expires')}{' '}
                            <DateCell value={document.expiryDate} />
                          </>
                        ) : (
                          t('party.document.noExpiry')
                        )}
                      </span>
                    </div>
                    <Badge
                      variant={document.hasFile ? 'success' : 'warning'}
                      appearance="light"
                      size="sm"
                    >
                      {document.hasFile ? <FileCheck2 /> : <FileWarning />}
                      {t(
                        document.hasFile
                          ? 'party.document.withScan'
                          : 'party.document.withoutScan'
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>

        {/* ── Colonne droite : la RÉFÉRENCE. Aucune card, que la grille. ──── */}
        <div className="px-4 lg:px-7.5">
          <div className="flex flex-col py-5">
            <h2 className="text-ink text-2sm mb-1 font-semibold lg:hidden">
              {t('party.details.organization')}
            </h2>

            <Field icon={Mail} label={t('party.field.email')}>
              <span className="flex flex-wrap items-center gap-2">
                <span dir="ltr" className="[unicode-bidi:isolate]">
                  {party.email}
                </span>
                {!party.emailVerified && (
                  <Badge variant="warning" appearance="light" size="xs">
                    <MailWarning />
                    {t('party.field.emailUnverified')}
                  </Badge>
                )}
              </span>
            </Field>
            <Field icon={Phone} label={t('party.field.phone')}>
              <span dir="ltr" className="[unicode-bidi:isolate]">
                {party.phonePrimary}
                {party.phoneSecondary && ` · ${party.phoneSecondary}`}
              </span>
            </Field>
            <Field icon={Globe} label={t('party.field.website')}>
              {party.website ? (
                <a
                  href={party.website}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                  className="text-ink-link inline-flex items-center gap-1 [unicode-bidi:isolate] hover:underline"
                >
                  {party.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <Value />
              )}
            </Field>

            <Separator className="my-2" />

            {party.addresses.map((address) => (
              <Field
                key={address.publicId}
                icon={MapPin}
                label={t(`party.address.${address.typeKey}`)}
              >
                <span dir="auto" className="block [unicode-bidi:isolate]">
                  {address.line1}
                  <br />
                  {address.postalCode} {address.city}
                </span>
              </Field>
            ))}

            <Separator className="my-2" />

            <Field icon={Building2} label={t('party.field.legalForm')}>
              {t(`party.legalForm.${party.legalFormKey}`)}
            </Field>
            <Field label={t('party.field.taxId')}>
              <span dir="ltr" className="[unicode-bidi:isolate]">
                {party.taxId}
              </span>
            </Field>
            <Field label={t('party.field.tradeRegister')}>
              <span dir="ltr" className="[unicode-bidi:isolate]">
                {party.tradeRegister}
              </span>
            </Field>

            <Separator className="my-2" />

            {/* L'affectation est HISTORISÉE : la période close reste visible. */}
            <Field label={t('party.managers')}>
              <span className="flex flex-col gap-1">
                {currentManagers.map((manager) => (
                  <span
                    key={manager.publicId}
                    className="flex items-center gap-2"
                  >
                    <Badge variant="secondary" appearance="light" size="xs">
                      {t(`party.manager.${manager.role}`)}
                    </Badge>
                    <span dir="auto" className="[unicode-bidi:isolate]">
                      {manager.displayName}
                    </span>
                  </span>
                ))}
                {pastManagers.map((manager) => (
                  <Tooltip key={manager.publicId}>
                    <TooltipTrigger asChild>
                      <span className="text-ink-muted flex cursor-help items-center gap-2 text-xs">
                        <Badge variant="secondary" appearance="ghost" size="xs">
                          {t(`party.manager.${manager.role}`)}
                        </Badge>
                        <span
                          dir="auto"
                          className="line-through [unicode-bidi:isolate]"
                        >
                          {manager.displayName}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {intl.formatMessage(
                        { id: 'party.manager.past' },
                        { from: manager.since, to: manager.until ?? '' }
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </span>
            </Field>

            <Field label={t('party.groups')}>
              <span className="flex flex-wrap gap-1.5">
                {party.groups.map((group) => (
                  <Tooltip key={group.name}>
                    <TooltipTrigger asChild>
                      <span>
                        <Badge
                          variant="secondary"
                          appearance="outline"
                          size="sm"
                        >
                          {group.name}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t(`party.group.${group.type}`)}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </span>
            </Field>

            <Separator className="my-2" />

            <Field label={t('party.field.offices')}>
              {party.offices.join(' · ')}
            </Field>
            <Field label={t('party.field.createdAt')}>
              <DateCell value={party.createdAt} /> — {party.createdBy}
            </Field>

            {alerts > 0 && (
              <span className="text-ink-muted mt-3 text-xs">
                {intl.formatMessage(
                  { id: 'party.alertsHint' },
                  {
                    n: (
                      <span
                        dir="ltr"
                        className="tabular-nums [unicode-bidi:isolate]"
                      >
                        {alerts}
                      </span>
                    ),
                  }
                )}
              </span>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
