import * as React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import {
  Building2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { DateCell } from '@/shared/table/cells'
import { PartyFinanceTab } from './party-finance-tab'
import { PARTY_DETAIL, type PartyDetail } from './party-detail-fixtures'
import { RolesCell, StateCell } from './party-cells'

/**
 * FICHE TIERS — gabarit de référence de toutes les fiches du produit.
 *
 * ⚠️ STATIQUE : une fixture, aucune API (règle du 20/08).
 *
 * ── LA STRUCTURE, VALIDÉE PAR ARBI LE 07/08 ────────────────────────────────────
 * Elle se pense **comme un tableau HTML**, pas comme un empilement de cards. Il a
 * rejeté deux fois une version « détails dans une card arrondie » :
 *
 *   · **Ligne 1, colspan pleine largeur** — la « bande nom » : logo, nom, badges,
 *     actions.
 *   · **Ligne 2, deux colonnes ~62/38** — à gauche les onglets et leur contenu, à
 *     droite « Détails société ».
 *   · **UNE SEULE ligne horizontale** court d'un bout à l'autre, sous les onglets
 *     ET sous le titre des détails — donc le titre monte sur la même ligne que
 *     les onglets.
 *   · **Un trait vertical continu** sépare les deux colonnes et DESCEND dans le
 *     contenu : c'est la bordure du milieu du tableau.
 *   · **Aucune card à coins arrondis** sur la colonne détails — que des bordures
 *     de grille.
 *
 * Techniquement : `Tabs` porte la grille, et ce sont les `border-b` / `border-e`
 * des cellules qui dessinent le tableau. Un `<table>` réel empêcherait les
 * onglets de fonctionner.
 */
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

/** Le vide s'écrit, il ne se masque pas — un champ absent doit se voir. */
function Value({ children }: { children?: React.ReactNode }) {
  if (children === undefined || children === null || children === '')
    return <span className="text-ink-muted">—</span>
  return <>{children}</>
}

export function PartyDetailPage() {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const party: PartyDetail = PARTY_DETAIL

  const missingScans = party.documents.filter((d) => !d.hasFile).length

  return (
    <div className="flex flex-col">
      {/* Fil d'Ariane — porté par la page, pas déduit de la route. */}
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
              {/* Texte libre : `auto` laisse le navigateur trancher sur le
                  premier caractère fort. Voir la règle en tête de party-cell. */}
              <h1
                dir="auto"
                className="text-ink truncate text-xl font-semibold [unicode-bidi:isolate]"
              >
                {party.displayName}
              </h1>
              <StateCell party={party} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RolesCell roles={party.roles} />
              <span className="text-ink-muted text-xs">
                {party.offices.map((o) => o.displayName).join(' · ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

      {/* ── LIGNE 2 : deux colonnes, dessinées par des bordures de grille ──── */}
      <Tabs
        defaultValue="overview"
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_38%]"
      >
        {/* Cellule haut-gauche : les onglets. Le `border-e` prolonge le trait
            vertical, le `border-b` fait la ligne horizontale unique. */}
        <div className="border-border border-b px-4 lg:border-e lg:px-7.5">
          <TabsList variant="line" className="border-b-0">
            <TabsTrigger value="overview">
              {t('party.tab.overview')}
            </TabsTrigger>
            <TabsTrigger value="finance">{t('party.tab.finance')}</TabsTrigger>
            <TabsTrigger value="documents">
              {t('party.tab.documents')}
              {missingScans > 0 && (
                <Badge variant="warning" appearance="light" size="xs">
                  <span
                    dir="ltr"
                    className="tabular-nums [unicode-bidi:isolate]"
                  >
                    {missingScans}
                  </span>
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" disabled>
              {t('party.tab.history')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Cellule haut-droite : le titre des détails MONTE sur la même ligne
            que les onglets — c'est ce qui fait courir un seul filet. */}
        <div className="border-border hidden items-center border-b px-4 lg:flex lg:px-7.5">
          <h2 className="text-ink text-2sm font-semibold">
            {t(
              party.nature === 'organization'
                ? 'party.details.organization'
                : 'party.details.person'
            )}
          </h2>
        </div>

        {/* Cellule bas-gauche : le contenu des onglets. Le `border-e` DESCEND. */}
        <div className="border-border px-4 lg:border-e lg:px-7.5">
          <TabsContent value="overview" className="mt-0">
            <div className="flex flex-col gap-6 py-5">
              <section className="flex flex-col">
                <h3 className="text-ink text-2sm mb-1 font-semibold">
                  {t('party.overview.contact')}
                </h3>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Field icon={Mail} label={t('party.field.email')}>
                    <span className="flex items-center gap-2">
                      <span dir="ltr" className="[unicode-bidi:isolate]">
                        <Value>{party.email}</Value>
                      </span>
                      {party.email && !party.emailVerified && (
                        <Badge variant="warning" appearance="light" size="xs">
                          <MailWarning />
                          {t('party.field.emailUnverified')}
                        </Badge>
                      )}
                    </span>
                  </Field>
                  <Field icon={Phone} label={t('party.field.phone')}>
                    <span dir="ltr" className="[unicode-bidi:isolate]">
                      <Value>{party.phonePrimary}</Value>
                    </span>
                  </Field>
                  <Field icon={Phone} label={t('party.field.phone2')}>
                    <span dir="ltr" className="[unicode-bidi:isolate]">
                      <Value>{party.phoneSecondary}</Value>
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
                </div>
              </section>

              <section className="flex flex-col">
                <h3 className="text-ink text-2sm mb-1 font-semibold">
                  {t('party.overview.addresses')}
                </h3>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  {party.addresses.map((address) => (
                    <Field
                      key={address.publicId}
                      icon={MapPin}
                      label={t(`party.address.${address.addressType}`)}
                    >
                      {/* Une adresse est du TEXTE LIBRE — elle peut être en
                          arabe comme en latin. Sans `auto`, « 12, avenue Habib
                          Bourguiba » s'affiche « avenue Habib Bourguiba ,12 ». */}
                      <span dir="auto" className="block [unicode-bidi:isolate]">
                        <Value>
                          {address.line1}
                          {address.city && (
                            <>
                              <br />
                              {address.postalCode} {address.city}
                            </>
                          )}
                        </Value>
                      </span>
                    </Field>
                  ))}
                </div>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="mt-0">
            <PartyFinanceTab party={party} />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <div className="flex flex-col gap-1.5 py-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-ink text-2sm font-semibold">
                  {t('party.tab.documents')}
                </h3>
                <Button variant="secondary" size="sm">
                  <Plus />
                  {t('party.documents.add')}
                </Button>
              </div>
              <div className="mt-1.5">
                {party.documents.map((document) => (
                  <div
                    key={document.publicId}
                    className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2.5 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-ink text-2sm">
                        {t(`party.document.${document.documentType}`)}
                        {document.documentNumber && (
                          <span
                            dir="ltr"
                            className="text-ink-muted ms-2 [unicode-bidi:isolate]"
                          >
                            {document.documentNumber}
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
                    {/* Ce qui MANQUE passe devant : une pièce sans scan
                        ressemble à une pièce complète. */}
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

        {/* Cellule bas-droite : les détails. AUCUNE card — que la grille. */}
        <div className="px-4 lg:px-7.5">
          <div className="flex flex-col py-5">
            <h2 className="text-ink text-2sm mb-1 font-semibold lg:hidden">
              {t('party.details.organization')}
            </h2>
            <Field icon={Building2} label={t('party.field.legalForm')}>
              <Value>
                {party.legalFormCode &&
                  t(`party.legalForm.${party.legalFormCode}`)}
              </Value>
            </Field>
            <Field label={t('party.field.taxId')}>
              <span dir="ltr" className="[unicode-bidi:isolate]">
                <Value>{party.taxId}</Value>
              </span>
            </Field>
            <Field label={t('party.field.tradeRegister')}>
              <span dir="ltr" className="[unicode-bidi:isolate]">
                <Value>{party.tradeRegister}</Value>
              </span>
            </Field>
            <Field label={t('party.field.createdAt')}>
              <DateCell value={party.createdAt} />
            </Field>
            <Field label={t('party.field.offices')}>
              <Value>
                {party.offices.map((o) => o.displayName).join(' · ')}
              </Value>
            </Field>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
